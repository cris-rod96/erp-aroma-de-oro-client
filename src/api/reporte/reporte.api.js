import { instance } from '../base.api.js'

const model = 'reportes'

const reporteAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/listar/todos`, {
      headers: {
        'x-token': token,
      },
    })
  },

  subirReporte: (token, formData) => {
    return instance.post(`/${model}/subir-reporte`, formData, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default reporteAPI
