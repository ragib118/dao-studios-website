"use client";

export default function Hero() {
  const handleExplore = () => {
    const discoverSection = document.querySelector(".featured");

    if (discoverSection) {
      discoverSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="hero">
      <video
        className="heroVideo"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="https://res.cloudinary.com/alvgxo0y/video/upload/q_auto,f_auto/v1786077087/hero.mp4"
          type="video/mp4"
        />
      </video>

      <div className="heroGradient"></div>

      <div className="heroOverlay">
        <div className="heroContent">
          <h1>
            Where Imagination
            <br />
            Comes Alive.
          </h1>

          <p>
            Original worlds. Endless imagination.
          </p>

          <div className="heroButtons">
            <button
              className="heroExploreButton"
              type="button"
              onClick={handleExplore}
            >
              Explore Worlds
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}