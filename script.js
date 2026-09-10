// Flipbook Application
class FamilyFlipbook {
    constructor() {
        this.albumData = null;
        this.pages = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.init();
    }

    async init() {
        try {
            // Load photos from JSON
            await this.loadAlbumData();
            
            // Create pages structure
            this.createPages();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize display
            this.updateDisplay();
            this.createNavigationDots();
            
            console.log('Flipbook initialized with', this.pages.length, 'pages');
        } catch (error) {
            console.error('Error initializing flipbook:', error);
            this.showError('Failed to load photo album');
        }
    }

    async loadAlbumData() {
        try {
            const response = await fetch('photos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.albumData = await response.json();
            
            document.getElementById('albumTitle').textContent = this.albumData.album.title;
            document.getElementById('albumDescription').textContent = this.albumData.album.description;
        } catch (error) {
            console.error('Error loading photos.json:', error);
            throw error;
        }
    }

    createPages() {
        this.pages = [];
        
        // Page 1: Cover Page
        this.pages.push({
            type: 'cover',
            left: { type: 'cover' },
            right: { type: 'blank' }
        });

        // Page 2: Table of Contents
        this.pages.push({
            type: 'toc',
            left: { type: 'toc' },
            right: { type: 'blank' }
        });

        // Pages with photos (2 photos per spread)
        const photos = this.albumData.album.photos;
        for (let i = 0; i < photos.length; i += 2) {
            this.pages.push({
                type: 'photos',
                left: { type: 'photo', photo: photos[i] },
                right: i + 1 < photos.length ? { type: 'photo', photo: photos[i + 1] } : { type: 'blank' }
            });
        }

        this.totalPages = this.pages.length;
        document.getElementById('totalPages').textContent = this.totalPages;
    }

    setupEventListeners() {
        // Button controls
        document.getElementById('nextBtn').addEventListener('click', () => this.nextPage());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevPage());
        
        // Mouse click page turning
        document.getElementById('leftPage').addEventListener('click', () => this.prevPage());
        document.getElementById('rightPage').addEventListener('click', () => this.nextPage());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.nextPage();
            if (e.key === 'ArrowLeft') this.prevPage();
        });
    }

    updateDisplay() {
        const currentPageData = this.pages[this.currentPage - 1];
        
        // Update left page
        this.renderPage('left', currentPageData.left);
        
        // Update right page
        this.renderPage('right', currentPageData.right);
        
        // Update page counter
        document.getElementById('currentPage').textContent = this.currentPage;
        
        // Update button states
        document.getElementById('prevBtn').disabled = this.currentPage === 1;
        document.getElementById('nextBtn').disabled = this.currentPage === this.totalPages;
        
        // Update active dot
        this.updateActiveDot();
    }

    renderPage(side, pageData) {
        const contentId = side === 'left' ? 'leftContent' : 'rightContent';
        const container = document.getElementById(contentId);
        
        container.innerHTML = '';
        
        if (pageData.type === 'cover') {
            container.innerHTML = this.createCoverHTML();
        } else if (pageData.type === 'toc') {
            container.innerHTML = this.createTOCHTML();
        } else if (pageData.type === 'photo' && pageData.photo) {
            container.innerHTML = this.createPhotoHTML(pageData.photo);
        } else if (pageData.type === 'blank') {
            container.innerHTML = '<div style="flex: 1;"></div>';
        }
    }

    createCoverHTML() {
        const crest = this.albumData.album.familyCrest;
        return `
            <div class="cover-page">
                ${crest.imageUrl ? `<img src="${crest.imageUrl}" alt="Family Crest">` : ''}
                <h1>📖 Family Album</h1>
                <div class="family-name">${crest.familyName}</div>
                <div class="motto">${crest.motto}</div>
                <p class="subtitle">${this.albumData.album.description}</p>
                <p class="year">A Journey Through Time</p>
            </div>
        `;
    }

    createTOCHTML() {
        const sections = this.albumData.album.sections;
        let html = '<div class="toc-page"><h2>Table of Contents</h2>';
        
        sections.forEach((section, index) => {
            const photos = section.photoIds.map(id => 
                this.albumData.album.photos.find(p => p.id === id)?.title || `Photo ${id}`
            );
            
            html += `
                <div class="toc-section">
                    <h3>${index + 1}. ${section.title}</h3>
                    <p>${section.description}</p>
                    <div class="photo-list">
                        ${photos.map((title, idx) => `
                            <span class="photo-badge">${idx + 1}. ${title}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    createPhotoHTML(photo) {
        return `
            <div class="page-content">
                ${photo.imageUrl ? `<img src="${photo.imageUrl}" alt="${photo.title}">` : ''}
                <div class="page-info">
                    <h3>${photo.title}</h3>
                    <p>${photo.description}</p>
                    <span class="date">📅 ${photo.date}</span>
                    <p class="names">👥 ${photo.names.join(', ')}</p>
                </div>
            </div>
        `;
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateDisplay();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplay();
        }
    }

    createNavigationDots() {
        const dotsContainer = document.getElementById('dotsContainer');
        dotsContainer.innerHTML = '';
        
        for (let i = 1; i <= this.totalPages; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i === this.currentPage) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => this.goToPage(i));
            dotsContainer.appendChild(dot);
        }
    }

    updateActiveDot() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === this.currentPage);
        });
    }

    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentPage = pageNumber;
            this.updateDisplay();
        }
    }

    showError(message) {
        const infoPanel = document.querySelector('.info-panel');
        infoPanel.innerHTML = `<h2>⚠️ Error</h2><p>${message}</p>`;
    }
}

// Initialize flipbook when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FamilyFlipbook();
});
