"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["client", "lawyer"]),
});

export default function SignupPage() {
  const [role, setRole] = useState("client");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: any) => {
    console.log("Signup data", data);
    // TODO: Call backend API
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        <Input type="text" placeholder="Full Name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>}

        <Input type="email" placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}

        <Input type="password" placeholder="Password" {...register("password")} />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message?.toString()}</p>}

        <Select onValueChange={(value) => { setRole(value); setValue("role", value); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="lawyer">Lawyer</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-red-500 text-sm">{errors.role.message?.toString()}</p>}

        <Button type="submit" className="w-full">Sign Up</Button>
        <div className="text-sm text-center mt-2">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </div>
      </form>
    </div>
  );
}
