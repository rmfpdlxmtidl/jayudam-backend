import jsonwebtoken, { type JwtPayload } from 'jsonwebtoken'

import { jwtSecretKey } from './constants'

const { sign, verify } = jsonwebtoken

export function generateJWT<T extends Record<string, unknown>>(payload: T, expiresIn = '7d') {
  return new Promise<string>((resolve, reject) => {
    sign(payload, jwtSecretKey, { expiresIn }, (err, token) => {
      if (err) reject(err)

      resolve(token as string)
    })
  })
}

export function verifyJWT<T>(token: string) {
  return new Promise<T & JwtPayload>((resolve, reject) => {
    verify(token, jwtSecretKey, { algorithms: ['HS256'] }, (err, decoded) => {
      // JWT가 아니거나, JWT 서명이 유효하지 않거나, JWT 유효기간이 만료됐을 때
      if (err) reject(err)

      resolve(decoded as T & JwtPayload)
    })
  })
}
