const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('dist/course-room.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Simulate DOMContentLoaded
const event = document.createEvent('Event');
event.initEvent('DOMContentLoaded', true, true);
window.document.dispatchEvent(event);

const btn = document.getElementById('login-submit-btn');
if (btn) {
    console.log("Button found! onclick:", btn.getAttribute('onclick'));
    try {
        btn.click(); // Should trigger the onclick handler
        console.log("Button text after click:", btn.innerHTML);
    } catch(e) {
        console.error("Error clicking:", e);
    }
} else {
    console.log("Button not found!");
}
