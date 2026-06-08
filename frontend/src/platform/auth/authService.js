import httpClient from "../../api/httpClient";

// ── EMAIL / PASSWORD AUTH ─────────────────────────────────────────────────────

export const login = async (email, password) => {
  const response = await httpClient.post("/users/login", { email, password });
  const { accessToken, role } = response.data;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("role", role);
  return response.data;
};

export const signup = async ({ name, email, password }) => {
  const response = await httpClient.post("/users/register", { name, email, password });
  return response.data;
};

export const logout = async () => {
  try {
    await httpClient.post("/users/logout");
  } catch {
    // Ignore logout errors — clean up local state regardless
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("userId");
  }
};

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────

/**
 * Exchanges a Google ID token (from @react-oauth/google) for an app JWT.
 *
 * Flow:
 *  1. Google sign-in button returns a credential (Google ID JWT)
 *  2. We send it to POST /users/auth/google
 *  3. Backend verifies the Google token, creates/logs in the user, and returns
 *     our own accessToken + role
 *  4. We store them the same way as email/password login
 *
 * @param {string} googleIdToken - The credential JWT from GoogleLogin onSuccess
 */
export const googleAuth = async (googleIdToken) => {
  const response = await httpClient.post("/users/auth/google", {
    idToken: googleIdToken,
  });
  const { accessToken, role } = response.data;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("role", role);
  return response.data;
};