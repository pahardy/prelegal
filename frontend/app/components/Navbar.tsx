"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  email?: string;
}

export default function Navbar({ email }: Props) {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="bg-brand-navy text-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight">
        Pre<span className="text-brand-yellow">Legal</span>
      </Link>
      {email && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-300">{email}</span>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
