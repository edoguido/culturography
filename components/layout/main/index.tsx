import Head from 'next/head'

// Title : a title should be maximum 65 characters or else will be clipped in the Google results
// Meta description : a meta description should be maximum 155 characters or else will be clipped in the Google results
// og:title : should be maximum 35 characters or else will be clipped in the Rich Preview
// og:description : should be maximum 65 characters or else will be clipped in the Rich Preview
// og:url : the full link to your website address
// og: image : a JPG or PNG image, minimum dimensions of 300 x 200 pixels are advised
// favicon : a small icon, this can be your logo and is usually 32 x 32 pixels

const DefaultLayout = ({ children }) => {
  return (
    <>
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
      <div className="text-white">{children}</div>
    </>
  )
}

export default DefaultLayout
