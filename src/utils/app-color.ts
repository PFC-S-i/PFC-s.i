import Cookies from 'js-cookie'

const COOKIE_KEY = 'theme-color'

export const saveAppColor = (color: string) => {
  Cookies.set(COOKIE_KEY, color, { expires: 365 })
}

export const getCookie = (cookieName: string): string | undefined => {
  return Cookies.get(cookieName)
}
