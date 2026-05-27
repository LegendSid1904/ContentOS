import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-void p-4">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-tx-1">ContentOS AI</h1>
        <p className="mt-1 text-sm text-tx-2">Create your account</p>
      </div>
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </main>
  );
}
