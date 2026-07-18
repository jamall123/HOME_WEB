/**
 * Jhome CMS Logic - Handles content management for Courses, Media, Projects, and Settings
 */

const db = firebase.firestore();

// ----------------------------------------------------
// Modal Helpers
// ----------------------------------------------------
window.closeCMSModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'none';
}

function openModal(modalId, title, isEdit = false) {
    const modal = document.getElementById(modalId);
    if(modal) {
        document.getElementById(modalId + '-title').textContent = title;
        modal.style.display = 'flex';
    }
}

// Close modals when clicking outside content
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) overlay.style.display = 'none';
    });
});

// ----------------------------------------------------
// Courses Management
// ----------------------------------------------------
window.loadCMSCourses = async function() {
    const tbody = document.getElementById('cms-courses-list');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">جاري التحميل...</td></tr>';
    
    try {
        const snap = await db.collection('courses').get();
        tbody.innerHTML = '';
        if(snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد دورات حالياً</td></tr>';
            return;
        }
        
        snap.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${data.coverImage || 'assets/images/placeholder.jpg'}" width="50" height="50" style="object-fit: cover; border-radius: 4px;"></td>
                <td>${data.title}</td>
                <td>${data.category}</td>
                <td><span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${data.price > 0 ? data.price + ' SDG' : 'مجاني'}</span></td>
                <td>${data.instructor}</td>
                <td>
                    <button class="action-btn" onclick="editCourse('${doc.id}')" style="color: var(--warning); margin-left: 10px;" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteDocument('courses', '${doc.id}', loadCMSCourses)" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">خطأ في التحميل</td></tr>';
    }
}

window.showCourseModal = function() {
    document.getElementById('cms-course-form').reset();
    document.getElementById('cms-course-id').value = '';
    openModal('cms-course-modal', 'إضافة دورة جديدة');
}

window.editCourse = async function(id) {
    try {
        const doc = await db.collection('courses').doc(id).get();
        if(doc.exists) {
            const data = doc.data();
            document.getElementById('cms-course-id').value = id;
            document.getElementById('cms-course-title').value = data.title;
            document.getElementById('cms-course-desc').value = data.description;
            document.getElementById('cms-course-instructor').value = data.instructor;
            document.getElementById('cms-course-category').value = data.category;
            document.getElementById('cms-course-level').value = data.level;
            document.getElementById('cms-course-duration').value = data.duration;
            document.getElementById('cms-course-price').value = data.price > 0 ? data.price : 'مجاني';
            document.getElementById('cms-course-image').value = data.coverImage;
            openModal('cms-course-modal', 'تعديل دورة');
        }
    } catch(e) { console.error(e); alert('خطأ في جلب بيانات الدورة'); }
}

document.getElementById('cms-course-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cms-course-id').value;
    let priceVal = document.getElementById('cms-course-price').value;
    const isFree = priceVal === 'مجاني' || priceVal === '0';
    
    const courseData = {
        title: document.getElementById('cms-course-title').value,
        description: document.getElementById('cms-course-desc').value,
        instructor: document.getElementById('cms-course-instructor').value,
        category: document.getElementById('cms-course-category').value,
        level: document.getElementById('cms-course-level').value,
        duration: document.getElementById('cms-course-duration').value,
        price: isFree ? 0 : Number(priceVal),
        isPaid: !isFree,
        coverImage: document.getElementById('cms-course-image').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if(id) {
            await db.collection('courses').doc(id).update(courseData);
            alert('تم التعديل بنجاح');
        } else {
            courseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('courses').add(courseData);
            alert('تمت الإضافة بنجاح');
        }
        closeCMSModal('cms-course-modal');
        loadCMSCourses();
    } catch(e) { console.error(e); alert('حدث خطأ أثناء الحفظ'); }
});

// ----------------------------------------------------
// Media Management (Posts)
// ----------------------------------------------------
window.loadCMSMedia = async function() {
    loadPosts();
    loadStories();
}

