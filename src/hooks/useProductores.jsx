import { useState } from 'react'
import { productorAPI } from '../api/index.api'
import { useEffect } from 'react'

export const useProductores = (token) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [productores, setProductores] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoIdentificacion: 'Cédula',
    numeroIdentificacion: '',
    telefono: '',
    direccion: '',
    email: '',
    tipo: 'Productor',
    estaActivo: true, // Nuevo campo
  })

  const fetchProductores = async () => {
    setFetching(true)
    try {
      const resp = await productorAPI.listarTodos(token)
      setProductores(resp.data.productores || [])
    } catch (error) {
      console.log('Error al listar productores', error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchProductores()
  }, [])

  return {
    isModalOpen,
    setIsModalOpen,
    isEdit,
    setIsEdit,
    selectedId,
    setSelectedId,
    productores,
    loading,
    setLoading,
    fetching,
    formData,
    setFormData,
    fetchProductores,
  }
}
