const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
    
    // Serve the directory locally first using python
    const { spawn } = require('child_process');
    const server = spawn('python3', ['-m', 'http.server', '8080'], { cwd: '/home/jamal/Projects/HOME-WEB' });
    
    // Wait for server to start
    await new Promise(r => setTimeout(r, 2000));
    
    try {
        await page.goto('http://localhost:8080/course-room.html?id=123');
        await page.waitForTimeout(2000);
        console.log("Clicking login...");
        await page.click('#login-submit-btn');
        await page.waitForTimeout(2000);
    } catch(e) {
        console.error("Test Error:", e);
    } finally {
        server.kill();
        await browser.close();
    }
})();
