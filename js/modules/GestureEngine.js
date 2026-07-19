/**
 * GestureEngine.js
 * Handles touch and swipe gestures (e.g. swipe-down to close bottom sheets) 
 * for improved mobile UX.
 */

export const GestureEngine = {
    init() {
        this.sheets = document.querySelectorAll('.room-bottom-sheet');
        this.sheets.forEach(sheet => this.attachSwipeGestures(sheet));
    },

    attachSwipeGestures(sheet) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        // Grab the header as the drag handle
        const handle = sheet.querySelector('.sheet-header');
        if (!handle) return;

        handle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            sheet.style.transition = 'none'; // Disable transition for 1:1 finger tracking
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;

            // Only allow dragging downwards
            if (deltaY > 0) {
                sheet.style.transform = `translateY(${deltaY}px)`;
            }
        }, { passive: true });

        handle.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            sheet.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const deltaY = currentY - startY;
            
            // If dragged down by more than 100px, close the sheet
            if (deltaY > 100) {
                sheet.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    sheet.classList.remove('active');
                    sheet.style.transform = ''; // reset for next open
                }, 300);
            } else {
                // Snap back to top
                sheet.style.transform = 'translateY(0)';
            }
            
            currentY = 0;
            startY = 0;
        });
    }
};
