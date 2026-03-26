import { instance } from '../base.api'

const model = 'usuarios'

const usuarioAPI = {
  listarUsuarios: (token) => {
    return instance.get(`/${model}/todos`, {
      headers: {
        'x-token': token,
      },
    })
  },

  agregarUsuario: (data, token) => {
    return instance.post(`/${model}/agregar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarUsuario: (id, data, token) => {
    return instance.patch(`/${model}/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  eliminarUsuario: (id, token) => {
    return instance.delete(`/${model}/borrar-usuario/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarClave: (id, clave, token) => {
    return instance.patch(
      `/${model}/actualizar-clave/${id}`,
      { clave },
      {
        headers: {
          'x-token': token,
        },
      }
    )
  },

  recuperarUsuario: (token, id) => {
    return instance.patch(
      `/${model}/recuperar-usuario/${id}`,
      {},
      {
        headers: {
          'x-token': token,
        },
      }
    )
  },
}

export default usuarioAPI
