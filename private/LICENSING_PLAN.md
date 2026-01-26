# Agentic Plugin Licensing System

## Overview

The Agentic Plugin is free to download and install. However, to access premium features, users must purchase a license key ($10/year).

### Features Requiring a License

| Feature | Free | Licensed |
|---------|------|----------|
| Install plugin | ✅ | ✅ |
| Use built-in agents | ✅ | ✅ |
| Build custom agents locally | ✅ | ✅ |
| Access Agent Marketplace | ❌ | ✅ |
| Download marketplace agents | ❌ | ✅ |
| Upload/sell agents on marketplace | ❌ | ✅ |
| Premium support | ❌ | ✅ |
| Automatic updates | ✅ | ✅ |

---

## Pricing

### Personal License
- **Cost:** $10 USD/year
- **Sites:** 1 site activation
- **Features:** Marketplace access, download agents, upload/sell agents

### Agency License
- **Cost:** $50 USD/year
- **Sites:** Unlimited activations
- **Features:** Same as Personal + priority support

### Common Terms
- **Validity:** 12 months from purchase date
- **Renewal:** Same price, extends by 12 months
- **Refund Policy:** 14-day money-back guarantee
- **Free Trial:** None (plugin is free, only marketplace requires license)
- **Deactivation:** Immediate

---

## License Key Format

```
AGNT-XXXX-XXXX-XXXX-XXXX
```

- Prefix: `AGNT-`
- 16 alphanumeric characters in 4 groups
- Case-insensitive
- Example: `AGNT-A1B2-C3D4-E5F6-G7H8`

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's WordPress Site                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Agentic Plugin (Free)                   │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │         License Manager Class               │    │    │
│  │  │  - Store license key in wp_options          │    │    │
│  │  │  - Validate against API                     │    │    │
│  │  │  - Cache validation result (24 hours)       │    │    │
│  │  │  - Gate premium features                    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 agentic-plugin.com (API)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              License API Endpoints                   │    │
│  │  POST /wp-json/agentic-license/v1/validate          │    │
│  │  POST /wp-json/agentic-license/v1/activate          │    │
│  │  POST /wp-json/agentic-license/v1/deactivate        │    │
│  │  GET  /wp-json/agentic-license/v1/status            │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              License Database                        │    │
│  │  - License keys                                      │    │
│  │  - Activation records (site URLs)                   │    │
│  │  - Purchase history                                  │    │
│  │  - Stripe customer IDs                               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## API Specification

### Base URL
```
https://agentic-plugin.com/wp-json/agentic-license/v1
```

### Authentication
All API requests must include:
- `X-License-Key`: The license key
- `X-Site-URL`: The requesting site's URL (home_url())
- `X-Site-Hash`: SHA256 hash of (license_key + site_url + secret_salt)

---

### Endpoints

#### 1. Validate License

Checks if a license is valid without consuming an activation.

**Request:**
```http
POST /wp-json/agentic-license/v1/validate
Content-Type: application/json
X-License-Key: AGNT-XXXX-XXXX-XXXX-XXXX
X-Site-URL: https://example.com
X-Site-Hash: abc123...

{
    "license_key": "AGNT-XXXX-XXXX-XXXX-XXXX",
    "site_url": "https://example.com",
    "plugin_version": "1.0.0"
}
```

**Response (Success):**
```json
{
    "valid": true,
    "license": {
        "key": "AGNT-XXXX-XXXX-XXXX-XXXX",
        "status": "active",
        "expires_at": "2027-01-25T00:00:00Z",
        "activations_used": 1,
        "activations_limit": 3,
        "customer_email": "user@example.com",
        "features": ["marketplace_access", "agent_upload", "premium_support"]
    },
    "cache_until": "2026-01-26T00:00:00Z"
}
```

**Response (Invalid):**
```json
{
    "valid": false,
    "error": "license_expired",
    "message": "Your license expired on 2026-01-01. Please renew to continue accessing premium features.",
    "renew_url": "https://agentic-plugin.com/renew?key=AGNT-XXXX-XXXX-XXXX-XXXX"
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| `invalid_key` | License key doesn't exist |
| `license_expired` | License has expired |
| `license_revoked` | License was revoked (refund, fraud) |
| `activation_limit` | Too many sites activated |
| `invalid_signature` | X-Site-Hash doesn't match |

---

#### 2. Activate License

Activates a license for a specific site. Call this when user first enters their license key.

**Request:**
```http
POST /wp-json/agentic-license/v1/activate
Content-Type: application/json
X-License-Key: AGNT-XXXX-XXXX-XXXX-XXXX
X-Site-URL: https://example.com
X-Site-Hash: abc123...

