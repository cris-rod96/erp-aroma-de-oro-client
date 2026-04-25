import { instance } from '../base.api'

const model = 'movimientos'

const movimientoAPI = {
  listarTodos: (token) => {
    return instance.get(`/${model}/listar/todos`, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default movimientoAPI
