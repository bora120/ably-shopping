import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'

import CredentialsSignInForm from './credentials-signin-form'

export const metadata: Metadata = {
  title: `Sign In - ${APP_NAME}`,
}

// ✅ 여기 부분만 고친 버전
export default async function SignIn(props: {
  searchParams?: Promise<{ callbackUrl?: string }>
}) {
  // searchParams를 먼저 await 해서 꺼내쓰기
  const searchParams = (await props.searchParams) ?? {}
  const callbackUrl = searchParams.callbackUrl ?? '/'

  const session = await auth()
  if (session) {
    return redirect(callbackUrl)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/assets/icons/logo.svg"
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
            />
          </Link>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Select a method to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  )
}
