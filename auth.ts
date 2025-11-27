import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { compareSync } from 'bcrypt-ts-edge'
import { eq } from 'drizzle-orm'
import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import db from './db/drizzle'
import { users } from './db/schema'

export const runtime = 'nodejs'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  // ✅ Vercel에서 MissingSecret 나는 거 방지
  secret: process.env.AUTH_SECRET,
  trustHost: true,

  adapter: DrizzleAdapter(db),

  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        // 1) credentials 방어
        if (!credentials) {
          console.log('❌ authorize: credentials 없음')
          return null
        }

        const email = (credentials.email as string | undefined)?.trim()
        const password = credentials.password as string | undefined

        console.log('📝 authorize - raw credentials:', credentials)
        console.log('📝 authorize - parsed:', { email, password })

        if (!email || !password) {
          console.log('❌ authorize: email 또는 password 비어있음')
          return null
        }

        // 2) DB에서 유저 조회
        const dbUser = (await db.query.users.findFirst({
          where: eq(users.email, email),
        })) as any

        console.log('authorize - dbUser:', dbUser)

        if (!dbUser) {
          console.log('authorize: 해당 email 유저 없음')
          return null
        }

        if (!dbUser.password) {
          console.log('authorize: dbUser.password 없음')
          return null
        }

        // 3) 비번 비교
        const isMatch = compareSync(password, dbUser.password as string)
        console.log('authorize - isMatch:', isMatch)

        if (!isMatch) {
          console.log('authorize: 비밀번호 불일치')
          return null
        }

        // 4) 성공
        console.log('authorize: 로그인 성공, user 반환')

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        } as any
      },
    }),
  ],

  callbacks: {
    session: async ({ session, user, trigger, token }: any) => {
      session.user.id = token.sub
      if (trigger === 'update') {
        session.user.name = user.name
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
