import { instance } from '../base.api'

const model = 'empresa'

const empresaAPI = {
  obtenerInformacion: (token) => {
    return instance.get(`/${model}/info`, {
      headers: {
        'x-token': token,
      },
    })
  },
  crearEmpresa: (token, data) => {
    return instance.post(`/${model}/create`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarInformacion: (id, data, token) => {
    return instance.patch(`/${model}/update/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default empresaAPI
