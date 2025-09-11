"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useState } from "react";

const forgotSchema = z.object({
  email: z.string().email(),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const { addToast } = useToast();
  const onSubmit = async(data: any) => {
  setLoading(true)

  console.log(data);
  

  try {
      const result = await apiClient<{ message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      addToast({
        title: "Password Reset Sent",
        description: result.message,
      });

    } catch (err: any) {
      addToast({
        title: "Password Reset Failed ❌",
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
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <Input type="email" placeholder="Enter your email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}
        <Button type="submit" className={`w-full ${loading ? "cursor-not-allowed" : "cursor-pointer"}`} disabled={loading}>{loading ? "Sending Reset Link..." : "Send Reset Link"}</Button>
      </form>
    </div>
  );
}
