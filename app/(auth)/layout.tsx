"use client";
import React, { ReactNode } from "react";
import DotGrid from "@/components/DotGrid";
const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full">
      <DotGrid
        dotSize={5}
        gap={15}
        baseColor="#808080"
        activeColor="#fff"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
        style={{ position: "absolute", inset: 0 }}
      />
      <div className="relative z-10 flex justify-center items-center md:px-[20%] w-full min-h-screen max-sm:px-4 max-sm:py-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
