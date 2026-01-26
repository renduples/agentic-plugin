# WordPress Standards Compliance & Security Audit

**Date**: January 25, 2026  
**Status**: beta; pre-production housecleaning  
**Action**: Fix BEFORE public release

---

## 🚨 Critical Issues Found

### 1. **Missing Permission Checks (HIGH SEVERITY)**
- ❌ **admin/dashboard.php** – NO current_user_can check (shows data to unauthorized users)
- ❌ **admin/agents.php** – NO current_user_can check  
- ❌ **admin/agents-add.php** – NO current_user_can check
- ❌ **admin/audit.php** – NO current_user_can check
- ❌ **admin/approvals.php** – Has check_admin_referer but NO current_user_can
- ✅ **admin/settings.php** – Has both nonce and referer (but mixed approach)

**Fix Required**: Add current_user_can('manage_options') to ALL admin pages at top

### 2. **Inconsistent @package DocBlocks**
- ❌ **admin/settings.php** – @package = "Agentic_WordPress" (inconsistent with core)
- ❌ **admin/audit.php** – @package = "Agentic_WordPress"
- ❌ **admin/approvals.php** – @package = "Agentic_WordPress"
- ✅ **agentic-core.php** – @package = "Agentic_Plugin"
- ✅ **admin/dashboard.php** – @package = "Agentic_Plugin"

**Fix Required**: Standardize ALL to @package Agentic_Plugin

### 3. **Missing Function Documentation**
- Many functions lack complete PHPdoc blocks
- Missing @param and @return tags
- Core classes need @since tags consistent with 0.1.0

**Fix Required**: Add full docblocks to all public methods

### 4. **Incomplete Nonce Verification**
- ❌ **admin/agents.php** – GET nonce via $_GET without wp_verify_nonce before processing
- ❌ **admin/agents-add.php** – Same issue
- ⚠️ **admin/approvals.php** – check_admin_referer for POST but not early enough
- ⚠️ **admin/settings.php** – Mixed check_admin_referer + wp_nonce_field

**Fix Required**: Use consistent wp_verify_nonce() for ALL nonces

### 5. **Missing File Headers in Templates**
- ❌ **templates/chat-interface.php** – Missing file header/docblock
- ✅ **Other template files** – Present

**Fix Required**: Add proper docblock to all template files

### 6. **Unused/Placeholder Files**
- ❓ **readme.txt** – Is this used? (package.json or composer.json not present)
- ❓ **agentic-logo.png** – Used anywhere?

**Fix Required**: Verify these are actually needed or remove

### 7. **Security: API Keys & Credentials**
- ⚠️ **get_option('agentic_repo_path', ABSPATH)** – Storing sensitive paths
- ⚠️ **get_option('agentic_xai_api_key')** – API keys stored in wp_options (should be encrypted)
- Issue: No note in SECURITY.md about this

**Risk Level**: MEDIUM (WordPress db is typically as secure as server access, but should be documented)

### 8. **Escape/Sanitize Audit**
Sample checks needed in:
- Settings page POST handling
- Admin page output (verify all esc_html, esc_url, esc_attr used)
- REST API input validation

---

## ✅ What's Correct

✅ ABSPATH checks in all core files  
✅ Namespace declarations (Agentic\Core)  
✅ singleton pattern in main class  
✅ Hook-based initialization  
✅ Most output ESCAPED (esc_html, esc_url, esc_attr)  
✅ POST handlers use some nonce checks  

---

## 📋 Action Plan (Priority Order)

### Phase 1: CRITICAL - Security (Before any deploy)
1. ✅ Add current_user_can('manage_options') to ALL admin pages (top of file)
2. ✅ Replace mixed nonce approaches with consistent wp_verify_nonce()
3. ✅ Add check_admin_referer() to ALL POST handlers
4. ✅ Verify no hardcoded secrets in code (grep search)
5. ✅ Document API key storage security in SECURITY.md

### Phase 2: HIGH - Standards Compliance
1. ✅ Standardize @package to "Agentic_Plugin" across ALL files
2. ✅ Add proper docblocks to all admin pages
3. ✅ Add docblocks to all class methods
4. ✅ Add @since 0.1.0 to all public methods
5. ✅ Add @return tags to all methods

### Phase 3: MEDIUM - Code Quality
1. ✅ Verify file headers in ALL template files
2. ✅ Add file documentation comments
3. ✅ Add inline comments to complex logic
4. ✅ Review and document each admin page's purpose

### Phase 4: LOW - Cleanup
1. ✅ Identify and remove unused files (readme.txt if not needed)
2. ✅ Audit library agents for same standards
3. ✅ Create STANDARDS.md documenting WordPress compliance approach

---

## Files to Modify

### High Priority (Security)
- /admin/dashboard.php
- /admin/agents.php
- /admin/agents-add.php
- /admin/audit.php
- /admin/approvals.php
- /admin/settings.php

### Medium Priority (Standards)
- /agentic-core.php (main file - add more docs)
- /includes/class-*.php (all classes)
- /templates/chat-interface.php
- /library/*/agent.php (10 agents)

### Low Priority (Cleanup)
- readme.txt (verify usage)
- agentic-logo.png (verify usage)

---

## Testing After Changes

1. Install plugin
2. Activate
3. Try accessing each admin page as non-admin (should get denied)
4. Try as admin (should work)
5. Test nonce failures (modify nonce, should fail)
6. Check audit log for all actions
7. Verify no errors in debug.log

---

## Standards Applied

- **WordPress Coding Standards** (https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
- **WordPress Plugin Security** (https://developer.wordpress.org/plugins/security/)
- **WordPress Data Validation** (https://developer.wordpress.org/plugins/sanitizing-output/)
- **PHP Naming** (PSR-12 compatible where possible)

---

## Estimated Effort

- Phase 1 (Security): ~2-3 hours
- Phase 2 (Standards): ~1-2 hours
- Phase 3 (Cleanup): ~30 min
- Phase 4 (Low): ~1 hour

**Total**: ~5-6 hours of hands-on work

---

**Next Step**: Start with Phase 1 (security fixes)
