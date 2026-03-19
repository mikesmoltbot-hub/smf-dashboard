"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-stone-900 text-stone-100">
        <div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-bold">Dashboard Error</h2>
          <p className="text-stone-400 max-w-md text-center">{error.message || "Something went wrong"}</p>
          {error.digest && (
            <p className="text-xs text-stone-600 font-mono">{error.digest}</p>
          )}
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
