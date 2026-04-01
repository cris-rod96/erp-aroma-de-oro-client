import { instance } from '../base.api'

const model = 'personas'

const compradorAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/listar/compradores`, {
      headers: {
        'x-token': token,
      },
    })
  },

  agregarComprador: (data, token) => {
    return instance.post(`/${model}/agregar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarComprador: (id, data, token) => {
    return instance.patch(`/${model}/compradores/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  eliminarComprador: (id, token) => {
    return instance.delete(`/${model}/borrar-persona/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },

  recuperarComprador: (id, token) => {
    return instance.patch(
      `/${model}/recuperar-comprador/${id}`,
      { estaActivo: true },
      {
        headers: {
          'x-token': token,
        },
      }
    )
  },
}

export default compradorAPI
