"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // ✅ import auth

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { addToast } = useToast();
  const { login } = useAuth(); // ✅ get login from context

  const onSubmit = async (data: any) => {
    setLoading(true);

    try {
      const result = await apiClient<{ token: string; user: any }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      // ✅ use context login
      login(result.user, result.token);

      addToast({
        title: "Login Successful 🎉",
        description: `Welcome back, ${result.user?.name || "User"}!`,
      });

      window.location.href = "/dashboard";
    } catch (err: any) {
      addToast({
        title: "Login Failed ❌",
        description: err.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {/* Email */}
        <Input type="email" placeholder="Email" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm">
            {errors.email.message?.toString()}
          </p>
        )}

        {/* Password with eye toggle */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm">
            {errors.password.message?.toString()}
          </p>
        )}

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="text-sm text-center mt-2">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </div>
      </form>
    </div>
  );
}
