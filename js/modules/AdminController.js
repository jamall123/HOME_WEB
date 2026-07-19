import { CMSService } from './CMSService.js';
import { AdminUI } from './AdminUI.js';
import { Logger } from './Logger.js';

class AdminControllerClass {
    constructor() {
        this.service = CMSService;
        this.ui = AdminUI;
        this.init();
    }

    init() {
        // Expose global functions for backward compatibility with onclick handlers in HTML
        window.switchAdminTab = this.switchAdminTab.bind(this);
        window.showCourseModal = this.showCourseModal.bind(this);
        window.showPostModal = this.showPostModal.bind(this);
        window.showStoryModal = this.showStoryModal.bind(this);
        window.showProjectModal = this.showProjectModal.bind(this);
        window.closeCMSModal = this.ui.closeModal.bind(this.ui);

        // Map global edit/delete for CMS items that use string interpolation in onclick
        window.editCourse = this.editCourse.bind(this);
        window.editPost = this.editPost.bind(this);
        window.editStory = this.editStory.bind(this);
        window.editProject = this.editProject.bind(this);
        window.deleteDocument = this.deleteDocument.bind(this);

        // Requests / Messages functions
        window.approveRequest = this.approveRequest.bind(this);
        window.deleteRequest = this.deleteRequest.bind(this);
        window.markMessageRead = this.markMessageRead.bind(this);
        window.deleteContactMessage = this.deleteContactMessage.bind(this);
        
        // Initial Tab setup
        this.switchAdminTab('payments');

        // Form Submit Listeners
        this.attachFormListeners();

        // Global Action Delegation (for buttons rendered dynamically)
        document.body.addEventListener('click', this.handleGlobalClick.bind(this));
    }

    async switchAdminTab(tabName) {
        this.ui.switchTab(tabName);
        if (tabName === 'payments') {
            await this.loadBankAccounts();
        } else if (tabName === 'users') {
            await this.loadUsers();
        } else if (tabName === 'requests') {
            await this.loadRequests();
        } else if (tabName === 'courses') {
            await this.loadCourses();
        } else if (tabName === 'media') {
            await this.loadMedia();
        } else if (tabName === 'projects') {
            await this.loadProjects();
        } else if (tabName === 'messages') {
            await this.loadMessages();
        } else if (tabName === 'settings') {
            await this.loadSettings();
        }
    }

    // ------------------------------------------------
    // Data Loading
    // ------------------------------------------------
    async loadBankAccounts() {
        this.ui.setTableLoading('bank-accounts-list', 4);
        try {
            const accounts = await this.service.getBankAccounts();
            this.ui.renderBankAccounts(accounts);
        } catch (e) {
            Logger.error('AdminController', 'Failed to load bank accounts', e);
            this.ui.setTableError('bank-accounts-list', 4);
        }
    }

    async loadUsers() {
        this.ui.setTableLoading('users-list', 6);
        try {
            const users = await this.service.getUsers();
            this.ui.renderUsers(users);
        } catch (e) {
            Logger.error('AdminController', 'Failed to load users', e);
            this.ui.setTableError('users-list', 6);
        }
    }

    async loadRequests() {
        this.ui.setTableLoading('requests-list', 6);
        try {
            const reqs = await this.service.getEnrollmentRequests();
            this.ui.renderEnrollmentRequests(reqs);
        } catch (e) {
            Logger.error('AdminController', 'Failed to load requests', e);
            this.ui.setTableError('requests-list', 6);
        }
    }

    async loadMessages() {
        this.ui.setTableLoading('messages-list', 7);
        try {
            const msgs = await this.service.getContactMessages();
            this.ui.renderMessages(msgs);
        } catch (e) {
            Logger.error('AdminController', 'Failed to load messages', e);
            this.ui.setTableError('messages-list', 7);
        }
    }

    async loadCourses() {
        this.ui.setTableLoading('cms-courses-list', 6);
        try {
            const items = await this.service.getCourses();
            this.ui.renderCourses(items);
        } catch (e) {
            Logger.error('AdminController', 'Failed to load courses', e);
            this.ui.setTableError('cms-courses-list', 6);
        }
    }