async function loadPosts() {
    const tbody = document.getElementById('cms-posts-list');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">جاري التحميل...</td></tr>';
    try {
        const snap = await db.collection('posts').orderBy('publishedAt', 'desc').get();
        tbody.innerHTML = '';
        if(snap.empty) { tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد مقالات</td></tr>'; return; }
        
        snap.forEach(doc => {
            const data = doc.data();
            const dateStr = data.publishedAt?.toDate ? data.publishedAt.toDate().toLocaleDateString('ar-EG') : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${data.coverImage || 'assets/images/placeholder.jpg'}" width="50" height="50" style="object-fit: cover; border-radius: 4px;"></td>
                <td>${data.title}</td>
                <td>${dateStr}</td>
                <td>
                    <button class="action-btn" onclick="editPost('${doc.id}')" style="color: var(--warning); margin-left: 10px;" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteDocument('posts', '${doc.id}', loadCMSMedia)" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) { console.error(e); tbody.innerHTML = '<tr><td colspan="4">خطأ</td></tr>'; }
}

window.showPostModal = function() {
    document.getElementById('cms-post-form').reset();
    document.getElementById('cms-post-id').value = '';
    openModal('cms-post-modal', 'إضافة مقال جديد');
}

window.editPost = async function(id) {
    try {
        const doc = await db.collection('posts').doc(id).get();
        if(doc.exists) {
            const data = doc.data();
            document.getElementById('cms-post-id').value = id;
            document.getElementById('cms-post-title').value = data.title;
            document.getElementById('cms-post-category').value = data.category;
            document.getElementById('cms-post-content').value = data.content;
            document.getElementById('cms-post-image').value = data.coverImage;
            openModal('cms-post-modal', 'تعديل المقال');
        }
    } catch(e) { console.error(e); }
}

document.getElementById('cms-post-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cms-post-id').value;
    const postData = {
        title: document.getElementById('cms-post-title').value,
        category: document.getElementById('cms-post-category').value,
        content: document.getElementById('cms-post-content').value,
        coverImage: document.getElementById('cms-post-image').value,
        status: 'published'
    };

    try {
        if(id) {
            await db.collection('posts').doc(id).update(postData);
        } else {
            postData.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('posts').add(postData);
        }
        closeCMSModal('cms-post-modal');
        loadCMSMedia();
    } catch(e) { console.error(e); alert('خطأ في الحفظ'); }
});

// ----------------------------------------------------
// Media Management (Stories)
// ----------------------------------------------------
async function loadStories() {
    const tbody = document.getElementById('cms-stories-list');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">جاري التحميل...</td></tr>';
    try {
        const snap = await db.collection('successStories').orderBy('createdAt', 'desc').get();
        tbody.innerHTML = '';
        if(snap.empty) { tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد قصص</td></tr>'; return; }
        
        snap.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${data.coverImage || data.personAvatar || 'assets/images/default-avatar.png'}" width="50" height="50" style="object-fit: cover; border-radius: 4px;"></td>
                <td>${data.personName}</td>
                <td>${data.personRole}</td>
                <td>
                    <button class="action-btn" onclick="editStory('${doc.id}')" style="color: var(--warning); margin-left: 10px;" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteDocument('successStories', '${doc.id}', loadCMSMedia)" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) { console.error(e); tbody.innerHTML = '<tr><td colspan="4">خطأ</td></tr>'; }
}

window.showStoryModal = function() {
    document.getElementById('cms-story-form').reset();
    document.getElementById('cms-story-id').value = '';
    openModal('cms-story-modal', 'إضافة قصة نجاح');
}

window.editStory = async function(id) {
    try {
        const doc = await db.collection('successStories').doc(id).get();
        if(doc.exists) {
            const data = doc.data();
            document.getElementById('cms-story-id').value = id;
            document.getElementById('cms-story-name').value = data.personName;
            document.getElementById('cms-story-role').value = data.personRole;
            document.getElementById('cms-story-achievement').value = data.keyAchievement;
            document.getElementById('cms-story-content').value = data.story;
            document.getElementById('cms-story-image').value = data.coverImage || data.personAvatar;
            document.getElementById('cms-story-link').value = data.freelancerLink || '';
            openModal('cms-story-modal', 'تعديل قصة النجاح');
        }
    } catch(e) { console.error(e); }
}

document.getElementById('cms-story-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cms-story-id').value;
    const storyData = {
        personName: document.getElementById('cms-story-name').value,
        personRole: document.getElementById('cms-story-role').value,
        keyAchievement: document.getElementById('cms-story-achievement').value,
        story: document.getElementById('cms-story-content').value,
        coverImage: document.getElementById('cms-story-image').value,
        personAvatar: document.getElementById('cms-story-image').value,
        freelancerLink: document.getElementById('cms-story-link').value,
        isPublished: true
    };

    try {
        if(id) {
            await db.collection('successStories').doc(id).update(storyData);
        } else {
            storyData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('successStories').add(storyData);
        }
        closeCMSModal('cms-story-modal');
        loadCMSMedia();
    } catch(e) { console.error(e); alert('خطأ في الحفظ'); }
});


// ----------------------------------------------------
// Projects Management
// ----------------------------------------------------
window.loadCMSProjects = async function() {
    const tbody = document.getElementById('cms-projects-list');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">جاري التحميل...</td></tr>';
    
    try {
        const snap = await db.collection('projects').get();
        tbody.innerHTML = '';
        if(snap.empty) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد منتجات حالياً</td></tr>';
            return;
        }
        
        snap.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.title}</td>
                <td><span class="badge" style="background: ${data.status === 'مباشر' ? 'var(--success)' : 'var(--warning)'}; color: ${data.status === 'مباشر' ? 'white' : '#000'}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${data.status}</span></td>
                <td>${data.progress}%</td>
                <td>
                    <button class="action-btn" onclick="editProject('${doc.id}')" style="color: var(--warning); margin-left: 10px;" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteDocument('projects', '${doc.id}', loadCMSProjects)" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">خطأ في التحميل</td></tr>';
    }
}

