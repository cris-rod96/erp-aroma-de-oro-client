import { instance } from '../base.api'

const model = 'tickets'

const ticketAPI = {
  listarTickets: (token) => {
    return instance.get(`/${model}/listar/todos`, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarTicketsPendientes: (token) => {
    return instance.get(`/${model}/listar-por-clave?clave=estadoTicket&value=Pendiente`, {
      headers: {
        'x-token': token,
      },
    })
  },

  listarTicketsLiquidados: (token) => {
    return instance.get(`/${model}/listar-por-clave?clave=estadoTicket&value=Liquidado`, {
      headers: {
        'x-token': token,
      },
    })
  },

  obtenerInformacion: (id, token) => {
    return instance.get(`/${model}/listar/informacion/${id}`, {
      headers: {
        'x-token': token,
      },
    })
  },

  generarTicket: (data, token) => {
    return instance.post(`/${model}/crear-ticket`, data, {
      headers: {
        'x-token': token,
      },
    })
  },

  actualizarTicket: (id, data, token) => {
    return instance.patch(`/${model}/actualizar-informacion/${id}`, data, {
      headers: {
        'x-token': token,
      },
    })
  },
}

export default ticketAPI
