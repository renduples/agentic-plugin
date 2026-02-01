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

= 1.1.0 - 2026-02-01 =
Code quality and WordPress.org compliance release.
* Added complete uninstall handler for GDPR compliance (cleans up all plugin data on deletion).
* Added phpcs.xml configuration for consistent coding standards across the project.
* Added VS Code settings for WordPress Coding Standards integration.
* Improved: All PHP files now have complete header blocks (@package, @author, @license, @since, PHP version).
* Improved: File naming compliance (class-openai-client.php renamed to class-llm-client.php, class-agent-registry.php renamed to class-agentic-agent-registry.php).
* Fixed SQL query formatting issues in class-job-manager.php that caused phpcbf corruption.
* Fixed all unused parameter warnings with proper phpcs:ignore annotations.
* Fixed nonce verification warnings for read-only filter parameters.
* Fixed reserved keyword parameter ($match renamed to $pattern) in class-chat-security.php.
* Removed Python helper scripts (fix-comments.py, fix-standards.py, fix-remaining.py) - no longer needed.

= 1.0.1 - 2026-01-30 =
Patch release with minor fixes.
* Fixed minor PHPCS compliance issues.
* Improved documentation updates.

= 1.0.0 - 2026-01-28 =
Production-ready release, fully prepared for WordPress.org submission.
* Added full internationalization support (Spanish, French, German translations ready).
* Improved: Complete compliance with WordPress Coding Standards (WPCS) - 7,246 auto-fixes applied.
* Security: Hardened codebase - removed all exec() calls and related vulnerabilities.
* Improved: Simplified namespace to "Agentic" for cleaner code organization.
* Added System Requirements Checker for better compatibility diagnostics.
* Improved: Version synchronization and plugin renaming to "Agentic Plugin" for brand consistency.

= 0.1.3-alpha - 2026-01-28 =
Focus on stability and naming consistency.
* Added System Requirements Checker module.
* Improved: Namespace simplified to Agentic.
* Improved: Plugin renamed to "Agentic Plugin" (previous internal names deprecated).
* Improved: Version synchronization across files and docs.

= 0.1.2-alpha - 2026-01-15 =
Introduction of background processing capabilities.
* Added Async Job Queue System for reliable background tasks.
* Added real-time progress tracking for long-running operations.
* Added Job management API for developers and future extensions.
* Improved: Background processing infrastructure to prevent timeouts on large sites.

= 0.1.0-alpha - 2026-01-01 =
Initial public alpha release - foundation of the Agentic ecosystem.
* Added core no-code AI agent builder.
* Added 10 pre-built community agents (Content, SEO, E-commerce, etc.).
* Added admin dashboard for agent management and configuration.
* Added multi-LLM support (OpenAI, Anthropic, Google Gemini, xAI Grok, local Ollama).
* Added secure human-in-the-loop approval workflow and audit trails.
* Added marketplace foundation (agent sharing and monetization prep).

== Upgrade Notice ==

= 1.1.0 =
Code quality release. GDPR-compliant uninstall handler added. No breaking changes.

= 1.0.0 =
First stable release. Smooth upgrade from beta - no database migrations required.

= 0.1.3-alpha =
Major naming changes: Namespace simplified. System Requirements Checker added.

= 0.1.2-alpha =
Async job queue system added for long-running tasks. No breaking changes.

= 0.1.0-alpha =
Initial alpha release. Not recommended for production use.
