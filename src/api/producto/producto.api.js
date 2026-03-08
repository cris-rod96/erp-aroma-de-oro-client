import { instance } from '../base.api'

const model = 'productos'

const productoAPI = {
  listarProductos: (token) => {
    return instance.get(`/${model}/todos`, {
      headers: {
        'x-token': token,
      },
    })
  },

  crearProducto: (data, token) => {
    return instance.post(`/${model}/agregar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarProducto: (id, data, token) => {
    return instance.patch(`/${model}/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default productoAPI
