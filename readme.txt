=== Agentic Core ===
Contributors: agentic-plugin
Tags: ai, agents, automation, marketplace, plugins
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 0.1.0-alpha
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-native ecosystem that allows you to install, activate, and deactivate any number of autonomous agents exactly like plugins.

== Description ==

Agentic Core brings an agent ecosystem to WordPress—just like plugins, but for AI capabilities:

* **Install agents from the marketplace** — Browse and install community-built agents with one click
* **Activate and deactivate** — Control which agents run on your site, just like plugins
* **Build and sell your own** — Create agents and share or sell them to the community
* **Purchase premium agents** — Access powerful agents from trusted developers

= Agent Types =

* **Content Agents**: Draft posts, optimize SEO, generate alt text, translate content
* **Admin Agents**: Monitor security, manage backups, optimize performance
* **E-commerce Agents**: Manage products, optimize pricing, handle inventory
* **Frontend Agents**: Chat with visitors, moderate comments, handle support
* **Developer Agents**: Generate code, debug issues, build themes and plugins

= Key Features =

* Agent management interface (install, activate, deactivate, delete)
* Multiple AI provider support (OpenAI, Anthropic, local models)
* Comprehensive audit logging
* Human-in-the-loop approval workflow
* Rate limiting and cost controls
* Open source core with commercial ecosystem support

= Requirements =

* WordPress 6.4 or higher
* PHP 8.1 or higher
* MySQL 8.0 or MariaDB 10.6

== Installation ==

1. Upload the `agentic-core` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu
3. Go to 'Agentic → Agents' to browse and install agents
4. Activate agents to enable their capabilities
5. (Optional) Add AI provider API keys in wp-config.php

== Frequently Asked Questions ==

= How is this different from regular plugins? =

Agents are like plugins but specifically designed for AI-powered automation. They follow a standard structure, can register tools for AI models to use, and integrate with the Agentic approval and audit system.

= Can I build my own agents? =

Yes! Agents follow a simple structure similar to WordPress plugins. Create an agent.php file with headers, register your tools, and share with the community.

= Is this production ready? =

No, Agentic Core is currently in early alpha development. Use only for testing and development.

= Which AI providers are supported? =

Currently supports OpenAI, Anthropic (Claude), and local models via Ollama.

= Is my data sent to external services? =

Only when using cloud AI providers. Local model support is available for privacy-sensitive deployments.

== Changelog ==

= 0.1.0-alpha =
* Initial development release
* Agent management system (install, activate, deactivate)
* Agent library with sample agents
* REST API endpoints
* Admin interface scaffolding

== Upgrade Notice ==

= 0.1.0-alpha =
Initial alpha release. Not recommended for production use.
