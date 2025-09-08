"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const forgotSchema = z.object({
  email: z.string().email(),
});

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (data: any) => {
    console.log("Forgot password request", data);
    // TODO: Call backend API for reset link
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <Input type="email" placeholder="Enter your email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}
        <Button type="submit" className="w-full">Send Reset Link</Button>
      </form>
    </div>
  );
}
