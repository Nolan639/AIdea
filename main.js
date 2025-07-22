+// Main JavaScript for AI Tool Directory
+
+class AIToolDirectory {
+    constructor() {
+        this.tools = window.aiToolsData.tools;
+        this.categories = window.aiToolsData.categories;
+        this.filteredTools = [...this.tools];
+        this.currentPage = 1;
+        this.toolsPerPage = 12;
+        this.favorites = JSON.parse(localStorage.getItem('aitools-favorites')) || [];
+        this.comparisonList = [];
+        this.currentView = 'grid';
+        this.filters = {
+            category: '',
+            pricing: '',
+            rating: '',
+            search: ''
+        };
+        
+        this.init();
+    }
+
+    init() {
+        this.setupEventListeners();
+        this.renderCategories();
+        this.renderFeaturedTools();
+        this.renderTools();
+        this.populateFilterOptions();
+        this.setupThemeToggle();
+        this.setupScrollAnimations();
+        this.setupBackToTop();
+        this.animateCounters();
+        this.setupFormHandlers();
+    }
+
+    setupEventListeners() {
+        // Search functionality
+        const searchInput = document.getElementById('searchInput');
+        const searchClear = document.getElementById('searchClear');
+        
+        searchInput.addEventListener('input', this.debounce((e) => {
+            this.filters.search = e.target.value.toLowerCase();
+            this.applyFilters();
+            this.toggleSearchClear();
+        }, 300));
+
+        searchClear.addEventListener('click', () => {
+            searchInput.value = '';
+            this.filters.search = '';
+            this.applyFilters();
+            this.toggleSearchClear();
+        });
+
+        // Filter events
+        document.getElementById('categoryFilter').addEventListener('change', (e) => {
+            this.filters.category = e.target.value;
+            this.applyFilters();
+        });
+
+        document.getElementById('pricingFilter').addEventListener('change', (e) => {
+            this.filters.pricing = e.target.value;
+            this.applyFilters();
+        });
+
+        document.getElementById('ratingFilter').addEventListener('change', (e) => {
+            this.filters.rating = parseFloat(e.target.value) || '';
+            this.applyFilters();
+        });
+
+        document.getElementById('clearFilters').addEventListener('click', () => {
+            this.clearAllFilters();
+        });
+
+        // View toggle
+        document.querySelectorAll('.view-btn').forEach(btn => {
+            btn.addEventListener('click', (e) => {
+                this.switchView(e.target.dataset.view);
+            });
+        });
+
+        // Filters toggle
+        document.getElementById('filtersToggle').addEventListener('click', () => {
+            this.toggleFiltersPanel();
+        });
+
+        // Comparison toggle
+        document.getElementById('comparisonToggle').addEventListener('click', () => {
+            this.showComparisonModal();
+        });
+
+        // Load more
+        document.getElementById('loadMoreBtn').addEventListener('click', () => {
+            this.loadMoreTools();
+        });
+
+        // Mobile menu
+        document.getElementById('mobileMenuToggle').addEventListener('click', () => {
+            this.toggleMobileMenu();
+        });
+
+        // Modal events
+        document.getElementById('closeComparison').addEventListener('click', () => {
+            this.closeModal('comparisonModal');
+        });
+
+        document.getElementById('closeToolModal').addEventListener('click', () => {
+            this.closeModal('toolModal');
+        });
+
+        // Close modals on backdrop click
+        document.querySelectorAll('.modal').forEach(modal => {
+            modal.addEventListener('click', (e) => {
+                if (e.target === modal) {
+                    this.closeModal(modal.id);
+                }
+            });
+        });
+
+        // Smooth scroll for navigation
+        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
+            anchor.addEventListener('click', (e) => {
+                e.preventDefault();
+                const target = document.querySelector(anchor.getAttribute('href'));
+                if (target) {
+                    target.scrollIntoView({ behavior: 'smooth' });
+                    this.updateActiveNavLink(anchor.getAttribute('href'));
+                }
+            });
+        });
+    }
+
+    debounce(func, wait) {
+        let timeout;
+        return function executedFunction(...args) {
+            const later = () => {
+                clearTimeout(timeout);
+                func(...args);
+            };
+            clearTimeout(timeout);
+            timeout = setTimeout(later, wait);
+        };
+    }
+
+    toggleSearchClear() {
+        const searchInput = document.getElementById('searchInput');
+        const searchClear = document.getElementById('searchClear');
+        
+        if (searchInput.value.length > 0) {
+            searchClear.classList.add('visible');
+        } else {
+            searchClear.classList.remove('visible');
+        }
+    }
+
+    applyFilters() {
+        this.filteredTools = this.tools.filter(tool => {
+            const matchesSearch = !this.filters.search || 
+                tool.name.toLowerCase().includes(this.filters.search) ||
+                tool.description.toLowerCase().includes(this.filters.search) ||
+                tool.tags.some(tag => tag.toLowerCase().includes(this.filters.search));
+
+            const matchesCategory = !this.filters.category || tool.category === this.filters.category;
+            const matchesPricing = !this.filters.pricing || tool.pricing === this.filters.pricing;
+            const matchesRating = !this.filters.rating || tool.rating >= this.filters.rating;
+
+            return matchesSearch && matchesCategory && matchesPricing && matchesRating;
+        });
+
+        this.currentPage = 1;
+        this.renderTools();
+        this.updateToolsCount();
+    }
+
+    clearAllFilters() {
+        this.filters = {
+            category: '',
+            pricing: '',
+            rating: '',
+            search: ''
+        };
+
+        document.getElementById('searchInput').value = '';
+        document.getElementById('categoryFilter').value = '';
+        document.getElementById('pricingFilter').value = '';
+        document.getElementById('ratingFilter').value = '';
+        
+        this.toggleSearchClear();
+        this.applyFilters();
+    }
+
+    switchView(view) {
+        this.currentView = view;
+        document.querySelectorAll('.view-btn').forEach(btn => {
+            btn.classList.toggle('active', btn.dataset.view === view);
+        });
+
+        const toolsGrid = document.getElementById('toolsGrid');
+        toolsGrid.classList.toggle('list-view', view === 'list');
+    }
+
+    toggleFiltersPanel() {
+        const filtersPanel = document.getElementById('filtersPanel');
+        filtersPanel.classList.toggle('active');
+    }
+
+    renderCategories() {
+        const categoriesGrid = document.getElementById('categoriesGrid');
+        
+        categoriesGrid.innerHTML = this.categories.map(category => {
+            const toolCount = this.tools.filter(tool => tool.category === category.id).length;
+            
+            return `
+                <div class="category-card animate-fade-in-up" data-category="${category.id}">
+                    <div class="category-icon">
+                        <i class="${category.icon}"></i>
+                    </div>
+                    <div class="category-name">${category.name}</div>
+                    <div class="category-count">${toolCount} tools</div>
+                </div>
+            `;
+        }).join('');
+
+        // Add click handlers for category cards
+        document.querySelectorAll('.category-card').forEach(card => {
+            card.addEventListener('click', () => {
+                const category = card.dataset.category;
+                this.filters.category = category;
+                document.getElementById('categoryFilter').value = category;
+                this.applyFilters();
+                
+                // Scroll to tools section
+                document.getElementById('tools').scrollIntoView({ behavior: 'smooth' });
+            });
+        });
+    }
+
+    renderFeaturedTools() {
+        const featuredContainer = document.getElementById('featuredTools');
+        const featuredTools = this.tools
+            .filter(tool => tool.trendingRank && tool.trendingRank <= 10)
+            .sort((a, b) => a.trendingRank - b.trendingRank)
+            .slice(0, 6);
+
+        featuredContainer.innerHTML = featuredTools.map(tool => 
+            this.createToolCard(tool, true)
+        ).join('');
+
+        this.attachToolCardEvents();
+    }
+
+    renderTools() {
+        const toolsGrid = document.getElementById('toolsGrid');
+        const startIndex = 0;
+        const endIndex = this.currentPage * this.toolsPerPage;
+        const toolsToShow = this.filteredTools.slice(startIndex, endIndex);
+
+        toolsGrid.innerHTML = toolsToShow.map(tool => 
+            this.createToolCard(tool)
+        ).join('');
+
+        this.attachToolCardEvents();
+        this.updateLoadMoreButton();
+    }
+
+    createToolCard(tool, isFeatured = false) {
+        const isFavorite = this.favorites.includes(tool.id);
+        const isInComparison = this.comparisonList.includes(tool.id);
+        
+        const badges = [];
+        if (tool.trendingRank && tool.trendingRank <= 10) {
+            badges.push(`<span class="tool-badge badge-trending">🔥 Trending #${tool.trendingRank}</span>`);
+        }
+        
+        if (tool.pricing === 'Free') {
+            badges.push(`<span class="tool-badge badge-free">Free</span>`);
+        } else if (tool.pricing === 'Freemium') {
+            badges.push(`<span class="tool-badge badge-freemium">Freemium</span>`);
+        } else {
+            badges.push(`<span class="tool-badge badge-paid">Paid</span>`);
+        }
+
+        const formatNumber = (num) => {
+            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
+            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
+            return num.toString();
+        };
+
+        return `
+            <div class="tool-card animate-fade-in-up" data-tool-id="${tool.id}">
+                ${badges.length > 0 ? `<div class="tool-badges">${badges.join('')}</div>` : ''}
+                
+                <div class="tool-header">
+                    <div class="tool-image">
+                        ${tool.logoUrl}
+                    </div>
+                    <div class="tool-info">
+                        <h3 class="tool-name">${tool.name}</h3>
+                        <span class="tool-category">${this.getCategoryName(tool.category)}</span>
+                    </div>
+                    <div class="tool-actions">
+                        <button class="tool-action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
+                                data-tool-id="${tool.id}" title="Add to favorites">
+                            <i class="fas fa-heart"></i>
+                        </button>
+                        <button class="tool-action-btn compare-btn ${isInComparison ? 'active' : ''}" 
+                                data-tool-id="${tool.id}" title="Add to comparison">
+                            <i class="fas fa-balance-scale"></i>
+                        </button>
+                        <button class="tool-action-btn info-btn" 
+                                data-tool-id="${tool.id}" title="More info">
+                            <i class="fas fa-info"></i>
+                        </button>
+                    </div>
+                </div>
+
+                <p class="tool-description">${tool.description}</p>
+
+                <div class="tool-tags">
+                    ${tool.tags.slice(0, 3).map(tag => 
+                        `<span class="tool-tag">${tag}</span>`
+                    ).join('')}
+                </div>
+
+                <div class="tool-footer">
+                    <div class="tool-stats">
+                        <div class="tool-rating">
+                            <span class="stars">
+                                ${this.generateStars(tool.rating)}
+                            </span>
+                            <span>${tool.rating}</span>
+                        </div>
+                        <div class="tool-stat">
+                            <i class="fas fa-thumbs-up"></i>
+                            <span>${formatNumber(tool.upvotes)}</span>
+                        </div>
+                        <div class="tool-stat">
+                            <i class="fas fa-users"></i>
+                            <span>${formatNumber(tool.uses)}</span>
+                        </div>
+                    </div>
+                    <a href="${tool.websiteUrl}" target="_blank" class="tool-cta" 
+                       onclick="event.stopPropagation();">
+                        Visit Tool <i class="fas fa-external-link-alt"></i>
+                    </a>
+                </div>
+            </div>
+        `;
+    }
+
+    generateStars(rating) {
+        const fullStars = Math.floor(rating);
+        const hasHalfStar = rating % 1 >= 0.5;
+        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
+
+        let stars = '';
+        for (let i = 0; i < fullStars; i++) {
+            stars += '<i class="fas fa-star"></i>';
+        }
+        if (hasHalfStar) {
+            stars += '<i class="fas fa-star-half-alt"></i>';
+        }
+        for (let i = 0; i < emptyStars; i++) {
+            stars += '<i class="far fa-star"></i>';
+        }
+        
+        return stars;
+    }
+
+    getCategoryName(categoryId) {
+        const category = this.categories.find(cat => cat.id === categoryId);
+        return category ? category.name : categoryId;
+    }
+
+    attachToolCardEvents() {
+        // Favorite buttons
+        document.querySelectorAll('.favorite-btn').forEach(btn => {
+            btn.addEventListener('click', (e) => {
+                e.stopPropagation();
+                this.toggleFavorite(parseInt(btn.dataset.toolId));
+            });
+        });
+
+        // Compare buttons
+        document.querySelectorAll('.compare-btn').forEach(btn => {
+            btn.addEventListener('click', (e) => {
+                e.stopPropagation();
+                this.toggleComparison(parseInt(btn.dataset.toolId));
+            });
+        });
+
+        // Info buttons
+        document.querySelectorAll('.info-btn').forEach(btn => {
+            btn.addEventListener('click', (e) => {
+                e.stopPropagation();
+                this.showToolDetails(parseInt(btn.dataset.toolId));
+            });
+        });
+
+        // Tool card click
+        document.querySelectorAll('.tool-card').forEach(card => {
+            card.addEventListener('click', () => {
+                this.showToolDetails(parseInt(card.dataset.toolId));
+            });
+        });
+    }
+
+    toggleFavorite(toolId) {
+        const index = this.favorites.indexOf(toolId);
+        if (index > -1) {
+            this.favorites.splice(index, 1);
+        } else {
+            this.favorites.push(toolId);
+        }
+
+        localStorage.setItem('aitools-favorites', JSON.stringify(this.favorites));
+        
+        // Update button state
+        const btn = document.querySelector(`.favorite-btn[data-tool-id="${toolId}"]`);
+        if (btn) {
+            btn.classList.toggle('active', this.favorites.includes(toolId));
+        }
+
+        this.showToast(
+            this.favorites.includes(toolId) 
+                ? 'Added to favorites!' 
+                : 'Removed from favorites!'
+        );
+    }
+
+    toggleComparison(toolId) {
+        const index = this.comparisonList.indexOf(toolId);
+        if (index > -1) {
+            this.comparisonList.splice(index, 1);
+        } else {
+            if (this.comparisonList.length >= 3) {
+                this.showToast('You can compare up to 3 tools at once!', 'warning');
+                return;
+            }
+            this.comparisonList.push(toolId);
+        }
+
+        // Update button state
+        const btn = document.querySelector(`.compare-btn[data-tool-id="${toolId}"]`);
+        if (btn) {
+            btn.classList.toggle('active', this.comparisonList.includes(toolId));
+        }
+
+        this.updateComparisonButton();
+    }
+
+    updateComparisonButton() {
+        const comparisonToggle = document.getElementById('comparisonToggle');
+        const comparisonCount = document.getElementById('comparisonCount');
+        
+        comparisonCount.textContent = this.comparisonList.length;
+        comparisonToggle.classList.toggle('active', this.comparisonList.length > 0);
+    }
+
+    showToolDetails(toolId) {
+        const tool = this.tools.find(t => t.id === toolId);
+        if (!tool) return;
+
+        const modal = document.getElementById('toolModal');
+        const title = document.getElementById('toolModalTitle');
+        const content = document.getElementById('toolModalContent');
+
+        title.textContent = tool.name;
+        
+        content.innerHTML = `
+            <div class="tool-detail-header">
+                <div class="tool-detail-image">
+                    ${tool.logoUrl}
+                </div>
+                <div class="tool-detail-info">
+                    <h2>${tool.name}</h2>
+                    <p class="tool-detail-category">${this.getCategoryName(tool.category)}</p>
+                    <div class="tool-detail-rating">
+                        <span class="stars">${this.generateStars(tool.rating)}</span>
+                        <span>${tool.rating} / 5</span>
+                    </div>
+                </div>
+            </div>
+
+            <div class="tool-detail-description">
+                <h3>Description</h3>
+                <p>${tool.description}</p>
+            </div>
+
+            <div class="tool-detail-features">
+                <h3>Key Features</h3>
+                <ul>
+                    ${tool.features.map(feature => `<li>${feature}</li>`).join('')}
+                </ul>
+            </div>
+
+            <div class="tool-detail-tags">
+                <h3>Tags</h3>
+                <div class="tool-tags">
+                    ${tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
+                </div>
+            </div>
+
+            <div class="tool-detail-stats">
+                <div class="stat-item">
+                    <strong>Pricing:</strong> ${tool.pricing}
+                </div>
+                <div class="stat-item">
+                    <strong>Users:</strong> ${this.formatNumber(tool.uses)}
+                </div>
+                <div class="stat-item">
+                    <strong>Upvotes:</strong> ${this.formatNumber(tool.upvotes)}
+                </div>
+            </div>
+
+            <div class="tool-detail-actions">
+                <a href="${tool.websiteUrl}" target="_blank" class="tool-cta">
+                    Visit ${tool.name} <i class="fas fa-external-link-alt"></i>
+                </a>
+            </div>
+        `;
+
+        this.showModal('toolModal');
+    }
+
+    showComparisonModal() {
+        if (this.comparisonList.length === 0) {
+            this.showToast('Please select tools to compare!', 'warning');
+            return;
+        }
+
+        const modal = document.getElementById('comparisonModal');
+        const content = document.getElementById('comparisonContent');
+        const compareTools = this.tools.filter(tool => this.comparisonList.includes(tool.id));
+
+        content.innerHTML = `
+            <div class="comparison-intro">
+                <p>Comparing ${compareTools.length} AI tools</p>
+                <button class="filter-clear" onclick="aiDirectory.clearComparison()">
+                    Clear All
+                </button>
+            </div>
+
+            <table class="comparison-table">
+                <thead>
+                    <tr>
+                        <th>Feature</th>
+                        ${compareTools.map(tool => `<th>${tool.name}</th>`).join('')}
+                    </tr>
+                </thead>
+                <tbody>
+                    <tr>
+                        <td><strong>Category</strong></td>
+                        ${compareTools.map(tool => `<td>${this.getCategoryName(tool.category)}</td>`).join('')}
+                    </tr>
+                    <tr>
+                        <td><strong>Pricing</strong></td>
+                        ${compareTools.map(tool => `<td>${tool.pricing}</td>`).join('')}
+                    </tr>
+                    <tr>
+                        <td><strong>Rating</strong></td>
+                        ${compareTools.map(tool => `<td>${tool.rating}/5</td>`).join('')}
+                    </tr>
+                    <tr>
+                        <td><strong>Users</strong></td>
+                        ${compareTools.map(tool => `<td>${this.formatNumber(tool.uses)}</td>`).join('')}
+                    </tr>
+                    <tr>
+                        <td><strong>Key Features</strong></td>
+                        ${compareTools.map(tool => 
+                            `<td>${tool.features.slice(0, 3).join(', ')}</td>`
+                        ).join('')}
+                    </tr>
+                    <tr>
+                        <td><strong>Website</strong></td>
+                        ${compareTools.map(tool => 
+                            `<td><a href="${tool.websiteUrl}" target="_blank">Visit</a></td>`
+                        ).join('')}
+                    </tr>
+                </tbody>
+            </table>
+        `;
+
+        this.showModal('comparisonModal');
+    }
+
+    clearComparison() {
+        this.comparisonList = [];
+        this.updateComparisonButton();
+        
+        // Update all compare buttons
+        document.querySelectorAll('.compare-btn').forEach(btn => {
+            btn.classList.remove('active');
+        });
+        
+        this.closeModal('comparisonModal');
+        this.showToast('Comparison cleared!');
+    }
+
+    formatNumber(num) {
+        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
+        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
+        return num.toString();
+    }
+
+    loadMoreTools() {
+        this.currentPage++;
+        this.renderTools();
+    }
+
+    updateLoadMoreButton() {
+        const loadMoreBtn = document.getElementById('loadMoreBtn');
+        const totalTools = this.filteredTools.length;
+        const shownTools = this.currentPage * this.toolsPerPage;
+
+        if (shownTools >= totalTools) {
+            loadMoreBtn.style.display = 'none';
+        } else {
+            loadMoreBtn.style.display = 'block';
+            loadMoreBtn.textContent = `Load More (${totalTools - shownTools} remaining)`;
+        }
+    }
+
+    updateToolsCount() {
+        const totalCount = this.filteredTools.length;
+        // Update any tool count displays if needed
+    }
+
+    populateFilterOptions() {
+        const categoryFilter = document.getElementById('categoryFilter');
+        const toolCategory = document.getElementById('toolCategory');
+        
+        this.categories.forEach(category => {
+            categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
+            toolCategory.innerHTML += `<option value="${category.id}">${category.name}</option>`;
+        });
+    }
+
+    toggleMobileMenu() {
+        const mobileNav = document.getElementById('mobileNav');
+        const menuToggle = document.getElementById('mobileMenuToggle');
+        
+        mobileNav.classList.toggle('active');
+        menuToggle.classList.toggle('active');
+    }
+
+    showModal(modalId) {
+        const modal = document.getElementById(modalId);
+        modal.classList.add('active');
+        document.body.style.overflow = 'hidden';
+    }
+
+    closeModal(modalId) {
+        const modal = document.getElementById(modalId);
+        modal.classList.remove('active');
+        document.body.style.overflow = '';
+    }
+
+    setupThemeToggle() {
+        const themeToggle = document.getElementById('themeToggle');
+        const currentTheme = localStorage.getItem('theme') || 'light';
+        
+        document.documentElement.setAttribute('data-theme', currentTheme);
+        this.updateThemeIcon(currentTheme);
+
+        themeToggle.addEventListener('click', () => {
+            const currentTheme = document.documentElement.getAttribute('data-theme');
+            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
+            
+            document.documentElement.setAttribute('data-theme', newTheme);
+            localStorage.setItem('theme', newTheme);
+            this.updateThemeIcon(newTheme);
+        });
+    }
+
+    updateThemeIcon(theme) {
+        const themeToggle = document.getElementById('themeToggle');
+        const icon = themeToggle.querySelector('i');
+        
+        if (theme === 'dark') {
+            icon.className = 'fas fa-sun';
+        } else {
+            icon.className = 'fas fa-moon';
+        }
+    }
+
+    setupScrollAnimations() {
+        const observerOptions = {
+            threshold: 0.1,
+            rootMargin: '0px 0px -50px 0px'
+        };
+
+        const observer = new IntersectionObserver((entries) => {
+            entries.forEach(entry => {
+                if (entry.isIntersecting) {
+                    entry.target.style.animationDelay = '0s';
+                    entry.target.classList.add('animate-fade-in-up');
+                }
+            });
+        }, observerOptions);
+
+        // Observe elements as they're added to the DOM
+        this.observeElements = (container) => {
+            container.querySelectorAll('.tool-card, .category-card').forEach(el => {
+                observer.observe(el);
+            });
+        };
+
+        // Initial observation
+        setTimeout(() => {
+            this.observeElements(document);
+        }, 100);
+    }
+
+    setupBackToTop() {
+        const backToTop = document.getElementById('backToTop');
+        
+        window.addEventListener('scroll', () => {
+            if (window.pageYOffset > 300) {
+                backToTop.classList.add('visible');
+            } else {
+                backToTop.classList.remove('visible');
+            }
+        });
+
+        backToTop.addEventListener('click', () => {
+            window.scrollTo({ top: 0, behavior: 'smooth' });
+        });
+    }
+
+    animateCounters() {
+        const counters = document.querySelectorAll('[data-count]');
+        
+        const animateCounter = (counter) => {
+            const target = parseInt(counter.dataset.count);
+            const duration = 2000;
+            const increment = target / (duration / 16);
+            let current = 0;
+
+            const updateCounter = () => {
+                current += increment;
+                if (current < target) {
+                    counter.textContent = Math.floor(current).toLocaleString();
+                    requestAnimationFrame(updateCounter);
+                } else {
+                    counter.textContent = target.toLocaleString();
+                }
+            };
+
+            updateCounter();
+        };
+
+        const observer = new IntersectionObserver((entries) => {
+            entries.forEach(entry => {
+                if (entry.isIntersecting) {
+                    animateCounter(entry.target);
+                    observer.unobserve(entry.target);
+                }
+            });
+        });
+
+        counters.forEach(counter => observer.observe(counter));
+    }
+
+    updateActiveNavLink(href) {
+        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
+            link.classList.toggle('active', link.getAttribute('href') === href);
+        });
+    }
+
+    setupFormHandlers() {
+        // Contact form
+        const contactForm = document.getElementById('contactForm');
+        contactForm.addEventListener('submit', (e) => {
+            e.preventDefault();
+            this.handleContactForm(new FormData(contactForm));
+        });
+
+        // Newsletter form
+        const newsletterForm = document.getElementById('newsletterForm');
+        newsletterForm.addEventListener('submit', (e) => {
+            e.preventDefault();
+            this.handleNewsletterForm(new FormData(newsletterForm));
+        });
+
+        // Submit tool form
+        const submitForm = document.getElementById('submitForm');
+        submitForm.addEventListener('submit', (e) => {
+            e.preventDefault();
+            this.handleSubmitToolForm(new FormData(submitForm));
+        });
+    }
+
+    handleContactForm(formData) {
+        this.showSpinner();
+        
+        // Simulate form submission
+        setTimeout(() => {
+            this.hideSpinner();
+            this.showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
+            document.getElementById('contactForm').reset();
+        }, 1000);
+    }
+
+    handleNewsletterForm(formData) {
+        const email = formData.get('email');
+        
+        // Simulate newsletter signup
+        this.showToast('Thanks for subscribing! Welcome to our newsletter.', 'success');
+        document.getElementById('newsletterForm').reset();
+    }
+
+    handleSubmitToolForm(formData) {
+        this.showSpinner();
+        
+        // Simulate tool submission
+        setTimeout(() => {
+            this.hideSpinner();
+            this.showToast('Tool submitted successfully! We\'ll review it and add it to our directory.', 'success');
+            document.getElementById('submitForm').reset();
+        }, 1500);
+    }
+
+    showSpinner() {
+        document.getElementById('loadingSpinner').classList.add('active');
+    }
+
+    hideSpinner() {
+        document.getElementById('loadingSpinner').classList.remove('active');
+    }
+
+    showToast(message, type = 'info') {
+        // Create toast notification
+        const toast = document.createElement('div');
+        toast.className = `toast toast-${type}`;
+        toast.innerHTML = `
+            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
+            <span>${message}</span>
+        `;
+        
+        // Add toast styles if not already present
+        if (!document.querySelector('.toast-container')) {
+            const container = document.createElement('div');
+            container.className = 'toast-container';
+            document.body.appendChild(container);
+            
+            // Add toast styles
+            const style = document.createElement('style');
+            style.textContent = `
+                .toast-container {
+                    position: fixed;
+                    top: 20px;
+                    right: 20px;
+                    z-index: 10000;
+                }
+                .toast {
+                    background: var(--bg-card);
+                    border: 1px solid var(--border-color);
+                    border-radius: var(--radius-md);
+                    padding: var(--spacing-md) var(--spacing-lg);
+                    margin-bottom: var(--spacing-sm);
+                    display: flex;
+                    align-items: center;
+                    gap: var(--spacing-sm);
+                    box-shadow: var(--shadow-lg);
+                    transform: translateX(100%);
+                    transition: transform 0.3s ease;
+                    max-width: 300px;
+                }
+                .toast.show {
+                    transform: translateX(0);
+                }
+                .toast-success { border-left: 4px solid var(--success-color); }
+                .toast-warning { border-left: 4px solid var(--warning-color); }
+                .toast-info { border-left: 4px solid var(--primary-color); }
+                .toast i {
+                    color: var(--primary-color);
+                }
+                .toast-success i { color: var(--success-color); }
+                .toast-warning i { color: var(--warning-color); }
+            `;
+            document.head.appendChild(style);
+        }
+        
+        const container = document.querySelector('.toast-container');
+        container.appendChild(toast);
+        
+        // Animate in
+        setTimeout(() => toast.classList.add('show'), 100);
+        
+        // Remove after 3 seconds
+        setTimeout(() => {
+            toast.style.transform = 'translateX(100%)';
+            setTimeout(() => container.removeChild(toast), 300);
+        }, 3000);
+    }
+}
+
+// Initialize the application when DOM is loaded
+document.addEventListener('DOMContentLoaded', () => {
+    window.aiDirectory = new AIToolDirectory();
+});
+
+// Export for global access
+window.AIToolDirectory = AIToolDirectory;
