import { instance } from '../base.api'

const model = 'cajas'

const cajaAPI = {
  abriCaja: (token, data) => {
    return instance.post(`/${model}/abrir-caja`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  cerrarCaja: (id, token, data) => {
    return instance.patch(`/${model}/cerrar-caja/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarTodas: (token) => {
    return instance.get(`/${model}/listar/todas`, {
      headers: {
        'x-token': token,
      },
    })
  },

  obtenerCajaAbierta: (token) => {
    return instance.get(`/${model}/obtener-abierta`, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarCajasCerradas: (token) => {
    return instance.get(`/${model}/listar/cerradas`, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarCajasPorRango: (token, fechaInicio, fechaFin) => {},
}

export default cajaAPI
