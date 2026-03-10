import { useState, useEffect } from 'react'
import {
  MdReceipt,
  MdAdd,
  MdPrint,
  MdVisibility,
  MdLocalShipping,
  MdAttachMoney,
  MdCheckCircle,
  MdCalendarToday,
  MdSearch,
  MdPersonAdd,
  MdClose,
} from 'react-icons/md'
import { FaBoxOpen, FaIdCard } from 'react-icons/fa'
import { Container, Modal } from '../../components/index.components'
import Swal from 'sweetalert2'

const Ventas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [compradorEncontrado, setCompradorEncontrado] = useState(null)
  const [mostrarRegistroComprador, setMostrarRegistroComprador] = useState(false)

  const [listadoVentas, setListadoVentas] = useState([
    {
      id: 'v1',
      numeroFactura: 'FAC-001',
      fecha: '2026-03-09',
      comprador: 'EXPORTADORA NOBOA',
      ruc: '0999999999001',
      producto: 'CACAO CCN-51 SECO',
      cantidadQuintales: 150.0,
      precioUnitario: 125.5,
      totalFactura: 18825.0,
      montoAbonado: 10000.0,
      montoPendiente: 8825.0,
      estado: 'Crédito',
    },
  ])

  // CORRECCIÓN DE FECHA LOCAL (Ecuador UTC-5)
  const getFechaLocal = () => {
    const hoy = new Date()
    const offset = hoy.getTimezoneOffset() * 60000
    const localISOTime = new Date(hoy - offset).toISOString().slice(0, 10)
    return localISOTime
  }

  const [formData, setFormData] = useState({
    numeroFactura: '',
    fecha: getFechaLocal(),
    cantidadQuintales: '',
    precioUnitario: '',
    totalFactura: 0,
    estado: 'Cobrado',
    montoAbonado: '',
    montoPendiente: 0,
    CompradorId: '',
    nuevoNombre: '',
    nuevaDireccion: '',
    nuevoTelefono: '',
  })

  const generarProximoNumero = () => {
    if (listadoVentas.length === 0) return 'FAC-001'
    const numeros = listadoVentas.map((v) => parseInt(v.numeroFactura.split('-')[1]) || 0)
    return `FAC-${String(Math.max(...numeros) + 1).padStart(3, '0')}`
  }

  useEffect(() => {
    if (isModalOpen) {
      setFormData((prev) => ({
        ...prev,
        numeroFactura: generarProximoNumero(),
        fecha: getFechaLocal(), // Refrescar fecha al abrir
      }))
    }
  }, [isModalOpen])

  useEffect(() => {
    const total =
      (parseFloat(formData.cantidadQuintales) || 0) * (parseFloat(formData.precioUnitario) || 0)
    const abono = formData.estado === 'Cobrado' ? total : parseFloat(formData.montoAbonado) || 0
    setFormData((prev) => ({
      ...prev,
      totalFactura: total.toFixed(2),
      montoPendiente: (total - abono).toFixed(2),
      ...(formData.estado === 'Cobrado' && { montoAbonado: total.toFixed(2) }),
    }))
  }, [formData.cantidadQuintales, formData.precioUnitario, formData.estado, formData.montoAbonado])

  const handleBuscarComprador = () => {
    if (cedulaBusqueda === '0999999999001') {
      setCompradorEncontrado({ id: 'c1', nombre: 'EXPORTADORA NOBOA' })
      setFormData({ ...formData, CompradorId: 'c1' })
      setMostrarRegistroComprador(false)
    } else {
      setCompradorEncontrado(null)
      setMostrarRegistroComprador(true)
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Ventas
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Aroma de Oro - Gestión de Facturación
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-amber-400 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
          >
            <MdAdd size={20} /> Nueva Venta
          </button>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Factura / Cliente</th>
                <th className="px-6 py-5 text-center">Volumen</th>
                <th className="px-6 py-5 text-right font-bold">Total</th>
                <th className="px-6 py-5 text-right text-emerald-600">Abono</th>
                <th className="px-6 py-5 text-right text-rose-600">Saldo</th>
                <th className="px-6 py-5 text-center">Estado</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {listadoVentas.map((venta) => (
                <tr key={venta.id} className="hover:bg-amber-50/10 transition-colors">
                  <td className="px-6 py-4 flex items-center">
                    <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center mr-4 shadow-sm">
                      <MdReceipt size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800 uppercase leading-none">
                        {venta.numeroFactura}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                        {venta.comprador}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-black text-gray-800 italic">
                      {venta.cantidadQuintales} QQ
                    </p>
                    <p className="text-[9px] text-amber-600 font-black uppercase">
                      {venta.producto}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-black text-gray-900">
                    ${venta.totalFactura.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-black text-emerald-600 bg-emerald-50/20">
                    ${venta.montoAbonado.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-black text-rose-600 bg-rose-50/20">
                    ${venta.montoPendiente.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${venta.estado === 'Cobrado' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                      {venta.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-900 transition-all">
                      <MdPrint size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CORREGIDO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setMostrarRegistroComprador(false)
        }}
        title={`REGISTRAR VENTA: ${formData.numeroFactura}`}
      >
        <form className="space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar p-1">
          {/* BUSCADOR DE RUC */}
          <div className="bg-gray-900 p-6 rounded-[2.5rem] shadow-2xl space-y-4 border border-white/5">
            <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FaIdCard size={16} /> Identificación del Comprador
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cedulaBusqueda}
                onChange={(e) => setCedulaBusqueda(e.target.value)}
                className="flex-1 h-12 bg-white/10 border border-white/10 rounded-2xl px-5 text-white font-black text-sm outline-none focus:border-amber-400 transition-all placeholder:text-gray-500"
                placeholder="INGRESE RUC O CÉDULA..."
              />
              <button
                type="button"
                onClick={handleBuscarComprador}
                className="bg-amber-400 text-gray-900 px-8 rounded-2xl font-black text-[10px] uppercase hover:bg-amber-300 transition-all shadow-lg active:scale-95"
              >
                Buscar
              </button>
            </div>

            {compradorEncontrado && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in duration-300">
                <div className="flex items-center gap-4">
                  <MdCheckCircle className="text-emerald-400" size={26} />
                  <div>
                    <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">
                      Cliente Verificado
                    </p>
                    <p className="text-sm text-white font-black uppercase tracking-tight">
                      {compradorEncontrado.nombre}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompradorEncontrado(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <MdClose size={22} />
                </button>
              </div>
            )}

            {mostrarRegistroComprador && (
              <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest mb-1">
                  <MdPersonAdd size={20} /> Cliente no registrado. Ingrese los datos:
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="NOMBRE / RAZÓN SOCIAL"
                    className="h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-black text-white uppercase outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="TELÉFONO"
                    className="h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-black text-white uppercase outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="DIRECCIÓN COMPLETA"
                    className="col-span-2 h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-black text-white uppercase outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PRODUCTO Y FECHA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">
                Producto
              </label>
              <div className="flex items-center h-14 bg-gray-50 border border-gray-200 rounded-[1.5rem] px-5 focus-within:border-amber-400 transition-all">
                <FaBoxOpen className="text-amber-500 mr-3" size={18} />
                <select className="bg-transparent w-full text-xs font-black text-gray-700 uppercase outline-none cursor-pointer">
                  <option>CACAO CCN-51 SECO</option>
                  <option>CACAO CCN-51 EN BABA</option>
                  <option>MAÍZ AMARILLO</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">
                Fecha de Venta
              </label>
              <div className="flex items-center h-14 bg-gray-50 border border-gray-200 rounded-[1.5rem] px-5">
                <MdCalendarToday className="text-amber-500 mr-3" size={18} />
                <input
                  type="date"
                  value={formData.fecha}
                  className="bg-transparent w-full text-xs font-black text-gray-700 outline-none"
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* PRECIOS Y TOTAL (NUEVO DISEÑO DE FILA) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">
                Quintales (QQ)
              </label>
              <input
                type="number"
                value={formData.cantidadQuintales}
                onChange={(e) => setFormData({ ...formData, cantidadQuintales: e.target.value })}
                className="h-14 w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 text-sm font-black text-gray-800 font-mono outline-none focus:border-amber-400"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">
                Precio Unitario
              </label>
              <input
                type="number"
                value={formData.precioUnitario}
                onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                className="h-14 w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 text-sm font-black text-gray-800 font-mono outline-none focus:border-amber-400"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-center block font-serif italic">
                Total Neto
              </label>
              <div className="h-16 bg-amber-50 border-2 border-amber-200 rounded-[1.5rem] flex items-center justify-center font-black font-mono text-amber-700 text-2xl italic shadow-inner">
                ${formData.totalFactura}
              </div>
            </div>
          </div>

          {/* PAGO */}
          <div className="bg-gray-50 p-7 rounded-[2.5rem] border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MdAttachMoney size={20} className="text-amber-500" /> Forma de Pago
              </p>
              <div className="flex bg-white p-1.5 rounded-2xl shadow-inner border border-gray-100 w-full sm:w-auto">
                {['Cobrado', 'Crédito'].map((opc) => (
                  <button
                    key={opc}
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: opc })}
                    className={`flex-1 sm:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${formData.estado === opc ? 'bg-gray-900 text-amber-400 shadow-xl scale-105' : 'text-gray-300 hover:text-gray-500'}`}
                  >
                    {opc}
                  </button>
                ))}
              </div>
            </div>

            {formData.estado === 'Crédito' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in slide-in-from-top-3 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-2 italic">
                    Abono Inicial
                  </label>
                  <input
                    type="number"
                    value={formData.montoAbonado}
                    onChange={(e) => setFormData({ ...formData, montoAbonado: e.target.value })}
                    className="h-14 w-full bg-white border border-emerald-200 rounded-[1.5rem] px-6 text-sm font-black text-emerald-700 font-mono outline-none shadow-sm focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-2 italic">
                    Saldo a Cobrar
                  </label>
                  <div className="h-14 bg-rose-50 border border-rose-100 rounded-[1.5rem] flex items-center justify-center font-black font-mono text-rose-700 text-base shadow-inner">
                    ${formData.montoPendiente}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTONES FINALES */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all active:scale-95"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="flex-[2] py-5 bg-gray-900 text-amber-400 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 border-b-4 border-amber-600"
            >
              Finalizar Registro {formData.numeroFactura}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </Container>
  )
}

export default Ventas
