import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold">Irving Nepal FC Member Portal</h1>
      <p className="text-gray-600">
        Manage your membership, teams, matches, and payments in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Member Login
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
        >
          Apply for Membership
        </Link>
      </div>
    </div>
  );
}
