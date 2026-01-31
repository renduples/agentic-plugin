<?php
/**
 * Agentic Settings Page
 *
 * @package Agentic_Plugin
 * @since 0.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Handle form submission.

if ( ! current_user_can( 'manage_options' ) ) {
	wp_die( esc_html__( 'You do not have permission to access this page.', 'agentic-plugin' ) );
}

if ( isset( $_POST['agentic_save_settings'] ) && check_admin_referer( 'agentic_settings_nonce' ) ) {
	// Core settings.
	update_option( 'agentic_llm_provider', sanitize_text_field( wp_unslash( $_POST['agentic_llm_provider'] ?? 'openai' ) ) );
	update_option( 'agentic_llm_api_key', sanitize_text_field( wp_unslash( $_POST['agentic_llm_api_key'] ?? '' ) ) );
	update_option( 'agentic_model', sanitize_text_field( wp_unslash( $_POST['agentic_model'] ?? 'gpt-4o' ) ) );
	update_option( 'agentic_agent_mode', sanitize_text_field( wp_unslash( $_POST['agentic_agent_mode'] ?? 'supervised' ) ) );

	// Cache settings.
	update_option( 'agentic_response_cache_enabled', isset( $_POST['agentic_response_cache_enabled'] ) );
	update_option( 'agentic_response_cache_ttl', absint( $_POST['agentic_response_cache_ttl'] ?? 3600 ) );

	// Security settings.
	update_option( 'agentic_security_enabled', isset( $_POST['agentic_security_enabled'] ) );
	update_option( 'agentic_rate_limit_authenticated', absint( $_POST['agentic_rate_limit_authenticated'] ?? 30 ) );
	update_option( 'agentic_rate_limit_anonymous', absint( $_POST['agentic_rate_limit_anonymous'] ?? 10 ) );
	update_option( 'agentic_allow_anonymous_chat', isset( $_POST['agentic_allow_anonymous_chat'] ) );


	// Handle cache clear.
	if ( isset( $_POST['agentic_clear_cache'] ) ) {
		$cleared = \Agentic\Response_Cache::clear_all();
		echo '<div class="notice notice-info"><p>Cleared ' . esc_html( $cleared ) . ' cached responses.</p></div>';
	}


	// Handle system check completion flag.
	if ( isset( $_POST['agentic_system_check_done'] ) ) {
		update_option( 'agentic_system_check_done', true );
	}

	echo '<div class="notice notice-success"><p>Settings saved successfully.</p></div>';
}

// Get current values.
$llm_provider = get_option( 'agentic_llm_provider', 'openai' );
$api_key      = get_option( 'agentic_llm_api_key', '' );
$model        = get_option( 'agentic_model', 'gpt-4o' );
$agent_mode   = get_option( 'agentic_agent_mode', 'supervised' );

// Cache settings.
$cache_enabled = get_option( 'agentic_response_cache_enabled', true );
$cache_ttl     = get_option( 'agentic_response_cache_ttl', 3600 );
$cache_stats   = \Agentic\Response_Cache::get_stats();

// Security settings.
$security_enabled = get_option( 'agentic_security_enabled', true );
$rate_limit_auth  = get_option( 'agentic_rate_limit_authenticated', 30 );
$rate_limit_anon  = get_option( 'agentic_rate_limit_anonymous', 10 );
$allow_anon_chat  = get_option( 'agentic_allow_anonymous_chat', false );
?>
<div class="wrap">
	<h1>Agentic Settings</h1>

	<?php
	$active_tab = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( $_GET['tab'] ) ) : 'general';
	?>

	<h2 class="nav-tab-wrapper">
		<a href="?page=agentic-settings&tab=general" class="nav-tab <?php echo 'general' === $active_tab ? 'nav-tab-active' : ''; ?>">General</a>
		<a href="?page=agentic-settings&tab=license" class="nav-tab <?php echo 'license' === $active_tab ? 'nav-tab-active' : ''; ?>">License</a>
		<a href="?page=agentic-settings&tab=cache" class="nav-tab <?php echo 'cache' === $active_tab ? 'nav-tab-active' : ''; ?>">Cache</a>
		<a href="?page=agentic-settings&tab=security" class="nav-tab <?php echo 'security' === $active_tab ? 'nav-tab-active' : ''; ?>">Security</a>
		<a href="?page=agentic-settings&tab=permissions" class="nav-tab <?php echo 'permissions' === $active_tab ? 'nav-tab-active' : ''; ?>">Permissions</a>
	</h2>

	<form method="post" action="">
		<?php wp_nonce_field( 'agentic_settings_nonce' ); ?>
		<input type="hidden" name="tab" value="<?php echo esc_attr( $active_tab ); ?>" />

		<?php if ( 'general' === $active_tab ) : ?>
		<h2>API Configuration</h2>
		<p>Configure your AI provider and model settings.</p>

		<table class="form-table">
			<tr>
				<th scope="row">
					<label for="agentic_llm_provider">LLM Provider</label>
				</th>
				<td>
					<select name="agentic_llm_provider" id="agentic_llm_provider">
						<option value="openai" <?php selected( $llm_provider, 'openai' ); ?>>OpenAI</option>
						<option value="anthropic" <?php selected( $llm_provider, 'anthropic' ); ?>>Anthropic (Claude)</option>
						<option value="xai" <?php selected( $llm_provider, 'xai' ); ?>>xAI (Grok)</option>
						<option value="google" <?php selected( $llm_provider, 'google' ); ?>>Google (Gemini)</option>
						<option value="mistral" <?php selected( $llm_provider, 'mistral' ); ?>>Mistral AI</option>
					</select>
					<a href="#" id="agentic-get-api-key" class="button" target="_blank" style="margin-left: 8px;">
						<span class="dashicons dashicons-external" style="margin-right: 4px; vertical-align: -2px;"></span>Get API Key
					</a>
					<p class="description">
						Choose your preferred AI provider for the agent builder.
					</p>
					<div id="agentic-api-key-instructions" style="margin-top: 12px; padding: 12px; background: #f0f6fc; border-left: 4px solid #0073aa; display: none;">
						<p style="margin: 0 0 8px 0; font-weight: 600;">How to get your API key:</p>
						<ol style="margin: 0; padding-left: 20px;" id="agentic-api-steps">
							<!-- Steps populated dynamically -->
						</ol>
					</div>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label for="agentic_llm_api_key">API Key</label>
				</th>
				<td>
					<input 
						type="password" 
						name="agentic_llm_api_key" 
						id="agentic_llm_api_key" 
						value="<?php echo esc_attr( $api_key ); ?>" 
						class="regular-text"
					/>
					<button type="button" id="agentic-test-api" class="button" style="margin-left: 8px;">Test</button>
					<p class="description" id="agentic-api-key-help">
						<!-- Updated dynamically based on provider -->
					</p>
					<div id="agentic-test-result" style="margin-top: 8px;"></div>
					<?php if ( ! empty( $api_key ) ) : ?>
						<p><span class="dashicons dashicons-yes-alt" style="color: #22c55e;"></span> API key is set</p>
					<?php endif; ?>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label for="agentic_model">Model</label>
				</th>
				<td>
					<select name="agentic_model" id="agentic_model" data-current-model="<?php echo esc_attr( $model ); ?>">
						<!-- Options populated dynamically based on provider -->
					</select>
					<p class="description" id="agentic-model-help">
						<!-- Updated dynamically based on provider -->
					</p>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label for="agentic_agent_mode">Agent Mode</label>
				</th>
				<td>
					<select name="agentic_agent_mode" id="agentic_agent_mode">
						<option value="disabled" <?php selected( $agent_mode, 'disabled' ); ?>>Disabled</option>
						<option value="supervised" <?php selected( $agent_mode, 'supervised' ); ?>>Supervised (Recommended)</option>
						<option value="autonomous" <?php selected( $agent_mode, 'autonomous' ); ?>>Autonomous</option>
					</select>
					<p class="description" id="agentic-agent-mode-help">
						<!-- Help text updated dynamically -->
					</p>
				</td>
			</tr>
		</table>

		<?php elseif ( 'license' === $active_tab ) : ?>
		<h2>License</h2>
		<p>Enter your license key to unlock premium features including access to the Agent Marketplace.</p>
		
		<?php
		$license_info = \Agentic\License_Manager::get_license_info();
		$license_key  = \Agentic\License_Manager::get_license_key();
		$is_valid     = \Agentic\License_Manager::is_valid();
		?>
		
		<?php if ( $is_valid && $license_info && 'active' === $license_info['status'] ) : ?>
			<div class="notice notice-success inline" style="padding: 12px; margin: 15px 0;">
				<p style="margin: 0; display: flex; align-items: center; gap: 8px;">
					<span class="dashicons dashicons-yes-alt" style="color: #22c55e;"></span>
					<strong>License Active</strong>
				</p>
			</div>
			
			<table class="form-table">
				<tr>
					<th scope="row">Status</th>
					<td>
						<span style="color: #22c55e; font-weight: 600;">● Active</span>
					</td>
				</tr>
				<tr>
					<th scope="row">License Key</th>
					<td>
						<code style="font-size: 14px;"><?php echo esc_html( $license_key ); ?></code>
					</td>
				</tr>
				<tr>
					<th scope="row">Expires</th>
					<td>
						<?php
						$expires_date = isset( $license_info['expires_at'] ) ? date_i18n( 'F j, Y', strtotime( $license_info['expires_at'] ) ) : 'Unknown';
						echo esc_html( $expires_date );
						?>
					</td>
				</tr>
				<tr>
					<th scope="row">Activations</th>
					<td>
						<?php
						$used  = $license_info['activations_used'] ?? 0;
						$limit = $license_info['activations_limit'] ?? 0;
						echo esc_html( $used . ' / ' . $limit . ' sites' );
						?>
					</td>
				</tr>
				<tr>
					<th scope="row">Features</th>
					<td>
						<?php
						$features = $license_info['features'] ?? array();
						if ( ! empty( $features ) ) {
							$feature_labels = array(
								'marketplace_access' => 'Agent Marketplace Access',
								'agent_upload'       => 'Upload & Sell Agents',
								'premium_support'    => 'Premium Support',
							);
							echo '<ul style="margin: 0; padding-left: 20px;">';
							foreach ( $features as $feature ) {
								$label = $feature_labels[ $feature ] ?? ucwords( str_replace( '_', ' ', $feature ) );
								echo '<li>' . esc_html( $label ) . '</li>';
							}
							echo '</ul>';
						} else {
							echo 'Standard features';
						}
						?>
					</td>
				</tr>
				<tr>
					<th scope="row">Actions</th>
					<td>
						<button type="button" class="button" id="agentic-deactivate-license">
							Deactivate License
						</button>
						<button type="button" class="button" id="agentic-refresh-license" style="margin-left: 8px;">
							Refresh Status
						</button>
						<p class="description">
							Deactivate to free up this activation slot for another site.
						</p>
					</td>
				</tr>
			</table>
		<?php else : ?>
			<div class="notice notice-warning inline" style="padding: 12px; margin: 15px 0;">
				<p style="margin: 0;">
					<span class="dashicons dashicons-warning" style="color: #f59e0b;"></span>
					No active license. Premium features are disabled.
				</p>
			</div>
			
			<table class="form-table">
				<tr>
					<th scope="row">
						<label for="agentic-license-key-input">Enter License Key</label>
					</th>
					<td>
						<input 
							type="text" 
							id="agentic-license-key-input" 
							placeholder="AGNT-XXXX-XXXX-XXXX-XXXX"
							value="<?php echo esc_attr( $license_key ); ?>"
							pattern="AGNT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
							style="width: 350px; font-family: monospace; font-size: 14px; text-transform: uppercase;"
						/>
						<button type="button" class="button button-primary" id="agentic-activate-license" style="margin-left: 8px;">
							Activate License
						</button>
						<p class="description">
							Enter the license key you received after purchase.
						</p>
						<div id="agentic-license-message" style="margin-top: 12px;"></div>
					</td>
				</tr>
			</table>
		<?php endif; ?>

		<?php elseif ( 'cache' === $active_tab ) : ?>
		<h2>Response Caching</h2>
		<p>Cache identical queries to save tokens and reduce latency.</p>
		
		<table class="form-table">
			<tr>
				<th scope="row">
					<label for="agentic_response_cache_enabled">Enable Response Cache</label>
				</th>
				<td>
					<label>
						<input 
							type="checkbox" 
							name="agentic_response_cache_enabled" 
							id="agentic_response_cache_enabled" 
							value="1"
							<?php checked( $cache_enabled ); ?>
						/>
						Cache identical messages to avoid repeated LLM calls
					</label>
					<p class="description">
						When enabled, exact-match queries return cached responses. Saves tokens and improves response time.
					</p>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label for="agentic_response_cache_ttl">Cache TTL</label>
				</th>
				<td>
					<select name="agentic_response_cache_ttl" id="agentic_response_cache_ttl">
						<option value="900" <?php selected( $cache_ttl, 900 ); ?>>15 minutes</option>
						<option value="1800" <?php selected( $cache_ttl, 1800 ); ?>>30 minutes</option>
						<option value="3600" <?php selected( $cache_ttl, 3600 ); ?>>1 hour (Recommended)</option>
						<option value="7200" <?php selected( $cache_ttl, 7200 ); ?>>2 hours</option>
						<option value="21600" <?php selected( $cache_ttl, 21600 ); ?>>6 hours</option>
						<option value="86400" <?php selected( $cache_ttl, 86400 ); ?>>24 hours</option>
					</select>
					<p class="description">
						How long to keep cached responses before they expire.
					</p>
				</td>
			</tr>

			<tr>
				<th scope="row">Cache Statistics</th>
				<td>
					<p>
						<strong>Cached entries:</strong> <?php echo esc_html( $cache_stats['entry_count'] ); ?><br>
						<strong>Status:</strong> <?php echo $cache_stats['enabled'] ? '<span style="color: #22c55e;">Active</span>' : '<span style="color: #b91c1c;">Disabled</span>'; ?>
					</p>
					<label>
						<input type="checkbox" name="agentic_clear_cache" value="1" />
						Clear all cached responses on save
					</label>
				</td>
			</tr>
		</table>

		<?php elseif ( 'security' === $active_tab ) : ?>
		<h2>Security Settings</h2>
		<p>Protect against prompt injection and abuse.</p>

		<table class="form-table">
			<tr>
				<th scope="row">
					<label for="agentic_security_enabled">Enable Security Filter</label>
				</th>
				<td>
					<label>
						<input 
							type="checkbox" 
							name="agentic_security_enabled" 
							id="agentic_security_enabled" 
							value="1"
							<?php checked( $security_enabled ); ?>
						/>
						Scan messages for prompt injection and malicious content
					</label>
					<p class="description">
						Blocks common injection patterns, rate limits requests, and flags PII. Adds &lt;1ms overhead.
					</p>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label for="agentic_rate_limit_authenticated">Rate Limit (Authenticated)</label>
				</th>
				<td>
					<input 
						type="number" 
						name="agentic_rate_limit_authenticated" 
						id="agentic_rate_limit_authenticated" 
						value="<?php echo esc_attr( $rate_limit_auth ); ?>" 
						min="5"
						max="100"
						class="small-text"
					/> requests per minute
					<p class="description">
						Maximum chat requests per minute for logged-in users.
					</p>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label for="agentic_rate_limit_anonymous">Rate Limit (Anonymous)</label>
				</th>
				<td>
					<input 
						type="number" 
						name="agentic_rate_limit_anonymous" 
						id="agentic_rate_limit_anonymous" 
						value="<?php echo esc_attr( $rate_limit_anon ); ?>" 
						min="1"
						max="30"
						class="small-text"
					/> requests per minute
					<p class="description">
						Maximum chat requests per minute for anonymous visitors (by IP).
					</p>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label for="agentic_allow_anonymous_chat">Allow Anonymous Chat</label>
				</th>
				<td>
					<label>
						<input 
							type="checkbox" 
							name="agentic_allow_anonymous_chat" 
							id="agentic_allow_anonymous_chat" 
							value="1"
							<?php checked( $allow_anon_chat ); ?>
						/>
						Allow non-logged-in users to chat via frontend shortcodes
					</label>
					<p class="description">
						When disabled, users must log in to use [agentic_chat] on the frontend.
					</p>
				</td>
			</tr>
		</table>

		<?php elseif ( 'permissions' === $active_tab ) : ?>
		<h2>Permissions</h2>
		<p>Configure what actions the agent can perform autonomously vs. with approval. The builder is sandboxed to <code>wp-content/plugins</code> and <code>wp-content/themes</code>.</p>
		
		<table class="widefat" style="max-width: 600px;">
			<thead>
				<tr>
					<th>Action</th>
					<th>Current Setting</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Read files from repository</td>
					<td><span class="dashicons dashicons-yes-alt" style="color: #22c55e;"></span> Always allowed</td>
				</tr>
				<tr>
					<td>Search code</td>
					<td><span class="dashicons dashicons-yes-alt" style="color: #22c55e;"></span> Always allowed</td>
				</tr>
				<tr>
					<td>Query WordPress database</td>
					<td><span class="dashicons dashicons-yes-alt" style="color: #22c55e;"></span> Always allowed</td>
				</tr>
				<tr>
					<td>Post comments</td>
					<td><span class="dashicons dashicons-yes-alt" style="color: #22c55e;"></span> Autonomous</td>
				</tr>
				<tr>
					<td>Update documentation (.md files)</td>
					<td><span class="dashicons dashicons-yes-alt" style="color: #22c55e;"></span> Autonomous</td>
				</tr>
				<tr>
					<td>Modify code files</td>
					<td><span class="dashicons dashicons-warning" style="color: #f59e0b;"></span> Requires approval</td>
				</tr>
			</tbody>
		</table>

		<?php endif; ?>

		<p class="submit">
			<input type="submit" name="agentic_save_settings" class="button-primary" value="Save Settings" />
		</p>
	</form>

	<script>
	document.getElementById('agentic-test-api').addEventListener('click', async function(e) {
		e.preventDefault();
		const result = document.getElementById('agentic-test-result');
		const btn = this;
		const provider = document.getElementById('agentic_llm_provider').value;
		const apiKey = document.getElementById('agentic_llm_api_key').value;
		const model = document.getElementById('agentic_model').value;
		
		if (!apiKey) {
			result.innerHTML = '<p style="color: #b91c1c; margin: 0;"><span class="dashicons dashicons-no-alt" style="vertical-align: -2px;"></span> ✗ Please enter an API key first</p>';
			return;
		}
		
		btn.disabled = true;
		const originalText = btn.innerHTML;
		btn.innerHTML = '<span class="spinner" style="float: none; vertical-align: -2px; margin-right: 4px;"></span>Testing...';
		
		try {
			const response = await fetch('<?php echo esc_js( rest_url( 'agentic/v1/test-api' ) ); ?>', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': '<?php echo esc_js( wp_create_nonce( 'wp_rest' ) ); ?>'
				},
				body: JSON.stringify({
					provider: provider,
					api_key: apiKey
				})
			});
			const data = await response.json();
			
			if (data.success) {
				result.innerHTML = '<p style="color: #22c55e; margin: 0;"><span class="dashicons dashicons-yes-alt" style="vertical-align: -2px;"></span> ✓ ' + data.message + ' Saving...</p>';
				
				// Save via AJAX without page refresh.
				const saveResponse = await fetch(window.location.href, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: new URLSearchParams({
						'agentic_save_settings': '1',
						'agentic_llm_provider': provider,
						'agentic_llm_api_key': apiKey,
						'agentic_model': model,
						'agentic_agent_mode': document.getElementById('agentic_agent_mode').value,
						'_wpnonce': '<?php echo esc_js( wp_create_nonce( 'agentic_settings_nonce' ) ); ?>',
					'_wp_http_referer': '<?php echo esc_js( esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ) ) ); ?>'
					})
				});
				
				if (saveResponse.ok) {
					result.innerHTML = '<p style="color: #22c55e; margin: 0;"><span class="dashicons dashicons-yes-alt" style="vertical-align: -2px;"></span> ✓ ' + data.message + ' Settings saved!</p>';
					// Update the "API key is set" indicator.
					const setIndicator = btn.parentElement.querySelector('p:last-child');
					if (!setIndicator || !setIndicator.querySelector('.dashicons-yes-alt')) {
						const indicator = document.createElement('p');
						indicator.innerHTML = '<span class="dashicons dashicons-yes-alt" style="color: #22c55e;"></span> API key is set';
						btn.parentElement.appendChild(indicator);
					}
				} else {
					result.innerHTML = '<p style="color: #b91c1c; margin: 0;"><span class="dashicons dashicons-warning" style="vertical-align: -2px;"></span> API key valid but save failed. Please use Save Settings button.</p>';
				}
				btn.disabled = false;
				btn.innerHTML = originalText;
			} else {
				result.innerHTML = '<p style="color: #b91c1c; margin: 0;"><span class="dashicons dashicons-no-alt" style="vertical-align: -2px;"></span> ✗ ' + (data.message || 'API test failed') + '</p>';
				btn.disabled = false;
				btn.innerHTML = originalText;
			}
		} catch (error) {
			result.innerHTML = '<p style="color: #b91c1c; margin: 0;"><span class="dashicons dashicons-no-alt" style="vertical-align: -2px;"></span> ✗ Error: ' + error.message + '</p>';
			btn.disabled = false;
			btn.innerHTML = originalText;
		}
	});
	</script>
</div>
