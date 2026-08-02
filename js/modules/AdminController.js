import { CMSService } from './CMSService.js';
import { AdminUI } from './AdminUI.js';
import { Logger } from './Logger.js';
import { eventBus } from '../core/EventBus.js';
import { CMSManager } from './CMSManager.js';
import { MediaManager } from './MediaManager.js';

class AdminControllerClass {
    constructor() {
        this.service = CMSService;
        this.ui = AdminUI;
        // Initialize UI logic
        this.ui.initModals();

        // Cursors for pagination
        this.cursors = {
            users: null,
            requests: null
        };

        // Loaded data
        this.loadedData = {
            users: [],
            requests: []
        };
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
        
        // Show request details modal
        window.showRequestDetailsModal = (btnElement) => {
            try {
                const reqData = JSON.parse(btnElement.getAttribute('data-req'));
                const contentDiv = document.getElementById('request-details-content');
                contentDiv.innerHTML = `
                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                        <p style="margin-bottom: 0.5rem; color: var(--text-secondary);"><i class="fas fa-book-open" style="margin-left: 5px;"></i> الدورة المطلوبة:</p>
                        <strong style="color: var(--primary-light); font-size: 1.1rem;">${reqData.courseTitle}</strong>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                            <p style="margin-bottom: 0.5rem; color: var(--text-secondary);"><i class="fas fa-user" style="margin-left: 5px;"></i> الطالب:</p>
                            <strong>${reqData.name}</strong><br>
                            <span dir="ltr">${reqData.phone}</span>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                            <p style="margin-bottom: 0.5rem; color: var(--text-secondary);"><i class="fas fa-map-marker-alt" style="margin-left: 5px;"></i> الموقع (المدينة):</p>
                            <strong>${reqData.city}</strong>
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                        <p style="margin-bottom: 0.5rem; color: var(--text-secondary);"><i class="fas fa-graduation-cap" style="margin-left: 5px;"></i> المستوى التعليمي:</p>
                        <strong>${reqData.education}</strong>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                        <p style="margin-bottom: 0.5rem; color: var(--text-secondary);"><i class="fas fa-comment-dots" style="margin-left: 5px;"></i> سبب الانضمام / الهدف:</p>
                        <p style="margin: 0; line-height: 1.5;">${reqData.reason}</p>
                    </div>
                    ${reqData.receipt ? `
                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; text-align: center;">
                        <p style="margin-bottom: 0.5rem; color: var(--text-secondary);"><i class="fas fa-receipt" style="margin-left: 5px;"></i> الإيصال المرفق:</p>
                        ${reqData.receipt.toLowerCase().includes('.pdf') ? 
                          `<a href="${reqData.receipt}" target="_blank" class="btn btn-primary" style="display:inline-block; margin-top:0.5rem;"><i class="fas fa-file-pdf"></i> عرض ملف الـ PDF</a>` :
                          `<a href="${reqData.receipt}" target="_blank"><img src="${reqData.receipt}" style="max-width: 100%; max-height: 300px; border-radius: 8px; object-fit: contain; cursor: zoom-in;" alt="الإيصال"></a>`
                        }
                    </div>` : ''}
                `;
                document.getElementById('request-details-modal').style.display = 'flex';
            } catch (e) {
                console.error("Error showing details", e);
            }
        };

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
        
        // Init Enterprise Managers
        CMSManager.init();
        MediaManager.init();

        // Initial Tab setup is now handled by AppShell Router

        // Form Submit Listeners
        this.attachFormListeners();

        // Global Action Delegation (for buttons rendered dynamically)
        document.body.addEventListener('click', this.handleGlobalClick.bind(this));

        // Hook into the Enterprise EventBus
        eventBus.on('workspace:module_loaded', (route) => {
            this.handleModuleLoaded(route);
        });

    }

    async switchAdminTab(tabName) {
        // Forward legacy tab switching to the new router hash
        window.location.hash = tabName;
    }

