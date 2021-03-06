export const isDevelopment = process.env.NODE_ENV === 'development'

export const hideUiControls =
  Boolean(process.env.SHOW_CONTROLS) === true || isDevelopment
