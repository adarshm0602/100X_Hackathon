import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConceptChecker } from "./concept-checker";
import { logout } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              Concept Checker
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Signed in as{" "}
              <span className="font-medium text-zinc-900">{user.email}</span>
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Log out
            </button>
          </form>
        </div>

        <ConceptChecker />
      </div>
    </div>
  );
}
