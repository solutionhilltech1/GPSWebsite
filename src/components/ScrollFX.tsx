"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/*
 * Every scroll effect on the site, driven by data attributes so pages stay Server Components:
 *   data-roof          home hero: [data-roof-window] opens from the logo's roof triangle to full-bleed
 *   data-speed="0.2"   parallax: element drifts against scroll (negative = moves with scroll)
 *   data-reveal        fades up when it enters the viewport
 *   data-clip          image wipes in from the bottom
 *   data-words         children (one span per word) light up as you scroll
 *   data-count="60"    number counts up when visible
 *   data-horizontal    pinned section; its [data-track] slides sideways inside its parent rail
 *                      (desktop only, mobile keeps the rail's native swipe + snap)
 *   data-draw          line that grows with scroll (timeline)
 *   data-live          gets .live while on screen, so CSS loops inside it pause offscreen
 * Reduced motion: none of it runs and the CSS initial states don't apply.
 */
export default function ScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    const isReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      document.querySelectorAll<HTMLElement>("[data-clip]").forEach((el) => {
        el.style.clipPath = "none";
      });
      return;
    }

    const lenis = new Lenis({
      anchors: true,
      prevent: (node) => {
        if (!(node instanceof HTMLElement)) return false;
        if (node.closest("nextjs-portal")) return false;
        return Boolean(
          node.hasAttribute("data-lenis-prevent") ||
          node.closest("[data-lenis-prevent]") ||
          node.closest("[class*='modalBackdrop']") ||
          node.closest("[class*='lightboxBackdrop']") ||
          document.body.classList.contains("modal-open")
        );
      },
    });

    (window as any).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Watch for actual modals or lightboxes in the application (excluding Next.js dev overlays)
    const checkModals = () => {
      const hasModal = Boolean(
        document.querySelector(
          "main [data-lenis-prevent], [class*='modalBackdrop'], [class*='lightboxBackdrop'], dialog[open]:not(nextjs-portal *)"
        )
      );

      if (hasModal) {
        document.documentElement.classList.add("modal-open");
        document.body.classList.add("modal-open");
        lenis.stop();
      } else {
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
        lenis.start();
      }
    };

    // Coalesce to one check per frame: counters and React re-renders mutate the DOM many times a second.
    let pending = 0;
    const observer = new MutationObserver(() => {
      if (!pending) pending = requestAnimationFrame(() => ((pending = 0), checkModals()));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(pending);
      observer.disconnect();
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  useEffect(() => {
    const isReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      document.querySelectorAll<HTMLElement>("[data-clip]").forEach((el) => {
        el.style.clipPath = "none";
      });
      return;
    }

    const mm = gsap.matchMedia();

    mm.add(
      { desktop: "(min-width: 900px)", mobile: "(max-width: 899px)" },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const all = <T extends HTMLElement = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);

        // Hero: the roof-shaped window opens into a full-bleed photo while its sticky stage scrolls past.
        all("[data-roof]").forEach((hero) => {
          const q = (sel: string) => hero.querySelectorAll(sel);
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            })
            .to(q("[data-roof-copy]"), { autoAlpha: 0, x: -80, duration: 0.45 }, 0)
            .to(q("[data-roof-line]"), { opacity: 0, duration: 0.35 }, 0.05)
            .to(
              q("[data-roof-window]"),
              {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                bottom: 0,
                duration: 1,
                ease: "power2.inOut",
              },
              0
            )
            .fromTo(q("[data-roof-window] img"), { scale: 1.18 }, { scale: 1, duration: 1 }, 0)
            .to(q("[data-roof-shade]"), { opacity: 1, duration: 0.3 }, 0.75)
            .fromTo(q("[data-roof-caption]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, 0.85)
            .to({}, { duration: 0.2 });
        });

        // Decorative CSS loops (Skyline) only run while their section is on screen.
        all("[data-live]").forEach((el) =>
          ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", toggleClass: "live" }),
        );

        if (desktop) {
          all("[data-horizontal]").forEach((section) => {
            const track = section.querySelector<HTMLElement>("[data-track]")!;
            const rail = track.parentElement!;
            const distance = () => track.offsetWidth - rail.clientWidth;
            gsap.set(rail, { overflow: "hidden" });
            gsap.to(track, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          });
        }

        all("[data-speed]").forEach((el) => {
          const speed = parseFloat(el.dataset.speed!) * (desktop ? 1 : 0.5);
          gsap.fromTo(
            el,
            { yPercent: -speed * 50 },
            {
              yPercent: speed * 50,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        // Individual ScrollTriggers ensure elements already in viewport on load animate in immediately
        all("[data-reveal]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 44 },
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                once: true,
              },
            }
          );
        });

        all("[data-clip]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.4,
              ease: "power3.inOut",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
        });

        all("[data-words]").forEach((el) => {
          gsap.fromTo(
            el.children,
            { opacity: 0.15 },
            {
              opacity: 1,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true },
            },
          );
        });

        all("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count);
          const counter = { value: 0 };
          el.textContent = "0";
          gsap.to(counter, {
            value: end,
            duration: 2.2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => {
              el.textContent = Math.round(counter.value).toLocaleString("en-IN");
            },
          });
        });

        all("[data-draw]").forEach((el) => {
          gsap.fromTo(
            el,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              transformOrigin: "top",
              scrollTrigger: { trigger: el.parentElement, start: "top 65%", end: "bottom 65%", scrub: true },
            },
          );
        });
      },
    );

    // Recompute trigger positions on mount and layout shifts
    const refresh = () => ScrollTrigger.refresh();
    refresh();
    const rafId = requestAnimationFrame(refresh);
    const t1 = setTimeout(refresh, 200);
    const t2 = setTimeout(refresh, 600);
    window.addEventListener("load", refresh, { once: true });

    let timer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 200);
    });
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", refresh);
      clearTimeout(timer);
      ro.disconnect();
      mm.revert();
    };
  }, [pathname]);

  return null;
}
