import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAdmin: null,
      data: null,

      login: (data) =>
        set({
          token: data.token,
          isAdmin: data.usuario.rol === 'Administrador',
          data: data.usuario,
        }),

      setAdminData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
          // También actualizamos isAdmin por si cambió el rango
          isAdmin: newData.rol !== undefined ? newData.rol === 'Administrador' : state.isAdmin,
        })),

      logout: () =>
        set({
          token: null,
          isAdmin: null,
          data: null,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
