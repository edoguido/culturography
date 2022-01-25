const isDevelopment =
  process.env.SHOW_CONTROLS || process.env.NODE_ENV !== 'development'

export default isDevelopment
