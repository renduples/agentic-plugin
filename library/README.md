# Agentic Agent Library

This directory contains open source example agents that demonstrate the Agentic Plugin agent architecture. These agents are functional, tested, and can be installed on your site.

## Available Agents

### Content Agents

| Agent | Description | Tools |
|-------|-------------|-------|
| **[Content Assistant](content-assistant/)** | Helps draft, edit, and optimize blog posts and pages | `analyze_content`, `suggest_title`, `improve_excerpt` |
| **[SEO Analyzer](seo-analyzer/)** | Analyzes posts for SEO best practices | `seo_analyze_post`, `seo_site_audit`, `seo_check_indexability` |

### Admin Agents

| Agent | Description | Tools |
|-------|-------------|-------|
| **[Security Monitor](security-monitor/)** | Monitors site for security issues and vulnerabilities | `security_scan`, `check_file_permissions`, `list_admin_users` |

### E-commerce Agents

| Agent | Description | Tools |
|-------|-------------|-------|
| **[Product Describer](product-describer/)** | Generates compelling WooCommerce product descriptions | `generate_product_description`, `analyze_product_listing`, `bulk_optimize_products`, `generate_product_meta` |

### Frontend Agents

| Agent | Description | Tools |
|-------|-------------|-------|
| **[Comment Moderator](comment-moderator/)** | Auto-moderates comments for spam and toxicity | `analyze_comment`, `bulk_moderate`, `get_moderation_stats` |

### Marketing Agents

| Agent | Description | Tools |
|-------|-------------|-------|
| **[Social Media Manager](social-media/)** | Manages social media campaigns across multiple platforms | `create_social_post`, `create_twitter_thread`, `generate_content`, `get_campaign_stats`, `get_hashtag_suggestions` |

### Developer Agents

| Agent | Description | Tools |
|-------|-------------|-------|
| **[Code Generator](code-generator/)** | Generates WordPress code snippets and scaffolding | `generate_cpt`, `generate_taxonomy`, `generate_shortcode`, `generate_hook_example`, `list_common_hooks` |
| **[Theme Builder](theme-builder/)** | Builds and maintains WordPress themes, creates child themes, clones starters | `create_theme`, `clone_theme`, `create_child_theme`, `write_theme_file`, `update_theme_json`, `generate_css` |
| **[Developer Agent](developer-agent/)** | Your guide to the Agentic Plugin ecosystem | `search_docs`, `explain_concept`, `list_hooks` |
| **[Agent Builder](agent-builder/)** | Meta-agent that creates new agents from natural language descriptions | `analyze_requirements`, `generate_agent`, `create_agent_files`, `validate_agent_code`, `generate_tool_schema` |

## Installing Agents

1. Go to **Agentic → Add New** in your WordPress admin
2. Browse available agents
3. Click **Install Now** on the agent you want
4. Go to **Agentic → Agents** and click **Activate**

## Creating Your Own Agent

See the [Agent Development Guide](../AGENT_DEVELOPMENT.md) for complete documentation on building your own agents.

### Quick Start

```php
<?php
/**
 * Agent Name: My Agent
 * Version: 1.0.0
 * Description: Brief description of what this agent does.
 * Author: Your Name
 * Category: Content
 * Tags: example, starter
 * Icon: 🤖
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class My_Agent {
    public function __construct() {
        add_action( 'agentic_agents_loaded', [ $this, 'init' ] );
    }

    public function init(): void {
        add_filter( 'agentic_agent_tools', [ $this, 'register_tools' ] );
    }

    public function register_tools( array $tools ): array {
        $tools['my_tool'] = [
            'name'        => 'my_tool',
            'description' => 'Does something useful',
            'parameters'  => [
                'type'       => 'object',
                'properties' => [
                    'input' => [
                        'type'        => 'string',
                        'description' => 'The input to process',
                    ],
                ],
                'required' => [ 'input' ],
            ],
            'handler' => [ $this, 'handle_my_tool' ],
        ];
        return $tools;
    }

    public function handle_my_tool( array $args ): array {
        return [ 'result' => 'Processed: ' . $args['input'] ];
    }
}

new My_Agent();
```

## Contributing

Want to contribute an agent to the library? 

1. Fork the repository
2. Create your agent in a new directory under `library/`
3. Follow the coding standards in [AGENT_DEVELOPMENT.md](../AGENT_DEVELOPMENT.md)
4. Submit a pull request

## License

All agents in this library are licensed under GPL v2 or later, consistent with WordPress.
