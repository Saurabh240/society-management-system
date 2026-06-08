import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { Eye, EyeOff } from "lucide-react";
import { login, googleAuth } from "../../platform/auth/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  useEffect(() => { document.title = "Login | GSTechSystem"; }, []);

  const [form, setForm]               = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.email)
      e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password)
      e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(form.password))
      e.password = "Include uppercase, lowercase & number";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      // credentialResponse.credential is the Google ID token (JWT)
      await googleAuth(credentialResponse.credential);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Google sign-in failed. Please try again." });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ general: "Google sign-in was cancelled or failed. Please try again." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <Card.Header className="text-center">
          <Card.Title>GSTechSystem</Card.Title>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-5">

            {successMessage && (
              <p className="text-green-600 text-sm text-center">{successMessage}</p>
            )}
            {errors.general && (
              <p className="text-red-500 text-sm text-center">{errors.general}</p>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange("email")}
              error={errors.email}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange("password")}
                error={errors.password}
                required
              />
              <div className="text-right">
                <span
                  className="text-sm text-blue-600 cursor-pointer"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>
              </div>
              <div
                className="absolute right-3 top-10 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} disabled={loading || googleLoading}>
              Login
            </Button>

          </form>

          {/* ── Divider ─────────────────────────────────── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Google Sign In ──────────────────────────── */}
          <div className="flex justify-center">
            {googleLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                Signing in with Google...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                text="signin_with"
                shape="rectangular"
                theme="outline"
                size="large"
                width="360"
              />
            )}
          </div>

        </Card.Content>

        <Card.Footer className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/signup")}>
              Sign up
            </span>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}