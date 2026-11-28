import api from "../utils/api";

const adminApi = {
  // Overview
  getOverview: (params) => api.get("/admin/overview", { params }).then((r) => r.data),

  // Users
  getUsers: (params) => api.get("/admin/users", { params }).then((r) => r.data),
  getUserDetail: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  updateUserPlan: (id, body) => api.patch(`/admin/users/${id}/plan`, body).then((r) => r.data),
  toggleSuspend: (id) => api.patch(`/admin/users/${id}/suspend`).then((r) => r.data),
  resetQuota: (id) => api.patch(`/admin/users/${id}/reset-quota`).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  toggleAdmin: (id) => api.patch(`/admin/users/${id}/toggle-admin`).then((r) => r.data),

  // Subscriptions
  getSubscriptions: (params) => api.get("/admin/subscriptions", { params }).then((r) => r.data),
  extendPlan: (id, days) => api.patch(`/admin/subscriptions/${id}/extend`, { days }).then((r) => r.data),

  // Workspaces
  getWorkspaces: (params) => api.get("/admin/workspaces", { params }).then((r) => r.data),
  deleteWorkspace: (id) => api.delete(`/admin/workspaces/${id}`).then((r) => r.data),

  // Analytics
  getAnalytics: () => api.get("/admin/analytics").then((r) => r.data),

  // Announcements
  getAnnouncements: () => api.get("/admin/announcements").then((r) => r.data),
  createAnnouncement: (body) => api.post("/admin/announcements", body).then((r) => r.data),
  updateAnnouncement: (id, body) => api.patch(`/admin/announcements/${id}`, body).then((r) => r.data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`).then((r) => r.data),

  // System
  getSystemHealth: () => api.get("/admin/system").then((r) => r.data),
};

export default adminApi;
