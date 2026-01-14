// assets/js/modules/related-carousel.js
export function initRelatedCarousel() {
  const rails = document.querySelectorAll("[data-related-rail]");
  if (!rails.length) return null;

  const instances = [];

  rails.forEach((rail) => {
    const interval = parseInt(rail.getAttribute("data-related-interval") || "3000", 10);
    const resumeDelay = parseInt(rail.getAttribute("data-related-resume") || "4000", 10);

    let timer = null;
    let resumeTimeout = null;

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let dragged = false;

    // ===== ✅ Infinite loop: duplicate items once =====
    const originals = Array.from(rail.children);
    if (originals.length) {
      originals.forEach((node) => rail.appendChild(node.cloneNode(true)));
    }

    const halfWidth = () => rail.scrollWidth / 2;

    const wrapIfNeeded = () => {
      const half = halfWidth();
      if (!half) return;

      // if we entered the duplicated half, jump back by half (same visual position)
      if (rail.scrollLeft >= half) {
        const prev = rail.style.scrollBehavior;
        rail.style.scrollBehavior = "auto";
        rail.scrollLeft = rail.scrollLeft - half;
        rail.style.scrollBehavior = prev || "smooth";
      }
    };

    const stopAuto = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const startAuto = () => {
      stopAuto();
      timer = setInterval(() => {
        const step = Math.max(rail.clientWidth, 320);

        rail.scrollTo({
          left: rail.scrollLeft + step,
          behavior: "smooth",
        });

        // wrap shortly after the smooth scroll begins
        setTimeout(wrapIfNeeded, 450);
      }, interval);
    };

    const scheduleResume = () => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(startAuto, resumeDelay);
    };

    // keep loop correct even if user scrolls manually (trackpad etc.)
    rail.addEventListener("scroll", wrapIfNeeded, { passive: true });

    // ===== Mouse drag =====
    rail.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      isDown = true;
      dragged = false;
      stopAuto();

      startX = e.pageX;
      startScrollLeft = rail.scrollLeft;

      rail.classList.add("is-dragging");
      rail.style.scrollBehavior = "auto";
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 6) dragged = true;
      rail.scrollLeft = startScrollLeft - dx;
      wrapIfNeeded();
    });

    window.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      rail.classList.remove("is-dragging");
      rail.style.scrollBehavior = "smooth";
      scheduleResume();
    });

    // ===== Touch =====
    rail.addEventListener("touchstart", stopAuto, { passive: true });
    rail.addEventListener("touchend", scheduleResume, { passive: true });
    rail.addEventListener("touchcancel", scheduleResume, { passive: true });

    // ===== Block click if dragged =====
    rail.addEventListener(
      "click",
      (e) => {
        if (!dragged) return;
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );

    // start
    startAuto();

    instances.push({
      stop: () => {
        stopAuto();
        if (resumeTimeout) clearTimeout(resumeTimeout);
      },
    });
  });

  return instances;
}
