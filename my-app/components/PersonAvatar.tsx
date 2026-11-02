"use client";

import React, { useEffect, useState } from "react";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

/**
 * A person's uploaded photo, or their initials when there is none (or it fails
 * to load) — never a stock photo of someone else. `className` sets the size and
 * shape, which apply to both the photo and the initials.
 */
export function PersonAvatar({
  src,
  name,
  className,
  textClass = "text-[14px]",
}: {
  src?: string | null;
  name: string;
  className: string;
  textClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center bg-[#fff1d9] font-semibold text-[#c2760a] ${textClass} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
