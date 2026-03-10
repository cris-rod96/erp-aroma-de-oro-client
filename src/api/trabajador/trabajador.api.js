import { instance } from '../base.api'

const model = 'personas'

const trabajadorAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/listar/trabajadores`, {
      headers: {
        'x-token': token,
      },
    })
  },

  agregarTrabajador: (data, token) => {
    return instance.post(`/${model}/agregar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarTrabajador: (id, data, token) => {
    return instance.patch(`/${model}/trabajadores/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  eliminarTrabajador: (id, token) => {
    return instance.delete(`/${model}/trabajadores/borrar-persona/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default trabajadorAPI
