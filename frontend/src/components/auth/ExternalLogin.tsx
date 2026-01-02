import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "../../utils/validation";
import { Label } from "../ui/cn/label";
import Input from "../form/input/InputField";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import { EyeOffIcon } from "lucide-react";
import Logo from "../../assets/logo-aii.png";
import Button from "../ui/button/Button";

export default function ExternalLogin() {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, error: authError, clearError } = useAuth();
  
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      setError: setFormError,
    } = useForm<SignInFormData>({
      resolver: zodResolver(signInSchema),
    });
  
    const from = location.state?.from?.pathname || "/dashboard";
  
    const onSubmit = async (data: SignInFormData) => {
      try {
        clearError();
        await login(data);
        navigate(from, { replace: true });
      } catch (err: unknown) {
        const message =
          (err as { message?: string })?.message ||
          t("login.generic_error") ||
          "Failed to login";
        setFormError("root", { message });
      }
    };
  
    return (
      <div className="min-h-screen bg-[#F9FBFC] flex items-center justify-center px-4">
        {/* Centered Card */}
        
        <div className="w-full relative max-w-6xl min-h-[80vh]  shadow-2xl rounded-2xl border border-[#DCE7F1] overflow-hidden flex flex-col lg:flex-row">
        <Button
          onClick={() => navigate("/")}
          className="cursor-pointer shadow-none z-50 bg-transparent hover:bg-slate-100      p-2 top-4 left-4 absolute flex items-center gap-1"
        >
          <ArrowLeftIcon className="w-5 h-5 text-[#0C4A6E]" />
          <span className="text-sm text-[#0C4A6E] font-medium">Back </span>
        </Button>
          {/* Left Side - Logo Section */}
          <div
            className="w-full  bg-cover bg-center p-8 flex items-center justify-center"
          >
            <div className="  backdrop-blur-md p-6 rounded-xl   text-center">
              <img
                src={Logo}
                alt="Organization Logo"
                className="h-72 mx-auto mb-3 rounded-xl   p-2"
              />
              {/* <h1 className="text-xl font-bold text-center uppercase  text-[#0C4A6E] mb-6">Ethiopian Artificial Intelligence Institute</h1> */}
            </div>
          </div>
  
          {/* Right Side - Form */}
          <div className="w-full px-16 py-8 flex items-center justify-center">
            <div className="w-full max-w-md">
              
              <h1 className="text-3xl font-semibold text-center text-[#0C4A6E] mb-6">
                Login
              </h1>
  
              {(authError || errors.root) && (
                <div className="rounded-md w-full text-center bg-red-50 border border-red-200 px-3 py-2 mb-4">
                  <div className="text-sm text-red-700">
                    {authError || errors.root?.message}
                  </div>
                </div>
              )}
  
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
                {/* Email */}
                <div className="">
                  <Label className="text-[#0C4A6E]">Email</Label>
                  <Input
                    placeholder="example.xx@gov.et"
                    {...register("email")}
                    className={`w-full h-14 mt-1 px-3 py-2 border rounded-md text-sm ${
                      errors.email ? "border-red-500" : "border-blue-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
  
                {/* Password */}
                <div>
                  <Label className="text-[#0C4A6E]">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`w-full h-14 px-3 py-2 pr-10 border rounded-md text-sm ${
                        errors.password ? "border-red-500" : "border-blue-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="h-5 w-5 text-[#0C4A6E]" />
                      ) : (
                        <EyeOffIcon className="h-5 w-5 text-[#0C4A6E]" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
  
                {/* Forgot Password */}
                <div className="w-full text-right">
                  <Link className="text-sm text-[#0C4A6E] hover:underline" to="/forgot-password">
                    Forgot Password?
                  </Link>
                </div>
  
                {/* Submit */}
                <button
                  type="submit"
                //   disabled={isSubmitting}
                  className="w-full bg-[#073954] h-14 hover:bg-[#073954]/90 text-xl text-white py-2 rounded-md shadow-md  "
                >
                  {isSubmitting ? "Signing in..." : "Log In"}
                </button>
              </form>
  
            </div>
          </div>
        </div>
      </div>
    );
  }
  