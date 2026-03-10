import { useState, useEffect } from 'react'
import { Container, Modal } from '../../components/index.components'
import { FaPlus, FaBoxOpen, FaEdit } from 'react-icons/fa'
import {
  MdDelete,
  MdInventory,
  MdScale,
  MdNumbers,
  MdInbox,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { productoAPI } from '../../api/index.api'

const Inventario = () => {
  // --- ESTADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [productos, setProductos] = useState([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    unidadMedida: 'Quintales',
    stock: 0,
    estaActivo: true,
  })

  const token = useAuthStore((state) => state.token)

  // --- LOGICA DE DATOS ---
  const fetchProductos = async () => {
    setFetching(true)
    try {
      const resp = await productoAPI.listarProductos(token)
      setProductos(resp.data.productos || resp.data || [])
    } catch (error) {
      console.error('Error al cargar inventario:', error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  // --- MANEJADORES DE EVENTOS ---
  const handleOpenModal = (edit = false, producto = null) => {
    setIsEdit(edit)
    if (edit && producto) {
      setSelectedId(producto.id)
      setFormData({
        nombre: producto.nombre,
        unidadMedida: producto.unidadMedida,
        stock: producto.stock,
        estaActivo: producto.estaActivo,
      })
    } else {
      setSelectedId(null)
      setFormData({ nombre: '', unidadMedida: 'Quintales', stock: 0, estaActivo: true })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await productoAPI.actualizarProducto(selectedId, formData, token)
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Producto modificado correctamente',
          confirmButtonColor: '#111827',
        })
      } else {
        await productoAPI.crearProducto(formData, token)
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'Nuevo producto en bodega',
          confirmButtonColor: '#111827',
        })
      }
      setIsModalOpen(false)
      fetchProductos()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error en la operación', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción borrará el producto permanentemente del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (confirm.isConfirmed) {
      try {
        await productoAPI.eliminarProducto(id, token)
        fetchProductos()
        Swal.fire('Eliminado', 'Producto borrado con éxito', 'success')
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error')
      }
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter leading-none">
              Gestión de Inventario
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Control de existencias Aroma de Oro
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(false)}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            <FaPlus size={14} /> Nuevo Producto
          </button>
        </div>

        {/* CONTENIDO - TABLA */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
              Sincronizando Bodega...
            </div>
          ) : productos.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
                No hay productos registrados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Producto
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      U. Medida
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Stock
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Estado
                    </th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productos.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 shadow-md transition-all ${p.estaActivo ? 'bg-gray-900 text-amber-400' : 'bg-gray-200 text-gray-400'}`}
                          >
                            <MdInventory size={20} />
                          </div>
                          <span
                            className={`text-sm font-black uppercase tracking-tighter ${p.estaActivo ? 'text-gray-800' : 'text-gray-400'}`}
                          >
                            {p.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          {p.unidadMedida}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-4 py-1 rounded-full text-xs font-mono font-black border ${parseFloat(p.stock) > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-100'}`}
                        >
                          {parseFloat(p.stock).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {p.estaActivo ? (
                            <span className="flex items-center text-[9px] font-black text-green-600 tracking-widest uppercase">
                              <MdCheckCircle className="mr-1 text-green-500" size={14} /> Activo
                            </span>
                          ) : (
                            <span className="flex items-center text-[9px] font-black text-red-400 tracking-widest uppercase">
                              <MdCancel className="mr-1 text-red-400" size={14} /> Inactivo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(true, p)}
                            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
                            title="Editar"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            title="Eliminar"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE FORMULARIO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombre del Producto
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all">
              <FaBoxOpen className="text-amber-500 mr-3" size={18} />
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="EJ. CACAO SECO"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unidad Medida */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Unidad de Medida
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 px-4">
                <MdScale className="text-amber-500 mr-3" size={20} />
                <select
                  value={formData.unidadMedida}
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 cursor-pointer uppercase"
                >
                  <option value="Quintales">Quintales</option>
                  <option value="Kilogramos">Kilogramos</option>
                  <option value="Libras">Libras</option>
                  <option value="Unidades">Unidades</option>
                </select>
              </div>
            </div>
            {/* Stock */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Stock Inicial
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdNumbers className="text-amber-500 mr-3" size={20} />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Disponibilidad
            </label>
            <select
              value={formData.estaActivo}
              onChange={(e) => setFormData({ ...formData, estaActivo: e.target.value === 'true' })}
              className="w-full h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="true">ACTIVO (Disponible)</option>
              <option value="false">INACTIVO (No disponible)</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 shadow-xl transition-all active:scale-95 italic"
            >
              {loading ? 'Procesando...' : isEdit ? 'Guardar Cambios' : 'Registrar Producto'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Inventario
