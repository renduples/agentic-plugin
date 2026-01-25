/**
 * Agent Submission Form JavaScript
 *
 * @package Agentic_Plugin
 * @since 0.2.0
 */

(function($) {
    'use strict';

    const Submission = {
        /**
         * Initialize
         */
        init: function() {
            this.form = $('#agentic-submit-agent-form');
            this.submitBtn = $('#submit-agent-btn');
            this.notice = $('#submission-notice');
            this.fileInput = $('#agent_zip');
            this.uploadArea = $('#file-upload-area');
            
            if (!this.form.length) {
                return;
            }

            this.bindEvents();
            this.initSlugGeneration();
        },

        /**
         * Bind events
         */
        bindEvents: function() {
            const self = this;

            // Form submission
            this.form.on('submit', function(e) {
                e.preventDefault();
                self.handleSubmit();
            });

            // File input change
            this.fileInput.on('change', function() {
                self.handleFileSelect(this.files[0]);
            });

            // Drag and drop
            this.uploadArea
                .on('dragover dragenter', function(e) {
                    e.preventDefault();
                    $(this).addClass('drag-over');
                })
                .on('dragleave drop', function(e) {
                    e.preventDefault();
                    $(this).removeClass('drag-over');
                })
                .on('drop', function(e) {
                    const files = e.originalEvent.dataTransfer.files;
                    if (files.length) {
                        self.fileInput[0].files = files;
                        self.handleFileSelect(files[0]);
                    }
                });

            // Premium pricing toggle
            $('input[name="agent_license_type"]').on('change', function() {
                const isPremium = $(this).val() === 'premium';
                $('.premium-price-row').toggle(isPremium);
                $('#agent_price').prop('required', isPremium);
            });

            // Remove file button
            $(document).on('click', '.remove-file', function() {
                self.clearFile();
            });
        },

        /**
         * Auto-generate slug from name
         */
        initSlugGeneration: function() {
            const nameInput = $('#agent_name');
            const slugInput = $('#agent_slug');
            let manualSlug = false;

            // Check if slug was manually edited
            slugInput.on('input', function() {
                manualSlug = true;
            });

            // Auto-generate slug from name
            nameInput.on('input', function() {
                if (!manualSlug && !slugInput.val()) {
                    const slug = $(this).val()
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .substring(0, 50);
                    slugInput.val(slug);
                }
            });
        },

        /**
         * Handle file selection
         */
        handleFileSelect: function(file) {
            if (!file) {
                return;
            }

            // Validate file type
            if (!file.name.endsWith('.zip')) {
                this.showNotice(agenticSubmission.strings.invalidFileType, 'error');
                this.clearFile();
                return;
            }

            // Validate file size
            if (file.size > agenticSubmission.maxFileSize) {
                this.showNotice(agenticSubmission.strings.fileTooLarge, 'error');
                this.clearFile();
                return;
            }

            // Update UI
            const fileSize = this.formatFileSize(file.size);
            this.uploadArea.find('.upload-placeholder').hide();
            this.uploadArea.find('.file-info')
                .html(`
                    <span class="dashicons dashicons-yes-alt"></span>
                    <span class="file-name">${this.escapeHtml(file.name)}</span>
                    <span class="file-size">(${fileSize})</span>
                    <span class="remove-file dashicons dashicons-dismiss"></span>
                `)
                .show();

            this.hideNotice();
        },

        /**
         * Clear file selection
         */
        clearFile: function() {
            this.fileInput.val('');
            this.uploadArea.find('.file-info').hide();
            this.uploadArea.find('.upload-placeholder').show();
        },

        /**
         * Handle form submission
         */
        handleSubmit: function() {
            const self = this;

            // Basic validation
            if (!this.form[0].checkValidity()) {
                this.form[0].reportValidity();
                return;
            }

            // Check file
            if (!this.fileInput[0].files.length) {
                this.showNotice('Please select a ZIP file to upload.', 'error');
                return;
            }

            // Show loading state
            this.setLoading(true);

            // Prepare form data
            const formData = new FormData(this.form[0]);
            formData.append('action', 'agentic_submit_agent');

            // Submit via AJAX
            $.ajax({
                url: agenticSubmission.ajaxUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    self.setLoading(false);

                    if (response.success) {
                        self.showNotice(response.data.message, 'success');
                        self.form[0].reset();
                        self.clearFile();

                        // Redirect to dashboard after delay
                        if (response.data.dashboard) {
                            setTimeout(function() {
                                window.location.href = response.data.dashboard;
                            }, 2000);
                        }
                    } else {
                        self.showNotice(response.data || agenticSubmission.strings.error, 'error');
                    }
                },
                error: function() {
                    self.setLoading(false);
                    self.showNotice(agenticSubmission.strings.error, 'error');
                }
            });
        },

        /**
         * Set loading state
         */
        setLoading: function(loading) {
            if (loading) {
                this.submitBtn.prop('disabled', true);
                this.submitBtn.find('.btn-text').hide();
                this.submitBtn.find('.btn-loading').show();
            } else {
                this.submitBtn.prop('disabled', false);
                this.submitBtn.find('.btn-text').show();
                this.submitBtn.find('.btn-loading').hide();
            }
        },

        /**
         * Show notice
         */
        showNotice: function(message, type) {
            this.notice
                .removeClass('success error')
                .addClass(type)
                .html(this.escapeHtml(message))
                .slideDown();

            // Scroll to notice
            $('html, body').animate({
                scrollTop: this.notice.offset().top - 100
            }, 300);
        },

        /**
         * Hide notice
         */
        hideNotice: function() {
            this.notice.slideUp();
        },

        /**
         * Format file size
         */
        formatFileSize: function(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        /**
         * Escape HTML
         */
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };

    /**
     * Stripe Connect module for developer dashboard
     */
    const StripeConnect = {
        /**
         * Initialize
         */
        init: function() {
            this.startBtn = $('#start-stripe-onboarding');
            this.continueBtn = $('#continue-stripe-onboarding');
            this.dashboardBtn = $('#open-stripe-dashboard');
            this.earningsContainer = $('#earnings-container');
            
            if (!this.startBtn.length && !this.continueBtn.length && !this.dashboardBtn.length) {
                return;
            }

            this.bindEvents();
            
            // Load earnings if container exists
            if (this.earningsContainer.length) {
                this.loadEarnings();
            }
        },

        /**
         * Bind events
         */
        bindEvents: function() {
            const self = this;

            this.startBtn.on('click', function() {
                self.startOnboarding($(this));
            });

            this.continueBtn.on('click', function() {
                self.startOnboarding($(this));
            });

            this.dashboardBtn.on('click', function() {
                self.openDashboard($(this));
            });
        },

        /**
         * Start Stripe Connect onboarding
         */
        startOnboarding: function($btn) {
            const originalText = $btn.text();
            $btn.prop('disabled', true).text('Connecting...');

            $.ajax({
                url: agenticSubmission.restUrl + 'agentic-marketplace/v1/connect/onboard',
                method: 'POST',
                headers: {
                    'X-WP-Nonce': agenticSubmission.nonce
                }
            })
            .done(function(response) {
                if (response.onboarding_url) {
                    window.location.href = response.onboarding_url;
                }
            })
            .fail(function(xhr) {
                const error = xhr.responseJSON?.message || 'Failed to start Stripe setup';
                alert(error);
                $btn.prop('disabled', false).text(originalText);
            });
        },

        /**
         * Open Stripe Express Dashboard
         */
        openDashboard: function($btn) {
            const originalText = $btn.text();
            $btn.prop('disabled', true).text('Opening...');

            $.ajax({
                url: agenticSubmission.restUrl + 'agentic-marketplace/v1/connect/dashboard',
                method: 'POST',
                headers: {
                    'X-WP-Nonce': agenticSubmission.nonce
                }
            })
            .done(function(response) {
                if (response.dashboard_url) {
                    window.open(response.dashboard_url, '_blank');
                }
                $btn.prop('disabled', false).text(originalText);
            })
            .fail(function(xhr) {
                const error = xhr.responseJSON?.message || 'Failed to open dashboard';
                alert(error);
                $btn.prop('disabled', false).text(originalText);
            });
        },

        /**
         * Load developer earnings
         */
        loadEarnings: function() {
            const self = this;

            $.ajax({
                url: agenticSubmission.restUrl + 'agentic-marketplace/v1/connect/earnings',
                method: 'GET',
                headers: {
                    'X-WP-Nonce': agenticSubmission.nonce
                }
            })
            .done(function(response) {
                self.renderEarnings(response);
            })
            .fail(function() {
                self.earningsContainer.html('<p class="error">Failed to load earnings</p>');
            });
        },

        /**
         * Render earnings data
         */
        renderEarnings: function(data) {
            const html = `
                <div class="earnings-grid">
                    <div class="earnings-stat">
                        <span class="stat-value">$${data.total_earnings.toFixed(2)}</span>
                        <span class="stat-label">Total Earnings</span>
                    </div>
                    <div class="earnings-stat">
                        <span class="stat-value">$${data.pending_earnings.toFixed(2)}</span>
                        <span class="stat-label">Pending</span>
                    </div>
                </div>
                ${data.by_agent.length > 0 ? `
                <h4>Earnings by Agent</h4>
                <table class="earnings-table">
                    <thead>
                        <tr>
                            <th>Agent</th>
                            <th>Sales</th>
                            <th>Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.by_agent.map(agent => `
                            <tr>
                                <td>${this.escapeHtml(agent.agent_title)}</td>
                                <td>${agent.sales}</td>
                                <td>$${agent.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<p class="no-earnings">No sales yet. Once you start selling, your earnings will appear here.</p>'}
            `;
            
            this.earningsContainer.html(html);
        },

        /**
         * Escape HTML
         */
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };

    // Initialize when DOM is ready
    $(document).ready(function() {
        Submission.init();
        StripeConnect.init();
    });

})(jQuery);
