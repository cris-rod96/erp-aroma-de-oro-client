import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAdmin: null,
      adminData: null,

      login: (data) =>
        set({
          token: data.token,
          isAdmin: data.usuario.esAdministrador,
          adminData: data.usuario,
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
