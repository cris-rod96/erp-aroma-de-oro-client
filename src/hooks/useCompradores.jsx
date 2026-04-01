import { useState } from 'react'
import { compradorAPI } from '../api/index.api'
import { useAuthStore } from '../store/useAuthStore'
import { useEffect } from 'react'
import Swal from 'sweetalert2'
import { data } from 'react-router-dom'
import { useMemo } from 'react'

const useCompradores = () => {
  const { token, user } = useAuthStore()

  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [compradores, setCompradores] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [verEliminados, setVerEliminados] = useState(false)

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoIdentificacion: 'Cédula',
    numeroIdentificacion: '',
    telefono: '',
    direccion: '',
    email: '',
    tipo: 'Comprador',
    estaActivo: true,
  })

  const compradoresFiltrados = useMemo(() => {
    let lista = compradores.filter((c) => c.estaActivo === !verEliminados)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      lista = lista.filter(
        (c) =>
          c.numeroIdentificacion.toLowerCase().includes(search) ||
          c.nombreCompleto.toLowerCase().includes(search)
      )
    }
    return lista
  }, [compradores, searchTerm, verEliminados])

  const fetchCompradores = async () => {
    setFetching(true)
    setError(null)
    try {
      const resp = await compradorAPI.listarTodos(token)
      setCompradores(resp.data.compradores || [])
    } catch (error) {
      console.log(error.message)
      const msg = error.response?.data?.message || 'Error al sincronizar productores'
      setError(msg)
    } finally {
      setFetching(false)
    }
  }

  const swalConfig = {
    target: document.getElementById('root'), // O usa document.body si 'root' no funciona
    customClass: {
      container: 'my-swal-container',
    },
    didOpen: () => {
      // Forzamos el z-index al máximo posible
      Swal.getContainer().style.zIndex = '999999'
    },
  }

  const resetData = () => {
    setFormData({
      nombreCompleto: '',
      tipoIdentificacion: 'Cédula',
      numeroIdentificacion: '',
      telefono: '',
      direccion: '',
      email: '',
      tipo: 'Comprador',
      estaActivo: true,
    })
  }
  const handleNuevoComprador = async (e) => {
    e.preventDefault()
    const { nombreCompleto, tipoIdentificacion, numeroIdentificacion, telefono } = formData

    if (!nombreCompleto)
      return Swal.fire('Error al guardar', 'El nombre del comprador es obligatorio', 'error')

    if (!numeroIdentificacion)
      return Swal.fire('Error al guardar', 'El número identificación es obligatorio', 'error')

    if (tipoIdentificacion === 'Cédula' && numeroIdentificacion.length !== 10)
      return Swal.fire('Error al guardar', 'La cédula debe tener 10 dígitos válidos', 'error')

    if (tipoIdentificacion === 'RUC' && numeroIdentificacion.length !== 13)
      return Swal.fire('Error al guardar', 'El RUC debe tener 13 dígitos válidos', 'error')

    if (telefono && telefono.length !== 10)
      return Swal.fire(
        'Error al guardar',
        'El número de teléfono debe tener 10 dígitos válidos',
        'error'
      )

    try {
      const resp = await compradorAPI.agregarComprador(formData, token)
      if (resp.status === 201) {
        Swal.fire('Éxito', 'Comprador registrado con éxito', 'success')
        resetData()
        fetchCompradores()
        setIsModalOpen(false)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al guardar el comprador'
      Swal.fire('Error al registrar', msg, 'error')
    }
  }

  const handleOpenModal = (edit = false, comprador = null) => {
    setIsEdit(edit)
    if (edit && comprador) {
      setSelectedId(comprador.id)
      setFormData({
        nombreCompleto: comprador.nombreCompleto || '',
        tipoIdentificacion: comprador.tipoIdentificacion || 'Cédula',
        numeroIdentificacion: comprador.numeroIdentificacion || '',
        telefono: comprador.telefono || '',
        direccion: comprador.direccion || '',
        email: comprador.email || '',
        tipo: 'Comprador',
        estaActivo: comprador.estaActivo ?? true,
      })
    } else {
      setSelectedId(null)
      setFormData({
        nombreCompleto: '',
        tipoIdentificacion: 'Cédula',
        numeroIdentificacion: '',
        telefono: '',
        direccion: '',
        email: '',
        tipo: 'Comprador',
        estaActivo: true,
      })
    }
    setIsModalOpen(true)
  }
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción desactivará al comprador del sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'No',
    })
    if (confirm.isConfirmed) {
      try {
        await compradorAPI.eliminarComprador(id, token)
        fetchCompradores()
        Swal.fire('Eliminado', 'Comprador eliminado', 'success')
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al eliminar comprador'
        Swal.fire('Error al eliminar', msg, 'error')
      }
    }
  }

  const handleRestore = async (id) => {
    const confirm = await Swal.fire({
      ...swalConfig,
      title: '¿Restaurar comprador?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // Emerald 500
      confirmButtonText: 'Sí, restaurar',
    })

    if (confirm.isConfirmed) {
      try {
        const resp = await compradorAPI.recuperarComprador(id, token)
        Swal.fire(
          'Comprador recuperado',
          resp.response?.data.message || 'Se recuperó al comprador con éxito',
          'success'
        )
        fetchCompradores()
        setVerEliminados(false)
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al recuperar comprador'
        Swal.fire('Error', msg, 'error')
      }
    }
  }

  useEffect(() => {
    fetchCompradores()
  }, [])

  return {
    isModalOpen,
    setIsModalOpen,
    isEdit,
    setIsEdit,
    selectedId,
    setSelectedId,
    compradores,
    loading,
    setLoading,
    fetching,
    formData,
    setFormData,
    fetchCompradores,
    error,
    handleNuevoComprador,
    searchTerm,
    setSearchTerm,
    compradoresFiltrados,
    handleDelete,
    verEliminados,
    setVerEliminados,
    handleOpenModal,
    handleRestore,
  }
}

export default useCompradores