    async loadMedia() {
        this.ui.setTableLoading('cms-posts-list', 4);
        this.ui.setTableLoading('cms-stories-list', 4);
        try {
            const posts = await this.service.getPosts();
            this.ui.renderPosts(posts);
            const stories = await this.service.getStories();
            this.ui.renderStories(stories);
        } catch (e) {
            Logger.error('AdminController', 'Failed to load media', e);
            this.ui.setTableError('cms-posts-list', 4);
            this.ui.setTableError('cms-stories-list', 4);
        }
    }

    async loadProjects() {
        this.ui.setTableLoading('cms-projects-list', 4);
        try {
            const projects = await this.service.getProjects();
            this.ui.renderProjects(projects);
        } catch (e) {
            Logger.error('AdminController', 'Failed to load projects', e);
            this.ui.setTableError('cms-projects-list', 4);
        }
    }

    async loadSettings() {
        try {
            const data = await this.service.getSettings();
            this.ui.populateSettings(data);
        } catch (e) {
            Logger.error('AdminController', 'Failed to load settings', e);
        }
    }

    // ------------------------------------------------
    // Action Delegation Handlers
    // ------------------------------------------------
    handleGlobalClick(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        switch (action) {
            case 'delete-bank': this.deleteBankAccount(id); break;
            case 'delete-user': this.deleteUser(id); break;
            case 'approve-req': 
                const name = btn.getAttribute('data-name');
                const course = btn.getAttribute('data-course');
                this.approveRequest(id, name, course);
                break;
            case 'delete-req': this.deleteRequest(id); break;
            case 'mark-msg-read': this.markMessageRead(id); break;
            case 'delete-msg': this.deleteContactMessage(id); break;
            case 'edit-course': this.editCourse(id); break;
            case 'delete-course': this.deleteDocument('courses', id, () => this.loadCourses()); break;
            case 'edit-post': this.editPost(id); break;
            case 'delete-post': this.deleteDocument('posts', id, () => this.loadMedia()); break;
            case 'edit-story': this.editStory(id); break;
            case 'delete-story': this.deleteDocument('successStories', id, () => this.loadMedia()); break;
            case 'edit-project': this.editProject(id); break;
            case 'delete-project': this.deleteDocument('projects', id, () => this.loadProjects()); break;
        }
    }

    // ------------------------------------------------
    // Specific Action Logic
    // ------------------------------------------------
    async deleteBankAccount(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
        try {
            await this.service.deleteBankAccount(id);
            this.loadBankAccounts();
        } catch (e) { alert("حدث خطأ أثناء الحذف"); }
    }

    async deleteUser(id) {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        try {
            await this.service.deleteUser(id);
            this.loadUsers();
        } catch (e) { alert("حدث خطأ أثناء الحذف"); }
    }

    async approveRequest(id, fullName, courseId) {
        if (!confirm(`هل أنت متأكد من الموافقة على طلب: ${fullName}؟ سيطلب منك النظام إنشاء حساب له الآن.`)) return;
        try {
            await this.service.updateRequestStatus(id, 'approved');
            this.switchAdminTab('users');
            const nameInput = document.getElementById('new-user-fullname');
            const courseInput = document.getElementById('new-user-course');
            if (nameInput) {
                nameInput.value = fullName;
                if(courseInput && courseId && courseId !== 'undefined') courseInput.value = courseId;
                nameInput.focus();
            }
        } catch (e) { alert('فشل التحديث!'); }
    }

    async deleteRequest(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
        try {
            await this.service.deleteRequest(id);
            this.loadRequests();
        } catch (e) { alert('فشل الحذف!'); }
    }

    async markMessageRead(id) {
        try {
            await this.service.markMessageRead(id);
            this.loadMessages();
        } catch (e) { alert('فشل التحديث!'); }
    }

    async deleteContactMessage(id) {
        if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
        try {
            await this.service.deleteContactMessage(id);
            this.loadMessages();
        } catch (e) { alert('فشل الحذف!'); }
    }

