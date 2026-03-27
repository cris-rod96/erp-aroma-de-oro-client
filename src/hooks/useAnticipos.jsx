import { useState, useEffect, useCallback, useMemo } from 'react'
import Swal from 'sweetalert2'
import { useAuthStore } from '../store/useAuthStore'
import { useCajaStore } from '../store/useCajaStore'
import { anticipoAPI, productorAPI } from '../api/index.api'

export const useAnticipos = () => {
  const { token, user } = useAuthStore()
  const { caja, setCaja } = useCajaStore()

  const [anticiposGlobales, setAnticiposGlobales] = useState([])
  const [productores, setProductores] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [productorInfo, setProductorInfo] = useState(null)
  const [montoEntregar, setMontoEntregar] = useState('')
  const [comentario, setComentario] = useState('')
  const [saldoDeudaProductor, setSaldoDeudaProductor] = useState(0)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

  const fetchDatos = useCallback(async () => {
    setError(null)
    try {
      setLoading(true)
      const [resAnt, resProd] = await Promise.all([
        anticipoAPI.listarTodos(token),
        productorAPI.listarTodos(token),
      ])
      setAnticiposGlobales(resAnt.data.anticipos || [])
      setProductores(resProd.data.productores || [])
    } catch (error) {
      setError(error.response?.data?.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchDatos()
  }, [token, fetchDatos])

  const productoresFiltrados = useMemo(() => {
    const termino = cedulaBusqueda.trim().toLowerCase()
    if (termino.length < 2) return []
    return productores
      .filter(
        (p) =>
          (p.numeroIdentificacion || '').toLowerCase().includes(termino) ||
          (p.nombreCompleto || '').toLowerCase().includes(termino)
      )
      .slice(0, 8)
  }, [cedulaBusqueda, productores])

  const seleccionarProductor = (productor) => {
    const anticiposPendientes = anticiposGlobales.filter(
      (ant) => ant.PersonaId === productor.id && ant.estado === 'Pendiente'
    )

    const deuda = anticiposPendientes.reduce((acc, curr) => acc + parseFloat(curr.monto || 0), 0)

    setSaldoDeudaProductor(deuda)
    setProductorInfo(productor)

    // ESTO COMPLETA EL NOMBRE EN AMBOS INPUTS AL SELECCIONAR
    setCedulaBusqueda(productor.nombreCompleto.toUpperCase())

    setMostrarSugerencias(false)

    if (deuda > 0) {
      Swal.fire({
        title: 'PRODUCTOR CON DEUDA',
        text: `El productor ${productor.nombreCompleto} tiene un anticipo pendiente por $${deuda.toFixed(2)}.`,
        icon: 'warning',
        confirmButtonColor: '#fbbf24',
      })
    }
  }

  const handleGuardarAnticipo = async () => {
    if (!caja || caja.estado !== 'Abierta') return Swal.fire('ERROR', 'Caja cerrada', 'error')

    const data = {
      monto: parseFloat(montoEntregar),
      comentario: comentario.trim().toUpperCase(),
      PersonaId: productorInfo.id,
      UsuarioId: user.id,
      CajaId: caja.id,
    }

    try {
      setLoading(true)
      const res = await anticipoAPI.crearAnticipo(token, data)
      Swal.fire('EXITO', 'Anticipo registrado', 'success')
      if (res.data.caja) setCaja(res.data.caja)

      setProductorInfo(null)
      setCedulaBusqueda('')
      setMontoEntregar('')
      setComentario('')
      fetchDatos()
    } catch (error) {
      Swal.fire('ERROR', error.response?.data?.message || 'Fallo al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    anticiposGlobales,
    productorInfo,
    setProductorInfo,
    cedulaBusqueda,
    setCedulaBusqueda,
    montoEntregar,
    setMontoEntregar,
    comentario,
    setComentario,
    handleGuardarAnticipo,
    cajaActual: caja,
    saldoDeudaProductor,
    setSaldoDeudaProductor,
    error,
    productoresFiltrados,
    mostrarSugerencias,
    setMostrarSugerencias,
    seleccionarProductor,
    fetchDatos,
  }
}
