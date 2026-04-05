
export const setToken = (token) => {
  localStorage.setItem("accessToken", token);
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};


export const clearStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
};

