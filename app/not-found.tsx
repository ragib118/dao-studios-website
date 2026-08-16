import Link from "next/link";

export default function NotFound() {
  return (
    <main className="daoErrorPage">
      <div className="daoErrorGlow" aria-hidden="true" />

      <section className="daoErrorCard" aria-labelledby="dao-not-found-title">
        <div className="daoErrorBrand">DAO</div>
        <div className="daoErrorLine" aria-hidden="true" />

        <p className="daoErrorEyebrow">SORRY TO INTERRUPT</p>
        <h1 id="dao-not-found-title">This world hasn&apos;t been built yet.</h1>
        <p className="daoErrorMessage">
          The page you&apos;re looking for doesn&apos;t exist yet, or it may still be
          under development. Let&apos;s get you back to the worlds we&apos;ve already
          created.
        </p>

        <div className="daoErrorActions">
          <Link href="/" className="daoErrorPrimary">
            Return Home
          </Link>
          <Link href="/journey" className="daoErrorSecondary">
            Explore Our Journey
          </Link>
        </div>
      </section>
    </main>
  );
}
