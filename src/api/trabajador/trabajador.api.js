import { instance } from '../base.api'

const model = 'personas'

const trabajadorAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/trabajadores/todos`, {
      headers: {
        'x-token': token,
      },
    })
  },

  agregarProductor: (data, token) => {
    return instance.post(`/${model}/trabajadores/agregar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarProductor: (id, data, token) => {
    return instance.patch(`/${model}/trabajadores/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  eliminarProductor: (id, token) => {
    return instance.delete(`/${model}/trabajadores/borrar-persona/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default trabajadorAPI
