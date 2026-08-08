import { PermissionManager } from '../../core/PermissionManager.js';
import { stateStore } from '../../core/StateStore.js';

export class CourseRoomController {
    constructor() {
        this.currentCourseId = null;
        this.currentRoomId = null;
        this.currentCourseRooms = [];
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentCourseId = urlParams.get('id');
        this.currentRoomId = urlParams.get('roomId');
        
        if (!this.currentCourseId) return;

        this.setupToggles();
        await this.loadCourseRoomData();
    }

    setupToggles() {
        // Floating Tab Buttons
        const floatingTabBtns = document.querySelectorAll('.floating-tab-btn');
        const roomContents = document.querySelectorAll('.room-tab-content');
        const bottomSheet = document.getElementById('bottom-sheet');

        if (floatingTabBtns.length > 0) {
            floatingTabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    floatingTabBtns.forEach(t => {
                        t.classList.remove('btn-primary');
                        t.classList.add('btn-secondary');
                        t.style.boxShadow = 'none';
                    });
                    roomContents.forEach(c => {
                        c.classList.remove('active');
                        c.style.display = 'none';
                    });

                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-primary');
                    btn.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.4)';

                    const targetId = btn.getAttribute('data-target');
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        targetEl.classList.add('active');
                        targetEl.style.display = 'block';
                    }

