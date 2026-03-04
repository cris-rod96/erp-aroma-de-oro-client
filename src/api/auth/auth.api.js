import { instance } from '../base.api'

const model = 'auth'

const authAPI = {
  loginWithCredentials: ({ cedula, clave }) => {
    return instance.post(`/${model}/iniciar-sesion`, { cedula, clave })
  },
}

export default authAPI
