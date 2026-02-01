<?php
/**
 * License AJAX Handlers
 *
 * Handles AJAX requests for license activation, deactivation, and refresh.
 *
 * @package    Agentic_Plugin
 * @subpackage Includes
 * @author     Agentic Plugin Team <support@agentic-plugin.com>
 * @license    GPL-2.0-or-later https://www.gnu.org/licenses/gpl-2.0.html
 * @link       https://agentic-plugin.com
 * @since      1.0.0
 *
 * php version 8.1
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Activate license via AJAX
 */
add_action(
	'wp_ajax_agentic_activate_license',
	function () {
		check_ajax_referer( 'agentic_license_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied.' ) );
		}

		$license_key = sanitize_text_field( wp_unslash( $_POST['license_key'] ?? '' ) );

		$result = \Agentic\License_Manager::activate( $license_key );

		if ( $result['success'] ) {
			wp_send_json_success( $result );
		} else {
			wp_send_json_error( $result );
		}
	}
);

/**
 * Deactivate license via AJAX
 */
add_action(
	'wp_ajax_agentic_deactivate_license',
	function () {
		check_ajax_referer( 'agentic_license_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied.' ) );
		}

		$result = \Agentic\License_Manager::deactivate();
		wp_send_json_success( $result );
	}
);

/**
 * Refresh license status via AJAX
 */
add_action(
	'wp_ajax_agentic_refresh_license',
	function () {
		check_ajax_referer( 'agentic_license_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied.' ) );
		}

		// Clear cache and validate.
		\Agentic\License_Manager::clear_cache();

		$license_key = \Agentic\License_Manager::get_license_key();

		if ( empty( $license_key ) ) {
			wp_send_json_error( array( 'message' => 'No license key found.' ) );
		}

		$result = \Agentic\License_Manager::validate_with_api( $license_key );

		if ( null === $result ) {
			wp_send_json_error( array( 'message' => 'Could not connect to license server. Please try again.' ) );
		}

		if ( isset( $result['valid'] ) && true === $result['valid'] ) {
			wp_send_json_success(
				array(
					'message' => 'License refreshed successfully!',
					'license' => $result['license'] ?? array(),
				)
			);
		} else {
			wp_send_json_error(
				array(
					'message' => $result['message'] ?? 'License is not valid.',
					'error'   => $result['error'] ?? 'invalid_license',
				)
			);
		}
	}
);
