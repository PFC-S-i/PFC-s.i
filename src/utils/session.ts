import { jwtDecode } from 'jwt-decode'

import { IUserLogin } from '@/types'

class AuthUtils {
  getDecodedToken(token: string) {
    try {
      const decodedToken = jwtDecode<IUserLogin>(token)

      const isValid = this.isTokenValid(decodedToken.exp)

      if (!isValid) return null

      return decodedToken
    } catch (error: unknown) {
      console.error(error)
      return null
    }
  }

  private isTokenValid(tokenExp: number) {
    const currentDate = new Date()

    // JWT exp is in seconds
    if (tokenExp * 1000 < currentDate.getTime()) {
      return false
    }

    return true
  }
}

const TokenAuthUtils = new AuthUtils()
export { TokenAuthUtils }
