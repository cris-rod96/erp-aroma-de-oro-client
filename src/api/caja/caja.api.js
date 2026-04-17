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

  registrarInyeccionBanco: (token, data) => {
    return instance.post(`/${model}/inyectar-banco`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  registrarVentaRapida: (token, data) => {
    return instance.post(`/${model}/inyectar-venta`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  reAbrirCaja: (token, id) => {
    return instance.patch(
      `/${model}/reabrir-caja/${id}`,
      {},
      {
        headers: {
          'x-token': token,
        },
      }
    )
  },

  actualizarDataCaja: (token, id, montoCierre) => {
    return instance.patch(
      `/${model}/actualizar-data/${id}`,
      { montoCierre },
      {
        headers: {
          'x-token': token,
        },
      }
    )
  },
}

export default cajaAPI
