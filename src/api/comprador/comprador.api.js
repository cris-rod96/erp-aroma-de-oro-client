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

  agregarProductor: (data, token) => {
    return instance.post(`/${model}/compradores/agregar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarProductor: (id, data, token) => {
    return instance.patch(`/${model}/compradores/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  eliminarProductor: (id, token) => {
    return instance.delete(`/${model}/compradores/borrar-persona/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default compradorAPI
