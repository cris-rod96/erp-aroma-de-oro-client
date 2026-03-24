import { instance } from '../base.api'

const model = 'abonos-por-pagar'

const abonosPorPagarApi = {
  registrarAbono: (token, data) => {
    return instance.post(`/${model}/abonar`, data, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default abonosPorPagarApi
