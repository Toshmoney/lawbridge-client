"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: any) => {
    console.log("Login data", data);
    // TODO: Call backend API
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <Input type="email" placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}
        <Input type="password" placeholder="Password" {...register("password")} />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message?.toString()}</p>}
        <Button type="submit" className="w-full">Login</Button>
        <div className="text-sm text-center mt-2">
          <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
        </div>
      </form>
    </div>
  );
}
