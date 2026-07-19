class AdminUIClass {
    // Helpers
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    setTableLoading(tbodyId, colspan) {
        const tbody = document.getElementById(tbodyId);
        if (tbody) tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center;">جاري التحميل...</td></tr>`;
    }

    setTableEmpty(tbodyId, colspan, message) {
        const tbody = document.getElementById(tbodyId);
        if (tbody) tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center;">${this.escapeHtml(message)}</td></tr>`;
    }

    setTableError(tbodyId, colspan) {
        const tbody = document.getElementById(tbodyId);
        if (tbody) tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; color: red;">فصل التحميل</td></tr>`;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.style.display = 'none';
    }

    openModal(modalId, title) {
        const modal = document.getElementById(modalId);
        if(modal) {
            document.getElementById(modalId + '-title').textContent = title;
            modal.style.display = 'flex';
        }
    }

    switchTab(tabName) {
        const sections = ['payments', 'users', 'requests', 'courses', 'media', 'projects', 'messages', 'settings'];
        const pageTitle = document.getElementById('admin-page-title');
        const pageSubtitle = document.getElementById('admin-page-subtitle');

        sections.forEach(sec => {
            const el = document.getElementById(`section-${sec}`);
            const nav = document.getElementById(`nav-${sec}`);
            if(el) el.style.display = 'none';
            if(nav) nav.classList.remove('active');
        });

        const activeSec = document.getElementById(`section-${tabName}`);
        const activeNav = document.getElementById(`nav-${tabName}`);
        
        if (activeSec) activeSec.style.display = 'block';
        if (activeNav) activeNav.classList.add('active');

        const titles = {
            'payments': { t: 'إدارة حسابات الدفع', s: 'تحكم في الحسابات البنكية التي تظهر للطلاب في شاشة الدفع' },
            'users': { t: 'إدارة المستخدمين', s: 'إنشاء وإدارة صلاحيات دخول المستخدمين للدورات المدفوعة' },
            'requests': { t: 'طلبات التسجيل', s: 'مراجعة طلبات التسجيل وإيصالات الدفع' },
            'courses': { t: 'إدارة الأكاديمية', s: 'إضافة وتعديل وحذف الدورات التعليمية' },
            'media': { t: 'المركز الإعلامي', s: 'إدارة المقالات التقنية وقصص النجاح' },
            'projects': { t: 'إدارة المنتجات', s: 'التحكم في عرض المنتجات والمشاريع وحالتها' },
            'messages': { t: 'رسائل التواصل', s: 'الرسائل الواردة من صفحة تواصل معنا' },
            'settings': { t: 'إعدادات الموقع', s: 'التحكم في بيانات الشركة ونصوص الصفحة الرئيسية' }
        };

        if (pageTitle && titles[tabName]) pageTitle.textContent = titles[tabName].t;
        if (pageSubtitle && titles[tabName]) pageSubtitle.textContent = titles[tabName].s;
    }

    // ------------------------------------------------
    // Bank Accounts
    // ------------------------------------------------
    renderBankAccounts(accounts) {
        const tbody = document.getElementById('bank-accounts-list');
        if (!tbody) return;

        if (accounts.length === 0) {
            this.setTableEmpty('bank-accounts-list', 4, 'لا توجد حسابات مضافة');
            return;
        }

        const fragment = document.createDocumentFragment();
        accounts.forEach(acc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.escapeHtml(acc.bank)}</td>
                <td>${this.escapeHtml(acc.name)}</td>
                <td style="font-family: monospace;">${this.escapeHtml(acc.number)}</td>
                <td>
                    <button class="action-btn" data-action="delete-bank" data-id="${acc.id}" title="حذف">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }

    // ------------------------------------------------
    // Users
    // ------------------------------------------------
    renderUsers(users) {
        const tbody = document.getElementById('users-list');
        if (!tbody) return;

        if (users.length === 0) {
            this.setTableEmpty('users-list', 6, 'لا يوجد مستخدمين');
            return;
        }

        const fragment = document.createDocumentFragment();
        users.forEach(user => {
            const roleBadge = user.role === 'instructor' 
                ? '<span style="background: var(--warning); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">مدرب / مشرف</span>'
                : '<span style="background: var(--primary-color); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">طالب</span>';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.escapeHtml(user.fullname || '-')}</td>
                <td style="font-family: monospace; color: var(--primary-color);">${this.escapeHtml(user.id)}</td>
                <td style="font-family: monospace;">${this.escapeHtml(user.password)}</td>
                <td>${roleBadge}</td>
                <td>${this.escapeHtml(user.courseId || 'عام (كل الدورات)')}</td>
                <td>
                    <button class="action-btn" data-action="delete-user" data-id="${user.id}" title="حذف">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }

    // ------------------------------------------------
    // Requests
    // ------------------------------------------------
    renderEnrollmentRequests(requests) {
        const tbody = document.getElementById('requests-list');
        if (!tbody) return;

        if (requests.length === 0) {
            this.setTableEmpty('requests-list', 6, 'لا توجد طلبات تسجيل حالياً');
            return;
        }

        const fragment = document.createDocumentFragment();
        requests.forEach(req => {
            const displayName = req.studentName || req.fullName || '-';
            const statusBadge = req.status === 'pending' ? 
                '<span style="background: var(--warning); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">قيد الانتظار</span>' :
                '<span style="background: var(--primary-color); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">مكتمل</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.escapeHtml(displayName)}</td>
                <td dir="ltr" style="text-align: right;">${this.escapeHtml(req.phone || '-')}</td>
                <td>${this.escapeHtml(req.courseTitle || '-')}</td>
                <td><a href="${this.escapeHtml(req.receiptUrl)}" target="_blank" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;"><i class="fas fa-eye"></i> عرض</a></td>
                <td>${statusBadge}</td>
                <td>
                    ${req.status === 'pending' ? `<button class="action-btn" style="color: var(--primary-color);" data-action="approve-req" data-id="${req.id}" data-name="${this.escapeHtml(displayName)}" data-course="${this.escapeHtml(req.courseId || '')}" title="موافقة وإنشاء حساب"><i class="fas fa-check-circle"></i></button>` : ''}
                    <button class="action-btn" data-action="delete-req" data-id="${req.id}" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }

    // ------------------------------------------------
    // Messages
    // ------------------------------------------------
    renderMessages(messages) {
        const tbody = document.getElementById('messages-list');
        if (!tbody) return;

        if (messages.length === 0) {
            this.setTableEmpty('messages-list', 7, 'لا توجد رسائل حتى الآن');
            return;
        }

        const fragment = document.createDocumentFragment();
        messages.forEach(msg => {
            const isRead = msg.read === true;
            const dateStr = msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString('ar-SA') : '-';
            const statusBadge = isRead
                ? '<span style="background:var(--success);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8rem;">مقروءة</span>'
                : '<span style="background:var(--warning);color:#000;padding:2px 8px;border-radius:4px;font-size:0.8rem;">جديدة</span>';

            const tr = document.createElement('tr');
            tr.style.opacity = isRead ? '0.7' : '1';
            tr.innerHTML = `
                <td>${this.escapeHtml(msg.name || '-')}</td>
                <td dir="ltr" style="text-align:right;"><a href="mailto:${this.escapeHtml(msg.email)}" style="color:var(--primary-color);">${this.escapeHtml(msg.email || '-')}</a></td>
                <td>${this.escapeHtml(msg.subject || '-')}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this.escapeHtml(msg.message || '')}">${this.escapeHtml(msg.message || '-')}</td>
                <td>${dateStr}</td>
                <td>${statusBadge}</td>
                <td>
                    ${!isRead ? `<button class="action-btn" style="color:var(--success);" data-action="mark-msg-read" data-id="${msg.id}" title="تحديد كمقروءة"><i class="fas fa-check"></i></button>` : ''}
                    <button class="action-btn" data-action="delete-msg" data-id="${msg.id}" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }

    // ------------------------------------------------
    // Courses
    // ------------------------------------------------
    renderCourses(courses) {
        const tbody = document.getElementById('cms-courses-list');
        if (!tbody) return;

        if (courses.length === 0) {
            this.setTableEmpty('cms-courses-list', 6, 'لا توجد دورات حالياً');
            return;
        }

        const fragment = document.createDocumentFragment();
        courses.forEach(data => {
            const tr = document.createElement('tr');
            const instructorName = typeof data.instructor === 'object' ? data.instructor.name : data.instructor;
            tr.innerHTML = `
                <td><img src="${this.escapeHtml(data.coverImage || data.cover || 'assets/images/placeholder.jpg')}" width="50" height="50" style="object-fit: cover; border-radius: 4px;"></td>
                <td>${this.escapeHtml(data.title)}</td>
                <td>${this.escapeHtml(data.category)}</td>
                <td><span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${data.price > 0 ? data.price + ' SDG' : 'مجاني'}</span></td>
                <td>${this.escapeHtml(instructorName || '')}</td>
                <td>
                    <button class="action-btn" data-action="edit-course" data-id="${data.id}" style="color: var(--warning); margin-left: 10px;" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" data-action="delete-course" data-id="${data.id}" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }

    populateCourseModal(id, data) {
        document.getElementById('cms-course-id').value = id || '';
        if (data) {
            document.getElementById('cms-course-title').value = data.title || '';
            document.getElementById('cms-course-desc').value = data.description || '';
            document.getElementById('cms-course-instructor').value = typeof data.instructor === 'object' ? (data.instructor.name || '') : (data.instructor || '');
            document.getElementById('cms-course-category').value = data.category || '';
            document.getElementById('cms-course-level').value = data.level || '';
            document.getElementById('cms-course-duration').value = data.duration || '';
            document.getElementById('cms-course-price').value = data.price > 0 ? data.price : 'مجاني';
            document.getElementById('cms-course-image').value = data.coverImage || data.cover || '';
            this.openModal('cms-course-modal', 'تعديل دورة');
        } else {
            const form = document.getElementById('cms-course-form');
            if (form) form.reset();
            this.openModal('cms-course-modal', 'إضافة دورة جديدة');
        }
    }

    // ------------------------------------------------
    // Media (Posts & Stories)
    // ------------------------------------------------
    renderPosts(posts) {
        const tbody = document.getElementById('cms-posts-list');
        if (!tbody) return;

        if (posts.length === 0) {
            this.setTableEmpty('cms-posts-list', 4, 'لا توجد مقالات');
            return;
        }

        const fragment = document.createDocumentFragment();
        posts.forEach(data => {
            const dateStr = data.publishedAt?.toDate ? data.publishedAt.toDate().toLocaleDateString('ar-EG') : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${this.escapeHtml(data.coverImage || 'assets/images/placeholder.jpg')}" width="50" height="50" style="object-fit: cover; border-radius: 4px;"></td>
                <td>${this.escapeHtml(data.title)}</td>
                <td>${dateStr}</td>
                <td>
                    <button class="action-btn" data-action="edit-post" data-id="${data.id}" style="color: var(--warning); margin-left: 10px;" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" data-action="delete-post" data-id="${data.id}" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }

    populatePostModal(id, data) {
        document.getElementById('cms-post-id').value = id || '';
        if (data) {
            document.getElementById('cms-post-title').value = data.title || '';
            document.getElementById('cms-post-category').value = data.category || '';
            document.getElementById('cms-post-author').value = data.authorName || '';
            document.getElementById('cms-post-excerpt').value = data.excerpt || '';
            document.getElementById('cms-post-content').value = data.content || '';
            document.getElementById('cms-post-image').value = data.coverImage || '';
            document.getElementById('cms-post-reading-time').value = data.readingTime || '';
            document.getElementById('cms-post-tags').value = (data.tags || []).join(', ');
            const statusEl = document.getElementById('cms-post-status');
            if (statusEl) statusEl.value = data.status || 'published';
            const featuredEl = document.getElementById('cms-post-featured');
            if (featuredEl) featuredEl.value = data.isFeatured ? 'true' : 'false';
            this.openModal('cms-post-modal', 'تعديل المقال');
        } else {
            const form = document.getElementById('cms-post-form');
            if (form) form.reset();
            this.openModal('cms-post-modal', 'إضافة مقال جديد');
        }
    }

    renderStories(stories) {
        const tbody = document.getElementById('cms-stories-list');
        if (!tbody) return;

        if (stories.length === 0) {
            this.setTableEmpty('cms-stories-list', 4, 'لا توجد قصص');
            return;
        }

        const fragment = document.createDocumentFragment();
        stories.forEach(data => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${this.escapeHtml(data.coverImage || data.personAvatar || 'assets/images/default-avatar.png')}" width="50" height="50" style="object-fit: cover; border-radius: 4px;"></td>
                <td>${this.escapeHtml(data.personName)}</td>
                <td>${this.escapeHtml(data.personRole)}</td>
                <td>
                    <button class="action-btn" data-action="edit-story" data-id="${data.id}" style="color: var(--warning); margin-left: 10px;" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" data-action="delete-story" data-id="${data.id}" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }

    populateStoryModal(id, data) {
        document.getElementById('cms-story-id').value = id || '';
        if (data) {
            document.getElementById('cms-story-name').value = data.personName || '';
            document.getElementById('cms-story-role').value = data.personRole || '';
            document.getElementById('cms-story-achievement').value = data.keyAchievement || '';
            document.getElementById('cms-story-content').value = data.story || '';
            document.getElementById('cms-story-image').value = data.coverImage || data.personAvatar || '';
            document.getElementById('cms-story-link').value = data.freelancerLink || '';
            this.openModal('cms-story-modal', 'تعديل قصة النجاح');
        } else {
            const form = document.getElementById('cms-story-form');
            if (form) form.reset();
            this.openModal('cms-story-modal', 'إضافة قصة نجاح');
        }
    }

    // ------------------------------------------------
    // Projects
    // ------------------------------------------------
    renderProjects(projects) {
        const tbody = document.getElementById('cms-projects-list');
        if (!tbody) return;

        if (projects.length === 0) {
            this.setTableEmpty('cms-projects-list', 4, 'لا توجد منتجات حالياً');
            return;
        }

        const fragment = document.createDocumentFragment();
        projects.forEach(data => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.escapeHtml(data.title)}</td>
                <td><span class="badge" style="background: ${data.status === 'مباشر' ? 'var(--success)' : 'var(--warning)'}; color: ${data.status === 'مباشر' ? 'white' : '#000'}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${this.escapeHtml(data.status)}</span></td>
                <td>${data.progress || 0}%</td>
                <td>
                    <button class="action-btn" data-action="edit-project" data-id="${data.id}" style="color: var(--warning); margin-left: 10px;" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" data-action="delete-project" data-id="${data.id}" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }

    populateProjectModal(id, data) {
        document.getElementById('cms-project-id').value = id || '';
        if (data) {
            document.getElementById('cms-project-title').value = data.title || '';
            document.getElementById('cms-project-desc').value = data.description || '';
            document.getElementById('cms-project-status').value = data.status || 'قيد التطوير';
            document.getElementById('cms-project-progress').value = data.progress || 0;
            document.getElementById('cms-project-icon').value = data.icon || '';
            document.getElementById('cms-project-link').value = data.link || '';
            this.openModal('cms-project-modal', 'تعديل منتج');
        } else {
            const form = document.getElementById('cms-project-form');
            if (form) form.reset();
            this.openModal('cms-project-modal', 'إضافة منتج');
        }
    }

    // ------------------------------------------------
    // Settings
    // ------------------------------------------------
    populateSettings(data) {
        if (!data) return;
        document.getElementById('settings-hero').value = data.heroText || '';
        document.getElementById('settings-vision').value = data.vision || '';
        document.getElementById('settings-mission').value = data.mission || '';
        document.getElementById('settings-values').value = data.values || '';
        document.getElementById('settings-founder-name').value = data.founderName || '';
        document.getElementById('settings-founder-bio1').value = data.founderBio1 || '';
        document.getElementById('settings-founder-bio2').value = data.founderBio2 || '';
    }
}

export const AdminUI = new AdminUIClass();
