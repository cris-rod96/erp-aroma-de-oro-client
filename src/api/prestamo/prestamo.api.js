import { instance } from '../base.api'

const model = 'prestamos'

const prestamoAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/listar-todos`, {
      headers: {
        'x-token': token,
      },
    })
  },

  crearPrestamo: (token, data) => {
    return instance.post(`/${model}/crear-prestamo`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarPrestamo: (token, data) => {
    return instance.patch(`/${model}/actualizar-prestamo`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  prestarTercero: (token, data) => {
    return instance.post(`/${model}/prestamo-terceros`, data, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default prestamoAPI
