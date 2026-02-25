

export const setToken = (token) => {
  localStorage.setItem("accessToken", token);
};

export const getToken = () => {
  return localStorage.getItem("accessToken");
};

export const clearToken = () => {
  localStorage.removeItem("accessToken");
};
