"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Eye, EyeOff } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const signupSchema = z
  .object({
    name: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    role: z.enum(["client", "lawyer"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });


export default function SignupPage() {
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);


  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const { addToast } = useToast();

  const onSubmit = async(data: any) => {
    setLoading(true);
  try {
        const result = await apiClient<{ accessToken: string; user: any }>(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
          
        addToast({
          title: "Regisetration Successful 🎉",
          description: `Welcome ${result.user?.name || "User"}!`,
        });
  
        window.location.href = "/login";
      } catch (err: any) {
        addToast({
          title: "Registeration Failed ❌",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        <Input type="text" placeholder="Full Name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>}

        <Input type="email" placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}

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

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message?.toString()}
          </p>
        )}

        <Select onValueChange={(value) => { setRole(value); setValue("role", value); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client</SelectItem>
            {/* <SelectItem value="lawyer">Lawyer</SelectItem> */}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-red-500 text-sm">{errors.role.message?.toString()}</p>}

        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
        <div className="text-sm text-center mt-2">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </div>
      </form>
    </div>
  );
}
