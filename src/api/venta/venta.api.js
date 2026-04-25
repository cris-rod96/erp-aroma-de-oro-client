import { instance } from '../base.api'

const model = 'ventas'

const ventaAPI = {
  listarVentas: (token) => {
    return instance.get(`/${model}/listar/todas`, {
      headers: {
        'x-token': token,
      },
    })
  },

  registrarVenta: (data, token) => {
    return instance.post(`/${model}/registrar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default ventaAPI
