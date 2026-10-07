"use client";
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="wrap section">
      <h1>Something went wrong</h1>
      <p>
        Please try again. If the problem continues, contact your workspace
        administrator.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
