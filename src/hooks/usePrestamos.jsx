import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { useAuthStore } from '../store/useAuthStore'
import { cajaAPI, trabajadorAPI } from '../api/index.api' // Asegúrate de importar trabajadorAPI
import prestamoAPI from '../api/prestamo/prestamo.api'
import { useCajaStore } from '../store/useCajaStore'

export const usePrestamos = () => {
  const token = useAuthStore((state) => state.token)
  const usuarioId = useAuthStore((state) => state.user?.id)
  const caja = useCajaStore((store) => store.caja)
  const setCaja = useCajaStore((store) => store.setCaja)

  // Estados de carga y datos
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [prestamosGlobales, setPrestamosGlobales] = useState([])
  const [trabajadores, setTrabajadores] = useState([]) // Lista para búsqueda local

  // Estados del Formulario
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [empleadoInfo, setEmpleadoInfo] = useState(null)
  const [montoTotal, setMontoTotal] = useState('')
  const [cuotasPactadas, setCuotasPactadas] = useState(1)
  const [comentario, setComentario] = useState('')

  // 1. Cargar datos iniciales (Caja, Préstamos y la lista de Trabajadores)
  const fetchDatosIniciales = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [resPrestamos, resTrabajadores] = await Promise.all([
        prestamoAPI.listarTodos(token),
        trabajadorAPI.listarTodos(token), // Traemos todos los trabajadores
      ])

      if (resPrestamos.data) setPrestamosGlobales(resPrestamos.data.prestamos)
      if (resTrabajadores.data) setTrabajadores(resTrabajadores.data.trabajadores)
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al obtener préstamos'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchDatosIniciales()
  }, [fetchDatosIniciales])

  // 2. Buscar Trabajador localmente por numeroIdentificacion
  const buscarEmpleado = () => {
    if (!cedulaBusqueda) return

    // Buscamos en la lista cargada previamente
    const encontrado = trabajadores.find((t) => t.numeroIdentificacion === cedulaBusqueda.trim())

    if (encontrado) {
      setEmpleadoInfo(encontrado)
    } else {
      Swal.fire({
        title: 'No encontrado',
        text: 'No existe un trabajador registrado con esa identificación',
        icon: 'warning',
        confirmButtonColor: '#111827',
      })
      setEmpleadoInfo(null)
    }
  }

  // 3. Guardar el Préstamo
  const handleGuardarPrestamo = async () => {
    if (caja.estado !== 'Abierta') {
      return Swal.fire('Caja Cerrada', 'Debes abrir una caja para realizar desembolsos', 'error')
    }

    if (!empleadoInfo) {
      return Swal.fire('Error', 'Debe seleccionar un trabajador válido', 'error')
    }

    if (parseFloat(montoTotal) > parseFloat(caja.saldoActual)) {
      return Swal.fire('Saldo Insuficiente', 'La caja no tiene fondos suficientes', 'error')
    }

    const confirm = await Swal.fire({
      title: '¿Confirmar Préstamo?',
      text: `Se entregará $${montoTotal} a ${empleadoInfo.nombreCompleto} en ${cuotasPactadas} cuotas.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      confirmButtonText: 'Sí, entregar dinero',
      cancelButtonText: 'Cancelar',
    })

    if (confirm.isConfirmed) {
      setLoading(true)
      try {
        const data = {
          // Usamos la ID de la Persona vinculada al Trabajador
          PersonaId: empleadoInfo.id,
          CajaId: caja.id,
          UsuarioId: usuarioId,
          montoTotal: parseFloat(montoTotal),
          cuotasPactadas: parseInt(cuotasPactadas),
          comentario: comentario.toUpperCase(),
        }

        const res = await prestamoAPI.crearPrestamo(token, data)
        const { caja: cajaData } = res.data
        console.log(cajaData)
        setCaja(cajaData)

        if (res.status === 201) {
          Swal.fire('¡Éxito!', 'Préstamo registrado correctamente', 'success')
          // Reset de formulario
          setEmpleadoInfo(null)
          setCedulaBusqueda('')
          setMontoTotal('')
          setCuotasPactadas(1)
          setComentario('')
          // Refrescar lista de préstamos y saldo de caja
          fetchDatosIniciales()
        }
      } catch (error) {
        console.log(error.message)
        Swal.fire(
          'Error',
          error.response?.data?.message || 'No se pudo procesar el préstamo',
          'error'
        )
      } finally {
        setLoading(false)
      }
    }
  }

  return {
    loading,
    prestamosGlobales,
    caja,
    cedulaBusqueda,
    setCedulaBusqueda,
    empleadoInfo,
    buscarEmpleado,
    montoTotal,
    setMontoTotal,
    cuotasPactadas,
    setCuotasPactadas,
    comentario,
    setComentario,
    handleGuardarPrestamo,
    refreshData: fetchDatosIniciales,
    error,
  }
}
