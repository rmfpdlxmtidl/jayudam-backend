import { Express } from 'express'
import fetch from 'node-fetch'

import { poolQuery } from '../../database/postgres'
import { bBatonClientId, bBatonClientSecretKey, frontendUrl } from '../../utils/constants'
import { generateJWT } from '../../utils/jwt'
import { encodeSex } from './naver'
import { IGetBBatonUserResult } from './sql/getBBatonUser'
import getBBatonUser from './sql/getBBatonUser.sql'
import { IRegisterBBatonUserResult } from './sql/registerBBatonUser'
import registerBBatonUser from './sql/registerBBatonUser.sql'
import { BBatonUserInfo, isValidFrontendUrl } from '.'

export function setBBatonOAuthStrategies(app: Express) {
  // https://bauth.bbaton.com/oauth/authorize?client_id=JDJhJDA0JHRqNmFYckhyZXBWVGlKLnFkNzUvTGV5VWYwVGdyTEdXLkpYUzFP&redirect_uri=http://localhost:4000/oauth/bbaton&response_type=code&scope=read_profile
  // 필수 수집: BBaton 식별 번호, 성별, 성인여부, 연령대
  app.get('/oauth/bbaton', async (req, res) => {
    const code = req.query.code as string
    const backendUrl = req.headers.host as string
    if (!code || !backendUrl) return res.status(400).send('Bad Request')

    const bBatonUserToken = await fetchBBatonUserToken(code, backendUrl)
    if (bBatonUserToken.error) return res.status(400).send('Bad Request')

    const bBatonUserInfo = await fetchBBatonUserInfo(bBatonUserToken.access_token)
    if (bBatonUserInfo.error) return res.status(400).send('Bad Request')

    const referer = req.headers.referer as string
    if (!isValidFrontendUrl(referer)) return res.status(400).send('Bad Request')

    const frontendUrl = getFrontendUrl(referer)

    // 성인이 아닌 경우
    if (bBatonUserInfo.adult_flag !== 'Y') return res.redirect(`${frontendUrl}/oauth?isAdult=false`)

    const { rows: bBatonUserResult } = await poolQuery<IGetBBatonUserResult>(getBBatonUser, [
      bBatonUserInfo.user_id,
    ])
    const bBatonUser = bBatonUserResult[0]

    // 이미 소셜 로그인 정보가 존재하는 경우
    if (bBatonUser?.id) {
      const nickname = bBatonUser.nickname
      const querystring = new URLSearchParams({
        jwt: await generateJWT({ userId: bBatonUser.id }),
        ...(nickname && { nickname }),
      })
      return res.redirect(`${frontendUrl}/oauth?${querystring}`)
    }

    // 소셜 로그인 정보가 없는 경우
    const { rows } = await poolQuery<IRegisterBBatonUserResult>(registerBBatonUser, [
      null,
      null,
      null,
      bBatonUserInfo.adult_flag + bBatonUserInfo.birth_year,
      null,
      encodeSex(bBatonUserInfo.gender),
      '소개가 아직 없어요.',
      null,
      bBatonUserInfo.user_id,
    ])

    const querystring = new URLSearchParams({
      jwt: await generateJWT({ userId: rows[0].id }),
    })
    return res.redirect(`${frontendUrl}/oauth?${querystring}`)
  })
}

async function fetchBBatonUserToken(code: string, backendUrl: string) {
  const bBatonAuthString = `${bBatonClientId}:${bBatonClientSecretKey}`

  const response = await fetch('https://bauth.bbaton.com/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(bBatonAuthString).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: `${backendUrl}/oauth/bbaton`,
      code,
    }).toString(),
  })

  return response.json() as Promise<Record<string, any>>
}

async function fetchBBatonUserInfo(accessToken: string) {
  const response = await fetch('https://bapi.bbaton.com/v2/user/me', {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
  return response.json() as Promise<BBatonUserInfo>
}

function getFrontendUrl(referer?: string) {
  switch (referer) {
    case 'https://accounts.bbaton.com/':
    case 'https://bauth.bbaton.com/':
    case undefined:
      return frontendUrl
    default:
      return referer.substring(0, referer?.length - 1)
  }
}