    // ------------------------------------------------
    // CMS Modal Actions (Edit)
    // ------------------------------------------------
    showCourseModal() { this.ui.populateCourseModal(null, null); }
    async editCourse(id) {
        try {
            const data = await this.service.getCourseById(id);
            if (data) this.ui.populateCourseModal(id, data);
        } catch (e) { alert('خطأ في جلب بيانات الدورة'); }
    }

    showPostModal() { this.ui.populatePostModal(null, null); }
    async editPost(id) {
        try {
            const data = await this.service.getPostById(id);
            if (data) this.ui.populatePostModal(id, data);
        } catch (e) { alert('خطأ في جلب بيانات المقال'); }
    }

    showStoryModal() { this.ui.populateStoryModal(null, null); }
    async editStory(id) {
        try {
            const data = await this.service.getStoryById(id);
            if (data) this.ui.populateStoryModal(id, data);
        } catch (e) { alert('خطأ في جلب بيانات القصة'); }
    }

    showProjectModal() { this.ui.populateProjectModal(null, null); }
    async editProject(id) {
        try {
            const data = await this.service.getProjectById(id);
            if (data) this.ui.populateProjectModal(id, data);
        } catch (e) { alert('خطأ في جلب بيانات المنتج'); }
    }

    async deleteDocument(collectionName, id, reloadCallback) {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            if (collectionName === 'courses') await this.service.deleteCourse(id);
            else if (collectionName === 'posts') await this.service.deletePost(id);
            else if (collectionName === 'successStories') await this.service.deleteStory(id);
            else if (collectionName === 'projects') await this.service.deleteProject(id);
            
            if (typeof reloadCallback === 'function') reloadCallback();
        } catch (e) { alert('حدث خطأ أثناء الحذف'); }
    }

    // ------------------------------------------------
    // Form Listeners
    // ------------------------------------------------
    attachFormListeners() {
        const bankForm = document.getElementById('add-bank-form');
        if (bankForm) {
            bankForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const bankInput = document.getElementById('new-bank-name');
                const nameInput = document.getElementById('new-account-name');
                const numInput = document.getElementById('new-account-number');
                try {
                    await this.service.addBankAccount({
                        bank: bankInput.value,
                        name: nameInput.value,
                        number: numInput.value
                    });
                    bankForm.reset();
                    this.loadBankAccounts();
                } catch (err) { alert("حدث خطأ أثناء إضافة الحساب"); }
            });
        }

        const userForm = document.getElementById('add-user-form');
        if (userForm) {
            userForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const fullnameInput = document.getElementById('new-user-fullname');
                const roleInput = document.getElementById('new-user-role');
                const courseInput = document.getElementById('new-user-course');
                
                const base = fullnameInput.value.replace(/\s+/g, '').toLowerCase();
                const unique = Math.floor(Math.random() * 10000).toString();
                const creds = { username: base + unique, password: base + unique };
                
                try {
                    await this.service.addUser(creds.username, {
                        fullname: fullnameInput.value,
                        password: creds.password,
                        role: roleInput.value,
                        courseId: courseInput.value.trim() || null
                    });
                    alert("تم إنشاء المستخدم بنجاح!");
                    userForm.reset();
                    this.loadUsers();
                } catch (err) { alert("حدث خطأ أثناء إنشاء الحساب."); }
            });
        }

        const courseForm = document.getElementById('cms-course-form');
        if (courseForm) {
            courseForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('cms-course-id').value;
                let priceVal = document.getElementById('cms-course-price').value;
                const isFree = priceVal === 'مجاني' || priceVal === '0';
                try {
                    await this.service.saveCourse(id, {
                        title: document.getElementById('cms-course-title').value,
                        description: document.getElementById('cms-course-desc').value,
                        instructor: document.getElementById('cms-course-instructor').value,
                        category: document.getElementById('cms-course-category').value,
                        level: document.getElementById('cms-course-level').value,
                        duration: document.getElementById('cms-course-duration').value,
                        price: isFree ? 0 : Number(priceVal),
                        isPaid: !isFree,
                        coverImage: document.getElementById('cms-course-image').value,
                        cover: document.getElementById('cms-course-image').value
                    });
                    alert(id ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
                    this.ui.closeModal('cms-course-modal');
                    this.loadCourses();
                } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
            });
        }

        const postForm = document.getElementById('cms-post-form');
        if (postForm) {
            postForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('cms-post-id').value;
                const title = document.getElementById('cms-post-title').value.trim();
                const tagsRaw = (document.getElementById('cms-post-tags')?.value || '').trim();
                const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
                const statusEl = document.getElementById('cms-post-status');
                const featuredEl = document.getElementById('cms-post-featured');
                
                const postData = {
                    title,
                    category: document.getElementById('cms-post-category').value.trim(),
                    authorName: (document.getElementById('cms-post-author')?.value || '').trim(),
                    excerpt: (document.getElementById('cms-post-excerpt')?.value || '').trim(),
                    content: document.getElementById('cms-post-content').value,
                    coverImage: (document.getElementById('cms-post-image')?.value || '').trim() || null,
                    readingTime: parseInt(document.getElementById('cms-post-reading-time')?.value) || null,
                    tags,
                    status: statusEl ? statusEl.value : 'published',
                    isFeatured: featuredEl ? featuredEl.value === 'true' : false
                };
                if (!id) postData.slug = title.replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '').toLowerCase().slice(0, 80) + '-' + Date.now().toString(36);
                
                try {
                    await this.service.savePost(id, postData);
                    this.ui.closeModal('cms-post-modal');
                    this.loadMedia();
                } catch (err) { alert('خطأ في الحفظ'); }
            });
        }

        const storyForm = document.getElementById('cms-story-form');
        if (storyForm) {
            storyForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('cms-story-id').value;
                try {
                    await this.service.saveStory(id, {
                        personName: document.getElementById('cms-story-name').value,
                        personRole: document.getElementById('cms-story-role').value,
                        keyAchievement: document.getElementById('cms-story-achievement').value,
                        story: document.getElementById('cms-story-content').value,
                        coverImage: document.getElementById('cms-story-image').value,
                        personAvatar: document.getElementById('cms-story-image').value,
                        freelancerLink: document.getElementById('cms-story-link').value,
                        isPublished: true
                    });
                    this.ui.closeModal('cms-story-modal');
                    this.loadMedia();
                } catch (err) { alert('خطأ في الحفظ'); }
            });
        }

        const projectForm = document.getElementById('cms-project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('cms-project-id').value;
                try {
                    await this.service.saveProject(id, {
                        title: document.getElementById('cms-project-title').value,
                        description: document.getElementById('cms-project-desc').value,
                        status: document.getElementById('cms-project-status').value,
                        progress: Number(document.getElementById('cms-project-progress').value),
                        icon: document.getElementById('cms-project-icon').value || 'fas fa-cubes',
                        link: document.getElementById('cms-project-link').value || '#'
                    });
                    this.ui.closeModal('cms-project-modal');
                    this.loadProjects();
                } catch (err) { alert('خطأ في الحفظ'); }
            });
        }

        const settingsForm = document.getElementById('cms-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const btn = e.target.querySelector('button[type="submit"]');
                    const oldText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                    await this.service.saveSettings({
                        heroText: document.getElementById('settings-hero').value,
                        vision: document.getElementById('settings-vision').value,
                        mission: document.getElementById('settings-mission').value,
                        values: document.getElementById('settings-values').value,
                        founderName: document.getElementById('settings-founder-name').value,
                        founderBio1: document.getElementById('settings-founder-bio1').value,
                        founderBio2: document.getElementById('settings-founder-bio2').value
                    });
                    btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ';
                    setTimeout(() => btn.innerHTML = oldText, 2000);
                } catch (err) { alert('خطأ في الحفظ'); }
            });
        }
    }
}

export const AdminController = new AdminControllerClass();
