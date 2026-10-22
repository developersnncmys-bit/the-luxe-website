"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconPlay } from "@/components/ui/icons";

// All optional. The home page server component fetches a banner for
// (page: 'home', section: 'film') and passes anything the admin authored.
// Any prop left undefined falls back to the hardcoded default below.
export type ChapterFilmProps = {
  mediaType?: "image" | "video";
  videoSrc?: string;
  image?: string;    // used as poster when mediaType === 'video', or as a still image
  eyebrow?: string;  // small label above the title (default "Film")
  title?: string;
  subtitle?: string;
  body?: string;
};

const DEFAULT_VIDEO_SRC = "/images/dining-video.mp4";
const DEFAULT_POSTER = "/images/dining.png";
const DEFAULT_EYEBROW = "Film";
const DEFAULT_TITLE = "A Conversation at the Studio";
const DEFAULT_SUBTITLE = "With the Artisan";
const DEFAULT_BODY =
  "An evening at the studio with the artisan who shaped this collection — on the pieces that never date, and the quiet work of making them.";

export function ChapterFilm({
  mediaType,
  videoSrc,
  image,
  eyebrow,
  title,
  subtitle,
  body
}: ChapterFilmProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Resolve: backend-provided values win over the hardcoded defaults.
  // Media routing: if admin uploaded a video URL, play the video. If admin
  // uploaded only an image, show it as a still. Otherwise, defaults.
  const resolvedMediaType: "image" | "video" =
    mediaType ?? (videoSrc ? "video" : image ? "image" : "video");
  const resolvedVideoSrc = videoSrc || DEFAULT_VIDEO_SRC;
  const resolvedPoster = image || DEFAULT_POSTER;
  const resolvedEyebrow = eyebrow || DEFAULT_EYEBROW;
  const resolvedTitle = title || DEFAULT_TITLE;
  const resolvedSubtitle = subtitle || DEFAULT_SUBTITLE;
  const resolvedBody = body || DEFAULT_BODY;

  // Muted autoplay — same belt-and-braces pattern as chapter-object's VideoCell.
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
      className="relative bg-ink pt-24 pb-40 md:pt-32 md:pb-56"
      aria-labelledby="chapter-film-heading"
    >
      <motion.figure
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl px-6 md:px-10"
      >
        <div className="group relative aspect-[4/3] w-full overflow-hidden bg-onyx">
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
              <span
                className={clsx(
                  "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-silk",
                  playing ? "opacity-0" : "opacity-100"
                )}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/30 ring-1 ring-chalk/70 backdrop-blur-md md:h-20 md:w-20">
                  <IconPlay />
                </span>
              </span>
            </>
          ) : (
            // Image-only branch — rendered when the admin uploads an image
            // but no video URL. Keeps the figure framing intact.
            <img
              src={resolvedPoster}
              alt={resolvedTitle}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <figcaption className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 text-center text-chalk md:mt-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-chalk/60 md:text-[11px]">
            {resolvedEyebrow}
          </p>
          <h3
            id="chapter-film-heading"
            className="font-display text-[clamp(1.25rem,2vw,2rem)] font-bold uppercase tracking-[0.02em]"
          >
            {resolvedTitle}
          </h3>
          <p className="text-[11px] uppercase tracking-[0.28em] text-chalk/70">
            {resolvedSubtitle}
          </p>
          <p className="mt-4 max-w-lg text-[13px] leading-[1.8] text-chalk/70">
            {resolvedBody}
          </p>
        </figcaption>
      </motion.figure>
    </section>
  );
}
