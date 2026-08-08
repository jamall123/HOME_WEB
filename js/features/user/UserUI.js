/**
 * @file UserUI.js
 * @purpose UI bindings for User Profile actions.
 */
import { UserController } from './UserController.js';
import { stateStore } from '../../core/StateStore.js';
export class UserUIClass {
    init() {
        this._bindInstructorProfileForms();
    }

    _bindInstructorProfileForms() {
        // We will expose a single global function for the legacy onclick handlers
        window.updateInstructorProfile = async () => {
            // First check which form is being used by looking for elements
            const nameEl = document.getElementById('prof-name');
            
            if (nameEl) {
                // Form 2 (Detailed)
                const imgUrl = document.getElementById('prof-img-url')?.value.trim() || '';
                const name = nameEl.value.trim();
                const spec = document.getElementById('prof-spec')?.value.trim() || '';
                const bio = document.getElementById('prof-bio')?.value.trim() || '';
                const cvUrl = document.getElementById('prof-cv-url')?.value.trim() || '';

                if (!name || !spec) {
                    alert("الاسم والتخصص مطلوبان!");
                    return;
                }

                try {
                    await UserController.updateInstructorProfile({ name, specialty: spec, bio, image: imgUrl, cvUrl });
                    alert("تم تحديث بياناتك بنجاح! سيراها الطلاب عند الدخول.");
                } catch (e) {
                    alert("حدث خطأ أثناء حفظ البيانات");
                }
            } else {
                // Form 1 (Basic)
                const photo = document.getElementById('inst-update-photo')?.value.trim() || '';
                const specialty = document.getElementById('inst-update-specialty')?.value.trim() || '';
                const bio = document.getElementById('inst-update-bio')?.value.trim() || '';
                const currentUser = stateStore.getState('currentUserData') || {};
                
                try {
                    await UserController.updateInstructorProfile({ 
                        name: currentUser.name || 'Instructor', 
                        specialty, 
                        bio, 
                        image: photo 
                    });
                    alert("تم التحديث بنجاح! ستظهر هذه التحديثات للطلاب مباشرة.");
                } catch (e) {
                    alert("حدث خطأ أثناء التحديث.");
                }
            }
        };
    }
}
export const UserUI = new UserUIClass();
