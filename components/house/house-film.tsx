"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { IconPlay } from "@/components/ui/icons";

// All optional. The house page fetches a banner for
// (page: 'house', section: 'film') and passes anything the admin authored.
// Any prop left undefined falls back to the hardcoded default below.
export type HouseFilmProps = {
  mediaType?: "image" | "video";
  videoSrc?: string;
  image?: string;    // used as poster when mediaType === 'video', or as a still image
  title?: string;    // big centered caption inside the frame
  subtitle?: string; // small all-caps line below the title (e.g. "Chapter I · A Film")
};

const DEFAULT_VIDEO_SRC = "/images/living-room1.mp4";
const DEFAULT_POSTER = "/images/Living-room1.png";
const DEFAULT_TITLE = "The Room, Composed";
const DEFAULT_SUBTITLE = "Chapter I · A Film";

export function HouseFilm({
  mediaType,
  videoSrc,
  image,
  title,
  subtitle
}: HouseFilmProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Resolve: backend values win. Routing: if admin uploaded a video URL,
  // play it. If only an image, show it as a still. Otherwise, defaults.
  const resolvedMediaType: "image" | "video" =
    mediaType ?? (videoSrc ? "video" : image ? "image" : "video");
  const resolvedVideoSrc = videoSrc || DEFAULT_VIDEO_SRC;
  const resolvedPoster = image || DEFAULT_POSTER;
  const resolvedTitle = title || DEFAULT_TITLE;
  const resolvedSubtitle = subtitle || DEFAULT_SUBTITLE;

  // Belt-and-braces muted autoplay — same pattern used elsewhere in the site.
  useEffect(() => {
    if (resolvedMediaType !== "video") return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    const attempt = el.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => void 0);
    }
  }, [resolvedMediaType, resolvedVideoSrc]);

  return (
    <section
      className="relative bg-ink py-12 text-chalk md:py-16"
      aria-labelledby="house-film-heading"
    >
      <div className="mx-auto max-w-editorial px-6 md:px-14">
        <motion.figure
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="group relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-hidden bg-onyx"
        >
          {resolvedMediaType === "video" ? (
            <>
              <video
                ref={videoRef}
                src={resolvedVideoSrc}
                poster={resolvedPoster}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label={resolvedTitle}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="h-full w-full object-cover"
              />
              {/* Play glyph — fades out once playback begins */}
              <span
                className={clsx(
                  "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-silk",
                  playing ? "opacity-0" : "opacity-100"
                )}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/30 ring-1 ring-chalk/70 backdrop-blur-md md:h-16 md:w-16">
                  <IconPlay />
                </span>
              </span>
            </>
          ) : (
            // Image-only branch — rendered when admin uploads an image but
            // no video URL. Keeps the figure framing intact.
            <img
              src={resolvedPoster}
              alt={resolvedTitle}
              className="h-full w-full object-cover"
            />
          )}

          {/* Bottom gradient so the caption reads on any footage */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />

          {/* Overlaid caption — bottom-centered */}
          <figcaption className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-center text-chalk md:bottom-10">
            <h3
              id="house-film-heading"
              className="font-display text-[clamp(0.875rem,1.4vw,1.375rem)] font-bold uppercase tracking-[0.04em]"
            >
              {resolvedTitle}
            </h3>
            <p className="text-[9px] uppercase tracking-[0.28em] text-chalk/80 md:text-[10px]">
              {resolvedSubtitle}
            </p>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
