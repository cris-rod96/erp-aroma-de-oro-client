import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useEmpresaStore = create(
  persist(
    (set) => ({
      empresa: null,

      setEmpresa: (data) =>
        set({
          empresa: data,
        }),

      clearEmpresa: () =>
        set({
          empresa: null,
        }),
    }),
    {
      name: 'empresa-storage',
    }
  )
)
