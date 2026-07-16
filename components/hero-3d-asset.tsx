"use client";

import { useTilt } from "@/hooks/use-tilt";

export default function Hero3DAsset() {
  const { ref, handlePointerMove, handlePointerLeave } = useTilt(12);

  return (
    <div ref={ref} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} className="hero-3d-tilt relative w-full h-full flex items-center justify-center select-none">
      <div className="hero-3d-scene">
        <div className="hero-3d-group">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-ring hero-ring-3" />
          <div className="hero-ring hero-ring-4" />
          <div className="hero-core" />
          <div className="hero-core-pulse" />
          <div className="hero-orbit">
            <div className="hero-orbit-particle" />
            <div className="hero-orbit-particle hero-orbit-particle-2" />
            <div className="hero-orbit-particle hero-orbit-particle-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
