import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { API_BASE, fetchArtworks, fetchEvents } from "../lib/api";
import SectionHeader from "../components/SectionHeader.jsx";
import GalleryCard from "../components/GalleryCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import InstagramSection from "../components/InstagramSection.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { LANGS, useI18n } from "../i18n/index.jsx";

const cx = (...xs) => xs.filter(Boolean).join(" ");
const toAbsolute = (p) => (p?.startsWith("http") ? p : `${API_BASE}${p || ""}`);

export default function Home() {
  const { t, lang, setLang } = useI18n();

  // -------- Local state --------
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  // -------- Data --------
  const [artworks, setArtworks] = useState([]);
  const [artState, setArtState] = useState({ loading: true, error: "" });

  const [events, setEvents] = useState([]);
  const [evtState, setEvtState] = useState({ loading: true, error: "" });

  const load = useCallback(async () => {
    setArtState({ loading: true, error: "" });
    setEvtState({ loading: true, error: "" });
    try {
      const [aData, eData] = await Promise.all([
        fetchArtworks({ offset: 0, limit: 20 }),
        fetchEvents({ offset: 0, limit: 20, upcoming_only: true }),
      ]);
      setArtworks(Array.isArray(aData) ? aData : []);
      setEvents(Array.isArray(eData) ? eData : []);
      setArtState({ loading: false, error: "" });
      setEvtState({ loading: false, error: "" });
    } catch (e) {
      const msg = e.message || "Failed to load";
      setArtState({ loading: false, error: msg });
      setEvtState({ loading: false, error: msg });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolveImage = (a) => {
    if (!a?.image_path) return null;
    if (a.image_path.startsWith("/media")) return `${API_BASE}${a.image_path}`;
    return `${API_BASE}/media/${a.image_path}`;
  };

  // ===== Selected Works: continuous auto-scroll with manual control =====
  const trackRef = useRef(null);
  const hoverPause = useRef(false);
  const userPauseUntil = useRef(0);
  const isDraggingRef = useRef(false);

  // drag handlers (desktop + touch) – artworks
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let startX = 0;
    let scrollLeft = 0;

    const kickPause = () => {
      userPauseUntil.current = performance.now() + 1500;
    };

    const onDown = (e) => {
      isDraggingRef.current = true;
      startX = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.classList.add("cursor-grabbing");
      kickPause();
    };
    const onLeave = () => {
      isDraggingRef.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const onUp = () => {
      isDraggingRef.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft;
      const walk = (x - startX) * 1.2;
      el.scrollLeft = scrollLeft - walk;
      kickPause();
    };
    const onWheel = () => kickPause();

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("touchend", onUp, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("touchend", onUp);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("wheel", onWheel);
    };
  }, [artworks.length]);

  // rAF loop: triple list for robust bi-directional looping – artworks
  useEffect(() => {
    const el = trackRef.current;
    if (!el || artworks.length === 0) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) return;

    // initial center position = start of the middle copy
    const setCenter = () => {
      const one = el.scrollWidth / 3;
      el.scrollLeft = one;
    };
    requestAnimationFrame(setCenter);

    let rafId;
    let last = performance.now();
    const pxPerSec = 60;

    const tick = (now) => {
      const dt = now - last;
      last = now;

      const pausedByHover = hoverPause.current;
      const pausedByUser = now < userPauseUntil.current;
      if (!pausedByHover && !pausedByUser && !document.hidden) {
        el.scrollLeft += (pxPerSec * dt) / 1000;
      }

      // seamless wrap across triple copies
      const one = el.scrollWidth / 3;
      if (el.scrollLeft >= one * 2) el.scrollLeft -= one;
      else if (el.scrollLeft <= 0) el.scrollLeft += one;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [artworks.length]);

  const onMouseEnterTrack = () => (hoverPause.current = true);
  const onMouseLeaveTrack = () => (hoverPause.current = false);

  // ===== Exhibitions =====
  const evTrackRef = useRef(null);
  const evHoverPause = useRef(false);
  const evUserPauseUntil = useRef(0);
  const evDraggingRef = useRef(false);

  // drag handlers – events
  useEffect(() => {
    const el = evTrackRef.current;
    if (!el) return;
    let startX = 0;
    let scrollLeft = 0;

    const kickPause = () => {
      evUserPauseUntil.current = performance.now() + 1500;
    };

    const onDown = (e) => {
      evDraggingRef.current = true;
      startX = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.classList.add("cursor-grabbing");
      kickPause();
    };
    const onLeave = () => {
      evDraggingRef.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const onUp = () => {
      evDraggingRef.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const onMove = (e) => {
      if (!evDraggingRef.current) return;
      e.preventDefault();
      const x = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft;
      const walk = (x - startX) * 1.2;
      el.scrollLeft = scrollLeft - walk;
      kickPause();
    };
    const onWheel = () => kickPause();

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("touchend", onUp, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("touchend", onUp);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("wheel", onWheel);
    };
  }, [events.length]);

  // rAF loop – events
  useEffect(() => {
    const el = evTrackRef.current;
    if (!el || events.length === 0) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) return;

    const setCenter = () => {
      const one = el.scrollWidth / 3;
      el.scrollLeft = one;
    };
    requestAnimationFrame(setCenter);

    let rafId;
    let last = performance.now();
    const pxPerSec = 60;

    const tick = (now) => {
      const dt = now - last;
      last = now;

      const pausedByHover = evHoverPause.current;
      const pausedByUser = now < evUserPauseUntil.current;
      if (!pausedByHover && !pausedByUser && !document.hidden) {
        el.scrollLeft += (pxPerSec * dt) / 1000;
      }

      const one = el.scrollWidth / 3;
      if (el.scrollLeft >= one * 2) el.scrollLeft -= one;
      else if (el.scrollLeft <= 0) el.scrollLeft += one;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [events.length]);

  const onMouseEnterEvents = () => (evHoverPause.current = true);
  const onMouseLeaveEvents = () => (evHoverPause.current = false);

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Local keyframes for shine effect */}
      <style>{`
        @keyframes skewShine {
          0%   { transform: translateX(-120%) skewX(-12deg); opacity: 0.00; }
          10%  { opacity: 0.25; }
          50%  { transform: translateX(0%)    skewX(-12deg); opacity: 0.40; }
          90%  { opacity: 0.18; }
          100% { transform: translateX(120%)  skewX(-12deg); opacity: 0.00; }
        }
      `}</style>

      {/* ---------- HERO / WELCOME ---------- */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className="grid md:grid-cols-2 gap-6 items-center p-6 md:p-10 relative">
          {/* Animated shine overlay */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div
              className="
                absolute -inset-y-10 -left-1/3 w-1/2
                bg-gradient-to-r from-transparent via-neutral-200/70 to-transparent
                blur-2xl
                mix-blend-overlay
              "
              style={{ animation: "skewShine 5s ease-in-out infinite" }}
            />
          </div>

          {/* Text */}
          <div className="space-y-4 relative z-10">
            <h1 className="text-3xl md:text-5xl font-sans tracking-tight text-neutral-900">
              {t("home.welcomeTitle") || "Welcome to the world of Mehmet Dağlı"}
            </h1>
            <p className="text-neutral-600 max-w-prose">
              {t("home.welcomeBody") ||
                "Minimal forms, bold contrasts, and elegant motion. Explore selected works, current exhibitions, and the story behind the art."}
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                to="/portfolio"
                className="btn rounded-full bg-neutral-900 text-white hover:bg-black"
              >
                {t("home.ctaPortfolio") || "See Portfolio"}
              </Link>
              <Link to="/events" className="btn rounded-full">
                {t("home.ctaEvents") || "Upcoming Events"}
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative z-10">
            <div className="rounded-2xl overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.25)]">
              <img
                src="/mehmet1.png"
                alt="Artist preview"
                className="w-full h-[300px] md:h-[360px] object-cover scale-100 hover:scale-[1.03] transition-transform duration-700 ease-out"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- EXHIBITIONS  ---------- */}
      <section>
        <SectionHeader title={t("home.eventsTitle") || "Events"} />
        <ErrorAlert message={evtState.error} onRetry={load} />

        {evtState.loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`evt-skel-${i}`} />
            ))}
          </div>
        ) : events.length ? (
          (() => {
            const looped = [...events, ...events, ...events]; // triple copy for smooth looping
            return (
              <div
                ref={evTrackRef}
                onMouseEnter={onMouseEnterEvents}
                onMouseLeave={onMouseLeaveEvents}
                className="flex gap-4 overflow-x-auto pb-2 px-1"
              >
                {looped.map((ev, idx) => {
                  const key = `${ev.id}-${idx % events.length}-${Math.floor(
                    idx / events.length
                  )}`;
                  const images = Array.isArray(ev.images) ? ev.images : [];

                  return (
                    <div
                      key={key}
                      className="
                        shrink-0
                        min-w-[78%] sm:min-w-[58%] lg:min-w-[48%] xl:min-w-[42%]
                        max-w-[420px]
                      "
                    >
                      <article
                        className="
                          rounded-2xl border border-neutral-200 bg-white p-5
                          shadow-[0_8px_28px_rgba(0,0,0,0.15)]
                          hover:shadow-[0_16px_44px_rgba(0,0,0,0.22)]
                          transition-shadow
                          text-center
                        "
                      >
                        {/* Title / Meta */}
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold text-neutral-900">
                            {ev.title}
                          </h3>
                          {ev.published === false ? (
                            <span className="badge mx-auto">Taslak</span>
                          ) : null}
                          <div className="text-neutral-600 text-sm">
                            <div>{ev.location || "—"}</div>
                            <div>
                              <span>{ev.start_date || "—"}</span>
                              {ev.end_date ? (
                                <span>{` → ${ev.end_date}`}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Inner image strip (horizontal scroll) */}
                        {images.length > 0 && (
                          <div className="mt-4 -mx-1">
                            <div className="flex gap-2 overflow-x-auto px-1 pb-1 justify-center">
                              {images.map((p, i) => (
                                <img
                                  key={i}
                                  src={toAbsolute(p)}
                                  alt={`${ev.title} image ${i + 1}`}
                                  className="h-[180px] w-auto rounded-lg object-cover flex-shrink-0"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {ev.details ? (
                          <p className="mt-3 text-sm text-neutral-700 line-clamp-3">
                            {ev.details}
                          </p>
                        ) : null}
                      </article>
                    </div>
                  );
                })}
              </div>
            );
          })()
        ) : (
          <div className="opacity-70">
            {t("home.eventsEmpty") || "No upcoming events."}
          </div>
        )}
      </section>

      {/* ---------- SELECTED WORKS ---------- */}
      <section>
        <SectionHeader title={t("home.portfolioTitle") || "Selected Works"} />
        <ErrorAlert message={artState.error} onRetry={load} />

        {artState.loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`art-skel-${i}`} />
            ))}
          </div>
        ) : artworks.length ? (
          <>
            {(() => {
              // triple list for robust looping in both directions
              const looped = [...artworks, ...artworks, ...artworks];
              return (
                <div
                  ref={trackRef}
                  onMouseEnter={onMouseEnterTrack}
                  onMouseLeave={onMouseLeaveTrack}
                  className="flex gap-4 overflow-x-auto pb-2 px-1"
                >
                  {looped.map((a, idx) => {
                    const key = `${a.id}-${idx % artworks.length}-${Math.floor(
                      idx / artworks.length
                    )}`;
                    const src = resolveImage(a);
                    return (
                      <div
                        key={key}
                        className="
                          shrink-0
                          min-w-[78%] sm:min-w-[58%] lg:min-w-[48%] xl:min-w-[42%]
                          max-w-[420px] cursor-pointer
                        "
                        onClick={() => setSelectedArtwork(a)}
                      >
                        <GalleryCard item={a} imageUrl={src} />
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="flex justify-center mt-6">
              <Link to="/portfolio" className="btn rounded-full">
                {t("home.seeFullPortfolio") || "See full portfolio"}
              </Link>
            </div>
          </>
        ) : (
          <div className="opacity-70">
            {t("home.empty") || "No artworks yet."}
          </div>
        )}

        {/* Inline Modal */}
        {selectedArtwork && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSelectedArtwork(null)}
            />
            <div className="relative z-10 mx-auto mt-10 mb-10 max-w-5xl">
              <div className="grid md:grid-cols-2 gap-6 rounded-2xl bg-white p-4 md:p-6 shadow-[0_18px_48px_rgba(0,0,0,0.25)]">
                {/* Image */}
                <div className="flex items-center justify-center">
                  <img
                    src={
                      selectedArtwork.image_path?.startsWith("/media")
                        ? `${API_BASE}${selectedArtwork.image_path}`
                        : `${API_BASE}/media/${
                            selectedArtwork.image_path || ""
                          }`
                    }
                    alt={selectedArtwork.title || "artwork"}
                    className="max-h-[70vh] w-auto object-contain rounded-lg"
                  />
                </div>

                {/* Info — centered vertically & horizontally */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-neutral-900">
                      {selectedArtwork.title || "Untitled"}
                    </h3>
                    {selectedArtwork.medium ? (
                      <div className="mt-2 text-sm text-neutral-600">
                        {selectedArtwork.medium}
                      </div>
                    ) : null}
                    {selectedArtwork.price != null ? (
                      <div className="mt-2 text-sm text-neutral-600">
                        {new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: "TRY",
                        }).format(Number(selectedArtwork.price))}
                      </div>
                    ) : null}
                    <div className="mt-2">
                      <span className="badge badge-success">
                        {selectedArtwork.available
                          ? t("common.available")
                          : t("common.notAvailable")}
                      </span>
                    </div>

                    {selectedArtwork.description ? (
                      <p className="mt-4 text-sm text-neutral-700 max-w-prose mx-auto">
                        {selectedArtwork.description}
                      </p>
                    ) : null}

                    <div className="mt-6 flex items-center justify-center gap-3">
                      <button className="btn btn-primary rounded-full">
                        Satın Al
                      </button>
                      <button
                        className="btn rounded-full"
                        onClick={() => setSelectedArtwork(null)}
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <InstagramSection title="Instagram" />

      {/* ---------- CTA ---------- */}
      <section className="rounded-3xl border border-neutral-200 p-6 md:p-10 bg-white shadow-[0_12px_36px_rgba(0,0,0,0.12)]">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900">
              {t("home.ctaTitle") || "Want to learn more?"}
            </h3>
            <p className="mt-2 text-neutral-600">
              {t("home.ctaBody") ||
                "Read the bio, explore the full portfolio, or get in touch for availability and pricing."}
            </p>
          </div>
          <div className="flex gap-3 md:justify-end">
            <Link to="/bio" className="btn rounded-full">
              {t("nav.bio") || "Bio"}
            </Link>
            <Link
              to="/contact"
              className="btn rounded-full bg-neutral-900 text-white hover:bg-black"
            >
              {t("nav.contact") || "Contact"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
