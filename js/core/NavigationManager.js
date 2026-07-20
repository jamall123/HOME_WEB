import { eventBus } from './EventBus.js';

export class NavigationManager {
    constructor() {
        this.registry = [];
    }

    register(group, items) {
        const existingGroup = this.registry.find(g => g.group === group);
        if (existingGroup) {
            existingGroup.items.push(...items);
        } else {
            this.registry.push({ group, items });
        }
        eventBus.emit('navigation:updated', this.registry);
    }

    getRegistry() {
        return this.registry;
    }
}

export const navigationManager = new NavigationManager();

// Pre-register core modules
navigationManager.register('نظرة عامة', [
    { id: 'dashboard', title: 'الرئيسية / الإحصائيات', icon: 'fas fa-chart-line', route: 'dashboard' }
]);

navigationManager.register('الأكاديمية', [
    { id: 'courses', title: 'الدورات التعليمية', icon: 'fas fa-graduation-cap', route: 'courses' },
    { id: 'users', title: 'طلاب الأكاديمية', icon: 'fas fa-users', route: 'users' },
    { id: 'requests', title: 'طلبات الانضمام', icon: 'fas fa-file-invoice', route: 'requests' }
]);

navigationManager.register('المحتوى (CMS)', [
    { id: 'media', title: 'المقالات وقصص النجاح', icon: 'fas fa-pen-nib', route: 'media' },
    { id: 'projects', title: 'إدارة المنتجات', icon: 'fas fa-project-diagram', route: 'projects' },
    { id: 'settings', title: 'محتوى الصفحات', icon: 'fas fa-columns', route: 'settings' },
    { id: 'medialibrary', title: 'مكتبة الوسائط', icon: 'fas fa-images', route: 'medialibrary' }
]);

navigationManager.register('التواصل', [
    { id: 'messages', title: 'رسائل التواصل', icon: 'fas fa-envelope', route: 'messages' }
]);

navigationManager.register('الإعدادات', [
    { id: 'payments', title: 'حسابات الدفع', icon: 'fas fa-university', route: 'payments' },
    { id: 'auditlog', title: 'سجل العمليات', icon: 'fas fa-history', route: 'auditlog' }
]);