window.showProjectModal = function() {
    document.getElementById('cms-project-form').reset();
    document.getElementById('cms-project-id').value = '';
    openModal('cms-project-modal', 'إضافة منتج');
}

window.editProject = async function(id) {
    try {
        const doc = await db.collection('projects').doc(id).get();
        if(doc.exists) {
            const data = doc.data();
            document.getElementById('cms-project-id').value = id;
            document.getElementById('cms-project-title').value = data.title;
            document.getElementById('cms-project-desc').value = data.description;
            document.getElementById('cms-project-status').value = data.status;
            document.getElementById('cms-project-progress').value = data.progress;
            document.getElementById('cms-project-icon').value = data.icon;
            document.getElementById('cms-project-link').value = data.link;
            openModal('cms-project-modal', 'تعديل منتج');
        }
    } catch(e) { console.error(e); }
}

document.getElementById('cms-project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cms-project-id').value;
    
    const projectData = {
        title: document.getElementById('cms-project-title').value,
        description: document.getElementById('cms-project-desc').value,
        status: document.getElementById('cms-project-status').value,
        progress: Number(document.getElementById('cms-project-progress').value),
        icon: document.getElementById('cms-project-icon').value || 'fas fa-cubes',
        link: document.getElementById('cms-project-link').value || '#'
    };

    try {
        if(id) {
            await db.collection('projects').doc(id).update(projectData);
        } else {
            await db.collection('projects').add(projectData);
        }
        closeCMSModal('cms-project-modal');
        loadCMSProjects();
    } catch(e) { console.error(e); alert('خطأ في الحفظ'); }
});


// ----------------------------------------------------
// Website Settings Management
// ----------------------------------------------------
window.loadCMSSettings = async function() {
    try {
        const doc = await db.collection('settings').doc('global').get();
        if(doc.exists) {
            const data = doc.data();
            document.getElementById('settings-hero').value = data.heroText || '';
            document.getElementById('settings-vision').value = data.vision || '';
            document.getElementById('settings-mission').value = data.mission || '';
            document.getElementById('settings-values').value = data.values || '';
            document.getElementById('settings-founder-name').value = data.founderName || '';
            document.getElementById('settings-founder-bio1').value = data.founderBio1 || '';
            document.getElementById('settings-founder-bio2').value = data.founderBio2 || '';
        }
    } catch(e) { console.error(e); }
}

document.getElementById('cms-settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const settingsData = {
        heroText: document.getElementById('settings-hero').value,
        vision: document.getElementById('settings-vision').value,
        mission: document.getElementById('settings-mission').value,
        values: document.getElementById('settings-values').value,
        founderName: document.getElementById('settings-founder-name').value,
        founderBio1: document.getElementById('settings-founder-bio1').value,
        founderBio2: document.getElementById('settings-founder-bio2').value
    };

    try {
        const btn = e.target.querySelector('button[type="submit"]');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        await db.collection('settings').doc('global').set(settingsData, {merge: true});
        btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ';
        setTimeout(() => btn.innerHTML = oldText, 2000);
    } catch(e) { console.error(e); alert('خطأ في الحفظ'); }
});

// ----------------------------------------------------
// Generic Delete helper
// ----------------------------------------------------
window.deleteDocument = async function(collectionName, id, reloadCallback) {
    if(confirm('هل أنت متأكد من الحذف؟')) {
        try {
            await db.collection(collectionName).doc(id).delete();
            if(reloadCallback) reloadCallback();
        } catch(e) {
            console.error(e);
            alert('حدث خطأ أثناء الحذف');
        }
    }
}
