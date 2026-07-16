"use client";

import { useTilt } from "@/hooks/use-tilt";
import { ReactNode } from "react";

export default function TiltWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, handlePointerMove, handlePointerLeave } = useTilt();
  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
