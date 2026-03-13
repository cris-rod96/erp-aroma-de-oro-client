import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCajaStore = create(
  persist(
    (set) => ({
      caja: null, // Objeto con la info de la caja abierta
      isCajaAbierta: false,

      // Acción para establecer la caja al abrirla o verificarla
      setCaja: (cajaData) =>
        set({
          caja: cajaData,
          isCajaAbierta: !!cajaData,
        }),

      // Acción para actualizar solo campos específicos (ej. el saldo tras una compra)
      updateCajaData: (newData) =>
        set((state) => ({
          caja: state.caja ? { ...state.caja, ...newData } : null,
        })),

      // Acción para cerrar la caja o limpiar el estado
      clearCaja: () =>
        set({
          caja: null,
          isCajaAbierta: false,
        }),
    }),
    {
      name: 'caja-storage', // Nombre para el localStorage independiente
    }
  )
)
