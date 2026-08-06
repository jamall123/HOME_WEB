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
    renderChannelMessage(message, docId) {
        const feed = document.getElementById('channel-feed');
        if (!feed) return;

        // Prevent duplicate rendering based on timestamp
        const msgId = docId || String(message.timestamp);
        if (feed.querySelector(`[data-id="${msgId}"]`)) return;

        // Clear placeholder text on first real message
        const placeholder = feed.querySelector('.channel-placeholder');
        if (placeholder) placeholder.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'channel-message-card';
        // Telegram channel style: solid dark background, rounded corners, max-width
        msgDiv.style.cssText = [
            'background: #1e293b',
            'padding: 0.6rem 0.8rem',
            'border-radius: 16px',
            'box-shadow: 0 1px 2px rgba(0,0,0,0.2)',
            'position: relative',
            'max-width: 85%',
            'align-self: center',
            'width: 100%',
            'display: flex',
            'flex-direction: column',
            'animation: fadeIn 0.3s ease'
        ].join(';');
        msgDiv.dataset.id = msgId;

        const timeString = new Date(message.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute:'2-digit' });

        let contentHtml = '';
        
        if (message.type === 'text') {
            contentHtml = `<p style="color:#f1f5f9;margin:0 0 0.4rem 0;font-size:1.05rem;line-height:1.6;">${message.content}</p>`;
        } else if (message.type === 'image') {
            contentHtml = `<div style="text-align:center;margin-bottom:0.4rem;border-radius:12px;overflow:hidden;background:#0f172a;"><img src="${message.content}" style="width:100%;max-height:400px;object-fit:cover;display:block;" alt="صورة توضيحية"></div>`;
        } else if (message.type === 'audio') {
            // Sleek audio wrapper
            contentHtml = `<div style="margin-bottom:0.4rem;background:rgba(99,102,241,0.1);border-radius:12px;padding:0.6rem;display:flex;flex-direction:column;gap:0.5rem;"><div style="display:flex;align-items:center;gap:0.5rem;color:#cbd5e1;font-size:0.85rem;margin-bottom:0.2rem;"><i class="fas fa-headphones" style="color:#6366f1;"></i> رسالة صوتية</div><audio src="${message.content}" controls style="width:100%;height:35px;outline:none;border-radius:20px;"></audio></div>`;
        } else if (message.type === 'video') {
            contentHtml = `<div style="text-align:center;margin-bottom:0.4rem;border-radius:12px;overflow:hidden;background:#0f172a;"><video src="${message.content}" controls style="width:100%;max-height:400px;display:block;outline:none;" playsinline></video></div>`;
        }

        // Reactions logic
        const reactions = message.reactions || { like: 0, heart: 0 };
        
        msgDiv.innerHTML = `
            ${contentHtml}
            <div style="display:flex;justify-content:flex-end;align-items:center;margin-top:0.2rem;">
                <span style="font-size:0.75rem;color:#94a3b8;display:flex;align-items:center;gap:0.2rem;">
                    ${timeString} <i class="fas fa-check-double" style="color:#3b82f6;font-size:0.7rem;margin-right:2px;"></i>
                </span>
            </div>
            <!-- Reaction buttons -->
            <div style="display:flex;gap:0.4rem;margin-top:0.5rem;" class="msg-reactions">
                <button onclick="if(window.RoomAPI) window.RoomAPI.toggleReaction('${msgId}', 'like')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#cbd5e1;border-radius:20px;padding:0.3rem 0.6rem;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;gap:0.3rem;transition:all 0.2s;">
                    👍 <span class="rxn-count-like">${reactions.like > 0 ? reactions.like : ''}</span>
                </button>
                <button onclick="if(window.RoomAPI) window.RoomAPI.toggleReaction('${msgId}', 'heart')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#cbd5e1;border-radius:20px;padding:0.3rem 0.6rem;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;gap:0.3rem;transition:all 0.2s;">
                    ❤️ <span class="rxn-count-heart">${reactions.heart > 0 ? reactions.heart : ''}</span>
                </button>
            </div>
        `;

        feed.appendChild(msgDiv);
        feed.scrollTop = feed.scrollHeight;
        feed.scrollTop = feed.scrollHeight;

        // Update message counter
        const counter = document.getElementById('channel-msg-count');
        if (counter) {
            const count = feed.querySelectorAll('.channel-message-card').length;
            counter.textContent = `${count} رسالة`;
        }
    }
};
