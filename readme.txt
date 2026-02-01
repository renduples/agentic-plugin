=== Agentic Plugin ===
Contributors: @agenticplugin
Tags: xai, openai, chatgpt, gpt, anthropic, claude, llm, ai, agents, chatbot, automation, plugins
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Build AI Agents without writing code. Describe the AI agent you want and let WordPress build it for you.

== Description ==

The Agentic Plugin brings an ecosystem to WordPress just like plugins and themes, but for AI capabilities.

If you've built a plugin or theme before, you already know the process. Now harness AI reasoning to solve WordPress problems at scale.

With this plugin you will be able to build most of your AI Agents without writing code.

* **Marketplace** — Browse and install community-built agents with one click
* **Activate and deactivate** — Control which agents run on your site, just like plugins

= Agent Categories =

* **Content Agents**: Draft posts, optimize SEO, generate alt text, translate content
* **Admin Agents**: Monitor security, manage backups, optimize performance
* **E-commerce Agents**: Manage products, optimize pricing, handle inventory
* **Frontend Agents**: Chat with visitors, moderate comments, handle support
* **Developer Agents**: Generate code, debug issues, build themes and plugins
* **Marketing Agents**: Create campaigns, generate platform-optimized content, and manage multi-channel presence.

= Key Features =

* Plugin like Agent management interface (install, activate, deactivate, delete)
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

1. Download the latest version from: https://github.com/renduples/agentic-plugin/releases/latest/download/agentic-plugin.zip
2. Upload via Plugins → Add New → Upload Plugin
3. Activate the plugin through the 'Plugins' menu
4. Go to 'Agentic → Settings' to add your API key
5. Go to 'Agentic → Agents' to browse and install agents
6. Activate agents to enable their capabilities

== Frequently Asked Questions ==

= How is this different from regular plugins? =

Agents are like plugins but specifically designed for AI-powered automation. They follow a standard structure, can register tools for AI models to use, and integrate with the Agentic approval and audit system.

= Can I build my own agents? =

Yes! Agents follow a simple structure similar to WordPress plugins. Create an agent.php file with headers, register your tools, and share with the community.

= Where should I install my custom agents? =

Install custom agents in `wp-content/agents/` directory (not inside the plugin folder). This ensures your agents survive plugin updates. 

The plugin comes with 10 bundled agents in `wp-content/plugins/agentic-plugin/library/` that update with the plugin, but your custom agents in `wp-content/agents/` will never be touched during updates.

= Is this production ready? =

Agentic Plugin is currently in beta. The core functionality is stable and ready for testing in production environments. We recommend thorough testing before deploying on critical sites.

= Which AI providers are supported? =

Currently supports OpenAI, Anthropic (Claude), and local models via Ollama.

= Is my data sent to external services? =

Only when using cloud AI providers. Local model support is available for privacy-sensitive deployments.

== Changelog ==

For the full changelog, see [changelog.txt](changelog.txt).

= 1.1.0 =
* Code quality and WordPress.org compliance release
* Added complete uninstall handler for GDPR compliance
* All PHP files now have complete header blocks
* Fixed SQL query formatting and unused parameter warnings

= 1.0.0 =
* **Production Release** - First stable release

== Upgrade Notice ==

= 1.1.0 =
Code quality release. GDPR-compliant uninstall handler added. No breaking changes.
