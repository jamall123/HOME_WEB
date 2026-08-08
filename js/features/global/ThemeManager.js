/**
 * ThemeManager.js
 * Manages CSS variables and theme state for the application.
 */

export const ThemeManager = {
    init() {
        // Prepare for future theme switching
        this.applyTheme('dark');
    },

    applyTheme(themeName) {
        const root = document.documentElement;
        if (themeName === 'dark') {
            root.style.setProperty('--bg-base', '#03040B');
            root.style.setProperty('--bg-surface', '#0A0C14');
            root.style.setProperty('--text-primary', '#FFFFFF');
            root.style.setProperty('--text-secondary', '#A1A1AA');
            root.style.setProperty('--primary-color', '#3B82F6');
        }
        // Future themes can be added here
    }
};
