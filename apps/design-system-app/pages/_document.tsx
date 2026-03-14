import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";
import React from "react";

// NOTE: goober CSS extraction for SSR is handled by StyledComponentsRegistry
// (lib/registry.tsx) via useServerInsertedHTML. Do NOT call extractCss() here
// as well — that would compete for the same goober buffer and produce either
// missing or duplicate styles.

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;
    ctx.renderPage = () => originalRenderPage();
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
