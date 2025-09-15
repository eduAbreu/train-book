import Link from "next/link";
import AuthForm from "@/components/shared/AuthForm";
import { ownerSignUp, ownerSignIn } from "@/features/auth/actions";

export default function OwnerLogin() {
  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center mb-4">
        <Link href="/" className="btn btn-ghost btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Home
        </Link>
      </div>

      <AuthForm
        role="owner"
        signUpAction={ownerSignUp}
        signInAction={ownerSignIn}
        locale="en"
      />
    </div>
  );
}
