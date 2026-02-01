# Agent Licensing for Developers

**How to monetize your agents using the Agent Builder licensing system**

---

## Overview

Agent Builder supports **per-agent licensing**, allowing you to create and sell premium agents while keeping the core plugin GPL-licensed and free. This guide explains how the licensing system works from a developer's perspective.

---

## 🎯 Key Concepts

### Core Plugin vs Agents

- **Core Plugin**: GPL v2, free, available on WordPress.org
- **Your Agent**: Can be premium with separate commercial license
- **License Scope**: Each premium agent requires its own license key

### How It Works

```
User Flow:
1. User installs free Agent Builder from WordPress.org
2. User browses marketplace for your premium agent
3. User purchases your agent → receives license key (AGT-XXXX-XXXX-XXXX)
4. User enters license key to install your agent
5. License validates → agent downloads and activates
6. License checks occur during updates and usage
```

---

## 💰 Revenue Models

### Free Agents
- No license required
- Distributed via marketplace for free
- Great for building reputation
- Can be monetized via donations/support

### Premium One-Time Purchase
- User pays once (e.g., $29)
- License never expires
- Lifetime updates included
- Best for: Productivity tools, utilities

### Premium Subscription
- User pays monthly/yearly (e.g., $9/month)
- License expires if subscription cancelled
- 7-day grace period after expiration
- Best for: API-dependent agents, SaaS integrations

### Freemium Model
- Basic version free
- Premium features require license
- Upgrade path built-in
- Best for: Complex agents with tiered capabilities

---

## 🔑 License Key Format

All premium agents use standardized license keys:

**Format**: `AGT-XXXXXXXX-XXXXXXXX-XXXXXXXX`

- Prefix: `AGT-` (identifies Agent Builder license)
- 3 segments of 8 alphanumeric characters
- Total: 28 characters including hyphens
- Example: `AGT-A1B2C3D4-E5F6G7H8-I9J0K1L2`

**Why this format?**
- Easy to read and type
- Prevents common typos
- Compatible with all keyboards/languages
- Marketplace API generates these automatically

---

## 📦 Agent Metadata

### Required Headers

Your `agent.php` file should include:

```php
<?php
/**
 * Agent Name: Invoice Generator Pro
 * Description: Automated PDF invoices for WooCommerce
 * Version: 1.2.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * Category: E-commerce
 * Icon: icon.png
 * Is Premium: true
 * Requires License: true
 * License Type: subscription
 * Price: 29.00
 * Billing Period: year
 * Activation Limit: 5
 */
```

### Premium-Specific Headers

| Header | Type | Description | Example |
|--------|------|-------------|---------|
| `Is Premium` | boolean | Mark as premium | `true` |
| `Requires License` | boolean | License validation needed | `true` |
| `License Type` | string | `one-time` or `subscription` | `subscription` |
| `Price` | float | Cost in USD | `29.00` |
| `Billing Period` | string | `month`, `year`, `lifetime` | `year` |
| `Activation Limit` | int | Max sites per license | `5` |

---

## 🔐 License Validation Flow

### Installation Validation

When a user tries to install your premium agent:

```
1. User clicks "Install" on your agent
2. Plugin shows license key prompt
3. User enters: AGT-A1B2C3D4-E5F6G7H8-I9J0K1L2
4. Plugin calls: POST /licenses/validate
   {
       "license_key": "AGT-A1B2C3D4-E5F6G7H8-I9J0K1L2",
       "agent_slug": "invoice-generator",
       "site_url": "https://example.com",
       "site_hash": "abc123...",
       "action": "install"
   }
5. Marketplace API validates:
   - License exists?
   - Correct agent?
   - Not expired?
   - Activation limit not reached?
6. If valid: Returns download URL
7. If invalid: Returns error code with user-friendly message
```

### Update Validation

Daily automatic update checks:

