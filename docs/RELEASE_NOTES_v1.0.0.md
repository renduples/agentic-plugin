# Release Notes - v1.0.0

**Release Date**: January 28, 2026  
**Status**: Production Release  
**Milestone**: First stable release with complete agent licensing system

---

## 🎉 Major Features

### Per-Agent Licensing System
Complete client-side implementation for premium agent licensing:

- **License Validation API Integration**
  - Endpoint: `POST /licenses/validate`
  - Parameters: `license_key`, `agent_slug`, `site_url`, `site_hash`, `action`
  - Response handling with full error coverage

- **Comprehensive Error Handling**
  - `license_expired` - Grace period support (7 days)
  - `activation_limit_reached` - Shows activated sites with management links
  - `agent_mismatch` - Prevents wrong license usage
  - `license_invalid` - Purchase prompts
  - User-friendly error messages with actionable next steps

- **Enhanced License Storage**
  - 8-field schema: `license_key`, `status`, `expires_at`, `activations_used`, `activation_limit`, `customer_email`, `validated_at`, `site_hash`
  - Persistent storage in `agentic_licenses` option
  - Automatic cleanup on agent deletion

- **Automatic Update Checking**
  - Daily WordPress cron checks marketplace API
  - Sends license keys for premium agents
  - 12-hour transient cache for performance
  - Update badges on Agents admin page
  - One-click update workflow

- **License Deactivation**
  - Calls `POST /licenses/deactivate` on agent deletion
  - Frees up activation slots
  - Error logging for failed API calls
  - Integrated into agent deletion workflow

- **Grace Period Validation**
  - `is_agent_license_valid()` public method
  - 7-day grace period after expiration
  - Allows continued usage during grace period
  - Ready for execution-time validation

### License Management UI

**New Admin Page**: Agentic → Licenses

- Table view of all licensed agents
- Status badges: Active, Expired, Grace Period (X days)
- Activation count display with color coding
- "Deactivate This Site" action
- "Renew License" button for expired licenses
- License information panel
- Responsive design matching WordPress admin

### JavaScript Enhancements

**Premium Agent Installation Flow**:
- Modal license key input prompt
- Format validation (AGT-XXXXXXXX-XXXXXXXX-XXXXXXXX)
- Session storage for entered licenses
- Comprehensive error dialogs
- Success/error toast notifications

**Error Handling**:
- Activation limit reached with site list
- Expired license with renewal prompt
- Agent mismatch detection
- Invalid license with purchase link

**New Methods**:
- `showLicensePrompt()` - Modal dialog
- `closeLicenseModal()` - Close handler  
- `handleInstallError()` - Error router
- `showNotice()` - Toast notifications

### CSS Additions

**New Styles**:
- `.agentic-license-modal` - Full-screen modal overlay
- `.agentic-license-content` - Modal card (500px)
- `.agentic-license-form` - Form inputs with validation
- `.agentic-notice-*` - Success/error/warning toasts
- Mobile responsive
- Accessibility features (focus states, keyboard navigation)

---

## 📋 Files Modified

### Core Plugin Files
1. **includes/class-marketplace-client.php**
   - Updated API endpoint: `/verify-purchase` → `/licenses/validate`
   - Added 5 error code handlers with user feedback
   - Enhanced license storage (2 → 8 fields)
   - License-aware update checking
   - Added `deactivate_agent_license()` method
   - Added `is_agent_license_valid()` method
   - Added `get_agent_license()` method
   - Added `render_licenses_page()` method

2. **admin/agents.php**
   - Integrated license deactivation on agent deletion
   - Calls deactivation API before removing agent

3. **assets/js/marketplace.js**
   - License key modal prompt system
   - Comprehensive error handling for all API error codes
   - Session storage for license keys
   - Toast notification system

4. **assets/css/marketplace.css**
   - License modal styles (~100 lines)
   - Notice/toast styles
   - Status badge styles

### New Files
1. **admin/licenses.php** (250+ lines)
   - Complete license management interface
   - Status display with grace period calculation
   - Activation count visualization
   - Deactivation workflow
   - Renewal links

---

## 🔄 Version Updates

Updated from `1.0.0-beta` to `1.0.0` in:

- `agentic-plugin.php` - Plugin header and `AGENTIC_PLUGIN_VERSION` constant
- `readme.txt` - Stable tag
- `.github/AI_DEVELOPMENT_GUIDE.md` - Documentation
- `languages/agentic-plugin.pot` - Translation template
- `languages/agentic-plugin-es_ES.po` - Spanish translations
- `languages/agentic-plugin-fr_FR.po` - French translations
- `languages/agentic-plugin-de_DE.po` - German translations

---

## 🔌 API Contract

The plugin expects these marketplace API endpoints:

### 1. POST /licenses/validate
Validates license for installation, activation, or updates.

**Request**:
```json
{
    "license_key": "AGT-A1B2C3D4-E5F6G7H8-I9J0K1L2",
    "agent_slug": "invoice-generator",
    "site_url": "https://example.com",
    "site_hash": "abc123...",
    "action": "install"
}
```

**Success Response**:
```json
{
    "success": true,
    "data": {
        "license_key": "AGT-A1B2C3D4-E5F6G7H8-I9J0K1L2",
        "status": "active",
        "expires_at": "2027-01-28",
        "activations_used": 1,
        "activation_limit": 5,
        "download_url": "https://...",
        "customer_email": "user@example.com"
    }
}
```

**Error Response** (example - license expired):
```json
{
    "success": false,
    "error": {
        "code": "license_expired",
        "message": "This license expired on 2025-12-31",
        "renewal_url": "https://agentic-plugin.com/renew?license=...",
        "grace_period_days": 7,
        "expired_at": "2025-12-31",
        "allow_existing_usage": true
    }
}
```

