import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { gastoAPI } from '../api/index.api'

export const useGastos = (token, cajaId) => {
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchGastos = useCallback(async () => {
    if (!token) return
    try {
      const res = await gastoAPI.listarGastos(token)
      setGastos(res.data)
    } catch (error) {
      console.error('Error al cargar gastos:', error)
    }
  }, [token])

  const guardarGasto = async (formData, callback) => {
    setLoading(true)
    try {
      const res = await gastoAPI.crearGasto({ ...formData, CajaId: cajaId }, token)
      if (res.status === 201) {
        Swal.fire('¡Éxito!', `Gasto ${res.data.gasto.codigo} registrado`, 'success')
        fetchGastos()
        if (callback) callback(res.data.caja) // Para actualizar el saldo de la caja en el store
        return true
      }
    } catch (error) {
      console.log(error.message)
      Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar', 'error')
    } finally {
      setLoading(false)
    }
    return false
  }

  return { gastos, loading, fetchGastos, guardarGasto }
}
