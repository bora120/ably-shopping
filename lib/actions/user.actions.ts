'use server'

import { signIn, signOut } from '@/auth'
import { signInFormSchema } from '../validator'

function isRedirectError(error: unknown): error is Error & { digest?: string } {
  return (
    error instanceof Error &&
    typeof (error as any).digest === 'string' &&
    (error as any).digest.startsWith('NEXT_REDIRECT')
  )
}

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    await signIn('credentials', user)

    return { success: true, message: 'Sign in successfully' }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    return { success: false, message: 'Invalid email or password' }
  }
}

export const SignOut = async () => {
  await signOut()
}
