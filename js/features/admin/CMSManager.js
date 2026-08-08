/**
 * CMSManager.js
 * Handles the Dynamic Content Engine, Theme & Branding Manager, and Settings Panels.
 * Saves/loads from the central 'settings' document in Firestore.
 */

import { eventBus } from '../../core/EventBus.js';
import { AdminRepository } from '../../repositories/AdminRepository.js';

class CMSManagerClass {
    constructor() {
        this.settingsDocId = 'global_config';
        
        // Theme Form
        this.themeForm = document.getElementById('cms-theme-form');
        this.primaryColorInput = document.getElementById('theme-primary');
        this.darkModeSelect = document.getElementById('theme-dark-mode');
        this.logoInput = document.getElementById('theme-logo');
        this.logoPreview = document.getElementById('theme-logo-preview');

        // Texts Form
        this.textsForm = document.getElementById('cms-settings-form');
        this.heroInput = document.getElementById('settings-hero');
        this.visionInput = document.getElementById('settings-vision');
        this.missionInput = document.getElementById('settings-mission');
        this.founderNameInput = document.getElementById('settings-founder-name');
        this.founderBio1Input = document.getElementById('settings-founder-bio1');
    }

    init() {
        if (this.themeForm) {
            this.themeForm.addEventListener('submit', (e) => this.saveTheme(e));
        }
        if (this.textsForm) {
            this.textsForm.addEventListener('submit', (e) => this.saveTexts(e));
        }
        if (this.logoInput) {
            this.logoInput.addEventListener('input', () => this.updateLogoPreview());
        }

        // Listen for when settings module is loaded
        eventBus.on('workspace:module_loaded', (route) => {
            if (route === 'settings') {
                this.loadSettings();
            }
        });

        // Initialize theme globally upon app start
        this.applyGlobalTheme();
    }

    async applyGlobalTheme() {
        try {
            const data = await AdminRepository.getSettingsDoc(this.settingsDocId);
            if (data) {
                if (data.theme) {
                    if (data.theme.primaryColor) {
                        document.documentElement.style.setProperty('--primary', data.theme.primaryColor);
                        document.documentElement.style.setProperty('--primary-color', data.theme.primaryColor); // legacy compat
                    }
                    if (data.theme.darkMode === 'false') {
                        // Apply light mode overrides if needed
                        document.documentElement.style.setProperty('--bg-base', '#f5f6fa');
                        document.documentElement.style.setProperty('--bg-surface', '#ffffff');
                        document.documentElement.style.setProperty('--text-primary', '#2f3640');
                        document.documentElement.style.setProperty('--text-muted', '#718093');
                    }
                }
            }
        } catch (err) {
            console.error('[CMSManager] Error applying global theme', err);
        }
    }

    async loadSettings() {
        try {
            const data = await AdminRepository.getSettingsDoc(this.settingsDocId);
            if (data) {
                // Populate Theme
                if (data.theme && this.themeForm) {
                    this.primaryColorInput.value = data.theme.primaryColor || '#00d2d3';
                    this.darkModeSelect.value = data.theme.darkMode || 'true';
                    this.logoInput.value = data.theme.logoUrl || '';
                    this.updateLogoPreview();
                }

                // Populate Texts
                if (data.texts && this.textsForm) {
                    this.heroInput.value = data.texts.hero || '';
                    this.visionInput.value = data.texts.vision || '';
                    this.missionInput.value = data.texts.mission || '';
                    this.founderNameInput.value = data.texts.founderName || '';
                    this.founderBio1Input.value = data.texts.founderBio1 || '';
                }
            }
        } catch (error) {
            console.error('[CMSManager] Load error', error);
            eventBus.emit('notification:show', { type: 'error', message: 'فشل في تحميل الإعدادات' });
        }
    }

    updateLogoPreview() {
        if (this.logoInput.value) {
            this.logoPreview.src = this.logoInput.value;
            this.logoPreview.style.display = 'block';
        } else {
            this.logoPreview.style.display = 'none';
        }
    }

    async saveTheme(e) {
        e.preventDefault();
        const themeData = {
            primaryColor: this.primaryColorInput.value,
            darkMode: this.darkModeSelect.value,
            logoUrl: this.logoInput.value
        };

        try {
            await AdminRepository.setSettingsDoc(this.settingsDocId, { theme: themeData });
            
            // Track asset usage for the logo if it's from our media library
            if (themeData.logoUrl && themeData.logoUrl.includes('firebasestorage')) {
                this.trackAssetUsage(themeData.logoUrl, 'Global Logo');
            }

            eventBus.emit('notification:show', { type: 'success', message: 'تم تحديث المظهر بنجاح' });
            this.applyGlobalTheme();
        } catch (error) {
            console.error('[CMSManager] Save theme error', error);
            eventBus.emit('notification:show', { type: 'error', message: 'حدث خطأ أثناء حفظ المظهر' });
        }
    }

    async saveTexts(e) {
        e.preventDefault();
        const textsData = {
            hero: this.heroInput.value,
            vision: this.visionInput.value,
            mission: this.missionInput.value,
            founderName: this.founderNameInput.value,
            founderBio1: this.founderBio1Input.value
        };

        try {
            await AdminRepository.setSettingsDoc(this.settingsDocId, { texts: textsData });
            eventBus.emit('notification:show', { type: 'success', message: 'تم حفظ نصوص المؤسسة بنجاح' });
        } catch (error) {
            console.error('[CMSManager] Save texts error', error);
            eventBus.emit('notification:show', { type: 'error', message: 'حدث خطأ أثناء حفظ النصوص' });
        }
    }

    async trackAssetUsage(url, location) {
        try {
            const doc = await AdminRepository.getMediaLibrary(url);
            if (doc) {
                await AdminRepository.updateMediaUsage(doc.id, location);
            }
        } catch (err) {
            console.warn('[CMSManager] Could not track asset usage', err);
        }
    }
}

export const CMSManager = new CMSManagerClass();
