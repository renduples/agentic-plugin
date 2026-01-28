# Async Job Queue Implementation

## Overview

The Agentic plugin now includes a complete async job queue system for handling long-running agent tasks (like the Agent Builder). This prevents timeout issues and provides real-time progress updates to users.

## Architecture

```
User Request
    ↓
POST /wp-json/agentic/v1/jobs
    ↓
Job Created (returns job_id immediately)
    ↓
WordPress Cron processes job asynchronously
    ↓
Frontend polls GET /wp-json/agentic/v1/jobs/{id}
    ↓
Shows progress updates
    ↓
Returns final result when complete
```

## Components

### 1. Job_Manager (`/includes/class-job-manager.php`)

Core job queue infrastructure:

```php
// Create a job
$job_id = Job_Manager::create_job([
    'agent_id' => 'agent-builder',
    'request_data' => [
        'message' => 'Build an SEO agent',
        'history' => []
    ],
    'processor' => 'Agentic\Core\Agent_Builder_Job_Processor'
]);

// Get job status
$job = Job_Manager::get_job($job_id);
echo $job->status; // pending, processing, completed, failed

// Update progress (called by processor)
Job_Manager::update_job($job_id, [
    'progress' => 50,
    'message' => 'Generating tools...'
]);
```

**Features:**
- ✅ Creates jobs table on activation
- ✅ Schedules async processing via WP Cron
- ✅ Tracks progress (0-100%)
- ✅ Auto-cleanup of old jobs (24 hours)
- ✅ User ownership & permissions

### 2. Job_Processor_Interface (`/includes/interface-job-processor.php`)

Contract for all job processors:

```php
interface Job_Processor_Interface {
    public function execute(array $request_data, callable $progress_callback): array;
}
```

### 3. Jobs_API (`/includes/class-jobs-api.php`)

REST API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/wp-json/agentic/v1/jobs` | POST | Create new job |
| `/wp-json/agentic/v1/jobs/{id}` | GET | Get job status |
| `/wp-json/agentic/v1/jobs/{id}` | DELETE | Cancel job |
| `/wp-json/agentic/v1/jobs/user/{user_id}` | GET | List user's jobs |

### 4. Agent_Builder_Job_Processor (`/includes/class-agent-builder-job-processor.php`)

Example processor for Agent Builder:

```php
class Agent_Builder_Job_Processor implements Job_Processor_Interface {
    public function execute($request_data, $progress_callback) {
        $progress_callback(10, 'Initializing...');
        
        // Do the work
        $agent = get_agent('agent-builder');
        $result = $agent->run($request_data['message']);
        
        $progress_callback(90, 'Finalizing...');
        
        return ['response' => $result];
    }
}
```

## Database Schema

```sql
CREATE TABLE wp_agentic_jobs (
    id VARCHAR(36) PRIMARY KEY,          -- UUID
    user_id BIGINT UNSIGNED NOT NULL,    -- Job owner
    agent_id VARCHAR(100),               -- Which agent ran
    status VARCHAR(20),                  -- pending|processing|completed|failed|cancelled
    progress INT DEFAULT 0,              -- 0-100
    message VARCHAR(255),                -- Current status message
    request_data LONGTEXT,               -- Input params (JSON)
    response_data LONGTEXT,              -- Output data (JSON)
    error_message TEXT,                  -- Error if failed
    created_at DATETIME,
    updated_at DATETIME,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_status (status)
);
```

## Usage Example: Agent Builder

### Backend (Marketplace Plugin)

Replace synchronous builder with async jobs:

```php
// OLD (times out):
public function handle_build_request($request) {
    $result = run_agent_builder($request['message']);
    return ['response' => $result];
}

// NEW (async):
public function handle_build_request($request) {
    $job_id = \Agentic\Core\Job_Manager::create_job([
        'agent_id' => 'agent-builder',
        'request_data' => [
            'message' => $request['message'],
            'history' => $request['history']
        ],
        'processor' => 'Agentic\Core\Agent_Builder_Job_Processor'
    ]);
    
    return new \WP_REST_Response([
        'job_id' => $job_id,
        'status' => 'pending'
    ], 202); // 202 Accepted
}
```

### Frontend (JavaScript)

Poll for job status:

```javascript
async function buildAgent(message) {
    // Start the job
    const response = await fetch('/wp-json/agentic/v1/jobs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpNonce
        },
        body: JSON.stringify({
            agent_id: 'agent-builder',
            request_data: { message },
            processor: 'Agentic\\Core\\Agent_Builder_Job_Processor'
        })
    });
    
    const { job_id } = await response.json();
    
    // Show progress
    showMessage(`⏳ Processing...`);
    
    // Poll for updates every 2 seconds
    const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/wp-json/agentic/v1/jobs/${job_id}`, {
            headers: { 'X-WP-Nonce': wpNonce }
        });
        
        const job = await statusResponse.json();
        
        // Update UI
        updateProgress(job.progress, job.message);
        
        if (job.status === 'completed') {
            clearInterval(pollInterval);
            showMessage(job.response_data.response);
        } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            showError(job.error_message);
        }
    }, 2000);
}
```

