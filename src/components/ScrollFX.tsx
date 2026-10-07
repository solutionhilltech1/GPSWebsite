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
 * Reduced motion: none of it runs and the CSS initial states don't apply.
 */
export default function ScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 900px)" },
      (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        const all = <T extends HTMLElement = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);

        // Hero: the roof-shaped window opens into a full-bleed photo while its sticky stage scrolls past.
        all("[data-roof]").forEach((hero) => {
          const q = (sel: string) => hero.querySelectorAll(sel);
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: 1 },
            })
            .to(q("[data-roof-copy]"), { autoAlpha: 0, x: -80, duration: 0.45 }, 0)
            .to(q("[data-roof-line]"), { opacity: 0, duration: 0.35 }, 0.05)
            .to(q("[data-roof-window]"), { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1, ease: "power2.inOut" }, 0)
            .fromTo(q("[data-roof-window] img"), { scale: 1.18 }, { scale: 1, duration: 1 }, 0)
            .to(q("[data-roof-shade]"), { opacity: 1, duration: 0.3 }, 0.75)
            .fromTo(q("[data-roof-caption]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, 0.85)
            .to({}, { duration: 0.2 }); // hold on the full photo before the next section
        });

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

        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) =>
            gsap.fromTo(els, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.1 }),
        });

        all("[data-clip]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.6,
              ease: "power4.inOut",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
        });

        all("[data-words]").forEach((el) => {
          gsap.fromTo(
            el.children,
            { opacity: 0.12 },
            {
              opacity: 1,
              stagger: 0.1,
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

    // Late layout shifts (fonts, images, filter changes) move trigger positions, so recompute.
    let timer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      mm.revert();
    };
  }, [pathname]);

  return null;
}
