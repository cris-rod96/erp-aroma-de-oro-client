import { instance } from '../base.api.js'

const model = 'gastos'

const gastoAPI = {
  crearGasto: (token, data) => {
    return instance.post(`/${model}/crear-gasto`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarGastos: (token) => {
    return instance.get(`/${model}/listar-gastos`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default gastoAPI
