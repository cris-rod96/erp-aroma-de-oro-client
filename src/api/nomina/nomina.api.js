import { instance } from '../base.api'

const model = 'nominas'

const nominaAPI = {
  pagarJornal: (data, token) => {
    return instance.post(`/${model}/pagar-jornal`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarPagos: (token) => {
    return instance.get(`/${model}/listar-todos`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default nominaAPI
