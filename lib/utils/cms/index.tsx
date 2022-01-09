const sanityClient = require('@sanity/client')

const client = sanityClient({
  projectId: 'xmrgv8k7',
  dataset: 'production',
  apiVersion: '2021-03-25', // use current UTC date - see "specifying API version"!
  // token: process.env.SANITY_TOKEN, // or leave blank for unauthenticated usage
  useCdn: true, // `false` if you want to ensure fresh data
})

export const apiFetch = async (assetName) => {
  return await fetch(`/api/${assetName}`).then((res) => res.json())
}

export default client
