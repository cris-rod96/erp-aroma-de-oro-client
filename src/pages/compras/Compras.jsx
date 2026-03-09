import { useState } from 'react'
import {
  MdPayments,
  MdScale,
  MdAccountBalanceWallet,
  MdInventory2,
  MdPersonAdd,
  MdCheckCircle,
  MdPrint,
  MdSend,
} from 'react-icons/md'
import { Container } from '../../components/index.components'

const Compras = () => {
  const [ticketsPendientes] = useState([
    {
      id: 'tk-1',
      numero: '001-992',
      pesoNeto: 125.5,
      cedulaProductor: '0940501596',
      productoId: '1',
    },
    {
      id: 'tk-2',
      numero: '001-995',
      pesoNeto: 80.0,
      cedulaProductor: '1234567890',
      productoId: '2',
    },
  ])

  const [productosBD] = useState([
    { id: '1', nombre: 'Cacao CCN51 Seco', unidad: 'Quintal' },
    { id: '2', nombre: 'Maíz Amarillo Duro', unidad: 'Quintal' },
  ])

  const [productoresDB] = useState([{ cedula: '0940501596', nombre: 'Cristhian Rodríguez' }])

  const [ticketSeleccionado, setTicketSeleccionado] = useState(null)
  const [productoInfo, setProductoInfo] = useState({ nombre: '', unidad: '' })
  const [productor, setProductor] = useState(null)
  const [peso, setPeso] = useState(0)
  const [precio, setPrecio] = useState(0)

  const [retencionDesc, setRetencionDesc] = useState('')
  const [retencionPorcentaje, setRetencionPorcentaje] = useState(0)
  const [pagoEfectivo, setPagoEfectivo] = useState(0)
  const [pagoCheque, setPagoCheque] = useState(0)
  const [pagoTransferencia, setPagoTransferencia] = useState(0)

  const handleTicketChange = (id) => {
    const tk = ticketsPendientes.find((t) => t.id === id)
    if (tk) {
      setTicketSeleccionado(tk)
      setPeso(tk.pesoNeto)
      const prod = productosBD.find((p) => p.id === tk.productoId)
      setProductoInfo(prod || { nombre: 'Desconocido', unidad: '---' })
      const p = productoresDB.find((prod) => prod.cedula === tk.cedulaProductor)
      setProductor(p || { cedula: tk.cedulaProductor, inexistente: true })
    } else {
      setTicketSeleccionado(null)
      setProductoInfo({ nombre: '', unidad: '' })
      setPeso(0)
      setProductor(null)
    }
  }

  const subtotal = peso * precio
  const valorRetenido = subtotal * (retencionPorcentaje / 100)
  const totalAPagar = subtotal - valorRetenido
  const montoAbonado =
    parseFloat(pagoEfectivo || 0) + parseFloat(pagoCheque || 0) + parseFloat(pagoTransferencia || 0)
  const montoPorPagar = totalAPagar - montoAbonado

  const handlePrint = () => {
    window.print()
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-8">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Liquidación de Compra
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Generación de factura y comprobante de pago al productor
            </p>
          </div>
          {ticketSeleccionado && (
            <button
              onClick={handlePrint}
              className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-lg active:scale-95 uppercase tracking-widest"
            >
              <MdPrint size={18} /> Imprimir Borrador
            </button>
          )}
        </div>

        <div className="w-full space-y-8">
          {/* SECCIÓN 1: TICKET Y PRODUCTOR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <label className="text-[11px] font-black text-gray-400 uppercase mb-3 block tracking-widest">
                1. Seleccionar Ticket de Recepción
              </label>
              <select
                onChange={(e) => handleTicketChange(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-gray-800 outline-none focus:border-amber-400 transition-all cursor-pointer uppercase appearance-none"
              >
                <option value="">-- BUSCAR TICKET PENDIENTE... --</option>
                {ticketsPendientes.map((tk) => (
                  <option key={tk.id} value={tk.id}>
                    TICKET #{tk.numero} | C.I: {tk.cedulaProductor}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`rounded-2xl shadow-sm border p-6 flex justify-between items-center transition-all ${productor?.inexistente ? 'bg-orange-50 border-orange-200 animate-pulse' : 'bg-white border-gray-100'}`}
            >
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase mb-1 block tracking-widest">
                  Productor Beneficiario
                </label>
                <p className="text-sm font-black text-gray-800 uppercase leading-none mb-1 tracking-tighter">
                  {productor?.nombre || 'Pendiente'}
                </p>
                <p className="text-xs font-mono text-gray-500 font-bold tracking-widest">
                  {productor?.cedula || 'Esperando ticket...'}
                </p>
              </div>
              {productor?.inexistente && (
                <button className="bg-gray-900 text-amber-400 px-4 py-2 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-2 uppercase tracking-widest transition-transform active:scale-95">
                  <MdPersonAdd size={16} /> REGISTRAR
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECCIÓN 2: PRODUCTO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <MdInventory2 className="text-amber-500" size={20} />
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Detalle de Mercancía
                </h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">
                    Producto
                  </label>
                  <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-gray-600 flex items-center justify-between tracking-tighter uppercase">
                    {productoInfo.nombre || 'SELECCIONE TICKET'}
                    {productoInfo.nombre && (
                      <MdCheckCircle className="text-emerald-500" size={18} />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-amber-600 uppercase mb-2 block tracking-widest">
                    Peso Neto ({productoInfo.unit || '---'})
                  </label>
                  <input
                    type="number"
                    value={peso}
                    readOnly
                    className="w-full bg-amber-50/50 border-2 border-amber-100 rounded-xl px-4 py-3 text-sm font-black text-gray-800 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">
                    Precio por {productoInfo.unidad || 'U'}
                  </label>
                  <input
                    type="number"
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-gray-800 outline-none focus:border-amber-400 shadow-sm font-mono transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN: RETENCIÓN */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <MdAccountBalanceWallet className="text-rose-500" size={18} />
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Retenciones de Ley
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  onChange={(e) => setRetencionDesc(e.target.value)}
                  placeholder="DESCRIPCIÓN (E.J. RETENCIÓN 1.5%)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[10px] font-black outline-none uppercase tracking-widest focus:border-rose-300 transition-all"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-rose-500 font-black text-xs">
                      %
                    </span>
                    <input
                      type="number"
                      onChange={(e) => setRetencionPorcentaje(e.target.value)}
                      className="w-full bg-rose-50/50 border-2 border-rose-100 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-rose-600 outline-none font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[10px] font-black text-gray-400 font-mono flex items-center justify-center">
                    DESC: -${valorRetenido.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN FINAL: PAGOS Y CIERRE */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">
                  Formas de Pago Aplicadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                      Efectivo
                    </span>
                    <input
                      type="number"
                      onChange={(e) => setPagoEfectivo(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-emerald-600 outline-none focus:border-emerald-300 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                      Cheque
                    </span>
                    <input
                      type="number"
                      onChange={(e) => setPagoCheque(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-amber-600 outline-none focus:border-amber-300 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                      Transferencia
                    </span>
                    <input
                      type="number"
                      onChange={(e) => setPagoTransferencia(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-gray-800 outline-none focus:border-gray-300 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* PANEL DE RESULTADO FINAL */}
              <div className="bg-gray-900 rounded-[2rem] p-8 flex flex-col justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-white transform rotate-12">
                  <MdPayments size={100} />
                </div>

                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-2 text-center relative z-10">
                  Total Neto Factura
                </span>
                <span className="text-5xl font-black text-white font-mono text-center tracking-tighter relative z-10">
                  ${totalAPagar.toFixed(2)}
                </span>

                <div className="mt-8 space-y-3 border-t border-gray-800 pt-6 relative z-10">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">Subtotal Bruto:</span>
                    <span className="text-gray-300 font-mono text-xs">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-emerald-500">Pagado:</span>
                    <span className="text-emerald-400 font-mono text-xs">
                      ${montoAbonado.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-rose-500 font-bold">Saldo Pendiente:</span>
                    <span className="text-rose-400 font-mono text-sm font-bold">
                      ${montoPorPagar.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  disabled={productor?.inexistente || !ticketSeleccionado || precio <= 0}
                  className={`mt-8 w-full py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 italic ${
                    productor?.inexistente || !ticketSeleccionado || precio <= 0
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                      : 'bg-amber-400 text-gray-900 hover:bg-amber-300'
                  }`}
                >
                  <MdSend size={18} /> Finalizar e Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Compras
