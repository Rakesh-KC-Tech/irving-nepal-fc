import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectedFrom?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Member Login</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="bg-paper text-navy rounded-md border border-line px-3 py-2"
           />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="bg-paper text-navy rounded-md border border-line px-3 py-2"
           />
        </label>
        <button
          formAction={login}
          className="rounded-md bg-crimson px-3 py-2 text-sm font-medium text-white"
        >
          Log in
        </button>
      </form>

      <p className="text-sm text-mist">
        Not a member yet?{" "}
        <Link href="/signup" className="underline">
          Apply here
        </Link>
      </p>
    </div>
  );
}
