import { useState, useEffect, useMemo } from 'react'
import { cajaAPI } from '../api/index.api'

export const useCajas = (token) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClosingModal, setIsClosingModal] = useState(false)
  const [cajas, setCajas] = useState([])
  const [error, setError] = useState(null) // NUEVO: Para capturar 403 o 401
  const [montoApertura, setMontoApertura] = useState('')
  const [montoFisicoCierre, setMontoFisicoCierre] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const fetchCajas = async () => {
    if (!token) return // Seguridad preventiva

    setFetching(true)
    setError(null) // Limpiamos errores anteriores
    try {
      const resp = await cajaAPI.listarTodas(token)
      setCajas(resp.data.cajas || [])
    } catch (error) {
      console.error('Error al listar cajas', error)
      // Capturamos el mensaje del backend (ej: "No tienes permisos")
      const msg = error.response?.data?.message || 'Error al sincronizar cajas'
      setError(msg)
    } finally {
      setFetching(false)
    }
  }

  // Dependencia del token por si cambia la sesión
  useEffect(() => {
    fetchCajas()
  }, [token])

  const cajaActiva = useMemo(() => {
    return cajas.find((c) => c.estado === 'Abierta')
  }, [cajas])

  return {
    isModalOpen,
    setIsModalOpen,
    isClosingModal,
    setIsClosingModal,
    cajas,
    error, // EXPORTAMOS EL ERROR
    montoApertura,
    setMontoApertura,
    montoFisicoCierre,
    setMontoFisicoCierre,
    loading,
    setLoading,
    fetching,
    cajaActiva,
    fetchCajas,
  }
}
