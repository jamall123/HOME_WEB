import { EnrollmentRepository } from '../../repositories/EnrollmentRepository.js';
import { BackendGateway } from '../../core/BackendGateway.js';

export const EnrollmentController = {
    // State
    currentCourseId: null,
    currentCourseTitle: null,
    isPaidCourse: false,
    loadedBankAccounts: [],
    selectedReceiptFile: null,

    // DOM Elements
    elements: {},
    initialized: false,

    init() {
        if (this.initialized) return;
        this.cacheDOM();
        this.attachEventListeners();
        this.attachBottomSheetGestures();
        this.initialized = true;
    },

    cacheDOM() {
        this.elements = {
            modal: document.getElementById('enrollment-modal'),
            bottomSheet: document.getElementById('registration-bottom-sheet'),
            closeBtns: document.querySelectorAll('.close-enrollment-modal'),
            
            // Steps
            step1: document.getElementById('enrollment-step-1'),
            step2: document.getElementById('enrollment-step-2'),
            loadingStep: document.getElementById('enrollment-loading'),
            successStep: document.getElementById('enrollment-success'),
            errorStep: document.getElementById('enrollment-error'),
            
            // Headers
            courseTitle: document.getElementById('enrollment-course-title'),

            // Form
            form: document.getElementById('enrollment-form'),
            name: document.getElementById('reg-name'),
            email: document.getElementById('reg-email'),
            age: document.getElementById('reg-age'),
            phone: document.getElementById('reg-phone'),
            education: document.getElementById('reg-education'),
            specialization: document.getElementById('reg-specialization'),
            city: document.getElementById('reg-city'),
            country: document.getElementById('reg-country'),
            gender: document.getElementById('reg-gender'),
            reason: document.getElementById('reg-reason'),
            
            // Errors
            errName: document.getElementById('err-name'),
            errEmail: document.getElementById('err-email'),
            errAge: document.getElementById('err-age'),
            errPhone: document.getElementById('err-phone'),
            errEducation: document.getElementById('err-education'),
            errCity: document.getElementById('err-city'),
            errCountry: document.getElementById('err-country'),
            errGender: document.getElementById('err-gender'),
            errReason: document.getElementById('err-reason'),

            // Step 1 Submit
            submitStep1: document.getElementById('submit-step-1'),
            
            // Step 2 Payment UI
            btnBack: document.getElementById('btn-back-to-form'),
            bankSelector: document.getElementById('bank-selector'),
            displayBankName: document.getElementById('display-bank-name'),
            displayAccountName: document.getElementById('display-account-name'),
            accountNumber: document.getElementById('account-number'),
            btnCopyAccount: document.getElementById('btn-copy-account'),
            
            // Receipt Upload
            uploadZone: document.getElementById('upload-receipt-zone'),
            receiptUpload: document.getElementById('receipt-upload'),
            previewContainer: document.getElementById('receipt-preview-container'),
            receiptPreview: document.getElementById('receipt-preview'),
            receiptFileName: document.getElementById('receipt-file-name'),
            btnRemoveReceipt: document.getElementById('btn-remove-receipt'),
            
            // Final Submit
            submitFinal: document.getElementById('submit-final-registration'),
            
            // Error handling
            btnRetry: document.getElementById('btn-retry-enrollment'),
            errorTitle: document.getElementById('enrollment-error-title'),
            errorMessage: document.getElementById('enrollment-error-message'),
            errorIcon: document.getElementById('enrollment-error-icon')
        };
    },

    attachEventListeners() {
        // Modal Closing
        this.elements.closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Step 1 Form Submission
        if(this.elements.form) {
            this.elements.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleStep1Submit();
            });
        }
        
        // Education change -> show specialization
        if(this.elements.education) {
            this.elements.education.addEventListener('change', (e) => {
                const specGroup = document.getElementById('group-specialization');
                if(e.target.value === 'جامعي' || e.target.value === 'دراسات عليا' || e.target.value === 'أخرى') {
                    specGroup.style.display = 'block';
                } else {
                    specGroup.style.display = 'none';
                }
            });
        }

        // Back from Step 2 to Step 1
        if(this.elements.btnBack) {
            this.elements.btnBack.addEventListener('click', () => this.showStep(this.elements.step1));
        }

        // Bank Selection
        if(this.elements.bankSelector) {
            this.elements.bankSelector.addEventListener('change', (e) => {
                const selectedId = e.target.value;
                const account = this.loadedBankAccounts.find(a => a.id === selectedId);
                if (account) {
                    this.elements.displayBankName.textContent = account.bank;
                    this.elements.displayAccountName.textContent = account.name;
                    this.elements.accountNumber.textContent = account.number;
                }
            });
        }

        // Copy Account
        if(this.elements.btnCopyAccount) {
            this.elements.btnCopyAccount.addEventListener('click', () => {
                const num = this.elements.accountNumber.textContent;
                navigator.clipboard.writeText(num).then(() => {
                    const originalHTML = this.elements.btnCopyAccount.innerHTML;
                    this.elements.btnCopyAccount.innerHTML = '<i class="fas fa-check" style="color:#10b981;"></i>';
                    setTimeout(() => {
                        this.elements.btnCopyAccount.innerHTML = originalHTML;
                    }, 2000);
                });
            });
        }

        // Receipt Upload Handlers
        if(this.elements.uploadZone && this.elements.receiptUpload) {
            this.elements.uploadZone.addEventListener('click', () => {
                this.elements.receiptUpload.click();
            });

            this.elements.receiptUpload.addEventListener('change', (e) => {
                this.handleReceiptSelection(e.target.files[0]);
            });
        }

        if(this.elements.btnRemoveReceipt) {
            this.elements.btnRemoveReceipt.addEventListener('click', () => {
                this.selectedReceiptFile = null;
                this.elements.receiptUpload.value = '';
                this.elements.uploadZone.style.display = 'block';
                this.elements.previewContainer.style.display = 'none';
            });
        }

        // Final Submit (Paid Course)
        if(this.elements.submitFinal) {
            this.elements.submitFinal.addEventListener('click', async () => {
                await this.submitFinalRegistration();
            });
        }
        
        // Retry
        if(this.elements.btnRetry) {
            this.elements.btnRetry.addEventListener('click', () => {
                if (this.isPaidCourse) {
                    this.showStep(this.elements.step2);
                } else {
                    this.showStep(this.elements.step1);
                }
            });
        }

        // Reset validation styling on input
        const inputs = [this.elements.name, this.elements.email, this.elements.age, this.elements.phone, this.elements.education, this.elements.city, this.elements.country, this.elements.gender, this.elements.reason];
        inputs.forEach(input => {
            if(input) {
                input.addEventListener('input', () => {
                    input.classList.remove('is-invalid');
                    const errEl = document.getElementById(`err-${input.id.replace('reg-', '')}`);
                    if(errEl) errEl.style.display = 'none';
                });
            }
        });
    },

    attachBottomSheetGestures() {
        if(!this.elements.bottomSheet) return;
        
        const handle = this.elements.bottomSheet.querySelector('.sheet-drag-handle');
        if(!handle) return;

        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        handle.addEventListener('touchstart', (e) => {
            if (this.elements.loadingStep.classList.contains('active-step')) return;

            startY = e.touches[0].clientY;
            isDragging = true;
            this.elements.bottomSheet.style.transition = 'none'; 
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;

            if (deltaY > 0) {
                this.elements.bottomSheet.style.transform = `translateY(${deltaY}px)`;
            }
        }, { passive: true });

        handle.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            this.elements.bottomSheet.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const deltaY = currentY - startY;
            
            if (deltaY > 150) {
                this.closeModal();
            } else {
                this.elements.bottomSheet.style.transform = 'translateY(0)';
            }
        });
    },

    openEnrollment(courseTitle, isPaid, courseId) {
        this.currentCourseId = courseId;
        this.currentCourseTitle = courseTitle;
        this.isPaidCourse = isPaid;

        this.elements.courseTitle.textContent = courseTitle;
        
        // Reset form and state
        this.elements.form.reset();
        this.selectedReceiptFile = null;
        if(this.elements.receiptUpload) this.elements.receiptUpload.value = '';
        if(this.elements.uploadZone) this.elements.uploadZone.style.display = 'block';
        if(this.elements.previewContainer) this.elements.previewContainer.style.display = 'none';

        // Clear validations
        document.querySelectorAll('.form-input').forEach(el => el.classList.remove('is-invalid', 'is-valid'));
        document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');

        // Adjust Step 1 button text based on course type
        if(this.elements.submitStep1) {
            if (isPaid) {
                this.elements.submitStep1.innerHTML = 'متابعة لإكمال الدفع <i class="fas fa-arrow-left" style="margin-right: 8px;"></i>';
            } else {
                this.elements.submitStep1.innerHTML = 'إرسال طلب التسجيل <i class="fas fa-check-circle" style="margin-right: 8px;"></i>';
            }
        }

        this.showStep(this.elements.step1);

        // Open modal with slide up animation
        this.elements.modal.classList.add('active');
        // Small delay to allow display block to apply before transforming
        setTimeout(() => {
            if(this.elements.bottomSheet) {
                this.elements.bottomSheet.style.transform = 'translateY(0)';
            }
        }, 10);

        if (isPaid) {
            this.loadBankAccounts();
        }
    },

    closeModal() {
        if(this.elements.bottomSheet) {
            this.elements.bottomSheet.style.transform = 'translateY(100%)';
        }
        setTimeout(() => {
            this.elements.modal.classList.remove('active');
        }, 300); // Wait for slide down transition
    },

    showStep(stepElement) {
        const steps = [this.elements.step1, this.elements.step2, this.elements.loadingStep, this.elements.successStep, this.elements.errorStep];
        steps.forEach(s => {
            if(s) s.classList.remove('active-step');
        });
        if(stepElement) {
            stepElement.classList.add('active-step');
        }
    },

    validateForm() {
        let isValid = true;
        
        const nameVal = this.elements.name.value.trim();
        const emailVal = this.elements.email.value.trim();
        const ageVal = parseInt(this.elements.age.value);
        const phoneVal = this.elements.phone.value.trim();
        const eduVal = this.elements.education.value;
        const cityVal = this.elements.city.value.trim();
        const countryVal = this.elements.country.value.trim();
        const genderVal = this.elements.gender.value;
        const reasonVal = this.elements.reason.value.trim();

        if (!nameVal || /\d/.test(nameVal) || nameVal.length < 3) {
            this.markInvalid(this.elements.name, this.elements.errName);
            isValid = false;
        } else {
            this.markValid(this.elements.name);
        }

        if (emailVal) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(emailVal)) {
                this.markInvalid(this.elements.email, this.elements.errEmail);
                isValid = false;
            } else {
                this.markValid(this.elements.email);
            }
        } else {
            this.markValid(this.elements.email);
        }

        if (!ageVal || isNaN(ageVal) || ageVal < 10 || ageVal > 100) {
            this.markInvalid(this.elements.age, this.elements.errAge);
            isValid = false;
        } else {
            this.markValid(this.elements.age);
        }

        const phoneDigits = phoneVal.replace(/\D/g, '');
        if (phoneDigits.length < 9) {
            this.markInvalid(this.elements.phone, this.elements.errPhone);
            isValid = false;
        } else {
            this.markValid(this.elements.phone);
        }

        if (!eduVal) {
            this.markInvalid(this.elements.education, this.elements.errEducation);
            isValid = false;
        } else {
            this.markValid(this.elements.education);
        }

        if (!cityVal || cityVal.length < 2) {
            this.markInvalid(this.elements.city, this.elements.errCity);
            isValid = false;
        } else {
            this.markValid(this.elements.city);
        }

        if (!countryVal || countryVal.length < 2) {
            this.markInvalid(this.elements.country, this.elements.errCountry);
            isValid = false;
        } else {
            this.markValid(this.elements.country);
        }

        if (!genderVal) {
            this.markInvalid(this.elements.gender, this.elements.errGender);
            isValid = false;
        } else {
            this.markValid(this.elements.gender);
        }

        if (!reasonVal || reasonVal.length < 5) {
            this.markInvalid(this.elements.reason, this.elements.errReason);
            isValid = false;
        } else {
            this.markValid(this.elements.reason);
        }

        return isValid;
    },

    markInvalid(input, errElement) {
        if(input) {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
        }
        if(errElement) errElement.style.display = 'block';
    },

    markValid(input) {
        if(input) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    },

    async handleStep1Submit() {
        if (!this.validateForm()) return;

        this.showStep(this.elements.loadingStep);
        try {
            if (this.isPaidCourse) {
                this.showStep(this.elements.step2);
            } else {
                await this.submitFinalRegistration(); // Free course, submit directly
            }
        } catch (error) {
            console.error("Submission failed:", error);
            this.showError("حدث خطأ", "تعذر الاتصال بالخادم. الرجاء التأكد من اتصالك بالإنترنت وإعادة المحاولة.");
        }
    },

    async loadBankAccounts() {
        if(this.elements.bankSelector) {
            this.elements.bankSelector.innerHTML = '<option value="" class="skeleton-loader">جاري التحميل...</option>';
        }

        try {
            this.loadedBankAccounts = await EnrollmentRepository.getBankAccounts() || [];

            if (this.loadedBankAccounts.length === 0) {
                this.loadedBankAccounts = [{ id: 'default', bank: 'بنكك', name: 'جمال احمد ابراهيم', number: '4373414' }];
            }

            this.populateBankAccounts();
        } catch (error) {
            console.error("Failed to load bank accounts:", error);
            this.loadedBankAccounts = [{ id: 'default', bank: 'بنكك', name: 'جمال احمد ابراهيم', number: '4373414' }];
            this.populateBankAccounts();
        }
    },

    populateBankAccounts() {
        if (!this.elements.bankSelector) return;
        this.elements.bankSelector.innerHTML = '';
        
        this.loadedBankAccounts.forEach(acc => {
            const opt = document.createElement('option');
            opt.value = acc.id;
            opt.textContent = `${acc.bank} - ${acc.name}`;
            this.elements.bankSelector.appendChild(opt);
        });

        if (this.loadedBankAccounts.length > 0) {
            this.elements.bankSelector.value = this.loadedBankAccounts[0].id;
            this.elements.bankSelector.dispatchEvent(new Event('change'));
        }
    },

    handleReceiptSelection(file) {
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('الرجاء رفع صورة (JPG, PNG) أو ملف PDF فقط.');
            return;
        }

        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`حجم الملف كبير جداً. الحد الأقصى هو ${maxSizeMB} ميجابايت.`);
            return;
        }

        this.selectedReceiptFile = file;

        this.elements.uploadZone.style.display = 'none';
        this.elements.previewContainer.style.display = 'block';
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.elements.receiptPreview.src = e.target.result;
                this.elements.receiptPreview.style.display = 'block';
                this.elements.receiptFileName.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            this.elements.receiptPreview.style.display = 'none';
            this.elements.receiptFileName.textContent = `📄 ${file.name}`;
            this.elements.receiptFileName.style.display = 'block';
        }
    },

    async submitFinalRegistration() {
        this.showStep(this.elements.loadingStep);

        try {
            let receiptUrl = null;
            if (this.isPaidCourse && this.selectedReceiptFile) {
                receiptUrl = await EnrollmentRepository.uploadReceipt(this.currentCourseId, this.selectedReceiptFile);
            }

            const requestNumber = 'REQ-' + Math.floor(10000000 + Math.random() * 90000000);

            const payload = {
                action: 'request',
                payload: {
                    courseId: this.currentCourseId,
                    email: this.elements.email.value.trim() || null,
                    name: this.elements.name.value.trim(),
                    student: {
                        fullName: this.elements.name.value.trim(),
                        phone: this.elements.phone.value.trim(),
                        age: parseInt(this.elements.age.value),
                        gender: this.elements.gender.value,
                        country: this.elements.country.value.trim(),
                        city: this.elements.city.value.trim(),
                        education: this.elements.education.value,
                        specialization: this.elements.specialization.value.trim() || null,
                        reason: this.elements.reason.value.trim(),
                        requestNumber,
                        paymentStatus: this.isPaidCourse ? 'paid' : 'free',
                        receiptUrl,
                        courseTitle: this.currentCourseTitle
                    }
                },
                apiVersion: 'v1',
                metadata: {
                    correlationId: crypto.randomUUID(),
                    clientTimestamp: new Date().toISOString()
                }
            };

            await BackendGateway.execute({
                domain: 'academy_enrollments',
                action: 'request',
                entity: undefined,
                payload: payload.payload
            });
            
            this.showStep(this.elements.successStep);

        } catch (error) {
            console.error('Final submission failed:', error);
            this.showError('فشل التسجيل', 'لم نتمكن من حفظ بياناتك. الرجاء التأكد من اتصالك بالإنترنت والمحاولة مجدداً.');
        }
    },

    showError(title, message, showRetry = true) {
        if(this.elements.errorTitle) this.elements.errorTitle.textContent = title;
        if(this.elements.errorMessage) this.elements.errorMessage.textContent = message;
        if(this.elements.btnRetry) this.elements.btnRetry.style.display = showRetry ? 'block' : 'none';
        
        if(!showRetry) {
            this.elements.errorIcon.style.color = '#f59e0b';
            this.elements.errorIcon.style.background = 'rgba(245, 158, 11, 0.1)';
            this.elements.errorIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
        } else {
            this.elements.errorIcon.style.color = '#ef4444';
            this.elements.errorIcon.style.background = 'rgba(239, 68, 68, 0.1)';
            this.elements.errorIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        }

        this.showStep(this.elements.errorStep);
    }
};
