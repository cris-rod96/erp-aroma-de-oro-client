import { instance } from '../base.api'

const model = 'anticipos'

const anticipoAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/listar-todos`, {
      headers: {
        'x-token': token,
      },
    })
  },
  crearAnticipo: (token, data) => {
    return instance.post(`/${model}/crear-anticipo`, data, {
      headers: {
        'x-token': token,
      },
    })
  },
  obtenerPendientesPorPersona: (id, token) => {
    return instance.get(`/${model}/obtener-pendientes/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizar: (token, data) => {
    return instance.patch(`/${model}/actualizar-anticipo`, data, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default anticipoAPI
