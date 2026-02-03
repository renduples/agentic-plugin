<?php
/**
 * Agentic Admin Dashboard
 *
 * @package    Agent_Builder
 * @subpackage Admin
 * @author     Agent Builder Team <support@agentic-plugin.com>
 * @license    GPL-2.0-or-later https://www.gnu.org/licenses/gpl-2.0.html
 * @link       https://agentic-plugin.com
 * @since      0.1.0
 *
 * php version 8.1
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Agentic\Audit_Log;
use Agentic\LLM_Client;

if ( ! current_user_can( 'manage_options' ) ) {
	wp_die( esc_html__( 'You do not have permission to access this page.', 'agent-builder' ) );
}

$audit         = new Audit_Log();
$stats         = $audit->get_stats( 'week' );
$llm           = new LLM_Client();
$is_configured = $llm->is_configured();
$provider      = $llm->get_provider();
$model         = $llm->get_model();

// Get actual count of activated agents.
$active_agents = get_option( 'agentic_active_agents', array() );
$active_count  = is_array( $active_agents ) ? count( $active_agents ) : 0;

// Check plugin license status.
$plugin_license_key = get_option( 'agentic_plugin_license_key', '' );
$license_status     = 'free'; // Default to free tier.
$license_display    = 'Free';

if ( ! empty( $plugin_license_key ) ) {
	// Check license status via marketplace API.
	$response = wp_remote_get(
		'https://agentic-plugin.com/wp-json/agentic-marketplace/v1/licenses/status',
		array(
			'timeout' => 5,
			'headers' => array(
				'Authorization' => 'Bearer ' . $plugin_license_key,
			),
		)
	);

	if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( isset( $data['success'] ) && $data['success'] && isset( $data['license']['status'] ) ) {
			$license_status = $data['license']['status'];
			$tier           = $data['license']['tier'] ?? 'pro';
			
			if ( 'active' === $license_status ) {
				$license_display = '<span style="color: #00a32a; font-weight: 600;">● ' . ucfirst( $tier ) . '</span>';
			} elseif ( 'grace_period' === $license_status ) {
				$license_display = '<span style="color: #dba617; font-weight: 600;">⚠ ' . ucfirst( $tier ) . ' (Expiring)</span>';
			} else {
				$license_display = '<span style="color: #d63638;">✕ Expired</span> <a href="https://agentic-plugin.com/pricing/" target="_blank">Renew</a>';
			}
		}
	}
} else {
	$license_display = 'Free <a href="https://agentic-plugin.com/pricing/" target="_blank" style="font-size: 12px;">(Upgrade)</a>';
}
?>
<div class="wrap agentic-admin">
	<h1>
		<span class="dashicons dashicons-superhero" style="font-size: 30px; margin-right: 10px;"></span>
		Agent Builder
	</h1>
	<p style="margin-bottom: 20px;">
		Need help? Visit our <a href="https://agentic-plugin.com/support/" target="_blank">Support Center</a> | <a href="https://github.com/renduples/agent-builder/wiki" target="_blank">Documentation</a>
	</p>

	<div class="agentic-dashboard-grid">
		<div class="agentic-card">
			<h2>Status</h2>
			<table class="widefat">
				<tr>
					<td><strong>License</strong></td>
					<td><?php echo wp_kses_post( $license_display ); ?></td>
				</tr>
				<tr>
					<td><strong>AI Provider</strong></td>
					<td><?php echo $is_configured ? esc_html( strtoupper( $provider ) ) . ' (Connected)' : '<a href="' . esc_url( admin_url( 'admin.php?page=agentic-settings' ) ) . '">Configure now</a>'; ?></td>
				</tr>
				<tr>
					<td><strong>Model</strong></td>
					<td>
						<?php
						if ( $is_configured ) {
							$mode = ucfirst( get_option( 'agentic_agent_mode', 'supervised' ) );
							echo esc_html( $model ) . ' <span style="color: #646970;">(' . esc_html( $mode ) . ')</span>';
						} else {
							echo 'None';
						}
						?>
					</td>
				</tr>
			</table>
		</div>

		<div class="agentic-card">
			<h2>Weekly Statistics</h2>
			<table class="widefat">
				<tr>
					<td><strong>Total Actions</strong></td>
					<td><?php echo esc_html( number_format( (int) ( $stats['total_actions'] ?? 0 ) ) ); ?></td>
				</tr>
				<tr>
					<td><strong>Tokens Used</strong></td>
					<td><?php echo esc_html( number_format( (int) ( $stats['total_tokens'] ?? 0 ) ) ); ?></td>
				</tr>
				<tr>
					<td><strong>Estimated Cost</strong></td>
					<td>$<?php echo esc_html( number_format( (float) ( $stats['total_cost'] ?? 0 ), 4 ) ); ?></td>
				</tr>
				<tr>
					<td><strong>Active Agents</strong></td>
					<td><?php echo esc_html( $active_count ); ?></td>
				</tr>
			</table>
		</div>

		<div class="agentic-card">
			<h2>Marketplace</h2>
			<?php
			// Fetch marketplace stats from API.
			$marketplace_stats = array(
				'latest_agent'   => array(
					'name' => 'N/A',
					'url'  => '',
				),
				'popular_agent'  => array(
					'name' => 'N/A',
					'url'  => '',
				),
				'user_sales'     => 0,
				'user_revenue'   => 0.00,
			);

			// Get developer API key for user-specific stats.
			$dev_api_key = get_option( 'agentic_developer_api_key', '' );

			$request_args = array( 'timeout' => 5 );
			if ( ! empty( $dev_api_key ) ) {
				$request_args['headers'] = array(
					'Authorization' => 'Bearer ' . $dev_api_key,
				);
			}

			$response = wp_remote_get(
				'https://agentic-plugin.com/wp-json/agentic-marketplace/v1/stats/dashboard',
				$request_args
			);

			if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
				$data = json_decode( wp_remote_retrieve_body( $response ), true );
				if ( isset( $data['success'] ) && $data['success'] ) {
					$marketplace_stats = array_merge( $marketplace_stats, $data['stats'] ?? array() );
				}
			}
			?>
			<table class="widefat">
				<tr>
					<td><strong>New Agent</strong></td>
					<td>
						<?php
						if ( ! empty( $marketplace_stats['latest_agent']['url'] ) ) {
							echo '<a href="' . esc_url( $marketplace_stats['latest_agent']['url'] ) . '" target="_blank">' . esc_html( $marketplace_stats['latest_agent']['name'] ) . '</a>';
						} else {
							echo esc_html( $marketplace_stats['latest_agent']['name'] );
						}
						?>
					</td>
				</tr>
				<tr>
					<td><strong>Popular Agent</strong></td>
					<td>
						<?php
						if ( ! empty( $marketplace_stats['popular_agent']['url'] ) ) {
							echo '<a href="' . esc_url( $marketplace_stats['popular_agent']['url'] ) . '" target="_blank">' . esc_html( $marketplace_stats['popular_agent']['name'] ) . '</a>';
						} else {
							echo esc_html( $marketplace_stats['popular_agent']['name'] );
						}
						?>
					</td>
				</tr>
				<tr>
					<td><strong>Agent Sales</strong></td>
					<td><?php echo esc_html( number_format( (int) $marketplace_stats['user_sales'] ) ); ?></td>
				</tr>
				<tr>
					<td><strong>Total Revenue</strong></td>
					<td>$<?php echo esc_html( number_format( (float) $marketplace_stats['user_revenue'], 2 ) ); ?></td>
				</tr>
			</table>
			<p style="margin-top: 15px;">
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=agentic-revenue' ) ); ?>" class="button button-primary">
					<?php echo ( $marketplace_stats['user_revenue'] > 0 ) ? 'View Revenue' : 'Earn Revenue'; ?>
				</a>
			</p>
		</div>

		<div class="agentic-card">
			<h2>Quick Actions</h2>
			<?php if ( ! $is_configured ) : ?>
				<p>
					<span class="dashicons dashicons-no-alt" style="color: #b91c1c; vertical-align: -2px;" title="Set up an AI provider and API key to enable the chatbot."></span>
					Chatbot offline
					<span class="dashicons dashicons-editor-help" title="Go to Settings to configure your AI provider and API key." style="vertical-align: -2px; margin-left: 6px;"></span>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=agentic-settings' ) ); ?>" style="margin-left: 6px;">Configure now</a>
				</p>
			<?php endif; ?>
			<p>
				<?php if ( $is_configured ) : ?>
					<a href="<?php echo esc_url( home_url( '/agent-chat/' ) ); ?>" class="button button-primary" target="_blank">
						Open Chat Interface
					</a>
				<?php endif; ?>
			</p>
			<p>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=agentic-approvals' ) ); ?>" class="button">
					View Approval Queue
				</a>
			</p>
		</div>

		<div class="agentic-card agentic-card-wide">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
				<h2 style="margin: 0;">Recent Activity</h2>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=agentic-audit' ) ); ?>" class="button">
					View Audit Log
				</a>
			</div>
			<?php
			$recent = $audit->get_recent( 10 );
			if ( empty( $recent ) ) :
				?>
				<p>No agent activity recorded yet.</p>
			<?php else : ?>
				<table class="widefat striped">
					<thead>
						<tr>
							<th>Time</th>
							<th>Agent</th>
							<th>Action</th>
							<th>Target</th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $recent as $entry ) : ?>
						<tr>
							<td>
								<?php
								$timestamp = strtotime( $entry['created_at'] );
								echo esc_html( wp_date( 'M j, Y g:i a', $timestamp ) );
								?>
							</td>
							<td><?php echo esc_html( $entry['agent_id'] ); ?></td>
							<td><?php echo esc_html( $entry['action'] ); ?></td>
							<td><?php echo esc_html( $entry['target_type'] ); ?></td>
						</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</div>
	</div>
</div>

<style>
.agentic-dashboard-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 20px;
	margin-top: 20px;
}

.agentic-card {
	background: #fff;
	border: 1px solid #c3c4c7;
	border-radius: 4px;
	padding: 20px;
}

.agentic-card h2 {
	margin-top: 0;
	padding-bottom: 10px;
	border-bottom: 1px solid #eee;
}

.agentic-card-wide {
	grid-column: 1 / -1;
}

.agentic-card .button {
	margin-bottom: 5px;
}
</style>
