import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      estaHabilitado: false,
      data: null,

      login: (data) =>
        set({
          token: data.token,
          estaHabilitado: data.usuario.rol === 'Administrador' || data.usuario.rol === 'Contador',
          data: data.usuario,
        }),

      setAdminData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
          // También actualizamos isAdmin por si cambió el rango
          estaHabilitado:
            newData.rol !== undefined
              ? newData.rol === 'Administrador' || newData.rol === 'Contador'
              : state.estaHabilitado,
        })),

      logout: () =>
        set({
          token: null,
          estaHabilitado: null,
          data: null,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
