export class OnlyAcademyUsersPolicy {
    name = 'OnlyAcademyUsersPolicy';
    evaluate(context) {
        // ABAC Example: check if the resource belongs to Academy
        if (context.targetResource?.type === 'ACADEMY')
            return true;
        return false;
    }
}
export class AdvancedRBAC {
    rolePolicies = new Map(); // Role -> Permission -> Policies
    addPolicy(role, permission, policy) {
        if (!this.rolePolicies.has(role)) {
            this.rolePolicies.set(role, new Map());
        }
        const permissions = this.rolePolicies.get(role);
        if (!permissions.has(permission)) {
            permissions.set(permission, []);
        }
        permissions.get(permission).push(policy);
    }
    hasAccess(context, permission) {
        const permissions = this.rolePolicies.get(context.role);
        if (!permissions)
            return false;
        const policies = permissions.get(permission);
        // If no specific policies are defined, but the role has the permission map entry, we assume grant (basic RBAC)
        if (policies && policies.length === 0)
            return true;
        if (!policies)
            return false;
        // Evaluate all policies (ABAC)
        return policies.every(policy => policy.evaluate(context));
    }
}
//# sourceMappingURL=advancedRbac.js.map