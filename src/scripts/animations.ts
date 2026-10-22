import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// --- Smooth Scroll (Lenis) ---
let lenisInstance: Lenis | null = null;
export function getLenis() { return lenisInstance; }

export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  lenisInstance = lenis;
  return lenis;
}

// --- Hero clip-path reveal ---
export function initHeroReveal() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const heroImage = hero.querySelector("[data-hero-image]");
  const heroContent = hero.querySelector("[data-hero-content]");

  // The circle opens on a photo that is already decoded, or a slow phone opens it on nothing and
  // decodes mid-animation. A photo that is slow to arrive gets 1.2 s before the reveal goes anyway.
  const photo = heroImage?.querySelector("img");
  const ready = photo
    ? Promise.race([photo.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1200))])
    : Promise.resolve();
  ready.then(() => revealHero(heroImage, heroContent));
}

function revealHero(heroImage: Element | null, heroContent: Element | null) {
  if (heroImage) {
    gsap.fromTo(
      heroImage,
      { clipPath: "circle(12% at 55% 45%)", scale: 1.3 },
      {
        clipPath: "circle(75% at 50% 50%)",
        scale: 1,
        duration: 1.8,
        ease: "power3.inOut",
        delay: 0.3,
      }
    );
  }

  if (heroContent) {
    const elements = heroContent.querySelectorAll("[data-reveal]");
    gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        delay: 1.0,
        // Heavy work below the fold (the why scene) waits for this, so it never stutters the reveal
        onComplete: () => {
          document.documentElement.dataset.heroRevealed = "";
          window.dispatchEvent(new Event("hero:revealed"));
        },
      }
    );
  }
}

// --- Scroll-triggered text reveals ---
export function initScrollReveals() {
  // Fade-up reveals for any [data-scroll-reveal] element
  const reveals = document.querySelectorAll("[data-scroll-reveal]");
  reveals.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  // Staggered children reveals for [data-scroll-stagger]
  const staggers = document.querySelectorAll("[data-scroll-stagger]");
  staggers.forEach((container) => {
    const children = container.children;
    gsap.fromTo(
      children,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          toggleActions: "play none none none",
          onEnter: () => {
            Array.from(children).forEach((child) => child.classList.add("is-visible"));
          },
        },
      }
    );
  });
}

// --- Image scale-in reveals ---
export function initImageReveals() {
  const images = document.querySelectorAll("[data-image-reveal]");
  images.forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 1.15, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: img,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  });
}