{
    "license_key": "AGNT-XXXX-XXXX-XXXX-XXXX",
    "site_url": "https://example.com",
    "site_name": "My WordPress Site",
    "plugin_version": "1.0.0",
    "wp_version": "6.7",
    "php_version": "8.2"
}
```

**Response (Success):**
```json
{
    "activated": true,
    "activation_id": "act_abc123",
    "license": {
        "key": "AGNT-XXXX-XXXX-XXXX-XXXX",
        "status": "active",
        "expires_at": "2027-01-25T00:00:00Z",
        "activations_used": 2,
        "activations_limit": 3
    },
    "message": "License activated successfully!"
}
```

---

#### 3. Deactivate License

Removes a site from the license, freeing up an activation slot.

**Request:**
```http
POST /wp-json/agentic-license/v1/deactivate
Content-Type: application/json
X-License-Key: AGNT-XXXX-XXXX-XXXX-XXXX
X-Site-URL: https://example.com
X-Site-Hash: abc123...

{
    "license_key": "AGNT-XXXX-XXXX-XXXX-XXXX",
    "site_url": "https://example.com"
}
```

**Response:**
```json
{
    "deactivated": true,
    "activations_used": 1,
    "activations_limit": 3,
    "message": "License deactivated from this site."
}
```

---

#### 4. Get License Status

Returns current license status (public info only, for display in admin).

**Request:**
```http
GET /wp-json/agentic-license/v1/status?key=AGNT-XXXX-XXXX-XXXX-XXXX
```

**Response:**
```json
{
    "status": "active",
    "expires_at": "2027-01-25T00:00:00Z",
    "days_remaining": 365,
    "features": ["marketplace_access", "agent_upload", "premium_support"]
}
```

---

## Client-Side Implementation Guide

### 1. License Manager Class

Create this class in the agentic-plugin codebase:

```php
<?php
namespace Agentic;

class License_Manager {
    
    const API_URL = 'https://agentic-plugin.com/wp-json/agentic-license/v1';
    const OPTION_KEY = 'agentic_license_key';
    const CACHE_KEY = 'agentic_license_cache';
    const CACHE_DURATION = DAY_IN_SECONDS;
    
    /**
     * Secret salt for hashing - must match server
     * This will be provided to you separately (don't commit to repo)
     */
    const HASH_SALT = 'YOUR_SECRET_SALT_HERE';
    
    /**
     * Get stored license key
     */
    public static function get_license_key(): string {
        return get_option( self::OPTION_KEY, '' );
    }
    
    /**
     * Save license key
     */
    public static function save_license_key( string $key ): bool {
        $key = self::sanitize_key( $key );
        return update_option( self::OPTION_KEY, $key );
    }
    
    /**
     * Sanitize license key format
     */
    public static function sanitize_key( string $key ): string {
        $key = strtoupper( trim( $key ) );
        $key = preg_replace( '/[^A-Z0-9-]/', '', $key );
        return $key;
    }
    
    /**
     * Generate request signature
     */
    private static function generate_signature( string $license_key, string $site_url ): string {
        return hash( 'sha256', $license_key . $site_url . self::HASH_SALT );
    }
    
    /**
     * Check if license is valid (with caching)
     */
    public static function is_valid(): bool {
        $license_key = self::get_license_key();
        
        if ( empty( $license_key ) ) {
            return false;
        }
        
        // Check cache first
        $cached = get_transient( self::CACHE_KEY );
        if ( $cached !== false ) {
            return $cached['valid'] === true;
        }
        
        // Validate with API
        $result = self::validate_with_api( $license_key );
        
        // Cache result
        if ( $result !== null ) {
            set_transient( self::CACHE_KEY, $result, self::CACHE_DURATION );
            return $result['valid'] === true;
        }
        
        // API unreachable - be lenient, assume valid if previously validated
        $last_valid = get_option( 'agentic_license_last_valid', false );
        return $last_valid === true;
    }
    
