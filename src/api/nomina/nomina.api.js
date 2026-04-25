import { instance } from '../base.api'

const model = 'nominas'

const nominaAPI = {
  pagarJornal: (data, token) => {
    return instance.post(`/${model}/pagar-jornal`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarPagos: (token) => {
    return instance.get(`/${model}/listar-todos`, {
      headers: {
        'x-token': token,
      },
    })
  },

  eliminarTrabajador: (id, token) => {
    return instance.delete(`/${model}/borrar-persona/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },

  recuperarTrabajador: (id, token) => {
    return instance.patch(
      `/${model}/recuperar-trabajador/${id}`,
      { estaActivo: true },
      {
        headers: {
          'x-token': token,
        },
      }
    )
  },
}

export default nominaAPI
