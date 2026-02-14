

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { signup } from "../../platform/auth/authService";

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up | GSTechSystem";
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };


  const validate = () => {
    const newErrors = {};


    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

 
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }


    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 characters required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Include uppercase, lowercase & number";
    }

   
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0)
      return;

    try {
      setLoading(true);

      await signup({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });

      navigate("/login", {
        state: { message: "Signup successful! Please login." },
      });

    } catch (err) {
      setErrors({
        general:
          err.response?.data?.message ||
          "Signup failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card padding="lg" shadow="lg" className="max-w-md w-full">

        <Card.Header className="text-center">
          <Card.Title>GSTechSystem</Card.Title>
          <Card.Description>
            Create your account to get started
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">

            {errors.general && (
              <p className="text-red-500 text-sm text-center">
                {errors.general}
              </p>
            )}

            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<User />}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail />}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock />}
              />
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

            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                leftIcon={<Lock />}
              />
              <div
                className="absolute right-3 top-10 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
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
              Sign Up
            </Button>

          </form>
        </Card.Content>

        <Card.Footer className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </Card.Footer>

      </Card>
    </div>
  );
};

export default Signup;

