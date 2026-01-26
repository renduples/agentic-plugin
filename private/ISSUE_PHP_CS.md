# PHPCS cleanup: 311 errors and 60 warnings remaining

**Summary**
- PHPCS/WPCS installed; initial scan reported 5,949 errors and 224 warnings.
- After PHPCBF and manual fixes: 311 errors and 60 warnings remain across 15 files.

**Key files with violations**
- includes/class-agent-registry.php — 68
- includes/class-marketplace-client.php — 42
- admin/settings.php — 24
- admin/agents.php — 23
- admin/agents-add.php — 23
- includes/class-response-cache.php — 23
- includes/class-rest-api.php — 21
- includes/class-agent-controller.php — 21
- includes/class-chat-security.php — 30
- includes/class-agent-tools.php — 30
- admin/audit.php — 5

**Common issues**
- Variable shadowing of WordPress globals
- Missing `wp_unslash()` before sanitization
- Yoda conditions
- Translator comments for strings with placeholders
- Unused parameters
- Database caching warnings (informational)

**Completed**
- Five files at 0 errors: chat-interface.php, class-approval-queue.php, class-agent-base.php, class-openai-client.php, class-shortcodes.php.
- Pricing links added; licensing UI in place.

**Next steps**
- Fix or suppress remaining violations.
- Rerun `vendor/bin/phpcs --standard=WordPress -d memory_limit=512M --ignore=vendor admin includes templates`.
