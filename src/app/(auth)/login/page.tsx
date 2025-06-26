"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/meterialInput";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import chatIcon from "@/assets/auth/chat.svg";
import filesIcon from "@/assets/auth/files.svg";
import hrmsIcon from "@/assets/auth/hrms.svg";
import mainIcon from "@/assets/auth/main_logo.svg";
import payrollIcon from "@/assets/auth/payroll.svg";
import mainIcon2 from "@/assets/auth/u3fyyxlm.png";
import backgroundImage from "@/assets/auth/bg.svg";
import { RiCheckDoubleFill } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loginUser } from "@/redux/slices/loginSlice";
import ButtonLoader from "@/components/loaders/ButtonLoader";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useTheme } from "next-themes";

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.login);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light"); // Force light theme
  }, []);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Signing in…");
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success("Logged in!", { id: toastId });
      router.push("/");
    } catch (err: any) {
      toast.error(err || "Login failed", { id: toastId });
    }
  };

  return (
    <div className=" min-h-screen w-full flex flex-col lg:flex-row">
      <div className="relative w-full lg:w-[40%] lg:min-w-md  text-white flex flex-col justify-between p-10 lg:p-4 ">
        <Image
          src={backgroundImage}
          alt=""
          className="absolute top-0 left-0 bg-accent-foreground w-full h-full object-cover -z-10"
        ></Image>
        <div className="text-center lg:pt-8">
          <Image
            src={mainIcon}
            alt="Logo"
            width={50}
            height={50}
            className="mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold">Welcome to Superworks</h1>
          <div className="w-7 h-1 bg-orange-400 mx-auto my-3 rounded" />
          <p className="text-sm">
            Connecting People. Optimizing Process. Enhancing Performance.
          </p>
        </div>

        <div className="relative w-80 h-80 mx-auto mt-6 hidden lg:block">
          {/* Dotted Circle */}
          <svg className="absolute inset-0 z-0" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#6B7280"
              strokeWidth="0.5"
              strokeDasharray="2,1"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 orbit-spin z-10 ">
            {/* Top */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 orbit-counter-spin bg-accent-foreground rounded-full">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg
                  className="absolute inset-0"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="11,8"
                  />
                </svg>
                <Image
                  src={chatIcon}
                  alt="Chat"
                  width={20}
                  height={20}
                  className="z-10"
                />
              </div>
            </div>

            {/* Right */}
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 orbit-counter-spin bg-accent-foreground rounded-full">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg
                  className="absolute inset-0"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="11,8"
                  />
                </svg>
                <Image
                  src={filesIcon}
                  alt="Files"
                  width={20}
                  height={20}
                  className="z-10"
                />
              </div>
            </div>

            {/* Bottom */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 orbit-counter-spin bg-accent-foreground rounded-full">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg
                  className="absolute inset-0"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="11,8"
                  />
                </svg>
                <Image
                  src={hrmsIcon}
                  alt="HRMS"
                  width={20}
                  height={20}
                  className="z-10"
                />
              </div>
            </div>

            {/* Left */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 orbit-counter-spin bg-accent-foreground rounded-full ">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg
                  className="absolute inset-0 "
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="11,8"
                  />
                </svg>
                <Image
                  src={payrollIcon}
                  alt="Payroll"
                  width={20}
                  height={20}
                  className="z-10 "
                />
              </div>
            </div>
          </div>

          {/* Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center z-20 ">
            <Image
              src={mainIcon2}
              alt="Center Logo"
              className="w-24 border rounded-full p-2 h-24"
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="hidden lg:flex flex-col items-center text-white">
          {/* Title */}
          <h2 className="text-xl font-semibold mb-2">Core Values</h2>
          {/* Underline */}
          <div className="w-7 h-1 bg-orange-400 rounded mb-4" />

          {/* Two‐column list */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-3">
            {/* Left column */}
            <div className="space-y-3">
              <p className="flex items-center text-sm">
                <RiCheckDoubleFill
                  size={20}
                  className="text-orange-400 flex-shrink-0 mr-2"
                />
                Working Every­day Towards Perfection
              </p>
              <p className="flex items-center text-sm">
                <RiCheckDoubleFill
                  size={20}
                  className="text-orange-400 flex-shrink-0 mr-2"
                />
                Inspiring Teams To Build The Best
              </p>
            </div>
            {/* Right column */}
            <div className="space-y-3">
              <p className="flex items-center text-sm">
                <RiCheckDoubleFill
                  size={20}
                  className="text-orange-400 flex-shrink-0 mr-2"
                />
                Grow Consistently Every Day
              </p>
              <p className="flex items-center text-sm">
                <RiCheckDoubleFill
                  size={20}
                  className="text-orange-400 flex-shrink-0 mr-2"
                />
                Creating Value Adding Services
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col justify-center px-8 lg:px-20 py-12 mt-20 lg:mt-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md mx-auto space-y-6"
        >
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">
              Sign In Your Account
            </h2>
            <div className="w-7 h-1 bg-orange-400 my-2 rounded" />
            <p className="text-base text-gray-500">
              Welcome Back! Please Sign In to access Superworks.
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <Input
              label="Email Address / User Name *"
              type="text"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                label="Password *"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm cursor-pointer rounded-full hover:bg-[#d9ebff] hover:text-[#007aff] p-2 "
              >
                {showPassword ? <FaEyeSlash size={17} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-blue-600 text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? <ButtonLoader /> : "Login"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>

          <p className="text-xs text-center text-gray-400 pt-6">
            Copyright © 2020-2025 Superworks Company. All rights reserved.
          </p>
        </form>
      </div>
    </div>
  );
}
