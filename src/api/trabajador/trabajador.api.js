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

  listarProximosCumples: (token) => {
    return instance.get(`/${model}/listar/cumples-trabajadores`, {
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

export default trabajadorAPI