    async handleModuleLoaded(tabName) {
        if (tabName === 'dashboard') {
            await this.loadDashboardWidgets();
        } else if (tabName === 'medialibrary') {
            MediaManager.loadGallery();
        } else if (tabName === 'payments') {
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
            CMSManager.loadSettings();
        } else if (tabName === 'auditlog') {
            await this.loadAuditLog(false);
        }
    }

    async loadDashboardWidgets() {
        try {
            const [usersRes, requests, messages] = await Promise.all([
                this.service.getUsers(),
                this.service.getEnrollmentRequests(),
                this.service.getContactMessages ? this.service.getContactMessages() : Promise.resolve([])
            ]);

            const users = Array.isArray(usersRes) ? usersRes : (usersRes.data || []);
            const pendingRequests = requests.filter(r => r.status === 'pending');
            const approvedRequests = requests.filter(r => r.status === 'approved');
            const unreadMessages = messages.filter(m => !m.isRead);

            const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
            setEl('dash-users-count', users.length);
            setEl('dash-requests-count', pendingRequests.length);
            setEl('dash-media-count', approvedRequests.length);
            setEl('dash-sales-count', unreadMessages.length || messages.length);

            // Recent Activity Feed
            const activityEl = document.getElementById('dash-recent-activity');
            if (activityEl) {
                const activities = [
                    ...pendingRequests.slice(0, 3).map(r => ({
                        icon: 'fas fa-file-invoice',
                        color: 'var(--warning)',
                        text: `طلب انضمام جديد من <strong>${r.name || 'مجهول'}</strong> — ${r.courseTitle || 'دورة'}`,
                        time: r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('ar-SD') : 'منذ قليل'
                    })),
                    ...unreadMessages.slice(0, 2).map(m => ({
                        icon: 'fas fa-envelope',
                        color: '#A78BFA',
                        text: `رسالة جديدة من <strong>${m.name || m.email || 'زائر'}</strong> — ${m.subject || ''}`,
                        time: m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString('ar-SD') : 'منذ قليل'
                    }))
                ];

                if (activities.length === 0) {
                    activityEl.innerHTML = `<p class="text-muted" style="text-align:center; padding:1.5rem;">لا توجد نشاطات حديثة</p>`;
                } else {
                    activityEl.innerHTML = activities.map(a => `
                        <div style="display:flex; align-items:center; gap:1rem; padding:0.9rem 0; border-bottom:1px solid var(--border-color);">
                            <div style="width:38px; height:38px; border-radius:50%; background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                <i class="${a.icon}" style="color:${a.color};"></i>
                            </div>
                            <div style="flex:1; min-width:0;">
                                <p style="margin:0; font-size:0.9rem;">${a.text}</p>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${a.time}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch(e) {
            console.error('[AdminController] Dashboard load error', e);
            const activityEl = document.getElementById('dash-recent-activity');
            if (activityEl) activityEl.innerHTML = `<p class="text-muted" style="text-align:center;">فشل تحميل النشاطات</p>`;
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

    async loadUsers(isLoadMore = false) {
        if (!isLoadMore) {
            this.cursors.users = null;
            this.loadedData.users = [];
            this.ui.setTableLoading('users-list', 6);
        } else {
            const btn = document.getElementById('btn-load-more-users');
            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
        }

        try {
            const { data, lastVisible } = await this.service.getUsers(50, this.cursors.users);
            this.cursors.users = lastVisible;
            this.loadedData.users.push(...data);
            
            this.ui.renderUsers(this.loadedData.users);
            
            // Update UI count and load more button
            const countText = document.getElementById('users-count-text');
            if (countText) countText.innerText = `عرض ${this.loadedData.users.length} مستخدم`;
            
            const loadMoreBtn = document.getElementById('btn-load-more-users');
            if (loadMoreBtn) {
                if (data.length < 50) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'block';
                    loadMoreBtn.innerHTML = 'عرض المزيد <i class="fas fa-chevron-down"></i>';
                }
            }

        } catch (e) {
            Logger.error('AdminController', 'Failed to load users', e);
            if (!isLoadMore) this.ui.setTableError('users-list', 6);
        }
    }

    async loadRequests(isLoadMore = false) {
        if (!isLoadMore) {
            this.cursors.requests = null;
            this.loadedData.requests = [];
            this.ui.setTableLoading('requests-list', 6);
        } else {
            const btn = document.getElementById('btn-load-more-requests');
            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
        }

        try {
            const { data, lastVisible } = await this.service.getEnrollmentRequests(50, this.cursors.requests);
            this.cursors.requests = lastVisible;
            this.loadedData.requests.push(...data);
            
            this.ui.renderEnrollmentRequests(this.loadedData.requests);

            // Update UI count and load more button
            const countText = document.getElementById('requests-count-text');
            if (countText) countText.innerText = `عرض ${this.loadedData.requests.length} طلب`;
            
            const loadMoreBtn = document.getElementById('btn-load-more-requests');
            if (loadMoreBtn) {
                if (data.length < 50) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'block';
                    loadMoreBtn.innerHTML = 'عرض المزيد <i class="fas fa-chevron-down"></i>';
                }
            }
        } catch (e) {
            Logger.error('AdminController', 'Failed to load requests', e);
            if (!isLoadMore) this.ui.setTableError('requests-list', 6);
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
            const data = await this.service.getSettings('global');
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
            case 'approve-req': {
                const name = btn.getAttribute('data-name');
                const course = btn.getAttribute('data-course');
                this.approveRequest(id, name, course);
                break;
            }
            case 'reject-req': {
                const name = btn.getAttribute('data-name');
                this.rejectRequest(id, name);
                break;
            }
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

    handleError(e) {
        console.error('[AdminController]', e);
        const message = e.message || 'حدث خطأ غير متوقع';
        // Check if there is a notificationManager, else fallback to alert
        if (window.NotificationManager) {
            window.NotificationManager.show({ title: 'خطأ', message, type: 'error' });
        } else {
            alert(message);
        }
    }

    async approveRequest(id, fullName, courseId) {
        if (!confirm(`هل أنت متأكد من الموافقة على طلب: ${fullName}؟ سيتم تفعيل حسابه تلقائياً.`)) return;
        try {
            const requestData = this.requestsData?.find(r => r.id === id);
            await this.service.approveEnrollment(id, requestData);
            this.loadRequests();
            alert('تمت الموافقة على الطلب بنجاح.');
        } catch (e) { this.handleError(e); }
    }

    async rejectRequest(id, fullName) {
        if (!confirm(`هل أنت متأكد من رفض طلب: ${fullName}؟`)) return;
        try {
            await this.service.rejectEnrollment(id);
            this.loadRequests();
            alert('تم رفض الطلب.');
        } catch (e) { this.handleError(e); }
    }

    async deleteRequest(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
        try {
            await this.service.deleteRequest(id);
            this.loadRequests();
        } catch (e) { this.handleError(e); }
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
                
                const base = fullnameInput.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
                const unique = Math.floor(Math.random() * 10000).toString();
                const creds = { username: base + unique, password: base + unique };
                
                try {
                    await this.service.createUser({
                        displayName: fullnameInput.value,
                        email: `${base}${unique}@jhome.local`,
                        password: base + unique,
                        role: roleInput.value || 'STUDENT',
                        courseId: courseInput.value.trim() || null
                    });
                    alert(`تم إنشاء الحساب بنجاح!\nاسم المستخدم: ${creds.username}\nكلمة المرور: ${creds.password}`);
                    userForm.reset();
                    this.loadUsers();
                } catch (err) { alert('حدث خطأ أثناء إنشاء الحساب: ' + (err.message || '')); }
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

    }

    // ------------------------------------------------
    // Audit Log
    // ------------------------------------------------
    async loadAuditLog(isLoadMore = false) {
        const tbody = document.getElementById('auditlog-list');
        if (!tbody) return;

        if (!isLoadMore) {
            this.cursors = this.cursors || {};
            this.cursors.auditlog = null;
            this.loadedData = this.loadedData || {};
            this.loadedData.auditlog = [];
            this.ui.setTableLoading?.('auditlog-list', 5);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>`;
        }

        try {
            const db = window.firebase?.firestore ? window.firebase.firestore() : null;
            if (!db) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--error);">لم يتم الاتصال بقاعدة البيانات</td></tr>`; return; }

            let query = db.collection('auditLogs').orderBy('timestamp', 'desc').limit(30);
            if (isLoadMore && this.cursors?.auditlog) {
                query = query.startAfter(this.cursors.auditlog);
            }

            const snap = await query.get();
            const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            if (!isLoadMore) this.loadedData.auditlog = [];
            this.loadedData.auditlog.push(...logs);
            this.cursors.auditlog = snap.docs[snap.docs.length - 1] || null;

            const actionColors = { CREATE: 'var(--success)', UPDATE: 'var(--info)', DELETE: 'var(--error)', APPROVE: 'var(--primary)', REJECT: 'var(--warning)' };
            const actionIcons = { CREATE: 'fa-plus-circle', UPDATE: 'fa-edit', DELETE: 'fa-trash', APPROVE: 'fa-check-circle', REJECT: 'fa-times-circle' };

            if (this.loadedData.auditlog.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);"><i class="fas fa-history fa-2x" style="display:block; margin-bottom:0.5rem;"></i>لا توجد سجلات بعد</td></tr>`;
            } else {
                tbody.innerHTML = this.loadedData.auditlog.map(log => {
                    const action = log.action || 'UNKNOWN';
                    const color = actionColors[action] || 'var(--text-secondary)';
                    const icon = actionIcons[action] || 'fa-circle';
                    const ts = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('ar-SD') : (log.timestamp || '—');
                    const statusOk = log.success !== false;
                    return `<tr>
                        <td>${log.performedBy || log.userId || 'النظام'}</td>
                        <td><span class="badge" style="background:${color}22; color:${color}; border:1px solid ${color}44;"><i class="fas ${icon}" style="margin-left:4px;"></i>${action}</span></td>
                        <td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${log.description || ''}"><code style="font-size:0.78rem; color:var(--text-secondary);">${log.collection || ''}</code> ${log.description || log.targetId || '—'}</td>
                        <td style="font-size:0.82rem; color:var(--text-muted); white-space:nowrap;">${ts}</td>
                        <td><span class="badge ${statusOk ? 'badge-success' : 'badge-danger'}">${statusOk ? 'نجح' : 'فشل'}</span></td>
                    </tr>`;
                }).join('');
            }

            const countEl = document.getElementById('auditlog-count-text');
            if (countEl) countEl.innerText = `عرض ${this.loadedData.auditlog.length} سجل`;

            const loadMoreBtn = document.getElementById('btn-load-more-auditlog');
            if (loadMoreBtn) loadMoreBtn.style.display = logs.length < 30 ? 'none' : 'inline-flex';

        } catch(e) {
            console.error('[AdminController] Audit log load error', e);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--error); padding:2rem;"><i class="fas fa-exclamation-triangle"></i> فشل تحميل سجل العمليات: ${e.message}</td></tr>`;
        }
    }

}

export const AdminController = new AdminControllerClass();

// Global table filtering utilities
window.filterTable = (tableId, query, cols = [0]) => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const q = query.toLowerCase();
    Array.from(table.getElementsByTagName('tr')).forEach(tr => {
        const tds = tr.getElementsByTagName('td');
        if (!tds.length) return;
        const matches = cols.some(c => tds[c] && tds[c].innerText.toLowerCase().includes(q));
        tr.style.display = matches ? '' : 'none';
    });
};

window.filterTableByCol = (tableId, query, colIndex) => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const q = query.toLowerCase();
    Array.from(table.getElementsByTagName('tr')).forEach(tr => {
        const tds = tr.getElementsByTagName('td');
        if (!tds.length || !tds[colIndex]) return;
        
        // Exact match for selects, or 'all' if query is empty
        const matches = q === '' || tds[colIndex].innerText.toLowerCase().includes(q) || tds[colIndex].innerHTML.toLowerCase().includes(q);
        tr.style.display = matches ? '' : 'none';
    });
};