    /**
     * Validate license with API
     */
    public static function validate_with_api( string $license_key ): ?array {
        $site_url = home_url();
        
        $response = wp_remote_post( self::API_URL . '/validate', [
            'timeout' => 15,
            'headers' => [
                'Content-Type'  => 'application/json',
                'X-License-Key' => $license_key,
                'X-Site-URL'    => $site_url,
                'X-Site-Hash'   => self::generate_signature( $license_key, $site_url ),
            ],
            'body' => wp_json_encode( [
                'license_key'    => $license_key,
                'site_url'       => $site_url,
                'plugin_version' => AGENTIC_VERSION,
            ] ),
        ] );
        
        if ( is_wp_error( $response ) ) {
            return null; // API unreachable
        }
        
        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        
        if ( isset( $body['valid'] ) && $body['valid'] === true ) {
            update_option( 'agentic_license_last_valid', true );
        }
        
        return $body;
    }
    
    /**
     * Activate license for this site
     */
    public static function activate( string $license_key ): array {
        $license_key = self::sanitize_key( $license_key );
        $site_url = home_url();
        
        $response = wp_remote_post( self::API_URL . '/activate', [
            'timeout' => 15,
            'headers' => [
                'Content-Type'  => 'application/json',
                'X-License-Key' => $license_key,
                'X-Site-URL'    => $site_url,
                'X-Site-Hash'   => self::generate_signature( $license_key, $site_url ),
            ],
            'body' => wp_json_encode( [
                'license_key'    => $license_key,
                'site_url'       => $site_url,
                'site_name'      => get_bloginfo( 'name' ),
                'plugin_version' => AGENTIC_VERSION,
                'wp_version'     => get_bloginfo( 'version' ),
                'php_version'    => PHP_VERSION,
            ] ),
        ] );
        
        if ( is_wp_error( $response ) ) {
            return [
                'success' => false,
                'error'   => 'connection_failed',
                'message' => 'Could not connect to license server. Please try again.',
            ];
        }
        
        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        
        if ( isset( $body['activated'] ) && $body['activated'] === true ) {
            self::save_license_key( $license_key );
            delete_transient( self::CACHE_KEY ); // Clear cache
            update_option( 'agentic_license_last_valid', true );
            
            return [
                'success' => true,
                'message' => $body['message'] ?? 'License activated successfully!',
                'license' => $body['license'] ?? [],
            ];
        }
        
        return [
            'success' => false,
            'error'   => $body['error'] ?? 'unknown_error',
            'message' => $body['message'] ?? 'License activation failed.',
        ];
    }
    
    /**
     * Deactivate license from this site
     */
    public static function deactivate(): array {
        $license_key = self::get_license_key();
        $site_url = home_url();
        
        if ( empty( $license_key ) ) {
            return [
                'success' => false,
                'message' => 'No license key found.',
            ];
        }
        
        $response = wp_remote_post( self::API_URL . '/deactivate', [
            'timeout' => 15,
            'headers' => [
                'Content-Type'  => 'application/json',
                'X-License-Key' => $license_key,
                'X-Site-URL'    => $site_url,
                'X-Site-Hash'   => self::generate_signature( $license_key, $site_url ),
            ],
            'body' => wp_json_encode( [
                'license_key' => $license_key,
                'site_url'    => $site_url,
            ] ),
        ] );
        
        // Clear local data regardless of API response
        delete_option( self::OPTION_KEY );
        delete_transient( self::CACHE_KEY );
        delete_option( 'agentic_license_last_valid' );
        
        if ( is_wp_error( $response ) ) {
            return [
                'success' => true, // Local deactivation succeeded
                'message' => 'License removed locally. Server sync pending.',
            ];
        }
        
        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        
        return [
            'success' => true,
            'message' => $body['message'] ?? 'License deactivated.',
        ];
    }
    
    /**
     * Get license details for display
     */
    public static function get_license_info(): ?array {
        $license_key = self::get_license_key();
        
        if ( empty( $license_key ) ) {
            return null;
        }
        
        $cached = get_transient( self::CACHE_KEY );
        if ( $cached !== false && isset( $cached['license'] ) ) {
            return $cached['license'];
        }
        
        $result = self::validate_with_api( $license_key );
        return $result['license'] ?? null;
    }
    
    /**
     * Clear cached license data
     */
    public static function clear_cache(): void {
        delete_transient( self::CACHE_KEY );
    }
}
```

---

### 2. Gating Premium Features

Use the License Manager to gate features:

```php
<?php
// In your marketplace access code:

use Agentic\License_Manager;

