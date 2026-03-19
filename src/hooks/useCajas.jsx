import { useState } from 'react'
import { cajaAPI } from '../api/index.api'
import { useEffect } from 'react'
import { useMemo } from 'react'

export const useCajas = (token) => {
  console.log(token)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClosingModal, setIsClosingModal] = useState(false)
  const [cajas, setCajas] = useState([])
  const [montoApertura, setMontoApertura] = useState('')
  const [montoFisicoCierre, setMontoFisicoCierre] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const fetchCajas = async () => {
    setFetching(true)
    try {
      const resp = await cajaAPI.listarTodas(token)
      setCajas(resp.data.cajas || [])
    } catch (error) {
      console.error('Error al listar cajas', error)
    } finally {
      setFetching(false)
    }
  }
  useEffect(() => {
    fetchCajas()
  }, [])

  const cajaActiva = useMemo(() => {
    return cajas.find((c) => c.estado === 'Abierta')
  }, [cajas])

  return {
    isModalOpen,
    setIsModalOpen,
    isClosingModal,
    setIsClosingModal,
    cajas,
    setCajas,
    montoApertura,
    setMontoApertura,
    montoFisicoCierre,
    setMontoFisicoCierre,
    loading,
    setLoading,
    fetching,
    setFetching,
    cajaActiva,
    fetchCajas,
  }
}
