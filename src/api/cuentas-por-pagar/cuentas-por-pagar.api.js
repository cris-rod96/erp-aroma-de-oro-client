import { instance } from '../base.api'

const model = 'cuentas-por-pagar'

const cuentasPorPagarAPI = {
  // Obtener todas las obligaciones pendientes y pagadas
  listarTodas: (token) => {
    return instance.get(`/${model}/todas`, {
      headers: {
        'x-token': token,
      },
    })
  },

  // Registrar un abono a una liquidación específica
  registrarAbono: (id, data, token) => {
    return instance.patch(`/${model}/abonar/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  // Obtener historial de pagos de una cuenta por pagar
  obtenerHistorial: (id, token) => {
    return instance.get(`/${model}/historial/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default cuentasPorPagarAPI
