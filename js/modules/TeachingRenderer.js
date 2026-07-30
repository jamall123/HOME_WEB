/**
 * TeachingRenderer.js
 * Unified rendering engine for the Presentation Area.
 * Switches between modes without layout shifts.
 */

export const TeachingRenderer = {
    elements: {},

    init() {
        this.elements = {
            videoLayer: document.getElementById('layer-video'),
            liveLayer: document.getElementById('layer-live'),
            slidesLayer: document.getElementById('layer-slides'),
            channelLayer: document.getElementById('layer-channel'),
            audioLayer: document.getElementById('layer-audio-only'),
            playerVideo: document.getElementById('player-video'),
            slidesContainer: document.getElementById('slides-container'),
            liveBadgeDot: document.getElementById('live-badge-dot'),
            liveBadgeText: document.getElementById('live-badge-text')
        };
    },

    /**
     * Renders the specified teaching mode.
     * @param {string} mode - 'video', 'link', 'slides', 'channel'
     * @param {boolean} isLowBandwidth - whether low bandwidth mode is active
     */
    renderMode(mode, isLowBandwidth = false) {
        if (!this.elements.videoLayer) this.init();

        // Deactivate all layers
        Object.values(this.elements).forEach(el => {
            if (el && el.classList && el.classList.contains('renderer-layer')) {
                el.classList.remove('active');
            }
        });

        // Pause video if navigating away
        if (this.elements.playerVideo && mode !== 'video' && mode !== 'link') {
            this.elements.playerVideo.pause();
        }

        // Handle Low Bandwidth Override
        if (isLowBandwidth && (mode === 'video' || mode === 'link')) {
            this.elements.audioLayer.classList.add('active');
            return;
        }

        // Activate specific layer
        switch (mode) {
            case 'live':
                if (this.elements.liveLayer) this.elements.liveLayer.classList.add('active');
                break;
            case 'video':
            case 'link':
                this.elements.videoLayer.classList.add('active');
                break;
            case 'slides':
                this.elements.slidesLayer.classList.add('active');
                break;
            case 'channel':
                this.elements.channelLayer.classList.add('active');
                break;
            case 'audio':
                this.elements.audioLayer.classList.add('active');
                break;
            default:
                this.elements.videoLayer.classList.add('active');
        }
    },

    updateLiveBadge(isLive) {
        if (!this.elements.liveBadgeText) return;
        if (isLive) {
            this.elements.liveBadgeDot.style.color = 'red';
            this.elements.liveBadgeText.textContent = 'LIVE';
        } else {
            this.elements.liveBadgeDot.style.color = '#ccc';
            this.elements.liveBadgeText.textContent = 'OFFLINE';
        }
    },

    /**
     * Renders multiple images in a specified layout.
     * @param {Array<string>} images - Array of image URLs
     * @param {string} layout - The CSS layout class (e.g., 'slides-layout-1')
     */
    renderSlidesLayout(images, layout = 'slides-layout-1') {
        if (!this.elements.slidesContainer) return;
        
        // Ensure layout is valid or default to 1
        const validLayout = layout && layout.startsWith('slides-layout-') ? layout : 'slides-layout-1';
        
        // Reset classes
        this.elements.slidesContainer.className = 'slides-container ' + validLayout;
        this.elements.slidesContainer.innerHTML = '';
        
        if (images && Array.isArray(images)) {
            images.forEach(url => {
                if (url) {
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = "شريحة عرض";
                    this.elements.slidesContainer.appendChild(img);
                }
            });
        }
    }
};
