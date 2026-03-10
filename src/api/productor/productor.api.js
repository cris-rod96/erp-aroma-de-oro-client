import { instance } from '../base.api'

const model = 'personas'

const productorAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/listar/productores`, {
      headers: {
        'x-token': token,
      },
    })
  },

  agregarProductor: (data, token) => {
    console.log(data)
    return instance.post(`/${model}/agregar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarProductor: (id, data, token) => {
    return instance.patch(`/${model}/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  eliminarProductor: (id, token) => {
    return instance.delete(`/${model}/borrar-persona/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default productorAPI
