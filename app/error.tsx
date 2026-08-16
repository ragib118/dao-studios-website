"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DAO Studios application error:", error);
  }, [error]);

  return (
    <main className="daoErrorPage">
      <div className="daoErrorGlow" aria-hidden="true" />

      <section className="daoErrorCard" aria-labelledby="dao-error-title">
        <div className="daoErrorBrand">DAO</div>
        <div className="daoErrorLine" aria-hidden="true" />

        <p className="daoErrorEyebrow">SORRY TO INTERRUPT</p>
        <h1 id="dao-error-title">Something interrupted this world.</h1>
        <p className="daoErrorMessage">
          Something went wrong while loading this page. Don&apos;t worry — the
          rest of DAO Studios is still here. You can try again or return to the
          home of our worlds.
        </p>

        <div className="daoErrorActions">
          <button type="button" onClick={reset} className="daoErrorPrimary">
            Try Again
          </button>
          <Link href="/" className="daoErrorSecondary">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