function agentic_can_access_marketplace(): bool {
    return License_Manager::is_valid();
}

function agentic_can_upload_agent(): bool {
    return License_Manager::is_valid();
}

// Example: In a REST API endpoint
add_action( 'rest_api_init', function() {
    register_rest_route( 'agentic/v1', '/marketplace/agents', [
        'methods'             => 'GET',
        'callback'            => 'agentic_get_marketplace_agents',
        'permission_callback' => function() {
            if ( ! License_Manager::is_valid() ) {
                return new WP_Error(
                    'license_required',
                    'A valid license is required to access the marketplace.',
                    [ 'status' => 403 ]
                );
            }
            return true;
        },
    ] );
} );
```

---

### 3. Admin UI Integration

Add a license settings section:

```php
<?php
// In your settings page:

function agentic_render_license_settings() {
    $license_info = \Agentic\License_Manager::get_license_info();
    $license_key = \Agentic\License_Manager::get_license_key();
    
    ?>
    <div class="agentic-license-section">
        <h2>License</h2>
        
        <?php if ( $license_info && $license_info['status'] === 'active' ) : ?>
            <div class="agentic-license-active">
                <span class="dashicons dashicons-yes-alt"></span>
                <strong>License Active</strong>
                <p>Expires: <?php echo esc_html( date( 'F j, Y', strtotime( $license_info['expires_at'] ) ) ); ?></p>
                <p>Activations: <?php echo esc_html( $license_info['activations_used'] . '/' . $license_info['activations_limit'] ); ?></p>
                <button type="button" class="button" id="agentic-deactivate-license">
                    Deactivate License
                </button>
            </div>
        <?php else : ?>
            <div class="agentic-license-inactive">
                <p>Enter your license key to access the Agent Marketplace and premium features.</p>
                <p><a href="https://agentic-plugin.com/pricing" target="_blank">Purchase a license</a></p>
                
                <input type="text" 
                       id="agentic-license-key" 
                       placeholder="AGNT-XXXX-XXXX-XXXX-XXXX"
                       value="<?php echo esc_attr( $license_key ); ?>"
                       pattern="AGNT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
                       style="width: 300px; font-family: monospace;">
                
                <button type="button" class="button button-primary" id="agentic-activate-license">
                    Activate License
                </button>
                
                <div id="agentic-license-message"></div>
            </div>
        <?php endif; ?>
    </div>
    <?php
}
```

---

### 4. AJAX Handlers

```php
<?php
// License activation via AJAX
add_action( 'wp_ajax_agentic_activate_license', function() {
    check_ajax_referer( 'agentic_license_nonce', 'nonce' );
    
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( [ 'message' => 'Permission denied.' ] );
    }
    
    $license_key = sanitize_text_field( $_POST['license_key'] ?? '' );
    
    if ( empty( $license_key ) ) {
        wp_send_json_error( [ 'message' => 'Please enter a license key.' ] );
    }
    
    $result = \Agentic\License_Manager::activate( $license_key );
    
    if ( $result['success'] ) {
        wp_send_json_success( $result );
    } else {
        wp_send_json_error( $result );
    }
} );

// License deactivation via AJAX
add_action( 'wp_ajax_agentic_deactivate_license', function() {
    check_ajax_referer( 'agentic_license_nonce', 'nonce' );
    
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( [ 'message' => 'Permission denied.' ] );
    }
    
    $result = \Agentic\License_Manager::deactivate();
    wp_send_json_success( $result );
} );
```

---

## Security Considerations

### 1. Request Signing

Every API request includes a signature hash:
```php
$signature = hash( 'sha256', $license_key . $site_url . $secret_salt );
```

The server validates this signature to prevent:
- License key enumeration
- Replay attacks
- Unauthorized activation checks

### 2. Rate Limiting

The API implements rate limiting:
- 10 requests per minute per IP
- 100 requests per hour per license key
- Exponential backoff on failures

### 3. Grace Period

When the API is unreachable:
- Plugin checks `agentic_license_last_valid` option
- If previously validated, features remain accessible for 7 days
- After 7 days, premium features are disabled until API is reachable

### 4. Caching Strategy

- License validation results cached for 24 hours
- Cache cleared on:
  - Manual license activation/deactivation
  - WordPress `upgrader_process_complete` hook
  - Admin dashboard visit (once per day)

---

## Database Schema (Server-Side)

I will implement these tables on agentic-plugin.com:

```sql
-- Licenses table
CREATE TABLE wp_agentic_licenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(25) NOT NULL UNIQUE,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status ENUM('active', 'expired', 'revoked', 'pending') DEFAULT 'pending',
    activations_limit INT DEFAULT 3,
    features JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_expires (expires_at),
    INDEX idx_customer (customer_email)
);

