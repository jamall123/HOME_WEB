export interface PolicyContext {
  userId: string;
  role: string;
  targetResource?: any;
  environment?: string;
}

export interface Policy {
  name: string;
  evaluate(context: PolicyContext): boolean;
}

export class OnlyAcademyUsersPolicy implements Policy {
  name = 'OnlyAcademyUsersPolicy';
  evaluate(context: PolicyContext): boolean {
    // ABAC Example: check if the resource belongs to Academy
    if (context.targetResource?.type === 'ACADEMY') return true;
    return false;
  }
}

export class AdvancedRBAC {
  private rolePolicies = new Map<string, Map<string, Policy[]>>(); // Role -> Permission -> Policies

  addPolicy(role: string, permission: string, policy: Policy) {
    if (!this.rolePolicies.has(role)) {
      this.rolePolicies.set(role, new Map());
    }
    const permissions = this.rolePolicies.get(role)!;
    if (!permissions.has(permission)) {
      permissions.set(permission, []);
    }
    permissions.get(permission)!.push(policy);
  }

  hasAccess(context: PolicyContext, permission: string): boolean {
    const permissions = this.rolePolicies.get(context.role);
    if (!permissions) return false;

    const policies = permissions.get(permission);
    // If no specific policies are defined, but the role has the permission map entry, we assume grant (basic RBAC)
    if (policies && policies.length === 0) return true;
    if (!policies) return false;

    // Evaluate all policies (ABAC)
    return policies.every(policy => policy.evaluate(context));
  }
}
