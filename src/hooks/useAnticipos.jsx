import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { useAuthStore } from '../store/useAuthStore'
import { useCajaStore } from '../store/useCajaStore'
import { anticipoAPI, productorAPI } from '../api/index.api'

export const useAnticipos = () => {
  const { token, data: user } = useAuthStore()
  const { caja, setCaja } = useCajaStore()

  const [anticiposGlobales, setAnticiposGlobales] = useState([])
  const [productores, setProductores] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados del Formulario
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [productorInfo, setProductorInfo] = useState(null)
  const [montoEntregar, setMontoEntregar] = useState('')
  const [comentario, setComentario] = useState('') // <--- EL COMENTARIO OBLIGATORIO
  const [saldoDeudaProductor, setSaldoDeudaProductor] = useState(0)

  const fetchDatos = useCallback(async () => {
    try {
      setLoading(true)
      const [resAnt, resProd] = await Promise.all([
        anticipoAPI.listarTodos(token),
        productorAPI.listarTodos(token), // Asumiendo que usas personaAPI para los productores
      ])
      setAnticiposGlobales(resAnt.data.anticipos || [])
      setProductores(resProd.data.productores || [])
    } catch (error) {
      console.error('Error Aroma de Oro:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchDatos()
  }, [token, fetchDatos])

  const buscarProductor = () => {
    if (!cedulaBusqueda) return
    const encontrado = productores.find((p) => p.numeroIdentificacion === cedulaBusqueda)
    if (encontrado) {
      setProductorInfo(encontrado)
      const deuda = anticiposGlobales
        .filter((ant) => ant.PersonaId === encontrado.id && ant.estado === 'Pendiente')
        .reduce((acc, curr) => acc + parseFloat(curr.saldoPendiente), 0)
      setSaldoDeudaProductor(deuda)
    } else {
      setProductorInfo(null)
      Swal.fire('No encontrado', 'El productor no existe', 'warning')
    }
  }

  const handleGuardarAnticipo = async () => {
    if (!caja || caja.estado !== 'Abierta') {
      return Swal.fire('Error', 'La caja debe estar abierta', 'error')
    }

    const data = {
      monto: parseFloat(montoEntregar),
      comentario: comentario.toUpperCase(), // Forzamos mayúsculas para el ERP
      PersonaId: productorInfo.id,
      UsuarioId: user.id,
      CajaId: caja.id,
    }

    try {
      setLoading(true)
      const res = await anticipoAPI.crearAnticipo(token, data)
      Swal.fire('¡Éxito!', 'Anticipo registrado y descontado de caja', 'success')
      if (res.data.cajaActualizada) setCaja(res.data.cajaActualizada)

      // Reset
      setProductorInfo(null)
      setCedulaBusqueda('')
      setMontoEntregar('')
      setComentario('')
      fetchDatos()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Fallo al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    anticiposGlobales,
    productorInfo,
    cedulaBusqueda,
    setCedulaBusqueda,
    buscarProductor,
    montoEntregar,
    setMontoEntregar,
    comentario,
    setComentario,
    handleGuardarAnticipo,
    cajaActual: caja,
    saldoDeudaProductor,
  }
}