-- Activations table
CREATE TABLE wp_agentic_activations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    license_id BIGINT UNSIGNED NOT NULL,
    site_url VARCHAR(500) NOT NULL,
    site_name VARCHAR(255),
    site_hash VARCHAR(64) NOT NULL,
    plugin_version VARCHAR(20),
    wp_version VARCHAR(20),
    php_version VARCHAR(20),
    ip_address VARCHAR(45),
    activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deactivated_at DATETIME NULL,
    FOREIGN KEY (license_id) REFERENCES wp_agentic_licenses(id),
    INDEX idx_license (license_id),
    INDEX idx_site_hash (site_hash),
    INDEX idx_active (deactivated_at)
);

-- API logs for debugging
CREATE TABLE wp_agentic_license_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(25),
    endpoint VARCHAR(50),
    request_data JSON,
    response_code INT,
    response_data JSON,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_license (license_key),
    INDEX idx_created (created_at)
);
```

---

## Purchase Flow

1. User visits https://agentic-plugin.com/pricing
2. User clicks "Buy License" → Stripe Checkout
3. On successful payment:
   - Stripe webhook creates license record
   - License key generated and emailed to customer
   - Customer redirected to success page with key
4. User enters key in plugin settings
5. Plugin calls `/activate` endpoint
6. License activated, features unlocked

---

## Renewal Flow

1. 30 days before expiration: Email reminder
2. 7 days before expiration: Second reminder
3. On expiration date:
   - Stripe attempts renewal charge
   - If successful: `expires_at` extended by 12 months
   - If failed: Status changed to `expired`, features locked

---

## Admin Management

I will build an admin interface at:
- https://agentic-plugin.com/wp-admin/admin.php?page=agentic-licenses

Features:
- View all licenses
- Search by email/key
- Manually revoke/extend licenses
- View activation history
- Generate keys manually

---

## Implementation Checklist

### Server-Side (I will build)
- [ ] Create database tables
- [ ] Implement REST API endpoints
- [ ] License key generation
- [ ] Stripe webhook integration for purchases
- [ ] Email notifications (purchase, renewal, expiration)
- [ ] Admin management interface
- [ ] Rate limiting middleware
- [ ] Request signature validation

### Client-Side (You will build)
- [ ] License_Manager class (use provided code)
- [ ] Settings page UI
- [ ] AJAX handlers
- [ ] Feature gating in marketplace components
- [ ] Graceful degradation when API unreachable

---

## Secret Salt

The server auto-generates the hash salt on first run and stores it in `wp_options`.

**To retrieve the salt for your client plugin:**
```bash
gcloud compute ssh --zone "us-central1-c" "instance-20260125-074449" --project "local-volt-485407-j8" -- "sudo -u www-data wp --path=/var/www/agentic-plugin.com/public option get agentic_license_salt"
```

Copy this value into your `License_Manager` class as the `HASH_SALT` constant.
**Do not commit this value to any repository.**

---

## Testing

### Test License Keys

I will provide test keys for development:
- `AGNT-TEST-0001-VALID-KEY1` - Valid, never expires
- `AGNT-TEST-0002-EXPIR-KEY2` - Expired
- `AGNT-TEST-0003-REVOK-KEY3` - Revoked
- `AGNT-TEST-0004-LIMIT-KEY4` - Activation limit reached

### Local Development

For local development (localhost, *.test, *.local domains):
- API will accept requests but not count toward activation limits
- Use test keys for validation

---

## Timeline

1. **Phase 1 (Week 1):** Database schema + REST API endpoints
2. **Phase 2 (Week 2):** Stripe integration + purchase flow
3. **Phase 3 (Week 3):** Admin interface + email notifications
4. **Phase 4 (Week 4):** Testing + documentation

---

## Questions for Clarification

1. Should licenses allow multiple sites? (Currently set to 3)
2. Should we offer different tiers? (e.g., Personal $10/yr, Agency $50/yr unlimited)
3. Should there be a free trial period?
4. Should deactivation be immediate or have a cooling-off period?
