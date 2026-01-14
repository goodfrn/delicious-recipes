// assets/js/related-carousel.js
export function initRelatedCarousel() {
  const rails = document.querySelectorAll("[data-related-rail]");
  if (!rails.length) return;

  rails.forEach((rail) => {
    const interval = parseInt(rail.getAttribute("data-related-interval") || "2500", 10);

    let timer = null;
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let paused = false;

    const stopAuto = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const startAuto = () => {
      stopAuto();
      if (paused) return;

      timer = setInterval(() => {
        // scroll d’environ 1 carte (responsive)
        const firstItem = rail.querySelector("[data-related-item]");
        const gap = 16; // approx, ok
        const step = firstItem ? firstItem.getBoundingClientRect().width + gap : rail.clientWidth * 0.8;

        const maxScroll = rail.scrollWidth - rail.clientWidth - 2;
        const next = rail.scrollLeft + step;

        rail.scrollTo({
          left: next >= maxScroll ? 0 : next,
          behavior: "smooth",
        });
      }, interval);
    };

    // Pause auto quand user interagit
    const pause = () => {
      paused = true;
      stopAuto();
    };
    const resume = () => {
      paused = false;
      startAuto();
    };

    // DRAG souris (click & drag)
    rail.addEventListener("mousedown", (e) => {
      isDown = true;
      pause();
      rail.classList.add("is-dragging");
      startX = e.pageX;
      startScrollLeft = rail.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      rail.classList.remove("is-dragging");
      // on reprend après un petit délai
      setTimeout(resume, 1200);
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      rail.scrollLeft = startScrollLeft - dx;
    });

    // Touch (mobile) : pause / resume
    rail.addEventListener("touchstart", pause, { passive: true });
    rail.addEventListener("touchend", () => setTimeout(resume, 800), { passive: true });

    // Hover (desktop) : pause / resume
    rail.addEventListener("mouseenter", pause, { passive: true });
    rail.addEventListener("mouseleave", () => setTimeout(resume, 600), { passive: true });

    // Wheel : pause / resume
    rail.addEventListener("wheel", () => {
      pause();
      setTimeout(resume, 1200);
    }, { passive: true });

    // Start
    startAuto();
  });
}
