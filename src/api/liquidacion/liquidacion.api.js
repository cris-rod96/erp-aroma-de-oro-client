import { instance } from '../base.api'

const model = 'liquidaciones'

const liquidacionAPI = {
  listarTodas: (token) => {
    return instance.get(`/${model}/listar/todas`, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarPorProductor: (token, ProductorId) => {
    return instance.get(`/${model}/listar/productor/${ProductorId}`, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarPorUsuario: (token, UsuarioId) => {
    return instance.get(`/${model}/listar/usuario/${UsuarioId}`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default liquidacionAPI
