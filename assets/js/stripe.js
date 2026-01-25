/**
 * Agentic Stripe Payment Handler
 *
 * @package Agentic_Plugin
 * @since 0.2.0
 */

(function($) {
    'use strict';

    const StripePayment = {
        stripe: null,

        /**
         * Initialize Stripe
         */
        init: function() {
            if (typeof Stripe === 'undefined' || !agenticStripe.publishableKey) {
                console.warn('Stripe not loaded or publishable key missing');
                return;
            }

            this.stripe = Stripe(agenticStripe.publishableKey);
            this.bindEvents();
        },

        /**
         * Bind event handlers
         */
        bindEvents: function() {
            const self = this;

            // Purchase button click
            $(document).on('click', '.agentic-purchase-btn, a[href="#purchase"]', function(e) {
                e.preventDefault();
                
                const $btn = $(this);
                const agentId = $btn.data('agent-id') || self.getAgentIdFromPage();
                
                if (!agentId) {
                    alert(agenticStripe.strings.error);
                    return;
                }

                self.initiateCheckout(agentId, $btn);
            });
        },

        /**
         * Get agent ID from page
         */
        getAgentIdFromPage: function() {
            // Try to get from body class
            const bodyClasses = document.body.className.split(' ');
            for (const cls of bodyClasses) {
                if (cls.startsWith('postid-')) {
                    return parseInt(cls.replace('postid-', ''), 10);
                }
            }
            
            // Try to get from data attribute
            return $('[data-agent-id]').first().data('agent-id') || null;
        },

        /**
         * Initiate checkout
         */
        initiateCheckout: function(agentId, $btn) {
            const self = this;
            const originalText = $btn.text();
            
            $btn.prop('disabled', true).text(agenticStripe.strings.processing);

            $.ajax({
                url: agenticStripe.checkoutUrl,
                method: 'POST',
                headers: {
                    'X-WP-Nonce': agenticStripe.nonce
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    agent_id: agentId
                }),
                success: function(response) {
                    if (response.checkout_url) {
                        // Redirect to Stripe Checkout
                        window.location.href = response.checkout_url;
                    } else if (response.session_id) {
                        // Use Stripe.js to redirect
                        self.stripe.redirectToCheckout({
                            sessionId: response.session_id
                        }).then(function(result) {
                            if (result.error) {
                                alert(result.error.message);
                                $btn.prop('disabled', false).text(originalText);
                            }
                        });
                    } else {
                        alert(agenticStripe.strings.error);
                        $btn.prop('disabled', false).text(originalText);
                    }
                },
                error: function(xhr) {
                    let message = agenticStripe.strings.error;
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        message = xhr.responseJSON.message;
                    }
                    alert(message);
                    $btn.prop('disabled', false).text(originalText);
                }
            });
        }
    };

    // Initialize on document ready
    $(document).ready(function() {
        StripePayment.init();
    });

})(jQuery);