                    if (bottomSheet) {
                        bottomSheet.style.bottom = '0';
                    }
                });
            });
        }

        // Mobile Toggles (Sidebar & Chat)
        const roomLayout = document.querySelector('.room-layout');
        const toggleSidebarBtn = document.getElementById('toggle-sidebar');
        const toggleChatBtn = document.getElementById('toggle-chat');

        if (toggleSidebarBtn && roomLayout) {
            toggleSidebarBtn.addEventListener('click', () => {
                roomLayout.classList.toggle('sidebar-toggled');
                if(window.innerWidth <= 1024 && roomLayout.classList.contains('sidebar-toggled')) {
                    roomLayout.classList.remove('chat-toggled');
                }
            });
        }

        if (toggleChatBtn && roomLayout) {
            toggleChatBtn.addEventListener('click', () => {
                roomLayout.classList.toggle('chat-toggled');
                if(window.innerWidth <= 1024 && roomLayout.classList.contains('chat-toggled')) {
                    roomLayout.classList.remove('sidebar-toggled');
                }
            });
        }

        // Fullscreen Button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const videoContainer = document.getElementById('main-video-container');
        if (fullscreenBtn && videoContainer) {
            fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    if (videoContainer.requestFullscreen) {
                        videoContainer.requestFullscreen();
                    } else if (videoContainer.webkitRequestFullscreen) {
                        videoContainer.webkitRequestFullscreen();
                    } else if (videoContainer.msRequestFullscreen) {
                        videoContainer.msRequestFullscreen();
                    }
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch(() => {});
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            });

            document.addEventListener('fullscreenchange', () => {
                if (document.fullscreenElement) {
                    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> تصغير';
                } else {
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> تكبير الشاشة';
                    if (screen.orientation && screen.orientation.unlock) {
                        screen.orientation.unlock();
                    }
                }
            });
        }
    }

    closeBottomSheet() {
        const bottomSheet = document.getElementById('bottom-sheet');
        const floatingTabBtns = document.querySelectorAll('.floating-tab-btn');
        if (bottomSheet) {
            bottomSheet.style.bottom = '-100%';
            floatingTabBtns.forEach(t => {
                t.classList.remove('btn-primary');
                t.classList.add('btn-secondary');
                t.style.boxShadow = 'none';
            });
        }
    }

    async loadCourseRoomData() {
        try {
            const course = await CourseRepository.getCourse(this.currentCourseId);
            if (!course) {
                console.error("Course not found!");
                return;
            }
            this.currentCourseRooms = course.rooms || [];
            
            this.renderSyllabusUI();
            this.updateInstructorDisplay(course.instructor || course);

            let activeRoom = this.currentCourseRooms.find(r => r.id === this.currentRoomId);
            if (!activeRoom && this.currentCourseRooms.length > 0) activeRoom = this.currentCourseRooms[0];

            if (activeRoom) {
                document.querySelector('#tab-desc h2').innerText = activeRoom.name;
                
                const resTab = document.getElementById('tab-resources');
                if (resTab) {
                    resTab.innerHTML = `
                        <h3 style="margin-bottom: 1rem;">المصادر والمرفقات</h3>
                        <p style="white-space: pre-wrap; line-height: 1.6;">${activeRoom.sources || 'لا توجد مصادر مرفقة مع هذا الدرس.'}</p>
                    `;
                }

                if (activeRoom.type === 'recorded') {
                    const liveBtns = document.getElementById('instructor-tab-btn');
                    if(liveBtns) liveBtns.style.display = 'none';
                    
                    const videoContainer = document.getElementById('main-video-container');
                    let embedUrl = activeRoom.videoUrl;
                    
                    if (embedUrl && (embedUrl.includes('youtube.com/') || embedUrl.includes('youtu.be/'))) {
                        if (embedUrl.includes('watch?v=')) {
                            embedUrl = embedUrl.replace('watch?v=', 'embed/');
                        }
                        if (embedUrl.includes('youtu.be/')) {
                            embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
                        }
                        videoContainer.innerHTML = `
                            <iframe width="100%" height="100%" src="${embedUrl || ''}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top:0; left:0; width:100%; height:100%;"></iframe>
                        `;
                    } else {
                        videoContainer.innerHTML = `
                            <video controls style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: contain; background: black;">
                                <source src="${embedUrl || ''}" type="video/mp4">
                                متصفحك لا يدعم تشغيل الفيديو.
                            </video>
                        `;
                    }
                }
            }
        } catch (e) {
            console.error("Error loading course room data:", e);
        }
    }

    renderSyllabusUI() {
        const sidebarContainer = document.querySelector('.room-sidebar-content');
        if (!sidebarContainer) return;

        const rooms = this.currentCourseRooms || [];
        const currentUser = stateStore.getState('userData') || stateStore.getState('user');
        const isInstructor = PermissionManager.isTeachingStaff(currentUser);

        let html = '<h3 style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.05); margin:0;">المنهج والدروس</h3><div style="padding:1rem; display: flex; flex-direction: column; gap: 1rem; position: relative;">';
        
        if (rooms.length === 0) {
            html += '<p class="text-muted text-center" style="margin-top:1rem;">لا توجد دروس متاحة حالياً.</p>';
        } else {
            rooms.forEach((r, idx) => {
                const isActive = r.id === this.currentRoomId || (!this.currentRoomId && idx === 0);
                const typeIcon = r.type === 'recorded' ? 'fa-play-circle' : 'fa-video';
                
                html += `
                    <div style="position: relative; display: flex; flex-direction: column;">
                        ${idx !== rooms.length - 1 ? '<div style="position: absolute; left: 1rem; top: 2.5rem; bottom: -1rem; width: 2px; background: rgba(255,255,255,0.1); z-index: 1;"></div>' : ''}
                        
                        <div onclick="window.location.href='course-room.html?id=${this.currentCourseId}&roomId=${r.id}'" style="position: relative; z-index: 2; display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: ${isActive ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)'}; border-radius: var(--radius-sm); cursor: pointer; transition: 0.3s; border: 1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'};">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(16, 185, 129, 0.2)'}; color: ${isActive ? '#fff' : '#10B981'}; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                                ${idx + 1}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; font-size: 0.95rem;">${r.name}</div>
                                <div style="font-size: 0.8rem; color: ${isActive ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'}; margin-top: 0.2rem;"><i class="fas ${typeIcon}"></i> ${r.type === 'recorded' ? 'مسجل' : 'مباشر'}</div>
                            </div>
                            
                            ${isInstructor ? `
                            <div style="display: flex; gap: 0.5rem;" onclick="event.stopPropagation()">
                                <button class="btn btn-icon" style="padding: 0.3rem; background: rgba(245, 158, 11, 0.2); color: var(--warning); border: none; font-size: 0.8rem;" onclick="window.courseRoomController.openSyllabusModal('${r.id}')"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-icon" style="padding: 0.3rem; background: rgba(239, 68, 68, 0.2); color: var(--danger); border: none; font-size: 0.8rem;" onclick="window.courseRoomController.deleteSyllabusRoom('${r.id}')"><i class="fas fa-trash"></i></button>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }
        html += '</div>';
        
        if (isInstructor) {
            html += `
            <div style="padding: 1rem; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05);">
                <button class="btn btn-primary" style="width: 100%; border-style: dashed; background: transparent; border-color: var(--primary-color); color: var(--primary-light);" onclick="window.courseRoomController.openSyllabusModal()"><i class="fas fa-plus"></i> إضافة درس للمنهج</button>
            </div>
            `;
        }

        sidebarContainer.innerHTML = html;
    }

    openSyllabusModal(roomId = null) {
        document.getElementById('syllabus-room-modal').style.display = 'flex';
        
        if (roomId) {
            document.getElementById('syllabus-modal-title').innerText = 'تعديل الدرس';
            const room = this.currentCourseRooms.find(r => r.id === roomId);
            if(room) {
                document.getElementById('syl-room-id').value = room.id;
                document.getElementById('syl-room-name').value = room.name;
                document.getElementById('syl-room-type').value = room.type || 'live';
                document.getElementById('syl-room-video-url').value = room.videoUrl || '';
                document.getElementById('syl-room-sources').value = room.sources || '';
                document.getElementById('syl-video-container').style.display = (room.type === 'recorded') ? 'block' : 'none';
            }
        } else {
            document.getElementById('syllabus-modal-title').innerText = 'إضافة درس جديد';
            document.getElementById('syl-room-id').value = '';
            document.getElementById('syl-room-name').value = '';
            document.getElementById('syl-room-type').value = 'live';
            document.getElementById('syl-room-video-url').value = '';
            document.getElementById('syl-room-sources').value = '';
            document.getElementById('syl-video-container').style.display = 'none';
        }
    }

    closeSyllabusModal() {
        document.getElementById('syllabus-room-modal').style.display = 'none';
    }

    async saveSyllabusRoom() {
        const id = document.getElementById('syl-room-id').value;
        const name = document.getElementById('syl-room-name').value.trim();
        const type = document.getElementById('syl-room-type').value;
        const videoUrl = document.getElementById('syl-room-video-url').value.trim();
        const sources = document.getElementById('syl-room-sources').value.trim();

        if (!name) return alert("الرجاء كتابة اسم الدرس");
        if (type === 'recorded' && !videoUrl) return alert("الرجاء وضع رابط الفيديو");
        if (!this.currentCourseId) return;

        try {
            let rooms = [...this.currentCourseRooms];

            if (id) {
                const idx = rooms.findIndex(r => r.id === id);
                if (idx > -1) {
                    rooms[idx].name = name;
                    rooms[idx].type = type;
                    rooms[idx].videoUrl = videoUrl;
                    rooms[idx].sources = sources;
                }
            } else {
                rooms.push({
                    id: Date.now().toString(),
                    name, type, videoUrl, sources,
                    startTime: '',
                    instructorName: stateStore.getState('userData')?.name || stateStore.getState('userData')?.username || ''
                });
            }

            await CourseRepository.updateCourse(this.currentCourseId, { rooms });
            this.currentCourseRooms = rooms;
            this.renderSyllabusUI();
            this.closeSyllabusModal();
            alert("تم الحفظ بنجاح!");
            
            if (!id && rooms.length === 1) {
                window.location.reload();
            }

        } catch (e) {
            console.error(e);
            alert("حدث خطأ أثناء الحفظ");
        }
    }

    async deleteSyllabusRoom(roomId) {
        if (!confirm("هل أنت متأكد من حذف هذا الدرس؟ سيتم فقدان كل محتوياته!")) return;
        
        try {
            let rooms = this.currentCourseRooms.filter(r => r.id !== roomId);
            
            await CourseRepository.updateCourse(this.currentCourseId, { rooms });
            this.currentCourseRooms = rooms;
            this.renderSyllabusUI();
            
            if (this.currentRoomId === roomId) {
                window.location.href = `course-room.html?id=${this.currentCourseId}`;
            }
        } catch(e) {
            console.error(e);
            alert("حدث خطأ أثناء الحذف");
        }
    }

    updateInstructorDisplay(instructor) {
        const instSection = document.getElementById('tab-overview');
        if(!instSection) return;
        
        let instHtml = `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: var(--radius-md); margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;"><i class="fas fa-chalkboard-teacher"></i> مقدم الدورة</h3>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${instructor.image || instructor.photo || 'assets/images/default-avatar.png'}" alt="Instructor" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">
                    <div>
                        <h4 style="font-size: 1.2rem; margin-bottom: 0.2rem;">${instructor.name || 'مدرب'}</h4>
                        <p style="color: var(--primary-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${instructor.specialty || 'تخصص غير محدد'}</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">${instructor.bio || ''}</p>
                        ${instructor.cvUrl ? `<a href="${instructor.cvUrl}" target="_blank" style="color: #60A5FA; font-size: 0.85rem; text-decoration: none;"><i class="fas fa-external-link-alt"></i> مصدر المهارات</a>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        const existingInst = instSection.querySelector('.instructor-info');
        if (existingInst) {
            existingInst.innerHTML = instHtml;
        } else {
            const div = document.createElement('div');
            div.className = 'instructor-info';
            div.innerHTML = instHtml;
            instSection.appendChild(div);
        }
    }
}

export const courseRoomController = new CourseRoomController();
window.courseRoomController = courseRoomController; // Expose globally for inline onclick handlers
