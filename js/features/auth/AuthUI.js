/**
 * @file AuthUI.js
 * @purpose UI bindings for Authentication.
 * @responsibilities
 *  - Handle DOM events for login forms.
 *  - Update UI state (spinners, alerts) during authentication.
 */

import { AuthController } from './AuthController.js';
import { stateStore } from '../../core/StateStore.js';

export class AuthUIClass {
    init() {
        // Bind UI elements dynamically to prevent errors if they don't exist
        window.enterRoom = this.enterRoom.bind(this);
        window.enterRoomUnified = this.enterRoomUnified.bind(this);
        window.backToSelection = this.backToSelection.bind(this);
        window.showStudentEntry = this.showStudentEntry.bind(this);
        window.showInstructorEntry = this.showInstructorEntry.bind(this);
    }

    showStudentEntry() {
        const selection = document.getElementById('entry-selection');
        const studentForm = document.getElementById('student-entry-form');
        if (selection && studentForm) {
            selection.style.display = 'none';
            studentForm.style.display = 'block';
        }
    }

    showInstructorEntry() {
        const selection = document.getElementById('entry-selection');
        const instructorForm = document.getElementById('instructor-entry-form');
        if (selection && instructorForm) {
            selection.style.display = 'none';
            instructorForm.style.display = 'block';
        }
    }

    backToSelection() {
        const selection = document.getElementById('entry-selection');
        const studentForm = document.getElementById('student-entry-form');
        const instructorForm = document.getElementById('instructor-entry-form');
        if (selection && studentForm && instructorForm) {
            studentForm.style.display = 'none';
            instructorForm.style.display = 'none';
            selection.style.display = 'flex';
        }
    }

    _hideEntryGate() {
        const gate = document.getElementById('room-entry-gate');
        if (gate) {
            gate.style.opacity = '0';
            setTimeout(() => {
                gate.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 400);
        }
    }

    async enterRoom(role) {
        if (role === 'instructor') {
            const email = document.getElementById('instructor-email').value.trim();
            const pass = document.getElementById('instructor-pass').value.trim();
            
            if (!email || !pass) {
                alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
                return;
            }

            const btn = event?.target;
            const originalText = btn ? btn.innerHTML : '';
            if (btn) { btn.innerHTML = 'جاري تسجيل الدخول...'; btn.disabled = true; }

            try {
                await AuthController.login(email, pass);
                this._hideEntryGate();
            } catch (e) {
                alert('فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.');
                if (btn) { btn.innerHTML = 'تسجيل الدخول الإداري <i class="fas fa-lock"></i>'; btn.disabled = false; }
            }
        } else {
            // Guest Student
            const guestName = document.getElementById('guest-name').value.trim() || 'ضيف';
            // Legacy compatibility (to be removed in Stage 4 Room migration)
            const currentUserObj = { name: guestName, role: 'student' };
            stateStore.setState({ currentUserData: currentUserObj });
            this._hideEntryGate();
        }
    }

    async enterRoomUnified(event) {
        const username = document.getElementById('unified-username').value.trim();
        const pass = document.getElementById('unified-pass').value.trim();

        if (!username || !pass) {
            alert('الرجاء إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        const btn = event ? event.target : document.querySelector('#unified-entry-form button');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) { btn.innerHTML = 'جاري تسجيل الدخول... <i class="fas fa-spinner fa-spin"></i>'; btn.disabled = true; }

        try {
            await AuthController.login(username, pass, stateStore.getState('currentRoomCourseId'));
            this._hideEntryGate();
            if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
        } catch (e) {
            const message = e.errorCode === 'invalid-credentials'
                ? e.message
                : 'حدث خطأ أثناء الاتصال بالخادم: ' + e.message;
            alert(message);
            if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
        }
    }
}

export const AuthUI = new AuthUIClass();
AuthUI.init();
