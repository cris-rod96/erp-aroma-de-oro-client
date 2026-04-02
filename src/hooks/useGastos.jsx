import { useState, useCallback, useEffect, useMemo } from 'react'
import Swal from 'sweetalert2'
import { gastoAPI } from '../api/index.api'
import { useAuthStore } from '../store/useAuthStore'
import { useCajaStore } from '../store/useCajaStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import {
  FaGasPump,
  FaUtensils,
  FaTools,
  FaShoppingCart,
  FaBoxes,
  FaBirthdayCake,
  FaMedal,
} from 'react-icons/fa'

export const useGastos = () => {
  const [gastos, setGastos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [fetching, setFetching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const { empresa } = useEmpresaStore()
  const { caja, setCaja } = useCajaStore()

  // --- CATEGORÍAS ACTUALIZADAS (Sin ajuste de centavos) ---
  const categorias = [
    { nombre: 'Alimentación', icono: <FaUtensils /> },
    { nombre: 'Repuestos', icono: <FaTools /> },
    { nombre: 'Combustible', icono: <FaGasPump /> },
    { nombre: 'Mantenimiento', icono: <FaTools /> },
    { nombre: 'Suministros', icono: <FaShoppingCart /> },
    { nombre: 'Cumpleaños', icono: <FaBirthdayCake /> },
    { nombre: 'Bonificaciones', icono: <FaMedal /> },
    { nombre: 'Varios', icono: <FaBoxes /> },
  ]

  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    categoria: 'Varios',
  })

  const fetchGastos = useCallback(async () => {
    if (!token) return
    setFetching(true)
    setError(null)
    try {
      const res = await gastoAPI.listarGastos(token)
      setGastos(res.data.gastos)
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al cargar los gastos'
      setError(msg)
    } finally {
      setFetching(false)
    }
  }, [token])

  const filtered = useMemo(() => {
    const termino = searchTerm.trim().toLowerCase()

    if (!termino) return gastos

    return gastos.filter((g) => {
      const codigo = (g.codigo || '').toLowerCase()
      const descripcion = (g.descripcion || '').toLowerCase()
      const categoria = (g.categoria || '').toLowerCase()
      const monto = parseFloat(g.monto || 0)
        .toFixed(2)
        .toString()
      const fecha = new Date(g.createdAt).toLocaleDateString('es-EC')

      return (
        codigo.includes(termino) ||
        descripcion.includes(termino) ||
        categoria.includes(termino) ||
        monto.includes(termino) ||
        fecha.includes(termino)
      )
    })
  }, [gastos, searchTerm])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const montoGasto = parseFloat(formData.monto)
    const saldoDisponible = parseFloat(caja?.saldoActual || 0)

    if (isNaN(montoGasto) || montoGasto <= 0) {
      return Swal.fire('Atención', 'Ingrese un monto válido', 'warning')
    }

    if (montoGasto > saldoDisponible) {
      return Swal.fire('Error', 'Saldo insuficiente en caja', 'error')
    }

    setLoading(true)
    try {
      const res = await gastoAPI.crearGasto(token, {
        ...formData,
        CajaId: caja.id,
        UsuarioId: user.id,
      })

      if (res.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Gasto Registrado',
          timer: 1500,
          showConfirmButton: false,
        })

        if (res.data.caja) setCaja(res.data.caja)

        setIsModalOpen(false)
        setFormData({ monto: '', descripcion: '', categoria: 'Varios' })
        fetchGastos()
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => setIsModalOpen(!isModalOpen)

  useEffect(() => {
    if (token) fetchGastos()
  }, [token, fetchGastos])

  return {
    gastos,
    loading,
    fetchGastos,
    handleSubmit,
    error,
    fetching,
    categorias,
    formData,
    filtered,
    isModalOpen,
    setIsModalOpen,
    setSearchTerm,
    searchTerm,
    handleOpenModal,
    caja,
    setFormData,
    empresa,
  }
}