## Creating Custom Processors

To add a new job processor:

1. **Create processor class:**

```php
<?php
namespace Agentic\Core;

class My_Custom_Processor implements Job_Processor_Interface {
    public function execute(array $request_data, callable $progress_callback): array {
        $progress_callback(0, 'Starting...');
        
        // Do work
        $progress_callback(50, 'Halfway there...');
        
        // More work
        $progress_callback(100, 'Done!');
        
        return ['result' => 'success'];
    }
}
```

2. **Use it:**

```php
$job_id = Job_Manager::create_job([
    'request_data' => ['foo' => 'bar'],
    'processor' => 'Agentic\Core\My_Custom_Processor'
]);
```

## Admin UI Integration

Add a jobs page to the admin menu:

```php
add_menu_page(
    'Background Jobs',
    'Jobs',
    'manage_options',
    'agentic-jobs',
    function() {
        $jobs = Job_Manager::get_user_jobs(get_current_user_id());
        require_once AGENTIC_CORE_PATH . 'admin/pages/jobs-list.php';
    }
);
```

## Performance Considerations

### WP Cron Limitations

WordPress Cron is visitor-dependent. For production:

1. **Disable WP-Cron:**
```php
// In wp-config.php
define('DISABLE_WP_CRON', true);
```

2. **Add real cron:**
```bash
# In server crontab
*/5 * * * * curl https://yoursite.com/wp-cron.php?doing_wp_cron
```

### Alternative: Action Scheduler

For more reliable processing, consider Action Scheduler:

```php
// Instead of wp_schedule_single_event
as_enqueue_async_action('agentic_process_job', [$job_id]);
```

## Cleanup & Maintenance

Jobs are auto-cleaned after 24 hours:

```php
// Manual cleanup
Job_Manager::cleanup_old_jobs();

// Get stats
$stats = Job_Manager::get_stats();
// ['total' => 100, 'pending' => 5, 'processing' => 2, 'completed' => 90, 'failed' => 3]
```

## Error Handling

Processors should throw exceptions on failure:

```php
public function execute($data, $progress) {
    if (!$data['required_field']) {
        throw new \Exception('Missing required field');
    }
    
    try {
        // Do work
    } catch (\Exception $e) {
        // Exception auto-caught and job marked as failed
        throw new \Exception('Processing failed: ' . $e->getMessage());
    }
}
```

## Security

- ✅ Jobs are user-owned (user_id required)
- ✅ Users can only access their own jobs
- ✅ Admins can see all jobs
- ✅ REST API requires authentication
- ✅ Request data sanitized before storage

## Testing

```php
// Create test job
$job_id = Job_Manager::create_job([
    'agent_id' => 'test',
    'request_data' => ['test' => true],
    'processor' => 'My_Test_Processor'
]);

// Wait for processing
sleep(5);

// Check result
$job = Job_Manager::get_job($job_id);
assert($job->status === 'completed');
```

## Migration Path

### For Marketplace Plugin

Update `Public_Builder_API::handle_build_request()`:

```php
// Change from synchronous:
return ['response' => $agent->run($message)];

// To async:
$job_id = Job_Manager::create_job([
    'agent_id' => 'agent-builder',
    'request_data' => ['message' => $message, 'history' => $history],
    'processor' => 'Agentic\Core\Agent_Builder_Job_Processor'
]);

return ['job_id' => $job_id, 'status' => 'pending'];
```

### For Frontend

Update `front-page.php` to poll instead of waiting:

```javascript
// OLD: Single request waits for response
const response = await fetch('/build', { body: JSON.stringify({ message }) });
const data = await response.json();
showMessage(data.response);

// NEW: Create job, then poll
const { job_id } = await fetch('/jobs', { body: JSON.stringify({ ... }) });
pollJobStatus(job_id); // Polls every 2s until complete
```

## Next Steps

1. ✅ Job infrastructure is ready
2. Update Marketplace plugin to use jobs for Agent Builder
3. Update frontend to poll job status
4. Add admin UI for viewing jobs
5. Consider Action Scheduler for production reliability

---

## Files Created

- `/includes/class-job-manager.php` - Core job queue
- `/includes/interface-job-processor.php` - Processor contract
- `/includes/class-jobs-api.php` - REST endpoints
- `/includes/class-agent-builder-job-processor.php` - Builder processor example
- Updated `agentic-core.php` - Initialize job system

**Status:** ✅ Infrastructure complete, ready for integration
