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
    },

    /**
     * Renders a channel message in the channel feed.
     * @param {Object} message - { type, content, url, timestamp }
     */
    renderChannelMessage(message) {
        const feed = document.getElementById('channel-feed');
        if (!feed) return;

        // Prevent duplicate rendering of the same message based on timestamp
        const lastMsgEl = feed.lastElementChild;
        if (lastMsgEl && lastMsgEl.dataset.timestamp === String(message.timestamp)) {
            return;
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = 'channel-message-card';
        msgDiv.style.background = 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)';
        msgDiv.style.padding = '1.2rem';
        msgDiv.style.borderRadius = '12px';
        msgDiv.style.border = '1px solid rgba(255,255,255,0.05)';
        msgDiv.style.borderRight = '4px solid var(--primary-color)';
        msgDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        msgDiv.style.position = 'relative';
        msgDiv.style.overflow = 'hidden';
        msgDiv.dataset.timestamp = message.timestamp;

        const timeString = new Date(message.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute:'2-digit' });

        let contentHtml = '';
        let downloadHtml = '';
        
        if (message.type === 'text') {
            contentHtml = `<p style="color: #f8fafc; margin: 0 0 0.8rem 0; font-size: 1.15rem; line-height: 1.6;">${message.content}</p>`;
        } else if (message.type === 'image') {
            contentHtml = `<div style="text-align: center; margin-bottom: 0.8rem; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.5rem;"><img src="${message.content}" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px;" alt="صورة توضيحية"></div>`;
            downloadHtml = `<a href="${message.content}" target="_blank" download="صورة_المحاضرة.jpg" class="btn btn-sm btn-dark" style="display: inline-flex; align-items: center; gap: 0.5rem; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.85rem; text-decoration: none; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-download"></i> تحميل الصورة</a>`;
        } else if (message.type === 'audio') {
            contentHtml = `<div style="margin-bottom: 0.8rem; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.8rem; display: flex; align-items: center; gap: 1rem;"><i class="fas fa-headphones" style="font-size: 1.5rem; color: #a78bfa;"></i><audio src="${message.content}" controls style="flex: 1; height: 36px; outline: none;"></audio></div>`;
            downloadHtml = `<a href="${message.content}" target="_blank" download="تسجيل_صوتي.webm" class="btn btn-sm btn-dark" style="display: inline-flex; align-items: center; gap: 0.5rem; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.85rem; text-decoration: none; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-download"></i> تحميل الصوت</a>`;
        } else if (message.type === 'video') {
            contentHtml = `<div style="text-align: center; margin-bottom: 0.8rem; background: rgba(0,0,0,0.3); border-radius: 8px; overflow: hidden;"><video src="${message.content}" controls style="max-width: 100%; max-height: 400px; width: 100%; outline: none;" playsinline></video></div>`;
            downloadHtml = `<a href="${message.content}" target="_blank" download="فيديو_المحاضرة.mp4" class="btn btn-sm btn-dark" style="display: inline-flex; align-items: center; gap: 0.5rem; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.85rem; text-decoration: none; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-download"></i> تحميل الفيديو</a>`;
        }

        msgDiv.innerHTML = `
            ${contentHtml}
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; margin-top: 0.5rem;">
                <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem;">
                    <i class="fas fa-clock" style="color: var(--primary-light);"></i> ${timeString}
                </div>
                ${downloadHtml}
            </div>
            <div style="position: absolute; top: 0; right: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, var(--primary-color), transparent);"></div>
        `;

        feed.appendChild(msgDiv);
        feed.scrollTop = feed.scrollHeight;
    }
};
