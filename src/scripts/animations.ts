import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// --- Smooth Scroll (Lenis) ---
export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// --- Hero clip-path reveal ---
export function initHeroReveal() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const heroImage = hero.querySelector("[data-hero-image]");
  const heroContent = hero.querySelector("[data-hero-content]");

  if (heroImage) {
    gsap.fromTo(
      heroImage,
      { clipPath: "polygon(20% 30%, 80% 30%, 80% 70%, 20% 70%)", scale: 1.3 },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        scale: 1,
        duration: 1.6,
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

// --- Counter animation for stats ---
export function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  counters.forEach((el) => {
    const target = parseInt((el as HTMLElement).dataset.counter || "0");
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toString();
      },
    });
  });
}

// --- Sticky pinned feature section ---
export function initStickyFeatures() {
  const section = document.querySelector("[data-sticky-features]");
  if (!section) return;

  const cards = section.querySelectorAll("[data-feature-card]");
  if (cards.length === 0) return;

  cards.forEach((card, i) => {
    if (i === 0) return; // first card is already visible
    gsap.fromTo(
      card,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      }
    );
  });
}

// --- Init all ---
export function initAllAnimations() {
  initSmoothScroll();
  initHeroReveal();
  initScrollReveals();
  initImageReveals();
  initParallax();
  initLineWipes();
  initCounters();
  initStickyFeatures();
}
