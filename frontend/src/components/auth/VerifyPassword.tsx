"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { useNavigate, useLocation } from "react-router-dom";

type VerificationCodeForm = {
  code: string;
};

const VerifyPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const { handleSubmit } = useForm<VerificationCodeForm>();

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // allow only digits
    if (!/^\d?$/.test(value)) return;

    // prevent skipping inputs
    if (index > 0 && code[index - 1] === "") return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // move forward
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
      }
    }
  };

  const onSubmit = () => {
    if (code.some((digit) => digit === "")) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    const finalCode = code.join("");
    console.log("Verification code:", finalCode);

    toast.success("Code verified successfully!");
    navigate("/change_password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0C4A6E]">Verify Code</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Verification Code</Label>
            <div className="flex justify-between gap-2 mt-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={index === 0}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg font-medium
                             border rounded-md
                             focus:outline-none focus:ring-2 focus:ring-[#0C4A6E]"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-5">
            <Button type="submit" className="w-full bg-[#0C4A6E]">
              Verify Code
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-gray-300 font-medium text-gray-900 hover:bg-gray-400"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyPassword;
