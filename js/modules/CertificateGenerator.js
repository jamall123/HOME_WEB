/**
 * CertificateGenerator.js
 * Scaffolding for the dynamic HTML-to-PDF certificate system.
 */

import { EventBus, Events } from './EventBus.js';

export class CertificateGenerator {
    static async generateAndStore(courseId, userId) {
        // 1. Generate unique Cert ID
        const certId = this.generateCertId();

        // 2. Fetch Course and User data
        const db = firebase.firestore();
        const courseDoc = await db.collection('courses').doc(courseId).get();
        const courseTitle = courseDoc.exists ? courseDoc.data().title : 'دورة تدريبية';
        
        const userDoc = await db.collection('users').doc(userId).get();
        let studentName = userDoc.exists ? userDoc.data().fullName : 'طالب';
        
        // Check local storage / session if not in users
        if (!userDoc.exists) {
           const cachedUser = localStorage.getItem('Jhome_Student_' + courseId);
           if (cachedUser) studentName = JSON.parse(cachedUser).fullName || studentName;
        }

        const dateStr = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy
        const verifyUrl = `${window.location.origin}/verify.html?id=${certId}`;

        // 3. Save to Firestore
        await db.collection('certificates').doc(certId).set({
            courseId,
            userId,
            studentName,
            courseTitle,
            issueDate: firebase.firestore.FieldValue.serverTimestamp(),
            verifyUrl
        });

        // 4. Trigger UI modal
        this.showCertificateModal(certId, studentName, courseTitle, dateStr, verifyUrl);
    }

    static generateCertId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'CERT-';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    static async loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    static async showCertificateModal(certId, studentName, courseTitle, dateStr, verifyUrl) {
        // Load QRCode library dynamically
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');

        const overlay = document.createElement('div');
        overlay.id = 'cert-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.flexDirection = 'column';

        const certContainer = document.createElement('div');
        certContainer.id = 'cert-container';
        certContainer.style.width = '800px';
        certContainer.style.height = '600px';
        certContainer.style.backgroundColor = '#fff';
        certContainer.style.position = 'relative';
        certContainer.style.padding = '40px';
        certContainer.style.textAlign = 'center';
        certContainer.style.fontFamily = 'Arial, sans-serif';
        certContainer.style.border = '10px solid var(--primary-color)';

        certContainer.innerHTML = `
            <h1 style="margin-top: 80px; color: #333; font-size: 48px;">شهادة إتمام دورة</h1>
            <p style="font-size: 24px; color: #555; margin-top: 20px;">تشهد منصة السودان المجاني بأن</p>
            <h2 style="font-size: 40px; color: #000; margin: 20px 0;">${studentName}</h2>
            <p style="font-size: 24px; color: #555;">قد أتم بنجاح دورة</p>
            <h3 style="font-size: 32px; color: var(--primary-color); margin: 20px 0;">${courseTitle}</h3>
            
            <div style="position: absolute; bottom: 50px; left: 50px; text-align: right; color: #666; font-size: 14px;">
                <p>تاريخ الإصدار: <br> ${dateStr}</p>
                <p>رقم الشهادة: <br> ${certId}</p>
            </div>
            
            <div id="cert-qrcode" style="position: absolute; bottom: 50px; right: 50px; width: 100px; height: 100px;"></div>
        `;

        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '20px';
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '10px';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'إغلاق';
        closeBtn.className = 'btn';
        closeBtn.style.padding = '10px 20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => document.body.removeChild(overlay);

        const printBtn = document.createElement('button');
        printBtn.textContent = 'طباعة / حفظ كـ PDF';
        printBtn.className = 'btn';
        printBtn.style.padding = '10px 20px';
        printBtn.style.cursor = 'pointer';
        printBtn.style.background = 'var(--primary-color)';
        printBtn.style.color = 'white';
        printBtn.onclick = () => {
            btnContainer.style.display = 'none';
            // Simple print strategy for canvas/div
            const oldBody = document.body.innerHTML;
            document.body.innerHTML = certContainer.outerHTML;
            window.print();
            document.body.innerHTML = oldBody;
            window.location.reload(); // Reload to restore event listeners
        };

        btnContainer.appendChild(printBtn);
        btnContainer.appendChild(closeBtn);

        overlay.appendChild(certContainer);
        overlay.appendChild(btnContainer);
        document.body.appendChild(overlay);

        // Generate QR Code
        setTimeout(() => {
            new QRCode(document.getElementById('cert-qrcode'), {
                text: verifyUrl,
                width: 100,
                height: 100
            });
        }, 200);
    }
}
