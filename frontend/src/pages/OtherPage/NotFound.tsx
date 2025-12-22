// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="Page Not Found |"
        description="The page you're looking for doesn't exist. Return to dashboard."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-white dark:bg-gray-900">
        <GridShape />
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-[#269A99] text-title-md xl:text-title-2xl">
            ERROR 404
          </h1>

          <img
            src="/images/error/404.svg"
            alt="Page not found"
            className="dark:hidden mx-auto"
          />
          <img
            src="/images/error/404-dark.svg"
            alt="Page not found"
            className="hidden dark:block mx-auto"
          />

          <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            We can’t seem to find the page you’re looking for.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-[#269A99] px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-[#1d7d7d] transition-colors"
          >
            Back to
          </Link>
        </div>

        {/* Footer */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </>
  );
}