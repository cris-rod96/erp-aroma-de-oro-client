import { useState, useEffect, useMemo } from 'react'
import { Container, InventarioHeader, Modal } from '../../components/index.components'
import { FaEdit } from 'react-icons/fa'
import {
  MdDelete,
  MdInventory,
  MdSwapHoriz,
  MdRefresh,
  MdChevronLeft,
  MdChevronRight,
  MdCalculate,
} from 'react-icons/md'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { productoAPI } from '../../api/index.api'

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
    estaActivo: true,
  })

  const [calc, setCalc] = useState({ valor: '', de: 'Kilogramos', a: 'Quintales', resultado: 0 })

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

  const handleInputChange = (id, value) => {
    setPreciosVenta({ ...preciosVenta, [id]: value })
  }

  const productosFiltrados = useMemo(() => {
    let lista = productos.filter((p) => p.estaActivo === !verEliminados)
    if (searchTerm) {
      const busqueda = searchTerm.toLowerCase().trim()
      return lista.filter((p) => p.nombre?.toLowerCase().includes(busqueda))
    }
    return lista
  }, [productos, searchTerm, verEliminados])

  // --- LÓGICA DE PAGINACIÓN RESTAURADA ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage)
  const currentProductos = useMemo(() => {
    return productosFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [productosFiltrados, currentPage])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6 space-y-8">
        <InventarioHeader
          handleOpenModal={() => setIsModalOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          verEliminados={verEliminados}
          setVerEliminados={setVerEliminados}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* CONVERSOR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-10">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                <MdCalculate className="text-amber-600" size={20} />
                <h3 className="text-gray-800 font-black uppercase text-[11px] tracking-widest">
                  Conversor
                </h3>
              </div>
              <div className="space-y-6">
                <input
                  type="number"
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-gray-800 font-mono text-xl font-black outline-none"
                  placeholder="0.00"
                  value={calc.valor}
                  onChange={(e) => {
                    /* Lógica conversor */
                  }}
                />
                <select
                  className="w-full h-12 bg-white border border-gray-100 rounded-xl px-4 text-[10px] font-black uppercase outline-none"
                  value={calc.de}
                >
                  <option>Kilogramos</option>
                  <option>Quintales</option>
                  <option>Libras</option>
                </select>
                <MdSwapHoriz className="mx-auto text-amber-500" size={20} />
                <select
                  className="w-full h-12 bg-white border border-gray-100 rounded-xl px-4 text-[10px] font-black uppercase outline-none"
                  value={calc.a}
                >
                  <option>Quintales</option>
                </select>
                <div className="bg-amber-50/50 rounded-[2rem] p-8 text-center border border-amber-100/50">
                  <span className="text-4xl font-black text-gray-900 font-mono italic">
                    {calc.resultado.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-50">
                    <tr>
                      <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Producto
                      </th>
                      <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Stock
                      </th>
                      <th className="px-6 py-5 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                        Inversión Total
                      </th>
                      <th className="px-6 py-5 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                        Precio Venta
                      </th>
                      <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Total Venta
                      </th>
                      <th className="px-6 py-5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                        Ganancia
                      </th>
                      <th className="px-6 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Gestión
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fetching ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs italic"
                        >
                          Cargando Bodega...
                        </td>
                      </tr>
                    ) : (
                      currentProductos.map((p) => {
                        const liquidaciones = p.DetalleLiquidacions || []
                        const inversionTotal = liquidaciones.reduce(
                          (acc, curr) => acc + parseFloat(curr.parcial || 0),
                          0
                        )

                        const pVenta = preciosVenta[p.id] ?? '0'
                        const totalVenta = parseFloat(p.stock) * (parseFloat(pVenta) || 0)
                        const margenGanancia = totalVenta - inversionTotal

                        return (
                          <tr key={p.id} className="hover:bg-gray-50 transition-all font-bold">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-amber-400">
                                  <MdInventory size={18} />
                                </div>
                                <span className="text-xs font-black uppercase">{p.nombre}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-black font-mono italic">
                                {parseFloat(p.stock).toFixed(2)}
                              </span>
                              <p className="text-[8px] text-gray-400 uppercase">{p.unidadMedida}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-black text-blue-600 font-mono">
                                ${inversionTotal.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-2 w-24">
                                <span className="text-amber-500 font-black mr-1">$</span>
                                <input
                                  type="number"
                                  className="w-full bg-transparent py-2 text-xs font-black font-mono outline-none"
                                  value={pVenta}
                                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-black text-gray-900 font-mono">
                                ${totalVenta.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`text-sm font-black font-mono ${margenGanancia >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
                              >
                                ${margenGanancia.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-900">
                                  <FaEdit size={16} />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-rose-600">
                                  <MdDelete size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- PAGINACIÓN RESTAURADA --- */}
              <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Página <span className="text-gray-900">{currentPage}</span> de{' '}
                  <span className="text-gray-900">{totalPages || 1}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border bg-white text-gray-400 disabled:opacity-20 hover:border-amber-400 transition-all shadow-sm"
                  >
                    <MdChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2.5 rounded-xl border bg-white text-gray-400 disabled:opacity-20 hover:border-amber-400 transition-all shadow-sm"
                  >
                    <MdChevronRight size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Inventario
