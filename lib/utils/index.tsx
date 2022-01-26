export const isDevelopment = process.env.NODE_ENV === 'development'

export const showUiControls =
  Boolean(process.env.SHOW_CONTROLS) || isDevelopment
