/**
 * dynamic-content.js
 * يقوم بجلب المحتوى من Firebase (مجموعة pageContent) 
 * وتحديث عناصر HTML التي تحتوي على الخاصية data-dynamic="key"
 */

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JHomeAPI) return;

    // تحديد الصفحة الحالية
    let pageKey = window.location.pathname.split('/').pop().replace('.html', '');
    if (!pageKey || pageKey === 'index' || pageKey === '') {
        pageKey = 'home';
    }

    try {
        // جلب المحتوى من السيرفر
        const pageData = await JHomeAPI.getPageContent(pageKey);
        
        if (pageData && pageData.sections) {
            // تحديث العناصر بناءً على المفاتيح
            Object.keys(pageData.sections).forEach(key => {
                const elements = document.querySelectorAll(`[data-dynamic="${key}"]`);
                elements.forEach(el => {
                    const value = pageData.sections[key];
                    if (el.tagName === 'IMG') {
                        el.src = value;
                    } else if (el.tagName === 'A' && el.hasAttribute('data-dynamic-href')) {
                        el.href = value;
                    } else {
                        // استخدام innerHTML لدعم التنسيقات (مثل <br> أو <strong>) القادمة من لوحة التحكم
                        el.innerHTML = value;
                    }
                });
            });
        }
    } catch (error) {
        console.error(`Error loading dynamic content for ${pageKey}:`, error);
    }
});