```
1. WordPress cron runs daily
2. For each premium agent:
   - Plugin calls: GET /agents/{slug}/version?license_key=AGT-...
3. Marketplace API:
   - Checks current_version vs latest_version
   - Validates license is still active
   - Returns update data or license_expired error
4. Plugin caches results for 12 hours
5. Admin sees update badge if available
```

### Runtime Validation (Optional)

You can check license validity before agent operations:

```php
$marketplace = new \Agentic\Marketplace_Client();
$is_valid = $marketplace->is_agent_license_valid( 'your-agent-slug' );

if ( ! $is_valid ) {
    return new WP_Error(
        'license_invalid',
        'Your license has expired. Please renew to continue using this agent.'
    );
}
```

---

## 📊 License States

### Active
- Status: `active`
- `expires_at`: Future date or null (lifetime)
- User can: Install, update, use
- Grace period: N/A

### Expired (Within Grace Period)
- Status: `active` (but expires_at in past)
- Days remaining: 1-7 days
- User can: Continue using, get warning
- **Important**: Allow continued usage during grace!

### Expired (Beyond Grace Period)
- Status: `expired`
- Days since expiration: 8+
- User can: View only, must renew
- Plugin blocks: New installs, updates

### Cancelled
- Status: `cancelled`
- User cancelled subscription
- User can: Use until expires_at, then same as expired
- No renewals until user re-subscribes

### Refunded
- Status: `refunded`
- Purchase was refunded
- User can: Nothing
- All activations deactivated immediately

---

## 🚨 Error Codes You'll Handle

The marketplace API returns these error codes:

### license_expired
**When**: License subscription ended
**Grace Period**: 7 days
**User Action**: Renew subscription

```json
{
    "success": false,
    "error": {
        "code": "license_expired",
        "message": "This license expired on 2025-12-31",
        "renewal_url": "https://agentic-plugin.com/renew?license=AGT-...",
        "grace_period_days": 7,
        "expired_at": "2025-12-31",
        "allow_existing_usage": true
    }
}
```

### activation_limit_reached
**When**: License used on max allowed sites
**User Action**: Deactivate other sites or upgrade

```json
{
    "success": false,
    "error": {
        "code": "activation_limit_reached",
        "message": "This license is activated on 5 sites (limit: 5)",
        "activations": [
            {
                "site_url": "https://site1.com",
                "activated_at": "2026-01-15 10:30:00"
            }
        ],
        "upgrade_url": "https://agentic-plugin.com/upgrade?license=AGT-...",
        "manage_url": "https://agentic-plugin.com/account/licenses/"
    }
}
```

### agent_mismatch
**When**: License is for different agent
**User Action**: Purchase correct license

```json
{
    "success": false,
    "error": {
        "code": "agent_mismatch",
        "message": "This license is for 'email-responder', not 'invoice-generator'",
        "licensed_agent": "email-responder",
        "requested_agent": "invoice-generator"
    }
}
```

### license_invalid
**When**: License key doesn't exist
**User Action**: Check email or purchase

```json
{
    "success": false,
    "error": {
        "code": "license_invalid",
        "message": "License key not found or invalid",
        "purchase_url": "https://agentic-plugin.com/agents/invoice-generator/"
    }
}
```

---

## 💳 Pricing Strategy

### Recommended Pricing Tiers

| Agent Type | Complexity | Suggested Price | Billing |
|------------|-----------|-----------------|---------|
| Simple utility | Low | $19 one-time | Lifetime |
| Content generator | Medium | $29/year | Annual |
| E-commerce tool | Medium | $49/year | Annual |
| API integration | High | $9/month | Monthly |
| Enterprise suite | Very High | $99/year | Annual |

### Activation Limits

| License Tier | Sites | Typical Price | Use Case |
|--------------|-------|---------------|----------|
| Single Site | 1 | Base price | Solo developers |
| Personal | 3 | +30% | Freelancers |
| Business | 5 | +50% | Agencies |
| Developer | 25 | +200% | Plugin developers |
| Unlimited | ∞ | +500% | Hosting companies |

