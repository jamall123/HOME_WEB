/**
 * CMSManager.js
 * Handles Dynamic CMS for the Enterprise Control Center.
 * Synchronizes global site settings (hero texts, vision, founder bio) with Firestore.
 */

import { OfflineSyncEngine } from './OfflineSyncEngine.js';
import { EventDispatcher } from './EventDispatcher.js';

class CMSManagerClass {
    constructor() {
        this.db = firebase.firestore();
        this.settingsDocRef = this.db.collection('system').doc('global_settings');
        this.form = document.getElementById('cms-settings-form');
        
        // Input fields mapping
        this.fields = {
            hero: document.getElementById('settings-hero'),
            vision: document.getElementById('settings-vision'),
            mission: document.getElementById('settings-mission'),
            values: document.getElementById('settings-values'),
            founderName: document.getElementById('settings-founder-name'),
            founderBio1: document.getElementById('settings-founder-bio1'),
            founderBio2: document.getElementById('settings-founder-bio2')
        };
    }

    async init() {
        if (!this.form) return;

        // Load current settings
        await this.loadSettings();

        // Handle Save
        this.form.addEventListener('submit', (e) => this.saveSettings(e));
    }

    async loadSettings() {
        try {
            const doc = await this.settingsDocRef.get();
            if (doc.exists) {
                const data = doc.data();
                for (const key in this.fields) {
                    if (this.fields[key] && data[key]) {
                        this.fields[key].value = data[key];
                    }
                }
            }
        } catch (error) {
            console.error('[CMSManager] Error loading settings', error);
        }
    }

    async saveSettings(e) {
        e.preventDefault();
        
        const data = {};
        for (const key in this.fields) {
            if (this.fields[key]) {
                data[key] = this.fields[key].value;
            }
        }

        try {
            // Use OfflineSyncEngine instead of direct Firebase call
            // Wait! For critical system settings, maybe direct is better, but OfflineSyncEngine is the new standard.
            // Let's use direct DB for immediate feedback in admin, then fallback to queue if offline.
            
            if (navigator.onLine) {
                await this.settingsDocRef.set(data, { merge: true });
                alert('تم حفظ إعدادات الموقع بنجاح!');
            } else {
                await OfflineSyncEngine.queueOperation('system', 'global_settings', 'set', data);
                alert('أنت غير متصل بالإنترنت. تم وضع الحفظ في قائمة الانتظار للمزامنة لاحقاً.');
            }
            
            EventDispatcher.emit('GLOBAL_SETTINGS_UPDATED', data);

        } catch (error) {
            console.error('[CMSManager] Error saving settings', error);
            alert('حدث خطأ أثناء الحفظ');
        }
    }
}

export const CMSManager = new CMSManagerClass();
