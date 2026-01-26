/**
 * License Management JavaScript
 *
 * Handles license activation, deactivation, and refresh via AJAX.
 *
 * @package Agentic_Plugin
 * @since 1.0.0
 */

(function ($) {
	'use strict';

	/**
	 * Show message in the license message area
	 */
	function showMessage(message, type = 'info') {
		const messageEl = $('#agentic-license-message');
		const classes = {
			success: 'notice notice-success inline',
			error: 'notice notice-error inline',
			info: 'notice notice-info inline'
		};

		messageEl
			.removeClass('notice-success notice-error notice-info')
			.addClass(classes[type])
			.html('<p>' + message + '</p>')
			.show();
	}

	/**
	 * Activate license
	 */
	$('#agentic-activate-license').on('click', function () {
		const button = $(this);
		const licenseKey = $('#agentic-license-key-input').val().trim().toUpperCase();

		// Validate format.
		const licensePattern = /^AGNT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
		if (!licensePattern.test(licenseKey)) {
			showMessage('Please enter a valid license key in the format: AGNT-XXXX-XXXX-XXXX-XXXX', 'error');
			return;
		}

		// Disable button and show loading.
		button.prop('disabled', true).text('Activating...');
		showMessage('Contacting license server...', 'info');

		$.ajax({
			url: ajaxurl,
			method: 'POST',
			data: {
				action: 'agentic_activate_license',
				nonce: agenticLicense.nonce,
				license_key: licenseKey
			},
			success: function (response) {
				if (response.success) {
					showMessage(response.data.message || 'License activated successfully!', 'success');
					// Reload page after 1.5 seconds to show new UI.
					setTimeout(() => location.reload(), 1500);
				} else {
					showMessage(response.data.message || 'License activation failed.', 'error');
					button.prop('disabled', false).text('Activate License');
				}
			},
			error: function () {
				showMessage('Connection error. Please try again.', 'error');
				button.prop('disabled', false).text('Activate License');
			}
		});
	});

	/**
	 * Deactivate license
	 */
	$('#agentic-deactivate-license').on('click', function () {
		if (!confirm('Are you sure you want to deactivate your license? This will disable premium features on this site.')) {
			return;
		}

		const button = $(this);
		button.prop('disabled', true).text('Deactivating...');

		$.ajax({
			url: ajaxurl,
			method: 'POST',
			data: {
				action: 'agentic_deactivate_license',
				nonce: agenticLicense.nonce
			},
			success: function (response) {
				if (response.success) {
					alert(response.data.message || 'License deactivated successfully.');
					location.reload();
				} else {
					alert(response.data.message || 'Deactivation failed.');
					button.prop('disabled', false).text('Deactivate License');
				}
			},
			error: function () {
				alert('Connection error. Please try again.');
				button.prop('disabled', false).text('Deactivate License');
			}
		});
	});

	/**
	 * Refresh license status
	 */
	$('#agentic-refresh-license').on('click', function () {
		const button = $(this);
		button.prop('disabled', true).text('Refreshing...');

		$.ajax({
			url: ajaxurl,
			method: 'POST',
			data: {
				action: 'agentic_refresh_license',
				nonce: agenticLicense.nonce
			},
			success: function (response) {
				if (response.success) {
					alert(response.data.message || 'License refreshed successfully!');
					location.reload();
				} else {
					alert(response.data.message || 'Could not refresh license.');
					button.prop('disabled', false).text('Refresh Status');
				}
			},
			error: function () {
				alert('Connection error. Please try again.');
				button.prop('disabled', false).text('Refresh Status');
			}
		});
	});

	/**
	 * Auto-format license key input
	 */
	$('#agentic-license-key-input').on('input', function () {
		let value = $(this).val().toUpperCase().replace(/[^A-Z0-9]/g, '');
		
		// Add AGNT- prefix if not present.
		if (!value.startsWith('AGNT')) {
			value = 'AGNT' + value;
		}
		
		// Remove AGNT prefix for formatting, then re-add.
		value = value.substring(4);
		
		// Split into groups of 4.
		const parts = value.match(/.{1,4}/g) || [];
		const formatted = 'AGNT-' + parts.slice(0, 4).join('-');
		
		$(this).val(formatted);
	});

})(jQuery);
