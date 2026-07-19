import { ContactService } from './ContactService.js';

class ContactControllerClass {
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
            }
        });
    }

    showToast(message, type = 'success') {
        let toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.className = 'toast-notification';
            toast.innerHTML = '<i id="toast-icon" class="fas"></i><span id="toast-msg"></span>';
            document.body.appendChild(toast);
        }
        const icon = document.getElementById('toast-icon');
        const msg = document.getElementById('toast-msg');
        toast.className = `toast-notification ${type}`;
        icon.className = `fas ${type === 'success' ? 'fa-check-circle success' : 'fa-exclamation-circle error'}`;
        msg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('contact-submit-btn');
        
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const subjectInput = document.getElementById('contact-subject');
        const messageInput = document.getElementById('contact-message');

        if (!nameInput || !emailInput || !subjectInput || !messageInput) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = subjectInput.value;
        const message = messageInput.value.trim();

        if (!name || !email || !subject || !message) {
            this.showToast('يرجى تعبئة جميع الحقول المطلوبة', 'error');
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-left:8px;"></i>جاري الإرسال...';
        }

        try {
            await ContactService.submitContactMessage({ name, email, subject, message });
            this.showToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
            form.reset();
        } catch (err) {
            console.error('Contact form error:', err);
            this.showToast('حدث خطأ في الإرسال. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane" style="margin-left:8px;"></i>إرسال الرسالة';
            }
        }
    }
}

export const ContactController = new ContactControllerClass();
ContactController.init();