// --- Parallax images ---
export function initParallax() {
  const parallaxElements = document.querySelectorAll("[data-parallax]");
  parallaxElements.forEach((el) => {
    const speed = parseFloat((el as HTMLElement).dataset.parallax || "0.2");
    gsap.to(el, {
      yPercent: speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

// --- Horizontal line wipe for section dividers ---
export function initLineWipes() {
  const lines = document.querySelectorAll("[data-line-wipe]");
  lines.forEach((line) => {
    gsap.fromTo(
      line,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: line,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );
  });
}

// --- Navbar scroll (glass over the hero → opaque past it) ---
export function initNavbarScroll() {
  const navbar = document.querySelector('[data-navbar-variant="transparent"]') as HTMLElement;
  if (!navbar) return;

  const trigger = document.querySelector("[data-hero]") || document.querySelector("section");
  if (!trigger) return;

  ScrollTrigger.create({
    trigger,
    start: "top top",
    end: "bottom top",
    onLeave: () => {
      navbar.classList.add("bg-brand-black/80");
      navbar.classList.remove("bg-brand-black/30");
      navbar.style.borderColor = "rgba(255,255,255,0.05)";
    },
    onEnterBack: () => {
      const menu = document.getElementById("mobile-menu");
      if (menu && !menu.classList.contains("hidden")) return; // keep opaque if menu open
      navbar.classList.remove("bg-brand-black/80");
      navbar.classList.add("bg-brand-black/30");
      navbar.style.borderColor = "";
    },
  });
}

// --- Devices: one card on stage at a time, cycling on its own ---
export function initProductsShowcase() {
  const section = document.querySelector("[data-products-showcase]") as HTMLElement;
  if (!section) return;

  const stage = section.querySelector("[data-products-stage]") as HTMLElement;
  const panels = Array.from(section.querySelectorAll("[data-product-panel]")) as HTMLElement[];
  const tabs = Array.from(section.querySelectorAll("[data-product-tab]")) as HTMLElement[];
  const fills = tabs.map((tab) => tab.querySelector("[data-product-tab-fill]") as HTMLElement);
  if (!stage || panels.length < 2 || fills.some((fill) => !fill)) return;

  const HOLD = 5; // seconds each device holds the stage
  let current = 0;
  let timer: gsap.core.Tween | null = null;
  let inView = false;
  let held = false; // a pointer or keyboard focus is on the card

  const running = () => inView && !held;

  const startTimer = () => {
    timer?.kill();
    fills.forEach((fill) => gsap.set(fill, { scaleX: 0 }));
    timer = gsap.to(fills[current], {
      scaleX: 1,
      duration: HOLD,
      ease: "none",
      paused: !running(),
      onComplete: () => show((current + 1) % panels.length),
    });
  };

  const show = (next: number) => {
    if (next === current) return;
    const leaving = panels[current];
    const arriving = panels[next];

    gsap.killTweensOf([leaving, arriving]);
    gsap.to(leaving, { autoAlpha: 0, scale: 0.96, y: -24, duration: 0.5, ease: "power2.in" });
    gsap.fromTo(
      arriving,
      { autoAlpha: 0, scale: 1.03, y: 40 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" }
    );
    leaving.setAttribute("aria-hidden", "true");
    arriving.removeAttribute("aria-hidden");

    tabs[current].classList.replace("text-white", "text-brand-gray-500");
    tabs[current].removeAttribute("aria-current");
    tabs[next].classList.replace("text-brand-gray-500", "text-white");
    tabs[next].setAttribute("aria-current", "true");

    current = next;
    startTimer();
  };

  const sync = () => {
    if (!timer) return;
    if (running()) timer.resume();
    else timer.pause();
  };

  tabs.forEach((tab, i) => tab.addEventListener("click", () => show(i)));
  stage.addEventListener("mouseenter", () => { held = true; sync(); });
  stage.addEventListener("mouseleave", () => { held = false; sync(); });
  stage.addEventListener("focusin", () => { held = true; sync(); });
  stage.addEventListener("focusout", () => { held = false; sync(); });

  // Cycle only while the section is on screen, so nobody arrives mid-way through the set
  ScrollTrigger.create({
    trigger: section,
    start: "top 75%",
    end: "bottom 25%",
    onToggle: (self) => { inView = self.isActive; sync(); },
  });

  startTimer();
}

// --- How It Works: continuously rotating 3D card carousel ---
export function initHowItWorksCarousel() {
  const carousel = document.querySelector("[data-how-carousel]") as HTMLElement;
  if (!carousel) return;

  const dots = document.querySelectorAll("[data-how-dot]");
  const glow = document.querySelector("[data-how-glow]") as HTMLElement;
  const icons = document.querySelectorAll("[data-how-icon]");
  const lines = document.querySelectorAll("[data-how-line]");
  const pulses = document.querySelectorAll("[data-how-pulse]");
  let currentStep = 0;

  function updateDots(step: number) {
    dots.forEach((dot, i) => {
      const el = dot as HTMLElement;
      if (i === step) {
        el.style.transform = "scale(1.5)";
        el.style.opacity = "1";
      } else {
        el.style.transform = "scale(1)";
        el.style.opacity = "0.4";
      }
    });
  }

  // Animate the active card's icon, line, and pulse
  function animateActiveCard(step: number) {
    // Reset all icons, lines, and pulses
    icons.forEach((icon) => {
      const path = icon.querySelector(".how-icon-path") as SVGPathElement;
      if (path) gsap.set(path, { strokeDashoffset: 100 });
    });
    lines.forEach((line) => gsap.set(line, { width: 0 }));
    pulses.forEach((pulse) => {
      (pulse as HTMLElement).style.animation = "none";
    });

    // Animate active icon: stroke draw-on
    const activeIcon = icons[step];
    if (activeIcon) {
      const path = activeIcon.querySelector(".how-icon-path") as SVGPathElement;
      if (path) {
        gsap.fromTo(path,
          { strokeDashoffset: 100 },
          { strokeDashoffset: 0, duration: 1, ease: "power2.out", delay: 0.3 }
        );
      }
    }

    // Animate active line: grow from center
    const activeLine = lines[step] as HTMLElement;
    if (activeLine) {
      gsap.fromTo(activeLine,
        { width: 0 },
        { width: "60%", duration: 0.8, ease: "power2.out", delay: 0.5 }
      );
    }

    // Animate active pulse ring
    const activePulse = pulses[step] as HTMLElement;
    if (activePulse) {
      activePulse.style.animation = "pulse-ring 2s ease-out infinite";
    }

    // Glow pulse
    if (glow) {
      gsap.fromTo(glow,
        { opacity: 0.1, scale: 0.8 },
        { opacity: 0.25, scale: 1, duration: 1, ease: "power2.out" }
      );
    }
  }

  updateDots(0);
  animateActiveCard(0);

  let autoTimer: ReturnType<typeof setTimeout> | null = null;
  let isInteracting = false;

  // Go to a specific face (dot index 0=Step1, 1=Step2, 2=Step3)
  function goToFace(i: number, autoAdvance = false) {
    if (autoTimer) clearTimeout(autoTimer);
    currentStep = i;
    updateDots(i);
    gsap.to(carousel, {
      rotateY: -i * 120,
      duration: autoAdvance ? 1.2 : 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        animateActiveCard(i);
        scheduleNext();
      },
    });
  }

  // Auto-advance to next face after pause
  function scheduleNext() {
    if (autoTimer) clearTimeout(autoTimer);
    if (isInteracting) return;
    autoTimer = setTimeout(() => {
      goToFace((currentStep + 1) % 3, true);
    }, 2500);
  }

  // Start auto-rotation
  scheduleNext();

  // Pause on hover
  const section = carousel.parentElement!.parentElement!;
  section.addEventListener("mouseenter", () => {
    isInteracting = true;
    if (autoTimer) clearTimeout(autoTimer);
  });
  section.addEventListener("mouseleave", () => {
    isInteracting = false;
    scheduleNext();
  });

  // Click dots to jump to a face
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goToFace(i));
  });

  // Swipe support for mobile
  let touchStartX = 0;
  section.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    isInteracting = true;
    if (autoTimer) clearTimeout(autoTimer);
  }, { passive: true });
  section.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    isInteracting = false;
    if (Math.abs(dx) > 40) {
      const next = dx < 0
        ? (currentStep + 1) % 3
        : (currentStep - 1 + 3) % 3;
      goToFace(next);
    } else {
      scheduleNext();
    }
  }, { passive: true });
}

// --- Init all ---
export function initAllAnimations() {
  // Mobile config: prevent address bar resize jumps
  ScrollTrigger.config({ ignoreMobileResize: true });

  initSmoothScroll();
  initNavbarScroll();
  initHeroReveal();
  initProductsShowcase();

  initScrollReveals();
  initImageReveals();
  initParallax();
  initLineWipes();
  initHowItWorksCarousel();

  // Recalculate after all assets load (images affect pin-spacer height)
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
