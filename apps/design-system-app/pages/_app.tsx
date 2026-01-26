import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

// Dynamically import GlobalModalStyles to avoid styled-components SSR issues
const GlobalModalStyles = dynamic(
  () =>
    import("@easyblocks/design-system").then((mod) => mod.GlobalModalStyles),
  { ssr: false },
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Component {...pageProps} />
      <div
        id={"modalContainer"}
        style={{ position: "fixed", top: 0, left: 0, zIndex: 1000 }}
      ></div>
      <GlobalModalStyles />
    </div>
  );
}