**Example Pricing**:
```
Invoice Generator Pro:
- Single Site: $29/year (1 activation)
- Personal: $39/year (3 activations)
- Business: $49/year (5 activations)
- Developer: $89/year (25 activations)
```

---

## 🛡️ Security Best Practices

### 1. Never Store License Keys in Code

❌ **Bad**:
```php
define( 'MY_AGENT_LICENSE', 'AGT-A1B2C3D4-E5F6G7H8-I9J0K1L2' );
```

✅ **Good**:
```php
$licenses = get_option( 'agentic_licenses', array() );
$license = $licenses['your-agent-slug']['license_key'] ?? null;
```

### 2. Validate on Critical Operations

```php
public function generate_invoice( $order_id ) {
    // Check license before expensive operation
    if ( ! $this->is_licensed() ) {
        return new WP_Error(
            'license_required',
            'License required for invoice generation.'
        );
    }
    
    // Continue with operation...
}

private function is_licensed(): bool {
    $marketplace = new \Agentic\Marketplace_Client();
    return $marketplace->is_agent_license_valid( 'invoice-generator' );
}
```

### 3. Respect Grace Periods

Never hard-block during grace period:

```php
if ( ! $this->is_licensed() ) {
    // Show warning but allow usage
    add_action( 'admin_notices', function() {
        ?>
        <div class="notice notice-warning">
            <p>
                Your Invoice Generator Pro license expired 3 days ago.
                You have 4 days remaining in your grace period.
                <a href="<?php echo esc_url( $renewal_url ); ?>">Renew now</a>
            </p>
        </div>
        <?php
    } );
}
```

### 4. Handle Offline Gracefully

If marketplace API is unreachable:

```php
// Use cached license status if API unavailable
$cached_status = get_transient( 'my_agent_license_status' );
if ( false === $cached_status ) {
    // Try API
    $status = $this->check_license_api();
    if ( is_wp_error( $status ) ) {
        // Fallback: Allow usage for 24 hours
        $status = 'active';
        set_transient( 'my_agent_license_status', $status, DAY_IN_SECONDS );
    }
}
```

---

## � Revenue Dashboard

Track your earnings directly from your WordPress admin at **Agent Builder → Revenue**.

### Getting Started

