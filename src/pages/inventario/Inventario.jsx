import { useState, useEffect, useMemo } from 'react'
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
  MdChevronLeft,
  MdChevronRight,
  MdCalculate,
  MdSwapHoriz,
  MdRefresh,
} from 'react-icons/md'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { productoAPI } from '../../api/index.api'

const Inventario = () => {
  // --- ESTADOS DE DATOS ---
  const [productos, setProductos] = useState([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const token = useAuthStore((state) => state.token)

  // --- ESTADOS MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    unidadMedida: 'Quintales',
    stock: 0,
    estaActivo: true,
  })

  // --- ESTADO CONVERSOR GLOBAL (PRO) ---
  const [calc, setCalc] = useState({ valor: '', de: 'Kilogramos', a: 'Quintales', resultado: 0 })

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const totalPages = Math.ceil(productos.length / itemsPerPage)
  const currentProductos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return productos.slice(start, start + itemsPerPage)
  }, [productos, currentPage])

  // --- LÓGICA DE CONVERSIÓN ---
  const conversionFactors = {
    Kilogramos_Libras: 2.20462,
    Kilogramos_Quintales: 0.0220462,
    Quintales_Libras: 100,
    Quintales_Kilogramos: 45.3592,
    Libras_Kilogramos: 0.453592,
    Libras_Quintales: 0.01,
  }

  const handleCalcChange = (field, value) => {
    const newCalc = { ...calc, [field]: value }
    const v = parseFloat(newCalc.valor)
    if (isNaN(v)) {
      setCalc({ ...newCalc, resultado: 0 })
      return
    }
    if (newCalc.de === newCalc.a) {
      setCalc({ ...newCalc, resultado: v })
    } else {
      const factor = conversionFactors[`${newCalc.de}_${newCalc.a}`]
      setCalc({ ...newCalc, resultado: v * factor })
    }
  }

  // --- FUNCIONES API ---
  const fetchProductos = async () => {
    setFetching(true)
    try {
      const resp = await productoAPI.listarProductos(token)
      setProductos(resp.data.productos || resp.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await productoAPI.actualizarProducto(selectedId, formData, token)
      } else {
        await productoAPI.crearProducto(formData, token)
      }
      setIsModalOpen(false)
      fetchProductos()
      Swal.fire({ icon: 'success', title: 'Éxito', timer: 1500, showConfirmButton: false })
    } catch (error) {
      Swal.fire('Error', 'No se pudo procesar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: '¿Eliminar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      confirmButtonText: 'Sí, eliminar',
    })
    if (res.isConfirmed) {
      try {
        await productoAPI.eliminarProducto(id, token)
        fetchProductos()
      } catch (e) {
        Swal.fire('Error', 'No se puede eliminar', 'error')
      }
    }
  }

  const handleOpenModal = (edit = false, p = null) => {
    setIsEdit(edit)
    if (edit && p) {
      setSelectedId(p.id)
      setFormData({
        nombre: p.nombre,
        unidadMedida: p.unidadMedida,
        stock: p.stock,
        estaActivo: p.estaActivo,
      })
    } else {
      setFormData({ nombre: '', unidadMedida: 'Quintales', stock: 0, estaActivo: true })
    }
    setIsModalOpen(true)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
              Inventario Aroma de Oro
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Control de Bodega y Pesos
            </p>
          </div>
          <button
            onClick={() => handleOpenModal(false)}
            className="bg-gray-900 text-amber-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 flex items-center gap-2 border-b-4 border-amber-600 transition-all italic"
          >
            <FaPlus size={14} /> Registrar Producto
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* COLUMNA 1: CONVERSOR PRO (LAYOUT FIJO) */}
          {/* COLUMNA 1: CONVERSOR REDISEÑADO */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-10">
              {/* Header del Widget */}
              <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <MdCalculate size={20} />
                  </div>
                  <h3 className="text-gray-800 font-black uppercase text-[11px] tracking-widest">
                    Conversor
                  </h3>
                </div>
                <button
                  onClick={() =>
                    setCalc({ valor: '', de: 'Kilogramos', a: 'Quintales', resultado: 0 })
                  }
                  className="text-gray-300 hover:text-amber-500 transition-colors"
                >
                  <MdRefresh size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Campo de Entrada */}
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">
                    Cantidad Base
                  </label>
                  <input
                    type="number"
                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-gray-800 font-mono text-xl font-black outline-none focus:border-amber-400 transition-all shadow-sm"
                    placeholder="0.00"
                    value={calc.valor}
                    onChange={(e) => handleCalcChange('valor', e.target.value)}
                  />
                </div>

                {/* Selectores con estilo de la tabla */}
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <select
                      className="w-full h-12 bg-white border border-gray-100 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none text-gray-500 focus:border-amber-200 shadow-sm"
                      value={calc.de}
                      onChange={(e) => handleCalcChange('de', e.target.value)}
                    >
                      <option>Kilogramos</option>
                      <option>Quintales</option>
                      <option>Libras</option>
                    </select>
                  </div>

                  <div className="flex justify-center py-1">
                    <div className="bg-gray-50 p-2 rounded-full border border-gray-100 text-amber-500 shadow-sm">
                      <MdSwapHoriz size={20} className="rotate-90 lg:rotate-0" />
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      className="w-full h-12 bg-white border border-gray-100 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none text-gray-500 focus:border-amber-200 shadow-sm"
                      value={calc.a}
                      onChange={(e) => handleCalcChange('a', e.target.value)}
                    >
                      <option>Quintales</option>
                      <option>Kilogramos</option>
                      <option>Libras</option>
                    </select>
                  </div>
                </div>

                {/* Resultado con estilo de celda de Stock */}
                <div className="mt-10 pt-8 border-t border-gray-50">
                  <div className="bg-amber-50/50 rounded-[2rem] p-8 border border-amber-100/50 text-center">
                    <p className="text-[9px] text-amber-600 font-black uppercase tracking-[0.3em] mb-2">
                      Equivalencia
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-black text-gray-900 font-mono italic tracking-tighter">
                        {calc.resultado.toFixed(2)}
                      </span>
                      <span className="text-amber-600 text-[10px] font-black uppercase italic">
                        {calc.a === 'Kilogramos' ? 'KG' : calc.a === 'Quintales' ? 'QQ' : 'LB'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNAS 2-4: TABLA DE PRODUCTOS */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Producto
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Medida
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Stock
                      </th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Gestión
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fetching ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs italic"
                        >
                          Cargando Bodega...
                        </td>
                      </tr>
                    ) : (
                      currentProductos.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-amber-50/20 transition-all group font-bold"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div
                                className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${p.estaActivo ? 'bg-gray-900 text-amber-400' : 'bg-gray-100 text-gray-400'}`}
                              >
                                <MdInventory size={20} />
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-black uppercase tracking-tighter ${p.estaActivo ? 'text-gray-800' : 'text-gray-400 line-through'}`}
                                >
                                  {p.nombre}
                                </p>
                                <span className="text-[9px] text-gray-400 uppercase tracking-widest">
                                  {p.estaActivo ? 'En Venta/Uso' : 'Inactivo'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-gray-500 uppercase bg-gray-100 px-3 py-1.5 rounded-lg tracking-widest">
                              {p.unidadMedida}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className={`text-lg font-black font-mono italic ${p.stock > 0 ? 'text-gray-900' : 'text-rose-500'}`}
                            >
                              {parseFloat(p.stock).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenModal(true, p)}
                                className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Página <span className="text-gray-900">{currentPage}</span> de{' '}
                  <span className="text-gray-900">{totalPages || 1}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border bg-white text-gray-400 disabled:opacity-20 hover:border-amber-400 transition-all"
                  >
                    <MdChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border bg-white text-gray-400 disabled:opacity-20 hover:border-amber-400 transition-all"
                  >
                    <MdChevronRight size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombre
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
              className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 text-sm font-black uppercase outline-none focus:border-amber-400 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                U. Medida
              </label>
              <select
                value={formData.unidadMedida}
                onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 text-[10px] font-black uppercase outline-none"
              >
                <option>Quintales</option>
                <option>Kilogramos</option>
                <option>Libras</option>
                <option>Unidades</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Stock Inicial
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 text-sm font-black outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] border-b-4 border-amber-600 shadow-xl active:scale-95 transition-all italic"
          >
            {loading ? 'Procesando...' : isEdit ? 'Actualizar Producto' : 'Guardar en Bodega'}
          </button>
        </form>
      </Modal>
    </Container>
  )
}

export default Inventario
