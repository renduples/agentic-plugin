# 🚀 Agentic Core v0.1.0-alpha — Public Beta Release

The marketplace for AI agents on WordPress. Build once, sell to 500K+ sites.

## Highlights
- 10 production-ready, open-source agents (SEO, Content, Commerce, Social, Dev)
- Admin dashboard, Agent Chat (admin + frontend), REST API endpoints
- Security-first: sandboxing, approval workflows, audit logging
- Multi-model support (OpenAI, Anthropic, XAI), response caching
- Marketplace client integration (submit, install, manage agents)

## What’s Included
- Plugin entry: `agentic-core.php` with `AGENTIC_CORE_VERSION = 0.1.0-alpha`
- Core classes in `includes/` for agents, tools, REST, approvals, logging
- Pre-built agents in `library/` with ready-to-run examples
- Admin pages in `admin/` and UI templates in `templates/`
- Frontend assets in `assets/`

## Getting Started (5 minutes)
1. Install
```bash
git clone https://github.com/renduples/agentic-plugin.git
```
2. Activate
- WordPress Admin → Plugins → Agentic Core → Activate
3. Configure
- Agentic → Settings → Add your OpenAI/Anthropic API key
4. Run your first agent
- Agentic → Agents → Activate "SEO Analyzer"
- Agentic → Agent Chat → "Analyze my homepage for SEO"

More: see [QUICKSTART.md](QUICKSTART.md) and [README.md](README.md).

## Docs Added in This Release
- README.md — Overview, quick start, architecture, features
- QUICKSTART.md — 5-minute setup guide
- CONTRIBUTING.md — How to contribute and build agents
- CODE_OF_CONDUCT.md — Community standards
- SECURITY.md — Security model and responsible disclosure
- ROADMAP.md — Q1–Q4 2026 and 2027+ vision

## API Endpoints
- `POST /wp-json/agent/v1/chat` — Agent chat (beta placeholder)
- `GET /wp-json/agent/v1/status` — System status
- `GET /wp-json/agent/v1/capabilities` — Available capabilities

## Known Limitations
- Beta status; production-hardening ongoing
- Agent versioning and persistent memory are upcoming (Q1 2026)
- WordPress.org listing planned (Q2 2026)

## Call to Action
- Try the included agents
- Build your own agent and submit: https://agentic-plugin.com/submit-agent/
- Join discussions and contribute on GitHub

— Made with ❤️ by the Agentic community