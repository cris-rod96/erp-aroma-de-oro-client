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

  cerrarCaja: (id, token) => {
    return instance.patch(
      `/${model}/cerrar-caja/${id}`,
      {},
      {
        headers: {
          'x-token': token,
        },
      }
    )
  },

  listarTodas: (token) => {
    return instance.get(`/${model}/listar/todas`, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarCajasAbiertas: (token) => {
    return instance.get(`/${model}/listar/abiertas`, {
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
