import { useState, useEffect } from 'react'
import { Container, Modal } from '../../components/index.components'
import { FaPlus, FaTicketAlt, FaSearch, FaIdCard, FaBox } from 'react-icons/fa'
import {
  MdDelete,
  MdScale,
  MdDirectionsCar,
  MdInbox,
  MdHistory,
  MdCalendarToday,
  MdBalance,
} from 'react-icons/md'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { ticketAPI, productoAPI } from '../../api/index.api'

const Tickets = () => {
  // --- DATOS DE EJEMPLO (MOCK DATA) ---
  const ticketsEjemplo = [
    {
      id: '1',
      numero: 'TKT-001-2026',
      identificacionTemporal: '0955842231',
      placaVehiculo: 'GBA-1234',
      pesoBruto: 150.75,
      taraVehiculo: 50.25,
      pesoNeto: 100.5,
      estadoTicket: 'Pendiente',
      fechaIngreso: '2026-03-10',
      Producto: { nombre: 'CACAO SECO' },
    },
    {
      id: '2',
      numero: 'TKT-002-2026',
      identificacionTemporal: '1204455871',
      placaVehiculo: 'PBX-9088',
      pesoBruto: 200.0,
      taraVehiculo: 60.0,
      pesoNeto: 140.0,
      estadoTicket: 'Liquidado',
      fechaIngreso: '2026-03-09',
      Producto: { nombre: 'MAÍZ AMARILLO' },
    },
  ]

  const productosEjemplo = [
    { id: 'p1', nombre: 'CACAO SECO' },
    { id: 'p2', nombre: 'MAÍZ AMARILLO' },
  ]

  // --- ESTADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tickets, setTickets] = useState(ticketsEjemplo)
  const [productos, setProductos] = useState(productosEjemplo)
  const [fetching, setFetching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filtro, setFiltro] = useState('')

  // Sincronizado con TicketModel de Sequelize
  const [formData, setFormData] = useState({
    identificacionTemporal: '',
    placaVehiculo: '',
    pesoBruto: '',
    taraVehiculo: '',
    pesoNeto: 0,
    ProductoId: '',
  })

  const token = useAuthStore((state) => state.token)

  // --- CÁLCULO DE PESO NETO AUTOMÁTICO ---
  useEffect(() => {
    const bruto = parseFloat(formData.pesoBruto) || 0
    const tara = parseFloat(formData.taraVehiculo) || 0
    setFormData((prev) => ({ ...prev, pesoNeto: (bruto - tara).toFixed(2) }))
  }, [formData.pesoBruto, formData.taraVehiculo])

  // --- LÓGICA DE API (COMENTADA) ---
  const fetchTickets = async () => {
    /* setFetching(true)
    try {
      const [respTickets, respProds] = await Promise.all([
        ticketAPI.listarTickets(token),
        productoAPI.listarProductos(token)
      ])
      setTickets(respTickets.data.tickets || respTickets.data || [])
      setProductos(respProds.data.productos || respProds.data || [])
    } catch (error) { 
      console.error('Error Aroma de Oro:', error) 
    } finally { 
      setFetching(false) 
    } 
    */
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // --- MANEJADORES ---
  const handleOpenModal = () => {
    setFormData({
      identificacionTemporal: '',
      placaVehiculo: '',
      pesoBruto: '',
      taraVehiculo: '',
      pesoNeto: 0,
      ProductoId: productos[0]?.id || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulación de guardado exitoso
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Ticket Generado',
        text: 'Registro guardado en base de datos',
        confirmButtonColor: '#111827',
      })
      setIsModalOpen(false)
      setLoading(false)
      // fetchTickets() <- Llamar aquí en producción
    }, 800)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* ENCABEZADO PROLIJO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter leading-none">
              Control de Pesaje
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Registro de Entradas Aroma de Oro
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="BUSCAR CÉDULA..."
                className="bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-[10px] font-black uppercase outline-none focus:border-amber-400 shadow-sm w-full sm:w-64"
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            <button
              onClick={handleOpenModal}
              className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 italic"
            >
              <FaPlus size={14} /> Nuevo Registro
            </button>
          </div>
        </div>

        {/* TABLA CON DESGLOSE DE PESOS */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
              Sincronizando Báscula...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Ticket / Proveedor
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">
                      Producto / Fecha
                    </th>
                    <th className="px-4 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-l border-gray-50">
                      P. Bruto
                    </th>
                    <th className="px-4 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-l border-gray-50">
                      Tara
                    </th>
                    <th className="px-4 py-5 text-center text-[10px] font-black text-amber-600 uppercase tracking-widest border-l border-amber-50 bg-amber-50/30">
                      P. Neto
                    </th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">
                      Estado
                    </th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tickets
                    .filter((t) => t.identificacionTemporal.includes(filtro))
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center mr-4 shadow-md">
                              <FaTicketAlt size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black uppercase tracking-tighter text-gray-800 italic">
                                {t.numero}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400">
                                {t.identificacionTemporal}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">
                              {t.Producto?.nombre}
                            </span>
                            <span className="flex items-center text-[9px] font-bold text-gray-400 mt-0.5 uppercase">
                              <MdCalendarToday className="mr-1" /> {t.fechaIngreso}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center border-l border-gray-50">
                          <span className="text-xs font-mono font-bold text-gray-600">
                            {parseFloat(t.pesoBruto).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center border-l border-gray-50">
                          <span className="text-xs font-mono font-bold text-gray-400">
                            {parseFloat(t.taraVehiculo).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center border-l border-amber-100 bg-amber-50/20">
                          <span className="text-sm font-mono font-black text-gray-900 italic">
                            {parseFloat(t.pesoNeto).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center hidden lg:table-cell">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${t.estadoTicket === 'Liquidado' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}
                          >
                            {t.estadoTicket}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                              <MdHistory size={20} />
                            </button>
                            <button className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
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

      {/* MODAL DE UNA COLUMNA (Estilo Inventario) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Registro de Pesaje"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Identificación Proveedor
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all">
              <FaIdCard className="text-amber-500 mr-3" size={18} />
              <input
                type="text"
                required
                value={formData.identificacionTemporal}
                onChange={(e) =>
                  setFormData({ ...formData, identificacionTemporal: e.target.value })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="Cédula / RUC"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Producto
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 px-4">
              <FaBox className="text-amber-500 mr-3" size={18} />
              <select
                value={formData.ProductoId}
                required
                onChange={(e) => setFormData({ ...formData, ProductoId: e.target.value })}
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase cursor-pointer"
              >
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Placa Vehículo
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 px-4">
              <MdDirectionsCar className="text-amber-500 mr-3" size={20} />
              <input
                type="text"
                value={formData.placaVehiculo}
                onChange={(e) =>
                  setFormData({ ...formData, placaVehiculo: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="Ej. GBA-0000"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 mt-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">P. Bruto</label>
                <div className="flex items-center h-10 bg-white rounded-lg border border-gray-200 px-3">
                  <MdScale className="text-amber-500 mr-2" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.pesoBruto}
                    onChange={(e) => setFormData({ ...formData, pesoBruto: e.target.value })}
                    className="bg-transparent w-full outline-none text-sm font-black text-gray-800"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase">Tara</label>
                <div className="flex items-center h-10 bg-white rounded-lg border border-gray-200 px-3">
                  <MdScale className="text-gray-300 mr-2" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taraVehiculo}
                    onChange={(e) => setFormData({ ...formData, taraVehiculo: e.target.value })}
                    className="bg-transparent w-full outline-none text-sm font-black text-gray-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-xl border-l-4 border-amber-400 shadow-lg">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Peso Neto Calculado
              </span>
              <div className="text-xl font-black italic text-amber-400 leading-none">
                {formData.pesoNeto} <span className="text-[10px] font-sans">QQ</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-200 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl italic active:scale-95 border-b-4 border-amber-600"
            >
              {loading ? 'Procesando...' : 'Confirmar Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Tickets
