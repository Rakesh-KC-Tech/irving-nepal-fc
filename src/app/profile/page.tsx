import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth";
import { updateProfile } from "./actions";

export default async function ProfilePage() {
  const { user, profile } = await requireUser();

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <Link href="/dashboard" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>

      <p className="text-sm text-mist">{user.email}</p>

      <form className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Full name
          <input
            name="fullName"
            type="text"
            defaultValue={profile?.full_name ?? ""}
            className="bg-paper text-navy rounded-md border border-line px-3 py-2"
           />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Phone
          <input
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ""}
            className="bg-paper text-navy rounded-md border border-line px-3 py-2"
           />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Date of birth
          <input
            name="dateOfBirth"
            type="date"
            defaultValue={profile?.date_of_birth ?? ""}
            className="bg-paper text-navy rounded-md border border-line px-3 py-2"
           />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Emergency contact name
          <input
            name="emergencyContactName"
            type="text"
            defaultValue={profile?.emergency_contact_name ?? ""}
            className="bg-paper text-navy rounded-md border border-line px-3 py-2"
           />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Emergency contact phone
          <input
            name="emergencyContactPhone"
            type="tel"
            defaultValue={profile?.emergency_contact_phone ?? ""}
            className="bg-paper text-navy rounded-md border border-line px-3 py-2"
           />
        </label>
        <button
          formAction={updateProfile}
          className="rounded-md bg-crimson px-3 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
      </form>
    </div>
  );
}
