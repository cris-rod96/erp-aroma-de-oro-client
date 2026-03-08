import { instance } from '../base.api'

const model = 'personas'

const productorAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/productores/todos`, {
      headers: {
        'x-token': token,
      },
    })
  },

  agregarProductor: (data, token) => {
    return instance.post(`/${model}/productores/agregar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarProductor: (id, data, token) => {
    return instance.patch(`/${model}/productores/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  eliminarProductor: (id, token) => {
    return instance.delete(`/${model}/productores/borrar-persona/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default productorAPI
