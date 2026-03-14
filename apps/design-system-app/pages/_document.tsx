import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";
import { extractCss, setup } from "goober";
import React from "react";

// Ensure goober is initialized for SSR
setup(React.createElement);

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () => originalRenderPage();

    const initialProps = await Document.getInitialProps(ctx);
    const css = extractCss();

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          {css && (
            <style id="goober" dangerouslySetInnerHTML={{ __html: css }} />
          )}
        </>
      ),
    };
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
