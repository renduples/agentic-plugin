/**
 * Agentic Marketplace JavaScript
 *
 * @package Agentic_Plugin
 * @since 0.2.0
 */

(function($) {
    'use strict';

    const Marketplace = {
        currentTab: 'featured',
        currentPage: 1,
        currentSearch: '',
        currentCategory: '',
        categories: [],
        debounceTimer: null,

        /**
         * Initialize marketplace
         */
        init: function() {
            this.bindEvents();
            this.loadCategories();
            this.loadAgents();
        },

        /**
         * Bind event handlers
         */
        bindEvents: function() {
            const self = this;

            // Tab clicks
            $(document).on('click', '.agentic-tab', function(e) {
                e.preventDefault();
                const tab = $(this).data('tab');
                self.switchTab(tab);
            });

            // Search input
            $('#agentic-agent-search').on('input', function() {
                clearTimeout(self.debounceTimer);
                self.debounceTimer = setTimeout(function() {
                    self.currentSearch = $('#agentic-agent-search').val();
                    self.currentPage = 1;
                    self.loadAgents();
                }, 300);
            });

            // Category filter
            $('#agentic-category-filter').on('change', function() {
                self.currentCategory = $(this).val();
                self.currentPage = 1;
                self.loadAgents();
            });

            // Pagination
            $(document).on('click', '.agentic-page-btn:not(:disabled)', function() {
                const page = $(this).data('page');
                if (page) {
                    self.currentPage = page;
                    self.loadAgents();
                }
            });

            // View details
            $(document).on('click', '.agentic-view-details', function(e) {
                e.preventDefault();
                const agentId = $(this).data('agent-id');
                self.showAgentDetails(agentId);
            });

            // Close modal
            $(document).on('click', '.agentic-modal-close, .agentic-modal-overlay', function() {
                self.closeModal();
            });

            // Install button
            $(document).on('click', '.agentic-install-btn', function(e) {
                e.preventDefault();
                const $btn = $(this);
                const agentId = $btn.data('agent-id');
                const isPremium = $btn.data('premium') === true || $btn.data('premium') === 'true';
                
                if (isPremium) {
                    self.showLicenseInput($btn);
                } else {
                    self.installAgent(agentId, null, $btn);
                }
            });

            // Submit license
            $(document).on('click', '.agentic-submit-license', function(e) {
                e.preventDefault();
                const $btn = $(this);
                const $input = $btn.closest('.agentic-license-input');
                const agentId = $input.data('agent-id');
                const licenseKey = $input.find('input').val();
                
                if (!licenseKey) {
                    alert(agenticMarketplace.strings.enterLicense);
                    return;
                }
                
                self.installAgent(agentId, licenseKey, $btn);
            });

            // Activate button
            $(document).on('click', '.agentic-activate-btn', function(e) {
                e.preventDefault();
                const $btn = $(this);
                const slug = $btn.data('slug');
                self.activateAgent(slug, $btn);
            });

            // Deactivate button
            $(document).on('click', '.agentic-deactivate-btn', function(e) {
                e.preventDefault();
                const $btn = $(this);
                const slug = $btn.data('slug');
                self.deactivateAgent(slug, $btn);
            });

            // Rating
            $(document).on('click', '.agentic-rate-star', function() {
                const $star = $(this);
                const rating = $star.data('rating');
                const agentId = $star.closest('.agentic-rating-widget').data('agent-id');
                self.rateAgent(agentId, rating);
            });

            // Detail tabs
            $(document).on('click', '.agentic-detail-tab', function() {
                const $tab = $(this);
                const section = $tab.data('section');
                
                $('.agentic-detail-tab').removeClass('active');
                $tab.addClass('active');
                
                $('.agentic-detail-section').removeClass('active');
                $('[data-content="' + section + '"]').addClass('active');
            });

            // ESC to close modal
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape') {
                    self.closeModal();
                }
            });
        },

        /**
         * Switch tab
         */
        switchTab: function(tab) {
            this.currentTab = tab;
            this.currentPage = 1;
            this.currentSearch = '';
            $('#agentic-agent-search').val('');
            
            $('.agentic-tab').removeClass('active');
            $('.agentic-tab[data-tab="' + tab + '"]').addClass('active');
            
            this.loadAgents();
        },

        /**
         * Load categories
         */
        loadCategories: function() {
            const self = this;
            
            $.ajax({
                url: agenticMarketplace.apiBase + '/wp-json/agentic-marketplace/v1/categories',
                method: 'GET',
                success: function(data) {
                    self.categories = data;
                    self.renderCategoryFilter();
                },
                error: function() {
                    // Fallback - load from AJAX
                    // Categories will just show empty
                }
            });
        },

        /**
         * Render category filter
         */
        renderCategoryFilter: function() {
            const $select = $('#agentic-category-filter');
            $select.find('option:not(:first)').remove();
            
            this.categories.forEach(function(cat) {
                $select.append(
                    $('<option>', {
                        value: cat.slug,
                        text: cat.name + ' (' + cat.count + ')'
                    })
                );
            });
        },

        /**
         * Load agents
         */
        loadAgents: function() {
            const self = this;
            const $grid = $('#agentic-agents-grid');
            
            $grid.html('<div class="agentic-loading"><span class="spinner is-active"></span> Loading agents...</div>');
            
            const params = {
                page: this.currentPage,
                per_page: 12,
                search: this.currentSearch,
                category: this.currentCategory
            };
            
            // Set orderby based on tab
            switch (this.currentTab) {
                case 'popular':
                    params.orderby = 'download_count';
                    break;
                case 'recent':
                    params.orderby = 'modified';
                    break;
                case 'free':
                    params.free_only = true;
                    break;
                case 'featured':
                default:
                    params.orderby = 'date';
                    break;
            }
            
            $.ajax({
                url: agenticMarketplace.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'agentic_browse_agents',
                    nonce: agenticMarketplace.nonce,
                    ...params
                },
                success: function(response) {
                    if (response.success) {
                        self.renderAgents(response.data);
                    } else {
                        $grid.html('<div class="agentic-no-results">' + (response.data || agenticMarketplace.strings.error) + '</div>');
                    }
                },
                error: function() {
                    $grid.html('<div class="agentic-no-results">' + agenticMarketplace.strings.error + '</div>');
                }
            });
        },

        /**
         * Render agents grid
         */
        renderAgents: function(data) {
            const self = this;
            const $grid = $('#agentic-agents-grid');
            const agents = data.agents || data;
            
            if (!agents || agents.length === 0) {
                $grid.html('<div class="agentic-no-results">' + agenticMarketplace.strings.noResults + '</div>');
                $('#agentic-pagination').empty();
                return;
            }
            
            $grid.empty();
            
            agents.forEach(function(agent) {
                $grid.append(self.renderAgentCard(agent));
            });
            
            // Render pagination
            if (data.total_pages && data.total_pages > 1) {
                this.renderPagination(data.page, data.total_pages);
            } else {
                $('#agentic-pagination').empty();
            }
        },

        /**
         * Render single agent card
         */
        renderAgentCard: function(agent) {
            const installed = agenticMarketplace.installed[agent.slug];
            const isInstalled = !!installed;
            const isActive = installed && installed.active;
            const isPremium = agent.is_premium;
            
            let actionButton = '';
            if (isInstalled) {
                if (isActive) {
                    actionButton = '<button class="agentic-btn agentic-btn-secondary agentic-deactivate-btn" data-slug="' + agent.slug + '">' + agenticMarketplace.strings.deactivate + '</button>';
                } else {
                    actionButton = '<button class="agentic-btn agentic-btn-success agentic-activate-btn" data-slug="' + agent.slug + '">' + agenticMarketplace.strings.activate + '</button>';
                }
            } else if (isPremium) {
                actionButton = '<button class="agentic-btn agentic-btn-primary agentic-install-btn" data-agent-id="' + agent.id + '" data-premium="true">' + agenticMarketplace.strings.purchase + '</button>';
            } else {
                actionButton = '<button class="agentic-btn agentic-btn-primary agentic-install-btn" data-agent-id="' + agent.id + '">' + agenticMarketplace.strings.install + '</button>';
            }
            
            const priceDisplay = isPremium
                ? '<span class="agentic-agent-price">$' + agent.price + '</span>'
                : '<span class="agentic-agent-price free">' + agenticMarketplace.strings.free + '</span>';
            
            const stars = this.renderStars(agent.rating || 0);
            const icon = agent.icon 
                ? '<img src="' + agent.icon + '" alt="' + agent.title + '">'
                : '<span class="dashicons dashicons-admin-generic"></span>';
            
            return `
                <div class="agentic-agent-card" data-agent-id="${agent.id}">
                    <div class="agentic-agent-card-header">
                        <div class="agentic-agent-icon">${icon}</div>
                        <div class="agentic-agent-info">
                            <h3 class="agentic-agent-name">
                                <a href="#" class="agentic-view-details" data-agent-id="${agent.id}">${agent.title}</a>
                            </h3>
                            <div class="agentic-agent-author">
                                ${agenticMarketplace.strings.author} <a href="${agent.author_uri || '#'}">${agent.author}</a>
                            </div>
                            <div class="agentic-agent-rating">
                                <span class="stars">${stars}</span>
                                <span class="count">(${agent.rating_count || 0})</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="agentic-agent-description">${agent.excerpt || agent.description || ''}</div>
                    
                    ${agent.categories && agent.categories.length ? `
                        <div class="agentic-agent-tags">
                            ${agent.categories.map(cat => `<span class="agentic-agent-tag">${cat.name}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="agentic-agent-footer">
                        <div class="agentic-agent-meta">
                            ${priceDisplay}
                            <span>${agent.download_count || 0} ${agenticMarketplace.strings.downloads}</span>
                        </div>
                        <div class="agentic-agent-actions">
                            ${actionButton}
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Render star rating
         */
        renderStars: function(rating) {
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5;
            const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
            
            let html = '';
            for (let i = 0; i < fullStars; i++) {
                html += '★';
            }
            if (halfStar) {
                html += '☆';
            }
            for (let i = 0; i < emptyStars; i++) {
                html += '☆';
            }
            return html;
        },

        /**
         * Render pagination
         */
        renderPagination: function(currentPage, totalPages) {
            const $pagination = $('#agentic-pagination');
            $pagination.empty();
            
            // Previous button
            $pagination.append(
                $('<button>', {
                    class: 'agentic-page-btn',
                    'data-page': currentPage - 1,
                    disabled: currentPage === 1,
                    html: '&laquo; Prev'
                })
            );
            
            // Page numbers
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            if (startPage > 1) {
                $pagination.append($('<button>', { class: 'agentic-page-btn', 'data-page': 1, text: '1' }));
                if (startPage > 2) {
                    $pagination.append($('<span>', { text: '...' }));
                }
            }
            
            for (let i = startPage; i <= endPage; i++) {
                $pagination.append(
                    $('<button>', {
                        class: 'agentic-page-btn' + (i === currentPage ? ' active' : ''),
                        'data-page': i,
                        text: i
                    })
                );
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    $pagination.append($('<span>', { text: '...' }));
                }
                $pagination.append($('<button>', { class: 'agentic-page-btn', 'data-page': totalPages, text: totalPages }));
            }
            
            // Next button
            $pagination.append(
                $('<button>', {
                    class: 'agentic-page-btn',
                    'data-page': currentPage + 1,
                    disabled: currentPage === totalPages,
                    html: 'Next &raquo;'
                })
            );
        },

        /**
         * Show agent details modal
         */
        showAgentDetails: function(agentId) {
            const self = this;
            const $modal = $('#agentic-agent-modal');
            const $body = $modal.find('.agentic-modal-body');
            
            $body.html('<div class="agentic-loading"><span class="spinner is-active"></span> Loading...</div>');
            $modal.show();
            
            $.ajax({
                url: agenticMarketplace.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'agentic_get_agent',
                    nonce: agenticMarketplace.nonce,
                    agent_id: agentId
                },
                success: function(response) {
                    if (response.success) {
                        $body.html(self.renderAgentDetails(response.data));
                    } else {
                        $body.html('<div class="agentic-no-results">' + agenticMarketplace.strings.error + '</div>');
                    }
                },
                error: function() {
                    $body.html('<div class="agentic-no-results">' + agenticMarketplace.strings.error + '</div>');
                }
            });
        },

        /**
         * Render agent details
         */
        renderAgentDetails: function(agent) {
            const installed = agenticMarketplace.installed[agent.slug];
            const isInstalled = !!installed;
            const isActive = installed && installed.active;
            const isPremium = agent.is_premium;
            
            let actionButton = '';
            if (isInstalled) {
                if (isActive) {
                    actionButton = '<button class="agentic-btn agentic-btn-secondary agentic-deactivate-btn" data-slug="' + agent.slug + '">' + agenticMarketplace.strings.deactivate + '</button>';
                } else {
                    actionButton = '<button class="agentic-btn agentic-btn-success agentic-activate-btn" data-slug="' + agent.slug + '">' + agenticMarketplace.strings.activate + '</button>';
                }
            } else if (isPremium) {
                actionButton = '<button class="agentic-btn agentic-btn-primary agentic-install-btn" data-agent-id="' + agent.id + '" data-premium="true">' + agenticMarketplace.strings.purchase + '</button>';
            } else {
                actionButton = '<button class="agentic-btn agentic-btn-primary agentic-install-btn" data-agent-id="' + agent.id + '">' + agenticMarketplace.strings.install + '</button>';
            }
            
            const priceDisplay = isPremium
                ? '<span class="agentic-agent-detail-price">$' + agent.price + '</span>'
                : '<span class="agentic-agent-detail-price free">' + agenticMarketplace.strings.free + '</span>';
            
            const stars = this.renderStars(agent.rating || 0);
            const icon = agent.icon 
                ? '<img src="' + agent.icon + '" alt="' + agent.title + '">'
                : '<span class="dashicons dashicons-admin-generic" style="font-size:64px;width:64px;height:64px;"></span>';
            
            return `
                <div class="agentic-agent-detail-header">
                    <div class="agentic-agent-detail-icon">${icon}</div>
                    <div class="agentic-agent-detail-info">
                        <h2 class="agentic-agent-detail-title">${agent.title}</h2>
                        <div class="agentic-agent-detail-meta">
                            <div>${agenticMarketplace.strings.author} <strong>${agent.author}</strong></div>
                            <div>${agenticMarketplace.strings.version} <strong>${agent.version}</strong></div>
                            <div><span class="stars">${stars}</span> (${agent.rating_count || 0})</div>
                            <div>${agent.download_count || 0} ${agenticMarketplace.strings.downloads}</div>
                        </div>
                        <div class="agentic-agent-detail-actions">
                            ${priceDisplay}
                            ${actionButton}
                        </div>
                        ${isPremium && !isInstalled ? `
                            <div class="agentic-license-input" data-agent-id="${agent.id}">
                                <label>${agenticMarketplace.strings.enterLicense}</label>
                                <input type="text" placeholder="XXXX-XXXX-XXXX-XXXX">
                                <button class="agentic-btn agentic-btn-primary agentic-submit-license">${agenticMarketplace.strings.install}</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="agentic-detail-tabs">
                    <div class="agentic-detail-tab active" data-section="description">Description</div>
                    <div class="agentic-detail-tab" data-section="capabilities">Capabilities</div>
                    ${agent.changelog ? '<div class="agentic-detail-tab" data-section="changelog">Changelog</div>' : ''}
                    <div class="agentic-detail-tab" data-section="reviews">Reviews</div>
                </div>
                
                <div class="agentic-detail-content">
                    <div class="agentic-detail-section active" data-content="description">
                        ${agent.description || agent.excerpt || 'No description available.'}
                        
                        ${agent.github_url ? `
                            <p style="margin-top:20px;">
                                <a href="${agent.github_url}" target="_blank" class="agentic-btn agentic-btn-secondary">
                                    View on GitHub
                                </a>
                            </p>
                        ` : ''}
                    </div>
                    
                    <div class="agentic-detail-section" data-content="capabilities">
                        <h3>Capabilities</h3>
                        ${agent.capabilities && agent.capabilities.length ? `
                            <div class="agentic-capabilities-list">
                                ${agent.capabilities.map(cap => `
                                    <div class="agentic-capability">
                                        <span class="dashicons dashicons-yes-alt"></span>
                                        ${cap}
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p>No specific capabilities listed.</p>'}
                        
                        ${agent.tools && agent.tools.length ? `
                            <h3 style="margin-top:30px;">Tools</h3>
                            <div class="agentic-tools-list">
                                ${agent.tools.map(tool => `
                                    <div class="agentic-tool">
                                        <div class="agentic-tool-name">${tool.name || tool}</div>
                                        ${tool.description ? `<div class="agentic-tool-description">${tool.description}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    ${agent.changelog ? `
                        <div class="agentic-detail-section" data-content="changelog">
                            ${agent.changelog}
                        </div>
                    ` : ''}
                    
                    <div class="agentic-detail-section" data-content="reviews">
                        <div class="agentic-reviews-summary">
                            <div class="agentic-reviews-score">
                                <div class="score">${(agent.rating || 0).toFixed(1)}</div>
                                <div class="stars">${stars}</div>
                                <div class="count">${agent.rating_count || 0} reviews</div>
                            </div>
                        </div>
                        
                        <div class="agentic-rating-widget" data-agent-id="${agent.id}">
                            <h4>Rate this agent:</h4>
                            <div class="agentic-rate-stars">
                                ${[1,2,3,4,5].map(n => `<span class="agentic-rate-star" data-rating="${n}">☆</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Close modal
         */
        closeModal: function() {
            $('#agentic-agent-modal').hide();
        },

        /**
         * Show license input
         */
        showLicenseInput: function($btn) {
            const $card = $btn.closest('.agentic-agent-card, .agentic-agent-detail-info');
            $card.find('.agentic-license-input').addClass('show');
        },

        /**
         * Install agent
         */
        installAgent: function(agentId, licenseKey, $btn) {
            const self = this;
            const originalText = $btn.text();
            
            $btn.prop('disabled', true).html('<span class="spinner is-active"></span> ' + agenticMarketplace.strings.installing);
            
            $.ajax({
                url: agenticMarketplace.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'agentic_install_agent',
                    nonce: agenticMarketplace.nonce,
                    agent_id: agentId,
                    license_key: licenseKey || ''
                },
                success: function(response) {
                    if (response.success) {
                        // Update installed list
                        agenticMarketplace.installed[response.data.slug] = {
                            version: '1.0.0',
                            active: false
                        };
                        
                        // Update button
                        $btn.removeClass('agentic-install-btn agentic-btn-primary')
                            .addClass('agentic-activate-btn agentic-btn-success')
                            .data('slug', response.data.slug)
                            .prop('disabled', false)
                            .text(agenticMarketplace.strings.activate);
                        
                        // Hide license input
                        $btn.closest('.agentic-agent-card, .agentic-agent-detail-info')
                            .find('.agentic-license-input').removeClass('show');
                    } else {
                        alert(response.data || agenticMarketplace.strings.error);
                        $btn.prop('disabled', false).text(originalText);
                    }
                },
                error: function() {
                    alert(agenticMarketplace.strings.error);
                    $btn.prop('disabled', false).text(originalText);
                }
            });
        },

        /**
         * Activate agent
         */
        activateAgent: function(slug, $btn) {
            const originalText = $btn.text();
            
            $btn.prop('disabled', true).html('<span class="spinner is-active"></span> ' + agenticMarketplace.strings.activating);
            
            $.ajax({
                url: agenticMarketplace.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'agentic_activate_agent',
                    nonce: agenticMarketplace.nonce,
                    slug: slug
                },
                success: function(response) {
                    if (response.success) {
                        agenticMarketplace.installed[slug].active = true;
                        
                        $btn.removeClass('agentic-activate-btn agentic-btn-success')
                            .addClass('agentic-deactivate-btn agentic-btn-secondary')
                            .prop('disabled', false)
                            .text(agenticMarketplace.strings.deactivate);
                    } else {
                        alert(response.data || agenticMarketplace.strings.error);
                        $btn.prop('disabled', false).text(originalText);
                    }
                },
                error: function() {
                    alert(agenticMarketplace.strings.error);
                    $btn.prop('disabled', false).text(originalText);
                }
            });
        },

        /**
         * Deactivate agent
         */
        deactivateAgent: function(slug, $btn) {
            const originalText = $btn.text();
            
            $btn.prop('disabled', true).text('Deactivating...');
            
            $.ajax({
                url: agenticMarketplace.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'agentic_deactivate_agent',
                    nonce: agenticMarketplace.nonce,
                    slug: slug
                },
                success: function(response) {
                    if (response.success) {
                        agenticMarketplace.installed[slug].active = false;
                        
                        $btn.removeClass('agentic-deactivate-btn agentic-btn-secondary')
                            .addClass('agentic-activate-btn agentic-btn-success')
                            .prop('disabled', false)
                            .text(agenticMarketplace.strings.activate);
                    } else {
                        alert(response.data || agenticMarketplace.strings.error);
                        $btn.prop('disabled', false).text(originalText);
                    }
                },
                error: function() {
                    alert(agenticMarketplace.strings.error);
                    $btn.prop('disabled', false).text(originalText);
                }
            });
        },

        /**
         * Rate agent
         */
        rateAgent: function(agentId, rating) {
            const $widget = $('.agentic-rating-widget[data-agent-id="' + agentId + '"]');
            const $stars = $widget.find('.agentic-rate-star');
            
            $.ajax({
                url: agenticMarketplace.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'agentic_rate_agent',
                    nonce: agenticMarketplace.nonce,
                    agent_id: agentId,
                    rating: rating
                },
                success: function(response) {
                    if (response.success) {
                        // Update star display
                        $stars.each(function(i) {
                            $(this).text(i < rating ? '★' : '☆');
                        });
                        
                        // Show thank you
                        $widget.find('h4').text('Thank you for your rating!');
                    }
                }
            });
        }
    };

    // Initialize on document ready
    $(document).ready(function() {
        if ($('.agentic-marketplace-wrap').length) {
            Marketplace.init();
        }
    });

})(jQuery);
