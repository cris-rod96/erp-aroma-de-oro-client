import { useState, useEffect, useMemo } from 'react'
import { cajaAPI } from '../api/index.api'
import Swal from 'sweetalert2'

export const useCajas = (token) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClosingModal, setIsClosingModal] = useState(false)
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false) // NUEVO: Modal Venta Rápida
  const [cajas, setCajas] = useState([])
  const [error, setError] = useState(null)
  const [montoApertura, setMontoApertura] = useState('')
  const [montoFisicoCierre, setMontoFisicoCierre] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const fetchCajas = async () => {
    if (!token) return

    setFetching(true)
    setError(null)
    try {
      const resp = await cajaAPI.listarTodas(token)
      setCajas(resp.data.cajas || [])
    } catch (error) {
      console.error('Error al listar cajas', error)
      const msg = error.response?.data?.message || 'Error al sincronizar cajas'
      setError(msg)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchCajas()
  }, [token])

  const cajaActiva = useMemo(() => {
    return cajas.find((c) => c.estado === 'Abierta')
  }, [cajas])

  // --- NUEVA FUNCIÓN PARA PROCESAR VENTAS PEQUEÑAS ---
  const ejecutarVentaRapida = async (data) => {
    setLoading(true)
    try {
      const resp = await cajaAPI.registrarVentaRapida(token, data)
      if (resp.status === 201) {
        await fetchCajas() // Refrescamos la tabla de movimientos
        return { success: true, data: resp.data }
      }
    } catch (err) {
      console.error('Error en venta rápida:', err)
      const msg = err.response?.data?.message || 'Error al procesar la venta'
      Swal.fire({
        icon: 'error',
        title: 'Error de Inventario',
        text: msg,
        confirmButtonColor: '#000',
      })
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return {
    // Estados de Modales
    isModalOpen,
    setIsModalOpen,
    isClosingModal,
    setIsClosingModal,
    isVentaModalOpen, // Exportado
    setIsVentaModalOpen, // Exportado

    // Datos y Control
    cajas,
    error,
    montoApertura,
    setMontoApertura,
    montoFisicoCierre,
    setMontoFisicoCierre,
    loading,
    setLoading,
    fetching,
    cajaActiva,

    // Funciones
    fetchCajas,
    ejecutarVentaRapida, // Exportada para usar en el submit del modal
  }
}
