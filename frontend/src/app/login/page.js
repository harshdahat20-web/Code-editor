"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", formData);
      setUser(res.data.data);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <div className="hidden w-1/2 flex-col justify-center bg-white px-16 lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-black">
            {"</>"}
          </span>
          <span className="text-lg font-medium text-zinc-900">CodeFlow</span>
        </div>
        <p className="mt-2 text-sm text-emerald-600">
          Code Together. Build Faster.
        </p>
        <h1 className="mt-8 max-w-sm text-2xl font-semibold text-zinc-900">
          A collaborative code editor for modern developers.
        </h1>
        <p className="mt-3 max-w-sm text-sm text-zinc-500">
          Work together in real-time, share ideas, and build things as a team.
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-black">
              {"</>"}
            </span>
            <span className="text-lg font-medium text-zinc-900">CodeFlow</span>
          </div>

          <h2 className="text-xl font-semibold text-zinc-900">Welcome back</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Login to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 pr-9 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-zinc-500">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-zinc-300 accent-emerald-500"
                />
                Remember me
              </label>
              <Link href="#" className="text-emerald-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
