"use client";

import Image from "next/image";
import React from "react";

type Props = {
  src?: string;         // путь к лого
  size?: number;        // размер в px
  intervalMs?: number;  // период между «сверками»
};

export default function GlintLogo({
  src = "/images/logo.png",
  size = 140,
  intervalMs = 4000,
}: Props) {
  return (
    <div
      className="relative inline-block select-none"
      style={{ width: size, height: size }}
      aria-label="Company logo"
    >
      {/* Сам логотип + мягкий glow-пульс */}
      <Image
        src={src}
        alt="Logo"
        fill
        priority
        className="object-contain gl-logo-glow"
      />
    </div>
  );
}
