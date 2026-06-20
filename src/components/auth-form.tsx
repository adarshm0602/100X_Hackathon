type AuthFormProps = {
  title: string;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  alternateHref: string;
  alternateLabel: string;
  formAction: (payload: FormData) => void;
  passwordAutoComplete: "current-password" | "new-password";
};

export function AuthForm({
  title,
  submitLabel,
  pending,
  error,
  alternateHref,
  alternateLabel,
  formAction,
  passwordAutoComplete,
}: AuthFormProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900">{title}</h1>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={passwordAutoComplete}
              minLength={6}
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Please wait..." : submitLabel}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          <a href={alternateHref} className="underline hover:text-zinc-900">
            {alternateLabel}
          </a>
        </p>
      </div>
    </div>
  );
}
