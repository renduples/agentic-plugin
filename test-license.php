<?php
/**
 * Test Script for License System
 *
 * This script tests the client-side license implementation.
 * Run this from WordPress admin or via WP-CLI.
 *
 * Usage: wp eval-file test-license.php
 */

// Load WordPress.
require_once __DIR__ . '/../../../wp-load.php';

echo "=== Agentic License System Test ===\n\n";

// Test 1: License Key Sanitization.
echo "Test 1: License Key Sanitization\n";
$test_keys = array(
	'agnt-a1b2-c3d4-e5f6-g7h8',         // Lowercase.
	'AGNT-A1B2-C3D4-E5F6-G7H8',         // Uppercase.
	'AGNT A1B2 C3D4 E5F6 G7H8',         // Spaces.
	'AGNT-A1B2-C3D4-E5F6-G7H8!!!',      // Invalid chars.
);

foreach ( $test_keys as $key ) {
	$sanitized = \Agentic\License_Manager::sanitize_key( $key );
	echo "  Input:  $key\n";
	echo "  Output: $sanitized\n\n";
}

// Test 2: Get License Status.
echo "Test 2: Get Current License Status\n";
$license_key = \Agentic\License_Manager::get_license_key();
echo "  Stored Key: " . ( $license_key ? $license_key : 'None' ) . "\n";

$is_valid = \Agentic\License_Manager::is_valid();
echo "  Is Valid: " . ( $is_valid ? 'Yes' : 'No' ) . "\n";

$info = \Agentic\License_Manager::get_license_info();
if ( $info ) {
	echo "  License Info:\n";
	print_r( $info );
} else {
	echo "  No license info available\n";
}
echo "\n";

// Test 3: Test Signature Generation.
echo "Test 3: Signature Generation\n";
$test_key  = 'AGNT-TEST-0001-VALID-KEY1';
$site_url  = home_url();
echo "  License: $test_key\n";
echo "  Site URL: $site_url\n";

// Note: This will use the temporary salt since we haven't set the real one yet.
$reflection = new ReflectionClass( '\Agentic\License_Manager' );
$method     = $reflection->getMethod( 'generate_signature' );
$method->setAccessible( true );
$signature = $method->invoke( null, $test_key, $site_url );
echo "  Signature: $signature\n\n";

// Test 4: Check Required Features.
echo "Test 4: Feature Checks\n";
$features = array( 'marketplace_access', 'agent_upload', 'premium_support' );
foreach ( $features as $feature ) {
	$has_feature = \Agentic\License_Manager::has_feature( $feature );
	echo "  $feature: " . ( $has_feature ? 'Available' : 'Not Available' ) . "\n";
}
echo "\n";

// Test 5: Grace Period Check.
echo "Test 5: Grace Period Test\n";
$last_valid = get_option( 'agentic_license_last_valid_time', 0 );
if ( $last_valid ) {
	$time_since = time() - $last_valid;
	$days       = floor( $time_since / DAY_IN_SECONDS );
	echo "  Last valid: $days days ago\n";
	echo "  Within grace period: " . ( $time_since < ( 7 * DAY_IN_SECONDS ) ? 'Yes' : 'No' ) . "\n";
} else {
	echo "  Never validated\n";
}
echo "\n";

// Test 6: API Request Simulation (won't actually connect unless API is live).
echo "Test 6: API Connection Test\n";
echo "  Testing connection to: " . \Agentic\License_Manager::class . "::API_URL\n";

// Get the API URL via reflection.
$reflection = new ReflectionClass( '\Agentic\License_Manager' );
$constants  = $reflection->getConstants();
$api_url    = $constants['API_URL'];
echo "  API URL: $api_url\n";

// Try to ping the base URL.
$response = wp_remote_get( $api_url, array( 'timeout' => 5 ) );
if ( is_wp_error( $response ) ) {
	echo "  Status: Error - " . $response->get_error_message() . "\n";
} else {
	$code = wp_remote_retrieve_response_code( $response );
	echo "  HTTP Status: $code\n";
	if ( 200 === $code || 404 === $code ) {
		echo "  Server is reachable (404 expected until endpoints are deployed)\n";
	}
}
echo "\n";

echo "=== Test Complete ===\n";
echo "\nNext Steps:\n";
echo "1. Retrieve hash salt from server and set in License_Manager class\n";
echo "2. Deploy license API endpoints on agentic-plugin.com\n";
echo "3. Test activation with a real test key\n";
echo "4. Verify marketplace gating works correctly\n";
