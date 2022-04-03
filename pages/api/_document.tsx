import { Html, Head, Main, NextScript } from 'next/document'

export default function NextDocument() {
  return (
    <Html>
      <Head>
        <title>Culturography</title>
        <meta
          name="description"
          content="A digital method that helps brands engage in meaningful partnerships
  with communities that matter to them"
        />
        <meta
          name="og:description"
          content="A digital method that helps brands engage in meaningful partnerships
  with communities that matter to them"
        />
        <meta name="url" content="https://culturography.com" />
        <meta name="image" content="/media_banner_b.png" />
        <meta name="og:image" content="/media_banner_b.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
