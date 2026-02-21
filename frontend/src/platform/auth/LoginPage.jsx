
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

import { Eye, EyeOff } from "lucide-react";
import { login } from "../../platform/auth/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  useEffect(() => {
    document.title = "Login | GSTechSystem";
  }, []);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

 
  const validate = () => {
    const newErrors = {};

   
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }


    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters";
    }
 
    else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(form.password)
    ) {
      newErrors.password =
        "Include uppercase, lowercase & number";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Login failed. Please try again.";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
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
              <p className="text-green-600 text-sm text-center">
                {successMessage}
              </p>
            )}

            {errors.general && (
              <p className="text-red-500 text-sm text-center">
                {errors.general}
              </p>
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
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Login
            </Button>

          </form>
        </Card.Content>

        <Card.Footer className="text-center">
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </Card.Footer>

      </Card>
    </div>
  );
}