1. **Register as a Developer** at [agentic-plugin.com/developer/register](https://agentic-plugin.com/developer/register)
2. **Get your API Key** from your developer dashboard
3. **Connect your account** in Agent Builder → Revenue → "I Have an API Key"
4. **View your stats** - installs, revenue, and payouts all in one place

### Dashboard Features

#### Stats Cards
At a glance view of your key metrics:
- **Agents Submitted** - Total agents with approved/pending breakdown
- **Total Installs** - All-time installs and active installs
- **Revenue This Month** - Current month earnings with trend indicator
- **Pending Payout** - Amount waiting to be paid out

#### Revenue Chart
Interactive line chart showing your earnings over time:
- 30 days / 90 days / 12 months views
- Daily revenue breakdown
- Visual trend analysis

#### Installs Chart  
Bar chart tracking agent installations:
- New installs over time
- Net growth (installs minus uninstalls)
- Period comparison

#### Agents Table
Detailed breakdown of each agent you've submitted:
- Agent name and version
- Approval status (approved/pending/rejected)
- Price and billing type
- Install count
- Total revenue earned
- User rating

#### Payouts Table
Your payout history:
- Payout date and amount
- Payment method (Stripe)
- Status (completed/processing/pending)

### Revenue Share Model

| Volume | Developer | Marketplace |
|--------|-----------|-------------|
| Standard | **70%** | 30% |
| High Volume (>$10k/mo) | **80%** | 20% |
| Featured Agents | Negotiable | Negotiable |

**Example Earnings:**
- You sell an agent for $29/year
- You keep $20.30 (70%)
- Marketplace keeps $8.70 (30%)

### Payout Schedule

- **Minimum Threshold**: $50 (we hold until you reach this)
- **Payout Frequency**: Monthly, on the 15th
- **Payment Methods**: Stripe (direct deposit)
- **Processing Time**: 2-3 business days

### Revenue Dashboard API

Your Revenue Dashboard pulls data from these marketplace endpoints:

| Endpoint | Data |
|----------|------|
| `/developer/stats` | Summary cards data |
| `/developer/agents` | Agents table |
| `/developer/revenue/history` | Revenue chart |
| `/developer/installs/history` | Installs chart |
| `/developer/payouts` | Payout history |

See [REVENUE_API_BRIEF.md](../REVENUE_API_BRIEF.md) for complete API specification.

---

## 📈 Analytics Deep Dive

Beyond the dashboard, the marketplace provides detailed analytics:

### Sales Data
- Total revenue (lifetime and periodic)
- Active subscriptions count
- Churn rate (monthly/annual)
- MRR/ARR calculations
- Revenue by agent breakdown

### Usage Data
- Total installations
- Active installations
- Activation counts by tier
- Geographic distribution
- WordPress version breakdown

### License Data
- Expired licenses count
- Licenses in grace period
- Deactivation requests
- Upgrade conversions
- Renewal rates

### Support Data
- License validation failures
- Common error codes
- User friction points
- Refund rates by agent

---

## 🎨 User Experience Tips

### 1. Clear Pricing Display

```php
// In your marketplace listing
Price: $29/year
Includes:
- 5 site activations
- Lifetime updates
- Priority support
- 7-day grace period
```

### 2. Helpful Error Messages

❌ **Bad**: "License invalid"

✅ **Good**: "License invalid. Please check your license key or purchase at agentic-plugin.com/agents/invoice-generator/"

### 3. Upgrade Paths

Make it easy to upgrade:

```php
if ( $activation_limit_reached ) {
    $message = sprintf(
        'You\'ve reached your activation limit (%d sites). <a href="%s">Upgrade to Business tier</a> for 5 activations.',
        $current_limit,
        $upgrade_url
    );
}
```

---

## 🔄 Migration & Updates

### Version Compatibility

Always specify minimum plugin version:

```php
/**
 * Requires Agent Builder: 1.0.0
 */
```

### Breaking Changes

If your update has breaking changes:

```php
/**
 * Version: 2.0.0
 * Breaking Changes: true
 * Migration Required: true
 */
 
// Include migration script
if ( version_compare( $old_version, '2.0.0', '<' ) ) {
    $this->migrate_v1_to_v2();
}
```

---

## 📝 License Management UI

Users see their licenses at **Agent Builder → Revenue**:

```
┌─────────────────────────────────────────────────┐
│ Invoice Generator Pro                           │
│ License: AGT-A1B2C3D4-E5F6G7H8-I9J0K1L2        │
│ Status: Active | Expires: Jan 28, 2027         │
│ Activations: 3 of 5 sites                      │
│ [Deactivate This Site] [View Details]          │
└─────────────────────────────────────────────────┘
```

They can:
- View all their agent licenses
- See activation counts
- Deactivate sites
- Renew expired licenses
- Manage subscriptions

---

## 🚀 Distribution Checklist

Before submitting your premium agent:

- [ ] Headers include `Is Premium: true`
- [ ] `Requires License: true` is set
- [ ] Price and billing period specified
- [ ] Activation limit defined
- [ ] License validation implemented
- [ ] Grace period handling added
- [ ] Error messages are user-friendly
- [ ] Upgrade paths documented
- [ ] README includes pricing info
- [ ] Screenshots show value
- [ ] Demo video optional but recommended
- [ ] Support email/URL provided
- [ ] Refund policy stated (recommend 30 days)
- [ ] Terms of service agreed

---

## 💡 Example: Complete Premium Agent

```php
<?php
/**
 * Agent Name: Invoice Generator Pro
 * Description: Automated PDF invoices for WooCommerce
 * Version: 1.2.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * Category: E-commerce
 * Icon: icon.png
 * Is Premium: true
 * Requires License: true
 * License Type: subscription
 * Price: 29.00
 * Billing Period: year
 * Activation Limit: 5
 * Requires Agent Builder: 1.0.0
 */

class Invoice_Generator_Agent extends Agentic_Agent_Base {
    
    public function __construct() {
        parent::__construct(
            'invoice-generator',
            'Invoice Generator Pro',
            'Generate professional PDF invoices automatically'
        );
        
        // Check license on critical operations
        add_filter( 'woocommerce_order_actions', array( $this, 'add_invoice_action' ) );
    }
    
    public function add_invoice_action( $actions ) {
        // Validate license before showing action
        if ( ! $this->is_licensed() ) {
            return $actions;
        }
        
        $actions['generate_invoice'] = __( 'Generate Invoice PDF', 'invoice-generator' );
        return $actions;
    }
    
    public function generate_invoice( $order_id ) {
        // Double-check license before expensive operation
        if ( ! $this->is_licensed() ) {
            $this->show_license_warning();
            return new WP_Error(
                'license_required',
                'Valid license required for invoice generation.'
            );
        }
        
        // Generate invoice...
        $pdf = $this->create_pdf( $order_id );
        return $pdf;
    }
    
    private function is_licensed(): bool {
        $marketplace = new \Agentic\Marketplace_Client();
        return $marketplace->is_agent_license_valid( 'invoice-generator' );
    }
    
    private function show_license_warning(): void {
        $license = $this->get_license_data();
        
        if ( ! $license ) {
            $message = 'No license found. Purchase at agentic-plugin.com';
        } elseif ( $this->in_grace_period( $license ) ) {
            $days_left = $this->get_grace_days_remaining( $license );
            $message = sprintf(
                'License expired. %d days left in grace period. Renew now.',
                $days_left
            );
        } else {
            $message = 'License expired. Renew to continue using Invoice Generator Pro.';
        }
        
        add_action( 'admin_notices', function() use ( $message ) {
            echo '<div class="notice notice-warning"><p>' . esc_html( $message ) . '</p></div>';
        } );
    }
}
```

---

## 🆘 Support Resources

### Documentation
- [MARKETPLACE_API_SOW.md](../.github/MARKETPLACE_API_SOW.md) - Complete API specification
- [AGENT_LICENSING_STRATEGY.md](../.github/AGENT_LICENSING_STRATEGY.md) - Architecture details
- [AI_DEVELOPMENT_GUIDE.md](../.github/AI_DEVELOPMENT_GUIDE.md) - Developer guide

### Community
- **Discord**: [discord.gg/agentic](https://discord.gg/agentic) - Developer chat
- **Forum**: [community.agentic-plugin.com](https://community.agentic-plugin.com)
- **Email**: developers@agentic-plugin.com

### Revenue Share
- **Standard**: 70% to developer, 30% to marketplace
- **High Volume**: 80% to developer (>$10k/month)
- **Featured Agents**: Negotiable revenue share

---

## 🎓 Best Practices Summary

1. **Always validate licenses** before expensive operations
2. **Respect grace periods** - warn but don't block
3. **Provide clear error messages** with actionable next steps
4. **Handle offline gracefully** - cache license status
5. **Document pricing** clearly in marketplace listing
6. **Offer multiple tiers** for different customer segments
7. **Test thoroughly** - all error scenarios
8. **Support your customers** - fast response times
9. **Update regularly** - monthly improvements
10. **Communicate changes** - email users before breaking changes

---

**Ready to monetize your agent?** Start building and submit to the marketplace!

Questions? Ask in [Discord](https://discord.gg/agentic) or email developers@agentic-plugin.com
