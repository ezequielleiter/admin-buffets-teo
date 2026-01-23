// Ejemplo de configuración NextAuth para tu backend
// Este archivo debería estar en tu backend en: pages/api/auth/[...nextauth].js o app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          // Aquí va tu lógica de autenticación
          // Ejemplo: validar con tu base de datos
          const user = await validateUserCredentials(
            credentials?.email, 
            credentials?.password
          )
          
          if (user) {
            // Retornar el objeto usuario que se guardará en la sesión
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              // otros campos que necesites
            }
          }
          
          // Si la autenticación falla, retornar null
          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  
  pages: {
    signIn: '/login', // Personaliza la página de login si quieres
  },
  
  callbacks: {
    async jwt({ token, user }) {
      // Persistir el usuario en el token justo después del signin
      if (user) {
        token.user = user
      }
      return token
    },
    
    async session({ session, token }) {
      // Enviar propiedades al cliente
      session.user = token.user
      return session
    },
  },
  
  // Configuración de cookies para el frontend externo
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
})

// Función ejemplo para validar credenciales
async function validateUserCredentials(email, password) {
  // Implementa tu lógica aquí:
  // - Buscar usuario por email en tu base de datos  
  // - Verificar password (bcrypt, etc.)
  // - Retornar datos del usuario si es válido
  
  // Ejemplo de uso de parámetros:
  console.log('Validating user:', email);
  console.log('Password provided:', !!password);
  
  // Ejemplo:
  // const user = await User.findOne({ email })
  // if (user && await bcrypt.compare(password, user.hashedPassword)) {
  //   return {
  //     id: user.id,
  //     email: user.email,
  //     name: user.name
  //   }
  // }
  // return null
}