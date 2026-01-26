import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the entire page content to avoid styled-components SSR issues
const HomeContent = dynamic(() => import("../src/HomeContent"), { ssr: false });

export default function Home() {
  return <HomeContent />;
}
