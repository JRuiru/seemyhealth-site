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

// --- HomeProblem: chaos → unified scroll transition ---
export function initChaosToUnified() {
  const chaosZone = document.querySelector("[data-chaos-zone]") as HTMLElement;
  const arrow = document.querySelector("[data-chaos-arrow]") as HTMLElement;
  const unifiedHeader = document.querySelector("[data-unified-header]") as HTMLElement;
  const unifiedGrid = document.querySelector("[data-unified-grid]") as HTMLElement;
  if (!chaosZone || !arrow) return;

  const cards = chaosZone.querySelectorAll(".fragment-card") as NodeListOf<HTMLElement>;
  if (!cards.length) return;

  // Kill CSS animations — GSAP handles everything
  cards.forEach((card) => { card.style.animation = "none"; });

  // Ambient drift parameters per card
  const driftX =    [ 8,  -10,  12,  -8,   10,  -6];
  const driftY =    [-12,   8,  10, -14,    6, -10];
  const driftRot =  [ 3,   3,  -3,  -3,   -3,   3];
  const durations = [ 3,  3.5, 2.8,   4,  3.2, 3.8];

  // Start looping drift tweens for each card
  function startDrift() {
    const tweens: gsap.core.Tween[] = [];
    cards.forEach((card, i) => {
      const tween = gsap.to(card, {
        x: driftX[i],
        y: driftY[i],
        rotation: `+=${driftRot[i]}`,
        duration: durations[i],
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * -0.5,
      });
      tweens.push(tween);
    });
    return tweens;
  }

  let driftTweens = startDrift();

  // Scatter directions for each card (outward from center)
  const scatterX = [-180, -120, -60, 60, 120, 180];
  const scatterY = [-100, 80, -110, 90, -80, 70];
  const scatterRot = [-25, 20, -15, 30, -20, 25];

  // As user scrolls past the chaos zone, cards scatter outward and fade
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chaosZone,
      start: "top 40%",
      end: "bottom 30%",
      scrub: 0.8,
      onEnter: () => {
        driftTweens.forEach((t) => t.kill());
      },
      onLeaveBack: () => {
        // Scrolled back up — reset cards and restart drift
        cards.forEach((card) => {
          gsap.set(card, { x: 0, y: 0, rotation: 0, opacity: 0.6, scale: 1 });
        });
        driftTweens = startDrift();
      },
    },
  });

  cards.forEach((card, i) => {
    tl.to(card, {
      x: scatterX[i],
      y: scatterY[i],
      rotation: scatterRot[i],
      opacity: 0,
      scale: 0.5,
      duration: 1,
      ease: "power2.in",
    }, 0);
  });

  // Fade the SVG connection lines too
  const svgLines = chaosZone.querySelector("svg");
  if (svgLines) {
    tl.to(svgLines, { opacity: 0, duration: 0.5 }, 0);
  }

  // Arrow pulses and fades
  if (arrow) {
    tl.fromTo(arrow, { opacity: 1 }, { opacity: 0, y: -20, duration: 0.5 }, 0.5);
  }

  // Unified section rises up with more presence
  if (unifiedHeader) {
    gsap.fromTo(unifiedHeader,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: {
          trigger: unifiedHeader,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  if (unifiedGrid) {
    gsap.fromTo(unifiedGrid,
      { opacity: 0, y: 80, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.out",
        scrollTrigger: {
          trigger: unifiedGrid,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }
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

// --- Navbar scroll (transparent → opaque) ---
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
      navbar.classList.add("bg-brand-black/80", "backdrop-blur-lg");
      navbar.classList.remove("bg-transparent");
      navbar.style.borderColor = "rgba(255,255,255,0.05)";
    },
    onEnterBack: () => {
      const menu = document.getElementById("mobile-menu");
      if (menu && !menu.classList.contains("hidden")) return; // keep opaque if menu open
      navbar.classList.remove("bg-brand-black/80", "backdrop-blur-lg");
      navbar.classList.add("bg-transparent");
      navbar.style.borderColor = "transparent";
    },
  });
}

// --- Ecosystem scroll reveal (Pin + Snap approach) ---
export function initEcosystemReveal() {
  const section = document.querySelector("[data-ecosystem-section]") as HTMLElement;
  if (!section) return;

  const flipperWrap = section.querySelector("[data-ecosystem-flipper-wrap]") as HTMLElement;
  const circle = section.querySelector("[data-ecosystem-circle]") as HTMLElement;
  const intro = section.querySelector("[data-ecosystem-intro]") as HTMLElement;
  if (!flipperWrap || !circle || !intro) return;

  const pulseRings = Array.from(section.querySelectorAll("[data-pulse-ring]")) as HTMLElement[];

  // --- Position satellite circles at their orbit radius ---
  const orbitScale = section.querySelector("[data-orbit-scale]") as HTMLElement;
  const satellites = Array.from(section.querySelectorAll("[data-satellite]")) as HTMLElement[];
  const circleRect = circle.getBoundingClientRect();
  const mainRadius = circleRect.width / 2;
  const satSize = satellites[0]?.getBoundingClientRect().width || 64;
  const orbitRadius = mainRadius + satSize * 0.8;

  const angles = [-90, -18, 54, 126, 198];
  satellites.forEach((sat, i) => {
    const angle = angles[i] * (Math.PI / 180);
    const x = Math.cos(angle) * orbitRadius;
    const y = Math.sin(angle) * orbitRadius;
    sat.style.marginLeft = `${x}px`;
    sat.style.marginTop = `${y}px`;
  });

  const slugOrder = ["app", "scale", "bp-monitor", "hydra-one", "hema-one", "ring-one"];
  const deviceColors = ["#ffffff", "#3B82F6", "#EF4444", "#06B6D4", "#A855F7", "#F97316"];

  const allFaces = slugOrder.map(
    (s) => section.querySelector(`[data-flip-face="${s}"]`) as HTMLElement
  );
  const allCards = slugOrder.map(
    (s) => section.querySelector(`[data-flip-header="${s}"]`) as HTMLElement
  );
  const allLabels = slugOrder.map(
    (s) => section.querySelector(`[data-flip-label="${s}"]`) as HTMLElement
  );

  // --- Build a single scrubbed + snapped timeline ---
  // Each segment has a FIXED duration S so snap points align exactly with settled states.
  // Steps: entrance | intro | app | scale | bp-monitor | hydra-one | hema-one | ring-one | exit
  const numSteps = 9;
  const S = 1; // uniform segment duration

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${numSteps * window.innerHeight * 0.6}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.8,
      snap: {
        snapTo: 1 / (numSteps - 1),
        duration: { min: 0.2, max: 0.5 },
        ease: "power2.inOut",
      },
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // --- Initial hidden state ---
  gsap.set(intro, { opacity: 0, y: 40 });
  gsap.set(circle, { scale: 0.3, opacity: 0 });
  if (orbitScale) gsap.set(orbitScale, { scale: 0, opacity: 0 });
  pulseRings.forEach((ring) => gsap.set(ring, { scale: 0.5, opacity: 0 }));

  // --- Segment 0 → 1: Entrance (text + circle + orbit phase in) ---
  tl.to(intro, { opacity: 1, y: 0, duration: S * 0.35, ease: "power2.out" }, 0);
  tl.to(circle, { scale: 1, opacity: 1, duration: S * 0.35, ease: "back.out(1.4)" }, S * 0.25);
  pulseRings.forEach((ring, idx) => {
    tl.to(ring, { scale: 1, opacity: 1, duration: S * 0.15, ease: "power2.out" }, S * 0.45 + idx * 0.05);
  });
  if (orbitScale) {
    tl.to(orbitScale, { scale: 1, opacity: 1, duration: S * 0.25, ease: "back.out(1.2)" }, S * 0.6);
  }

  // --- Segment 1 → 2: Hold intro (pause) ---

  // --- Segment 2 → 3: Collapse to app (first flip via scaleX) ---
  const seg2 = S * 2;
  tl.to(intro, { opacity: 0, y: -20, duration: S * 0.3, ease: "power2.inOut" }, seg2);
  if (orbitScale) {
    tl.to(orbitScale, { scale: 0, opacity: 0, duration: S * 0.35, ease: "power2.inOut" }, seg2);
  }
  pulseRings.forEach((ring) => {
    tl.to(ring, { opacity: 0, duration: S * 0.3 }, seg2);
  });
  // Squish to line (scaleX 1 → 0)
  tl.to(circle, { scaleX: 0, duration: S * 0.3, ease: "power2.in" }, seg2 + S * 0.3);
  // Swap face at zero-width
  if (allCards[0]) tl.set(allCards[0], { opacity: 1 }, seg2 + S * 0.6);
  // Expand back (scaleX 0 → 1)
  tl.to(circle, { scaleX: 1, duration: S * 0.3, ease: "power2.out" }, seg2 + S * 0.6);

  // --- Segments 3–7: Each device with scaleX flip ---
  for (let i = 1; i < slugOrder.length; i++) {
    const color = deviceColors[i];
    const segStart = S * (2 + i);

    // Fade out previous header + label
    if (allCards[i - 1]) tl.to(allCards[i - 1], { opacity: 0, duration: S * 0.2, ease: "power2.in" }, segStart);
    if (allLabels[i - 1]) tl.to(allLabels[i - 1], { opacity: 0, duration: S * 0.2, ease: "power2.in" }, segStart);

    // Squish to line
    tl.to(circle, { scaleX: 0, duration: S * 0.3, ease: "power2.in" }, segStart + S * 0.15);

    // At zero-width: swap face content
    if (allFaces[i - 1]) tl.set(allFaces[i - 1], { opacity: 0 }, segStart + S * 0.45);
    if (allFaces[i]) tl.set(allFaces[i], { opacity: 1 }, segStart + S * 0.45);

    // Expand back
    tl.to(circle, { scaleX: 1, duration: S * 0.3, ease: "power2.out" }, segStart + S * 0.45);

    // Fade in new header + label + color
    if (allCards[i]) tl.to(allCards[i], { opacity: 1, duration: S * 0.2, ease: "power2.out" }, segStart + S * 0.7);
    if (allLabels[i]) tl.to(allLabels[i], { opacity: 1, duration: S * 0.2, ease: "power2.out" }, segStart + S * 0.7);

    // Color change
    tl.to(circle, { borderColor: color + "60", duration: S * 0.2, ease: "power2.out" }, segStart + S * 0.7);
    pulseRings.forEach((ring) => {
      tl.to(ring, { borderColor: color + "30", duration: S * 0.2, ease: "power2.out" }, segStart + S * 0.7);
    });
  }

  // --- Segment 8: Exit — fade out ---
  const exitStart = S * 8;
  tl.to(flipperWrap, { opacity: 0, duration: S * 0.5, ease: "power2.in" }, exitStart);

  // Pad to exact total duration so snap math is correct
  tl.to({}, { duration: 0.01 }, S * numSteps);
}

// --- Horizontal scroll products ---
export function initProductsHorizontal() {
  const section = document.querySelector("[data-products-horizontal]") as HTMLElement;
  if (!section) return;

  const trackWrap = section.querySelector("[data-products-track-wrap]") as HTMLElement;
  const track = section.querySelector("[data-products-track]") as HTMLElement;
  const progress = section.querySelector("[data-products-progress]") as HTMLElement;
  const panels = section.querySelectorAll("[data-product-panel]");
  if (!trackWrap || !track || !panels.length) return;

  // Total horizontal distance to scroll
  const getScrollDistance = () => track.scrollWidth - window.innerWidth;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trackWrap,
      start: "top top",
      end: () => `+=${getScrollDistance()}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  tl.to(track, {
    x: () => -getScrollDistance(),
    ease: "none",
  });

  // Progress bar
  if (progress) {
    tl.to(progress, { scaleX: 1, ease: "none" }, 0);
  }

  // Fade in each panel as it enters
  panels.forEach((panel, i) => {
    if (i === 0) return; // first panel is already visible
    gsap.fromTo(
      panel.querySelector(".group"),
      { opacity: 0, x: 80 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: panel,
          containerAnimation: tl,
          start: "left 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

// --- Mobile collapse for "App works from day one" section ---
// Uses CSS sticky instead of ScrollTrigger pin.
// Sticky doesn't create a spacer, so when content collapses,
// the document flow adjusts naturally — no dead space possible.
export function initAppFirstCollapse() {
  const mm = gsap.matchMedia();

  mm.add("(max-width: 1023px)", () => {
    const wrapper = document.querySelector("[data-app-first-wrapper]") as HTMLElement;
    const section = document.querySelector("[data-app-first-section]") as HTMLElement;
    if (!wrapper || !section) return;

    const collapsible = section.querySelector("[data-app-collapsible]") as HTMLElement;
    if (!collapsible) return;

    const naturalHeight = collapsible.offsetHeight;

    // Make section sticky within the wrapper
    section.style.position = "sticky";
    section.style.top = "0";

    // Wrapper must be taller than the section to provide scroll distance.
    // Extra height = the cards we'll collapse (the scroll runway).
    wrapper.style.height = `${section.offsetHeight + naturalHeight}px`;

    // Lock collapsible height for smooth animation
    gsap.set(collapsible, { height: naturalHeight, overflow: "hidden" });

    // Animate based on wrapper scroll, no pin needed
    gsap.to(collapsible, {
      height: 0,
      opacity: 0,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
    });

    return () => {
      section.style.position = "";
      section.style.top = "";
      wrapper.style.height = "";
      gsap.set(collapsible, { height: "auto", opacity: 1, overflow: "" });
    };
  });
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
  initEcosystemReveal();

  // Sequential pins must be created in DOM order (top → bottom)
  initAppFirstCollapse();   // pin 1: collapse section
  initProductsHorizontal(); // pin 2: horizontal scroll

  initScrollReveals();
  initImageReveals();
  initParallax();
  initLineWipes();
  initCounters();
  initChaosToUnified();
  initStickyFeatures();
  initHowItWorksCarousel();

  // Recalculate after all assets load (images affect pin-spacer height)
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
