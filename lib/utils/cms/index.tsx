import { isDevelopment } from '../index'
import SanityClient from '@sanity/client'

const client = SanityClient({
  projectId: 'xmrgv8k7',
  dataset: 'production',
  apiVersion: '2022-02-03', // use current UTC date - see "specifying API version"!
  // token: process.env.SANITY_TOKEN, // or leave blank for unauthenticated usage
  useCdn: !isDevelopment, // `false` if you want to ensure fresh data
})

export const apiFetch = async (assetName) => {
  return await fetch(`/api/${assetName}`).then((res) => res.json())
}

export default client
