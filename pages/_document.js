import Document, { Html, Head, Main, NextScript } from "next/document";

class CustomDoc extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="FX Dashboard" />
        <meta
          name="description"
          content="A dashboard for Myfxbook portfolios account"
        />
        <meta name="theme-color" content="#262b34" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <Head />
        <body>
          <style global jsx>{`
            html,
            body,
            body > div {
              overflow-x: hidden;
              overflow-y: auto;
              height: 100%;
            }
            body,
            .wrapper {
              background-color: #262b34;
            }
          `}</style>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDoc;
