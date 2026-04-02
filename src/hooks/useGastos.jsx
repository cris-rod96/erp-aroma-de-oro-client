import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { gastoAPI } from '../api/index.api'
import { useAuthStore } from '../store/useAuthStore'
import { useCajaStore } from '../store/useCajaStore'
import { FaGasPump, FaUtensils, FaTools, FaShoppingCart, FaBoxes } from 'react-icons/fa'
import { useEffect } from 'react'
import { useMemo } from 'react'
import { useEmpresaStore } from '../store/useEmpresaStore'

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

  const fetchGastos = useCallback(async () => {
    if (!token) return
    setFetching(true)
    setError(null)
    try {
      const res = await gastoAPI.listarGastos(token)
      setGastos(res.data.gastos)
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al cargar'
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

      // Retorna true si el término coincide con CUALQUIER campo
      return (
        codigo.includes(termino) ||
        descripcion.includes(termino) ||
        categoria.includes(termino) ||
        monto.includes(termino) ||
        fecha.includes(termino)
      )
    })
  }, [gastos, searchTerm])

  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    categoria: 'Varios',
  })

  const categorias = [
    { nombre: 'Alimentación', icono: <FaUtensils /> },
    { nombre: 'Repuestos', icono: <FaTools /> },
    { nombre: 'Combustible', icono: <FaGasPump /> },
    { nombre: 'Mantenimiento', icono: <FaTools /> },
    { nombre: 'Suministros', icono: <FaShoppingCart /> },
    { nombre: 'Varios', icono: <FaBoxes /> },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (parseFloat(formData.monto) > parseFloat(caja?.saldoActual)) {
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
        Swal.fire('Éxito', `Gasto registrado correctamente`, 'success')
        if (res.data.caja) setCaja(res.data.caja)
        setIsModalOpen(false)
        setFormData({ monto: '', descripcion: '', categoria: 'Varios' })
        fetchGastos()
      }
    } catch (error) {
      console.log(error)
      Swal.fire('Error', error.response?.data?.message || 'Error al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => setIsModalOpen(!isModalOpen)

  useEffect(() => {
    if (token) {
      fetchGastos()
    }
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
