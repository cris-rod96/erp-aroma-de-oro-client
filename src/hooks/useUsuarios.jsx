import { useEffect, useState } from 'react'
import { usuarioAPI } from '../api/index.api'

export const useUsuarios = (token) => {
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    nombresCompletos: '',
    cedula: '',
    telefono: '',
    correo: null,
    clave: '',
    rol: '',
    estaActivo: true,
  })

  const fetchUsuarios = async () => {
    setFetching(true)
    setError(null)
    try {
      const resp = await usuarioAPI.listarUsuarios(token)
      // Ajusta según cómo responda tu backend (resp.data o resp.data.usuarios)
      setUsuarios(resp.data.usuarios || resp.data || [])
    } catch (error) {
      setError(error.response?.data.message || 'Error al cargar')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleOpenModal = (edit = false, usuario = null) => {
    setIsEdit(edit)
    if (edit && usuario) {
      setSelectedId(usuario.id)
      setFormData({
        nombresCompletos: usuario.nombresCompletos,
        cedula: usuario.cedula,
        telefono: usuario.telefono,
        correo: usuario.correo || null,
        clave: '', // La clave no se suele enviar de vuelta al editar
        rol: usuario.rol,
        estaActivo: usuario.estaActivo,
      })
    } else {
      setSelectedId(null)
      setFormData({
        nombresCompletos: '',
        cedula: '',
        telefono: '',
        correo: null,
        clave: '',
        rol: '',
        estaActivo: true,
      })
    }
    setIsModalOpen(true)
  }

  return {
    isModalOpen,
    setIsModalOpen,
    isEdit,
    setIsEdit,
    selectedId,
    setSelectedId,
    fetchUsuarios,
    fetching,
    formData,
    handleOpenModal,
    setFormData,
    usuarios,
    loading,
    error,
    setLoading,
  }
}