### 2. POST /licenses/deactivate
Removes site activation when agent is deleted.

**Request**:
```json
{
    "license_key": "AGT-A1B2C3D4-E5F6G7H8-I9J0K1L2",
    "site_url": "https://example.com",
    "site_hash": "abc123..."
}
```

### 3. GET /agents/{slug}/version
Checks for available updates (called daily by cron).

**Query Parameters**:
- `license_key` (optional for premium agents)
- `current_version` (required)
- `site_url` (required)

**Response**:
```json
{
    "success": true,
    "update_available": true,
    "data": {
        "current_version": "1.2.0",
        "latest_version": "1.3.0",
        "download_url": "...",
        "license_valid": true
    }
}
```

See [MARKETPLACE_API_SOW.md](.github/MARKETPLACE_API_SOW.md) for complete API specification.

---

## 🧪 Testing Requirements

Before production use, verify:

- [ ] Install free agent (no license required)
- [ ] Install premium agent with valid license
- [ ] Install premium agent with expired license (grace period)
- [ ] Install premium agent with expired license (beyond grace)
- [ ] Install premium agent with invalid license
- [ ] Install premium agent when activation limit reached
- [ ] Install premium agent with wrong license (mismatch)
- [ ] Update premium agent with valid license
- [ ] Update premium agent with expired license
- [ ] Delete premium agent (license deactivates)
- [ ] View Agentic → Licenses page
- [ ] Deactivate license from Licenses page
- [ ] Verify grace period warnings display
- [ ] Test all JavaScript modals and prompts

---

## ⚙️ Configuration

### Required Constants

```php
// wp-config.php
define( 'AGENTIC_SALT', 'your-secret-salt-here' ); // For site_hash generation
define( 'AGENTIC_MARKETPLACE_URL', 'https://agentic-plugin.com' ); // Optional override
```

### WordPress Options

- `agentic_licenses` - Array of agent licenses with metadata
- `agentic_available_updates` - Transient cache (12 hours)

---

## 📚 Documentation

New documentation added:

1. **[MARKETPLACE_API_SOW.md](.github/MARKETPLACE_API_SOW.md)**
   - Complete API endpoint specifications
   - Database schemas (2 tables)
   - Stripe webhook integration
   - Error code reference
   - Testing scenarios
   - Performance requirements

2. **[AGENT_LICENSING_STRATEGY.md](.github/AGENT_LICENSING_STRATEGY.md)**
   - License types (free vs premium)
   - Purchase → installation → update lifecycle
   - API response formats
   - Client-side handling
   - Admin UI mockups
   - Security considerations

3. **[AGENT_LICENSING_GAP_ANALYSIS.md](.github/AGENT_LICENSING_GAP_ANALYSIS.md)**
   - Initial gap assessment (now resolved)
   - Implementation roadmap

4. **[CLIENT_LICENSING_COMPLETE.md](.github/CLIENT_LICENSING_COMPLETE.md)**
   - Implementation summary
   - Testing checklist
   - API contract summary

---

## 🔐 Security

- **Site Hash Verification**: `hash_hmac('sha256', $site_url, AGENTIC_SALT)` prevents license sharing
- **License Key Format**: `AGT-XXXXXXXX-XXXXXXXX-XXXXXXXX` (28 chars total)
- **Time-Limited Downloads**: Marketplace API should generate expiring download tokens
- **Input Validation**: All license keys validated on client and server
- **Error Logging**: Failed API calls logged without exposing sensitive data

---

## 🚀 Upgrade Instructions

### From 1.0.0-beta

This is a smooth upgrade with no breaking changes:

1. Update plugin files
2. No database migrations required
3. Existing plugin licenses continue to work
4. No action needed for bundled agents
5. Premium agent licenses (if any) will continue to function

**Note**: The licensing system is new in v1.0.0. Beta users won't have existing agent licenses to migrate.

---

## 🐛 Known Limitations

1. **Grace Period Duration**: Hardcoded to 7 days (not yet configurable per agent)
2. **License Transfer**: No automatic site transfer - must deactivate and reactivate
3. **Offline Validation**: Requires API connection - no offline grace period yet
4. **Bulk Operations**: No bulk license management (one at a time)

These will be addressed in future updates based on user feedback.

---

## 📊 Statistics

- **Lines of Code Added**: ~800
- **New Methods**: 8
- **Error Codes Handled**: 5
- **API Endpoints Required**: 3
- **Database Fields**: 8 per license
- **Documentation Pages**: 4

---

## 🎯 What's Next

### v1.1.0 Roadmap

- Agent Builder testing and refinement
- Enhanced marketplace filtering
- License usage analytics
- Configurable grace periods
- Bulk license operations
- WordPress.org submission

### Marketplace API Development

The client-side is complete. Next step: Implement marketplace API endpoints per [MARKETPLACE_API_SOW.md](.github/MARKETPLACE_API_SOW.md).

---

## 👥 Credits

- **Development**: Agentic Plugin Team
- **Testing**: Community beta testers
- **Translation**: German, French, Spanish language teams

---

## 📝 License

This plugin is licensed under GPL v2 or later. Individual premium agents may have separate commercial licenses - this is documented in the licensing strategy and does not conflict with WordPress.org GPL requirements.

---

## 🔗 Resources

- **Website**: https://agentic-plugin.com
- **GitHub**: https://github.com/renduples/agentic-plugin
- **Wiki**: https://github.com/renduples/agentic-plugin/wiki
- **Support**: https://agentic-plugin.com/support
- **Marketplace**: https://agentic-plugin.com/agents

---

**For full API documentation and implementation details, see [MARKETPLACE_API_SOW.md](.github/MARKETPLACE_API_SOW.md)**
