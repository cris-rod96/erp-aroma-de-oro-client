import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAdmin: null,
      adminData: null,

      login: (usuario) =>
        set({
          token: usuario.token,
          isAdmin: usuario.esAdministrador,
          adminData: usuario,
        }),

      logout: () =>
        set({
          token: null,
          isAdmin: null,
          adminData: null,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
