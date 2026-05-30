import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { getUserByEmail, verifyPassword } from './users'

const GOOGLE_CLIENT_ID     = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ''
export const IS_GOOGLE_CONFIGURED = !!(
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET &&
  GOOGLE_CLIENT_ID !== 'your_google_client_id_here'
)

export const authOptions: NextAuthOptions = {
  providers: [
    ...(IS_GOOGLE_CONFIGURED
      ? [GoogleProvider({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET })]
      : []
    ),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email)
        if (!user) return null
        const valid = await verifyPassword(credentials.password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id    = (user as { id?: string }).id ?? token.sub ?? ''
        token.name  = user.name
        token.email = user.email
      }
      if (!token.id) token.id = token.sub ?? ''
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
        session.user.name  = token.name  as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
