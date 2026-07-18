// settings.js - Loads website settings globally

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});

async function loadSettings() {
    try {
        const db = firebase.firestore();
        const doc = await db.collection('settings').doc('global').get();
        if (doc.exists) {
            const data = doc.data();

            // Populate index.html elements
            const heroText = document.getElementById('dy-hero-text');
            if(heroText && data.heroText) heroText.textContent = data.heroText;

            // Populate about.html elements
            const vision = document.getElementById('dy-vision');
            if(vision && data.vision) vision.textContent = data.vision;

            const mission = document.getElementById('dy-mission');
            if(mission && data.mission) mission.textContent = data.mission;

            const values = document.getElementById('dy-values');
            if(values && data.values) values.textContent = data.values;

            const founderName = document.getElementById('dy-founder-name');
            if(founderName && data.founderName) founderName.textContent = data.founderName;

            const founderBio1 = document.getElementById('dy-founder-bio1');
            if(founderBio1 && data.founderBio1) founderBio1.textContent = data.founderBio1;

            const founderBio2 = document.getElementById('dy-founder-bio2');
            if(founderBio2 && data.founderBio2) founderBio2.textContent = data.founderBio2;
        }
    } catch(e) {
        console.error('Error loading settings:', e);
    }
}
