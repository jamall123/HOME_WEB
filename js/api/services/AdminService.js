import { BackendGateway } from '../BackendGateway.js';

class AdminServiceClass {
  /**
   * Approves a user enrollment request.
   */
  async approveEnrollment(requestId, fullName, courseId) {
    return BackendGateway.call('admin-approveEnrollment', {
      requestId,
      fullName,
      courseId
    });
  }

  /**
   * Deletes a user enrollment request.
   */
  async deleteRequest(requestId) {
    return BackendGateway.call('admin-deleteEnrollmentRequest', {
      requestId
    });
  }

  /**
   * Deletes an existing user completely.
   */
  async deleteUser(userId) {
    return BackendGateway.call('admin-deleteUser', {
      userId
    });
  }

  /**
   * Retrieves the system health and logs.
   */
  async getSystemHealth() {
    return BackendGateway.call('monitoring-getSystemHealth');
  }

  /**
   * Updates feature flags across the system.
   */
  async updateFeatureFlag(flagName, enabled) {
    return BackendGateway.call('admin-updateFeatureFlag', {
      flagName,
      enabled
    });
  }
}

export const AdminService = new AdminServiceClass();
window.AdminService = AdminService;
