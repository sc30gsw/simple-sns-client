'use client'
import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
  token: string
  user: { id: string; email: string; username: string } | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: '',
  user: null,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string>('')
  const [user, setUser] = useState<{
    id: string
    email: string
    username: string
  } | null>(null)

  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)

      const getLoginUser = async () => {
        try {
          const response = await fetch(
            'https://simple-sns-api.onrender.com/api/auth/find',
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storedToken}`,
              },
            },
          )

          const res = await response.json()
          if (!response.ok) {
            alert(res.msg)
            router.push('/auth/login')
            return
          }

          setUser(res.user)
        } catch (err) {
          console.log(err)
          router.push('/auth/login')
        }
      }

      getLoginUser()
    }
  }, [token, router])

  const login = (newToken: string) => {
    localStorage.setItem('auth_token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    router.push('/')
    setUser(null)
    setToken('')
  }

  const value = {
    token,
    user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
