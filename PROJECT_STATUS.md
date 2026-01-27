# Agentic Plugin - Project Status

**Last Updated:** January 26, 2026  
**Version:** 0.1.0  
**Status:** Active Development

---

## Recent Major Changes (January 26, 2026)

### Multi-LLM Provider Support
- **Migrated from:** xAI-only POC → Production multi-provider system
- **Supported Providers:**
  - OpenAI (GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-4, GPT-3.5-turbo)
  - Anthropic (Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus)
  - xAI (Grok 3, Grok 3 Fast, Grok 3 Mini variants)
  - Google (Gemini 2.0 Flash, Gemini 1.5 Pro/Flash)
  - Mistral (Large, Medium, Small)
- **Implementation:**
  - Renamed `OpenAI_Client` → `LLM_Client` with provider abstraction
  - Provider-specific endpoints, headers, and request formatting
  - Legacy xAI migration path (`agentic_xai_api_key` → `agentic_llm_api_key`)
  - Default: OpenAI with gpt-4o model

### Repository Sandboxing
- **Security Hardening:** Builder restricted to `wp-content/plugins` and `wp-content/themes` only
- **Removed:** User-configurable repository path setting (was security risk)
- **Enforced at:** All file operations (read_file, list_directory, search_code, update_documentation, request_code_change)
- **Implementation:**
  - `Agent_Tools::get_allowed_repo_base()` → Returns WP_CONTENT_DIR
  - `Agent_Tools::is_allowed_subpath()` → Validates paths against allowed_roots array
  - Path traversal prevention with realpath checks

### Settings Page Improvements
- **API Key Management:**
  - Dynamic provider/model selection with JavaScript
  - "Get API Key" button with provider-specific instructions (expandable)
  - Inline test button validates API key before saving
  - Auto-saves via AJAX on successful test (no page refresh)
  - Test now validates the entered key, not saved database value
- **UX Enhancements:**
  - Mode-specific help text (updates dynamically on dropdown change)
  - Cleaner button styling matching WordPress standards
  - API key instructions per provider (5-step guidance)
  - Visual feedback for all actions

### Dashboard Updates
- **Removed:** Warning notice for unconfigured API key
- **Status Box:**
  - AI Provider shows "Configure now" link when not set (replaces "Not configured")
  - Model shows "None" when no provider selected
- **Quick Actions:**
  - Shows "Chatbot offline" with help icon when not configured
  - Hides "Open Chat Interface" button until configured
  - "Configure now" link for easy setup

