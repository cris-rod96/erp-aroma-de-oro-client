import { useState, useEffect, useCallback, useMemo } from 'react'
import Swal from 'sweetalert2'
import { useAuthStore } from '../store/useAuthStore'
import { trabajadorAPI } from '../api/index.api'
import prestamoAPI from '../api/prestamo/prestamo.api'
import { useCajaStore } from '../store/useCajaStore'

export const usePrestamos = () => {
  const token = useAuthStore((state) => state.token)
  const usuarioId = useAuthStore((state) => state.user?.id)
  const { caja, setCaja } = useCajaStore()
  const [isEdit, setIsEdit] = useState(false)
  const [prestamoEditId, setPrestamoEditId] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [prestamosGlobales, setPrestamosGlobales] = useState([])
  const [trabajadores, setTrabajadores] = useState([])

  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [empleadoInfo, setEmpleadoInfo] = useState(null)
  const [montoTotal, setMontoTotal] = useState('')
  const [cuotasPactadas, setCuotasPactadas] = useState(1)
  const [comentario, setComentario] = useState('')
  const [empleadoId, setEmpleadoId] = useState(null)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [saldoDeudaEmpleado, setSaldoDeudaEmpleado] = useState(0)

  const prepararEdicion = (prestamo) => {
    // Solo permitir editar si no tiene cuotas pagadas (regla de negocio sugerida)
    if (prestamo.cuotasPagadas > 0) {
      return Swal.fire(
        'Acción Denegada',
        'No se puede editar un préstamo con pagos realizados',
        'error'
      )
    }
    console.log(prestamo)

    setIsEdit(true)
    setPrestamoEditId(prestamo.id)
    setEmpleadoInfo(prestamo.Persona)
    setEmpleadoId(prestamo.PersonaId)
    setCedulaBusqueda(prestamo.Persona.nombreCompleto)
    setMontoTotal(prestamo.montoTotal)
    setCuotasPactadas(prestamo.cuotasPactadas)
    setComentario(prestamo.comentario)
    setSaldoDeudaEmpleado(0) // Opcional: resetear para que el form no se bloquee
  }
  const cancelarEdicion = () => {
    setIsEdit(false)
    setPrestamoEditId(null)
    setEmpleadoInfo(null)
    setCedulaBusqueda('')
    setMontoTotal('')
    setCuotasPactadas(1)
    setComentario('')
  }

  const fetchDatosIniciales = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [resPrestamos, resTrabajadores] = await Promise.all([
        prestamoAPI.listarTodos(token),
        trabajadorAPI.listarTodos(token),
      ])
      setPrestamosGlobales(resPrestamos.data.prestamos || [])
      setTrabajadores(resTrabajadores.data.trabajadores || [])
    } catch (error) {
      setError(error.response?.data?.message || 'Error al obtener datos')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchDatosIniciales()
  }, [fetchDatosIniciales, token])

  const trabajadoresFiltrados = useMemo(() => {
    const termino = cedulaBusqueda.trim().toLowerCase()
    if (termino.length < 2) return []
    return trabajadores
      .filter(
        (t) =>
          (t.numeroIdentificacion || '').toLowerCase().includes(termino) ||
          (t.nombreCompleto || '').toLowerCase().includes(termino)
      )
      .slice(0, 8)
  }, [cedulaBusqueda, trabajadores])

  const seleccionarEmpleado = (empleado) => {
    const pendientes = prestamosGlobales.filter(
      (p) => p.PersonaId === empleado.id && p.estado === 'Pendiente'
    )
    const deuda = pendientes.reduce((acc, curr) => acc + parseFloat(curr.saldoPendiente || 0), 0)

    setSaldoDeudaEmpleado(deuda)
    setEmpleadoInfo(empleado)
    setCedulaBusqueda(empleado.nombreCompleto.toUpperCase())
    setMostrarSugerencias(false)

    if (deuda > 0) {
      Swal.fire({
        title: 'EMPLEADO CON DEUDA',
        text: `Deuda activa: $${deuda.toFixed(2)}`,
        icon: 'warning',
        confirmButtonColor: '#111827',
      })
    }
  }

  const handleGuardarPrestamo = async () => {
    if (!caja || caja.estado !== 'Abierta') return Swal.fire('Error', 'Caja cerrada', 'error')

    try {
      setLoading(true)
      const data = {
        CajaId: caja.id,
        UsuarioId: usuarioId,
        montoTotal: parseFloat(montoTotal),
        cuotasPactadas: parseInt(cuotasPactadas),
        comentario: comentario.trim().toUpperCase(),
      }
      if (isEdit) {
        const res = await prestamoAPI.actualizarPrestamo(token, {
          ...data,
          PrestamoId: prestamoEditId,
          PersonaId: empleadoId,
        })
        if (res.status === 200) {
          Swal.fire('¡Éxito!', 'Préstamo actualizado', 'success')
          setCaja(res.data.caja)
          setEmpleadoInfo(null)
          setCedulaBusqueda('')
          setMontoTotal('')
          setCuotasPactadas(1)
          setComentario('')
          setSaldoDeudaEmpleado(0)
          cancelarEdicion()

          fetchDatosIniciales()
        }
      } else {
        const res = await prestamoAPI.crearPrestamo(token, {
          ...data,
          PersonaId: empleadoInfo.id,
        })
        if (res.status === 201) {
          Swal.fire('¡Éxito!', 'Préstamo registrado', 'success')
          setCaja(res.data.caja)
          setEmpleadoInfo(null)
          setCedulaBusqueda('')
          setMontoTotal('')
          setCuotasPactadas(1)
          setComentario('')
          setSaldoDeudaEmpleado(0)
          fetchDatosIniciales()
        }
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Fallo', 'error')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    prestamosGlobales,
    caja,
    cedulaBusqueda,
    setCedulaBusqueda,
    empleadoInfo,
    montoTotal,
    setMontoTotal,
    cuotasPactadas,
    setCuotasPactadas,
    comentario,
    setComentario,
    handleGuardarPrestamo,
    error,
    trabajadoresFiltrados,
    mostrarSugerencias,
    setMostrarSugerencias,
    seleccionarEmpleado,
    saldoDeudaEmpleado,
    prepararEdicion,
    isEdit,
  }
}
