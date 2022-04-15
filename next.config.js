module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
  },
  env: {
    SHOW_CONTROLS: process.env.SHOW_CONTROLS,
    TRACKING_ID: process.env.TRACKING_ID,
  },
}
