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

      setAdminData: (newData) =>
        set((state) => ({
          adminData: { ...state.adminData, ...newData },
          // También actualizamos isAdmin por si cambió el rango
          isAdmin: newData.esAdministrador !== undefined ? newData.esAdministrador : state.isAdmin,
        })),

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
