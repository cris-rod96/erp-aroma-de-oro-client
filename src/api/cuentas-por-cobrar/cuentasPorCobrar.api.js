import { instance } from '../base.api'

const model = 'cuentas-por-cobrar' // Ajusta según tu ruta en el backend

const cuentasPorCobrarAPI = {
  /**
   * Obtiene todas las cuentas pendientes de cobro
   */
  listarTodas: (token) => {
    return instance.get(`/${model}/todas`, {
      headers: {
        'x-token': token,
      },
    })
  },

  /**
   * Obtiene una cuenta específica por su ID o por VentaId
   */
  obtenerPorId: (id, token) => {
    return instance.get(`/${model}/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },

  /**
   * Registra un nuevo cobro/abono.
   * El objeto data debe contener: montoEfectivo, montoCheque, montoTransferencia, etc.
   */
  registrarCobro: (id, data, token) => {
    return instance.patch(`/${model}/cobrar/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  /**
   * Obtiene el historial de movimientos de una cuenta (si tienes esa tabla/relación)
   */
  obtenerHistorial: (id, token) => {
    return instance.get(`/${model}/historial/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },

  /**
   * Reporte de cartera total (Suma de todos los montosPorCobrar)
   */
  obtenerResumenCartera: (token) => {
    return instance.get(`/${model}/resumen`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default cuentasPorCobrarAPI
