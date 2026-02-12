import client from "./client";

export const auth = {
  register: (data) => client.post("/register/", data),
  login: (username, password) => client.post("/token/", { username, password }),
  refresh: (refresh) => client.post("/token/refresh/", { refresh }),
};

export const articles = {
  list: (params) => client.get("/articles/", { params }),
  get: (id) => client.get(`/articles/${id}/`),
  create: (data) => client.post("/articles/", data),
  update: (id, data) => client.patch(`/articles/${id}/`, data),
  delete: (id) => client.delete(`/articles/${id}/`),
};

export const me = () => client.get("/me/");

export const tags = {
  list: () => client.get("/tags/"),
};

export const comments = {
  listByArticle: (articleId) => client.get(`/articles/${articleId}/comments/`),
  create: (articleId, content) => client.post(`/articles/${articleId}/comments/`, { content }),
  update: (id, content) => client.patch(`/comments/${id}/`, { content }),
  delete: (id) => client.delete(`/comments/${id}/`),
};

export const ratings = {
  get: (articleId) => client.get(`/articles/${articleId}/rating/`),
  set: (articleId, score) => client.post(`/articles/${articleId}/rating/`, { score }),
};

export const chat = {
  list: () => client.get("/chat/"),
  send: (content) => client.post("/chat/", { content }),
};

export const tracking = {
  passwordResetRequest: (email) => client.post("/password-reset/", { email }),
  passwordResetConfirm: (uid, token, new_password) =>
    client.post("/password-reset/confirm/", { uid, token, new_password }),
  verifyHuman: () => client.post("/verify-human/", {}),
};

export const uploadedFiles = {
  list: () => client.get("/files/"),
  upload: (formData) => client.post("/files/", formData),
  delete: (id) => client.delete(`/files/${id}/`),
};
