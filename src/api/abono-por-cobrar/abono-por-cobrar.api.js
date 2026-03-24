import { instance } from '../base.api'

const model = 'abonos-por-cobrar'

const abonoPorCobrarAPI = {
  obtenerHistorialPorCxc: (id, token) => {
    return instance.get(`/${model}/historial/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default abonoPorCobrarAPI
