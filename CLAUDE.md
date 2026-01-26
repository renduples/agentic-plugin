# Project Context for Claude

This file contains persistent context that Claude should remember across sessions.

## Development Environment

- **NO DOCKER** - The user runs WordPress locally via MAMP/native, not Docker
- WP-CLI is available directly: `wp` commands work without docker exec
- Local site URL: http://agentic.test
- Production URL: https://agentic-plugin.com

## Server & Deployment

### GitHub Repository for this plugin
- **Repo URL:** https://github.com/renduples/agentic-plugin
- **SSH:** git@github.com:renduples/agentic-plugin.git

### Production Server for testing plugin (GCP)
- **SSH Command:**
  ```bash
  gcloud compute ssh --zone "us-central1-c" "instance-20260125-074449" --project "local-volt-485407-j8"
  ```
- **WordPress Path:** `/var/www/agentic-plugin.com/public`
- **WP-CLI on server:** `sudo -u www-data wp --path=/var/www/agentic-plugin.com/public`

### Admin Credentials
- **Username:** renduples@gmail.com
- **URL:** https://agentic-plugin.com/wp-admin/

### Stripe Webhook
- **Endpoint:** https://agentic-plugin.com/wp-json/agentic-marketplace/v1/webhook
- **Settings:** https://agentic-plugin.com/wp-admin/admin.php?page=agentic-settings

### Licensing API (COMPLETED)
- **Base URL:** https://agentic-plugin.com/wp-json/agentic-license/v1
- **Endpoints:**
  - `POST /validate` - Check license validity
  - `POST /activate` - Activate license on a site
  - `POST /deactivate` - Deactivate license from a site
  - `GET /status?key=XXX` - Get public license status
- **Admin Page:** https://agentic-plugin.com/wp-admin/admin.php?page=agentic-licenses
- **Pricing:** Personal $10/yr (1 site), Agency $50/yr (unlimited sites)
- **Database Tables:** wp_agentic_licenses, wp_agentic_activations, wp_agentic_license_logs
- **Classes:** License_Server (server), License_API (REST endpoints) in agentic-marketplace plugin
- **Plan Document:** private/licensing/LICENSING_PLAN.md (has client implementation guide)

## Repository Structure (COMPLETED)

### Two Repositories:

**1. agentic-plugin (this repo)** (`/Users/r3n13r/Code/agentic-plugin/`)
- Distributed to users via WordPress.org or direct download
- Contains only core plugin functionality
- NO marketplace admin, payments, or social login code
- Git initialized with initial commit

**2. agentic** (`/Users/r3n13r/Code/agentic/`)
- Runs agentic-plugin.com marketplace
- Contains `agentic-marketplace` plugin for marketplace-specific code
- Contains theme `agentic` for marketplace website
- Contains docs, tests, scripts

### Plugin Files (this repo):
- `agentic-core.php` - Main plugin file (cleaned of marketplace code)
- `admin/` - Dashboard, agents, settings
- `includes/` - Core classes (NO marketplace classes)
- `library/` - Built-in agents
- `assets/`, `templates/`

### Marketplace Plugin (agentic-plugin repo):
- `wp-content/plugins/agentic-marketplace/`
- Contains: class-agent-submission.php, class-marketplace-api.php, class-marketplace-cpt.php, class-social-auth.php, class-stripe-handler.php

## Key Facts

- This is Agentic Plugin - an AI agent ecosystem plugin for WordPress
- Agents extend `\Agentic\Agent_Base` class
- Library agents are in: `wp-content/plugins/agentic-core/library/`
- User-installed agents go in: `wp-content/agents/`

## User Preferences

- Prefers direct action over asking permission
- Uses WP-CLI for database/WordPress operations
- Prefers concise responses

## Important Post IDs

- Developer Agents page: Post ID 24 (http://agentic.test/agents/developer-agents/)
- Marketing Agents page: Post ID 73 (http://agentic.test/agents/marketing-agents/)

## Current Agents in Library

1. content-assistant
2. seo-analyzer
3. security-monitor
4. product-describer
5. comment-moderator
6. code-generator
7. developer-agent
8. theme-builder
9. social-media
10. agent-builder

## TODO - Pending Tasks

### Immediate
- [x] Deploy POC server to agentic-plugin.com
- [x] Create Marketing Agents page (http://agentic.test/agents/marketing-agents/)
- [ ] Test Agent Builder - verify it can create working agents
- [x] Activate new agents (Social Media Manager, Agent Builder) in WP admin
- [ ] Configure Stripe (add keys to settings page)

### Social Media Campaign
- [ ] Set up Buffer or scheduling tool (free tier)
- [ ] Review/edit content in docs/SOCIAL_MEDIA_CAMPAIGN.md
- [ ] Create social media accounts if needed (X, LinkedIn, etc.)
- [ ] Schedule Week 1 posts
- [ ] Campaign runs 4 weeks with $200 budget

### Future
- [ ] Build more prototype agents
- [ ] Create agent marketplace UI
- [ ] Write more documentation/tutorials
- [ ] Community outreach (Reddit, Hacker News, Dev.to)
- [ ] Product Hunt launch (Week 4 of campaign)
