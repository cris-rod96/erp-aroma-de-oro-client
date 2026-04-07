import { useState, useEffect, useMemo } from 'react'
import { Container, InventarioHeader, Modal } from '../../components/index.components'
import { FaEdit } from 'react-icons/fa'
import { MdInventory, MdChevronLeft, MdChevronRight, MdAttachMoney } from 'react-icons/md'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { productoAPI } from '../../api/index.api'
import { formatMoney } from '../../utils/fromatters'

const Inventario = () => {
  const [productos, setProductos] = useState([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const token = useAuthStore((state) => state.token)
  const [verEliminados, setVerEliminados] = useState(false)
  const [preciosVenta, setPreciosVenta] = useState({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    unidadMedida: 'Quintales',
    stock: 0,
    inversionInicial: 0,
    estaActivo: true,
  })

  const productosFiltrados = useMemo(() => {
    let lista = productos.filter((p) => p.estaActivo === !verEliminados)
    if (searchTerm) {
      const busqueda = searchTerm.toLowerCase().trim()
      return lista.filter((p) => {
        return (
          p.nombre?.toLowerCase().includes(busqueda) ||
          p.unidadMedida?.toLowerCase().includes(busqueda)
        )
      })
    }
    return lista
  }, [productos, searchTerm, verEliminados])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage)

  const currentProductos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return productosFiltrados.slice(start, start + itemsPerPage)
  }, [productosFiltrados, currentPage])

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

  const handlePrecioVentaChange = (id, value) => {
    setPreciosVenta({ ...preciosVenta, [id]: value })
  }

  const handleOpenModal = (edit = false, p = null) => {
    setIsEdit(edit)
    if (edit && p) {
      setSelectedId(p.id)
      setFormData({
        nombre: p.nombre,
        unidadMedida: p.unidadMedida,
        stock: p.stock,
        inversionInicial: p.inversionInicial || 0,
        estaActivo: p.estaActivo,
      })
    } else {
      setFormData({
        nombre: '',
        unidadMedida: 'Quintales',
        stock: 0,
        inversionInicial: 0,
        estaActivo: true,
      })
    }
    setIsModalOpen(true)
  }

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
      Swal.fire({ icon: 'success', title: 'Exito', timer: 1500, showConfirmButton: false })
    } catch (error) {
      Swal.fire('Error', 'No se pudo procesar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6 space-y-8">
        <InventarioHeader
          handleOpenModal={handleOpenModal}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          verEliminados={verEliminados}
          setVerEliminados={setVerEliminados}
        />

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-50">
                <tr>
                  <th className="px-4 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Producto
                  </th>
                  <th className="px-4 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Stock
                  </th>
                  <th className="px-4 py-5 text-[9px] font-black text-amber-500 uppercase tracking-widest text-center">
                    Inv. Inicial
                  </th>
                  <th className="px-4 py-5 text-[9px] font-black text-blue-700 uppercase tracking-widest text-center border-r border-gray-100">
                    Inv. Total
                  </th>
                  <th className="px-4 py-5 text-[9px] font-black text-emerald-600 uppercase tracking-widest text-center">
                    Cant. Vendida
                  </th>
                  <th className="px-4 py-5 text-[9px] font-black text-emerald-700 uppercase tracking-widest text-center">
                    Venta Real
                  </th>
                  <th className="px-4 py-5 text-[9px] font-black text-amber-600 uppercase tracking-widest text-center">
                    P. Venta
                  </th>
                  <th className="px-4 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Proy. Stock
                  </th>
                  <th className="px-4 py-5 text-[9px] font-black text-emerald-600 uppercase tracking-widest text-center bg-gray-50/30">
                    Ganancia Total
                  </th>
                  <th className="px-4 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Gestion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetching ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs"
                    >
                      Cargando Bodega...
                    </td>
                  </tr>
                ) : (
                  currentProductos.map((p) => {
                    // 1. INVERSIONES
                    const detLiq = p.DetalleLiquidacions || []
                    const invCompras = detLiq.reduce(
                      (acc, curr) => acc + (parseFloat(curr.parcial) || 0),
                      0
                    )
                    const invInicial = parseFloat(p.inversionInicial) || 0
                    const invTotal = invCompras + invInicial

                    // 2. VENTAS REALIZADAS
                    const ventasArray = p.Venta || []
                    const cantidadVendida = ventasArray.reduce(
                      (acc, v) => acc + (parseFloat(v.cantidadNeta) || 0),
                      0
                    )
                    const ventaRealDinero = ventasArray.reduce(
                      (acc, v) => acc + (parseFloat(v.totalFactura) || 0),
                      0
                    )

                    // 3. PROYECCIÓN DE LO QUE QUEDA EN STOCK
                    const valVentaManual = preciosVenta[p.id] ?? ''
                    const proyStockRestante =
                      parseFloat(p.stock) * (parseFloat(valVentaManual) || 0)

                    // 4. GANANCIA TOTAL (Lo vendido + Lo que espero vender del stock - Lo invertido)
                    const gananciaTotal = ventaRealDinero + proyStockRestante - invTotal

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-amber-50/20 transition-all group font-bold"
                      >
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-sm ${p.estaActivo ? 'bg-gray-900 text-amber-400' : 'bg-gray-100 text-gray-400'}`}
                            >
                              <MdInventory size={14} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-tighter text-gray-800">
                              {p.nombre}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="text-xs font-black font-mono">
                            {parseFloat(p.stock).toFixed(2)}
                          </span>
                          <p className="text-[7px] text-gray-400 uppercase">{p.unidadMedida}</p>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="text-xs font-black text-amber-500 font-mono">
                            ${invInicial.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center border-r border-gray-100">
                          <span className="text-xs font-black text-blue-700 font-mono">
                            ${invTotal.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="text-xs font-black text-emerald-600 font-mono">
                            {cantidadVendida.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="text-xs font-black text-emerald-700 font-mono">
                            ${ventaRealDinero.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-2 w-16 mx-auto">
                            <span className="text-amber-500 font-black text-[9px]">$</span>
                            <input
                              type="number"
                              className="w-full bg-transparent py-1 text-[10px] font-black font-mono outline-none"
                              value={valVentaManual}
                              onChange={(e) => handlePrecioVentaChange(p.id, e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="text-xs font-black text-gray-400 font-mono">
                            ${proyStockRestante.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center bg-gray-50/30">
                          <span
                            className={`text-xs font-black font-mono ${gananciaTotal >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
                          >
                            {formatMoney(gananciaTotal.toFixed(2))}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-right">
                          <button
                            onClick={() => handleOpenModal(true, p)}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-all"
                          >
                            <FaEdit size={12} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Pagina <span className="text-gray-900">{currentPage}</span> de{' '}
              <span className="text-gray-900">{totalPages || 1}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border bg-white text-gray-400 disabled:opacity-20 hover:border-amber-400 transition-all"
              >
                <MdChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg border bg-white text-gray-400 disabled:opacity-20 hover:border-amber-400 transition-all"
              >
                <MdChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
              className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-5 text-sm font-black uppercase outline-none focus:border-amber-400 transition-all"
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
                className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-[10px] font-black uppercase outline-none"
              >
                <option value="Quintales">Quintales</option>
                <option value="Kilogramos">Kilogramos</option>
                <option value="Libras">Libras</option>
                <option value="Tacho">Tacho</option>
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
                className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-5 text-sm font-black outline-none focus:border-amber-400 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Inversion Inicial ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.inversionInicial}
              onChange={(e) => setFormData({ ...formData, inversionInicial: e.target.value })}
              placeholder="0.00"
              className="w-full h-12 bg-amber-50/30 border-2 border-amber-100 rounded-xl px-5 text-sm font-black outline-none focus:border-amber-400 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-amber-400 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] border-b-4 border-amber-600 shadow-xl active:scale-95 transition-all"
          >
            {loading ? 'Procesando...' : isEdit ? 'Actualizar Producto' : 'Guardar en Bodega'}
          </button>
        </form>
      </Modal>
    </Container>
  )
}

export default Inventario
