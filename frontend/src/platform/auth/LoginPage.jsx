
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

import { login } from "../../platform/auth/authService"; 


export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
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
    setErrors({ general: "Login failed" });
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
         <Card.Header className="text-center">
          <Card.Title>GSTechSystem</Card.Title>
          <Card.Description>
            Welcome back! Please login to your account.
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-5">

            {errors.general && (
              <p className="text-red-500 text-sm">
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

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange("password")}
              error={errors.password}
              required
            />

            <Button type="submit" fullWidth loading={loading}>
              Login
            </Button>

          </form>
        </Card.Content>

  <Card.Footer className="text-center">
  <p className="text-sm text-gray-600">
    Don’t have an account?{" "}
    <span
      className="text-blue-600 cursor-pointer hover:underline"
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