### Approvals Page Rebuild
- **Removed:** Git branch workflow (agents shouldn't be in your repo)
- **Implemented:** Functional approval queue UI using database
- **Features:**
  - Displays pending actions from `agentic_approval_queue` table
  - Shows agent ID, action type, reasoning, time requested, expiration
  - Inline Approve/Reject buttons with AJAX handlers
  - Expandable "View Details" with JSON parameters
  - Empty state: "All caught up!" when no pending approvals
  - Mode indicator at top with link to settings

---

## Architecture Decisions

### File Structure
```
agentic-core.php              # Main plugin file, activation hooks
admin/
  dashboard.php               # Overview with status, stats, quick actions
  settings.php                # LLM provider, API keys, mode config
  approvals.php               # Approval queue UI (rebuilt Jan 26)
  agents.php                  # Agent management
  audit.php                   # Audit log viewer
assets/
  js/settings.js              # Dynamic provider/model/mode help
  css/                        # Frontend styles
includes/
  class-openai-client.php     # LLM_Client (renamed, multi-provider)
  class-agent-tools.php       # Tool execution with sandboxing
  class-agent-controller.php  # Main orchestration
  class-rest-api.php          # REST endpoints (chat, approvals, test-api)
  class-approval-queue.php    # Database queue management
  class-audit-log.php         # Action logging
library/
  [agent-name]/agent.php      # Individual agent implementations
```

### Security Model
1. **Repository Access:** Sandboxed to plugins/themes directories only
2. **Path Validation:** Multi-layer (sanitize_path, is_allowed_subpath, realpath checks)
3. **Agent Modes:**
   - Disabled: Chat only, no file operations
   - Supervised: Docs auto-execute, code requires approval (default)
   - Autonomous: All actions execute immediately (use with caution)
4. **Chat Security:** Rate limiting, PII detection, content scanning

### Database Schema
- `agentic_approval_queue` - Pending actions requiring approval
- `agentic_audit_log` - All agent actions for compliance
- Session/history tables for chat persistence

---

## Key Features Status

### ✅ Completed
- Multi-LLM provider support with 5 providers
- Repository sandboxing to plugins/themes
- Dynamic settings UI with API key testing
- Approval queue with database-backed UI
- Dashboard status indicators
- Legacy xAI migration
- AJAX-based saves (no page refresh)

### 🚧 In Progress
- Agent marketplace integration
- License verification system
- Stripe payment processing

### 📋 Planned
- Additional LLM providers as needed
- Advanced agent capabilities
- Performance optimizations

---

## Recent Commits (Jan 26, 2026)

| Commit | Description |
|--------|-------------|
| `4f2a258` | Show mode-specific help only: update dynamically when agent mode changes |
| `6416e19` | Fix test API button: save via AJAX without page refresh to preserve entered data |
| `61039f4` | Simplify test button styling to match standard WordPress buttons |
| `6596590` | Fix API test button: test actual key from form, add test-api endpoint |
| `ada92ee` | Rebuild approvals page: remove git workflow, use approval queue database with approve/reject UI |
| `90a9392` | Quick Actions: add tooltip and 'Configure now' link next to Chatbot offline |
| `f84c56f` | Quick Actions: show 'Chatbot offline' when not configured; hide chat button until configured |
| `6687d3b` | Remove API key notice from dashboard and add Configure link to Status table |
| `a40ef71` | Add API key helper link and steps per provider |
| `697e441` | Add multi-LLM provider support, sandbox builder to plugins/themes, and move test button next to API key |

---

## Technical Notes

### LLM_Client Provider Handling
```php
// Endpoints map
'openai'    => 'https://api.openai.com/v1/chat/completions'
'anthropic' => 'https://api.anthropic.com/v1/messages'
'xai'       => 'https://api.x.ai/v1/chat/completions'
'google'    => 'https://generativelanguage.googleapis.com/v1beta/models/'
'mistral'   => 'https://api.mistral.ai/v1/chat/completions'

// Google uses model-specific endpoints with API key in URL
// Anthropic uses 'x-api-key' header, others use 'Authorization: Bearer'
// Anthropic separates system messages, Google uses 'user'/'model' roles
```

### Agent Tools Sandbox
```php
// Base path
WP_CONTENT_DIR

// Allowed roots
['plugins', 'themes']

// Validation
realpath() check + str_starts_with() + is_allowed_subpath()
```

### REST API Endpoints
```
POST   /agentic/v1/chat                    # Main chat interface
GET    /agentic/v1/status                  # Agent status
GET    /agentic/v1/approvals               # Get pending approvals (admin)
POST   /agentic/v1/approvals/{id}          # Approve/reject action (admin)
POST   /agentic/v1/test-api                # Test API key (admin)
GET    /agentic/v1/history/{session_id}   # Chat history
```

---

## Known Issues / Tech Debt

None currently blocking. All major features working as expected.

---

## Next Steps

1. Test multi-provider functionality with real API keys
2. Monitor approval queue workflow in supervised mode
3. Marketplace integration setup
4. Performance testing with multiple agents

---

## Developer Notes

- All PHP files pass `php -l` syntax validation
- JavaScript validated with node -c
- Git workflow: feature branches → main (protected)
- Auto-save on test success prevents data loss
- Dynamic UI updates prevent page refreshes
