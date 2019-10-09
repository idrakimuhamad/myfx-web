import Document, { Html, Head, Main, NextScript } from 'next/document'

class CustomDoc extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css"
        />
        <Head />
        <body>
          <Main />
          <NextScript />
          <style global jsx>{`
            html,
            body {
              overflow-x: hidden;
              overflow-y: auto;
              height: 100vh;
            }
            body,
            .wrapper {
              background-color: #262b34;
            }
          `}</style>
        </body>
      </Html>
    )
  }
}

export default CustomDoc
