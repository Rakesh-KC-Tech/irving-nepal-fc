export default function CheckEmailPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-sm flex-col justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="text-sm text-gray-600">
        We sent you a confirmation link. Click it to activate your account,
        then log in — your membership application will be reviewed by an
        admin before you get full access.
      </p>
    </div>
  );
}
