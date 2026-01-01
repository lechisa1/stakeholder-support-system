"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useNavigate } from "react-router-dom";
// import { useRequestResetMutation } from "../../redux/services/authApi";

type ForgotPasswordEmailForm = {
  email: string;
};

const ForgotPasswordEmail = () => {
  const navigate = useNavigate();
  // const [requestReset] = useRequestResetMutation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordEmailForm>();

  const onSubmit = async (data: ForgotPasswordEmailForm) => {
    try {
      // const res = await requestReset({ email: data.email });
      // if (res.error) throw new Error(res.error.data.message);

      toast.success("Verification code sent to your email.");
      // navigate to code validation page, passing email as state or query param
      navigate("/verify-password", { state: { email: data.email } });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send verification code";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0C4A6E]">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email to receive a verification code.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="flex gap-5">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#0C4A6E]">
              Send Code
            </Button>
            <Button type="button" onClick={() => navigate("/login")} className="w-full bg-gray-300 font-medium text-gray-900 rounded-md hover:bg-gray-400">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordEmail;
