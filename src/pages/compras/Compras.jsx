import { useState } from 'react'
import {
  MdPrint,
  MdReceipt,
  MdDelete,
  MdBusiness,
  MdPersonAdd,
  MdClose,
  MdSmartphone,
  MdDesktopWindows,
} from 'react-icons/md'
import { Container } from '../../components/index.components'

const Compras = () => {
  const empresa = {
    nombre: 'AROMA DE ORO S.A.',
    ruc: '0992837465001',
    direccion: 'Velasco Ibarra, Guayas, Ecuador',
    telefono: '04-2XXXXXX / 09XXXXXXXX',
  }

  // --- ESTADOS DE DATOS ---
  const [productoresDB] = useState([
    {
      cedula: '0940501596',
      nombre: 'CRISTHIAN RODRIGUEZ',
      telefono: '0987654321',
      correo: 'cristhian@mail.com',
    },
  ])

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

  const [liquidaciones, setLiquidaciones] = useState([
    {
      id: 'LIQ-001',
      fecha: '2026-03-10 09:45',
      comprobante: '001-001-000045',
      productor: 'CRISTHIAN RODRIGUEZ',
      producto: 'CACAO CCN51',
      total: 450.75,
      abono: 450.75,
      saldo: 0,
    },
    {
      id: 'LIQ-002',
      fecha: '2026-03-10 10:20',
      comprobante: '001-001-000046',
      productor: 'JUAN PEREZ',
      producto: 'CACAO CCN51',
      total: 320.0,
      abono: 200.0,
      saldo: 120.0,
    },
  ])

  // --- ESTADOS FORMULARIO ---
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null)
  const [productorInfo, setProductorInfo] = useState(null)
  const [mostrarRegistroProductor, setMostrarRegistroProductor] = useState(false)

  const [precio, setPrecio] = useState(0)
  const [prima, setPrima] = useState(0)
  const [ivaPorcentaje, setIvaPorcentaje] = useState(0)
  const [calificacion, setCalificacion] = useState('')
  const [unidad, setUnidad] = useState('QUINTALES')
  const [retencionDesc, setRetencionDesc] = useState('')
  const [retencionPorcentaje, setRetencionPorcentaje] = useState(0)
  const [pagos, setPagos] = useState({ efectivo: 0, cheque: 0, transferencia: 0 })

  // --- LÓGICA ---
  const handleTicketChange = (id) => {
    const tk = ticketsPendientes.find((t) => t.id === id)
    setTicketSeleccionado(tk)
    if (tk) {
      const prod = productoresDB.find((p) => p.cedula === tk.cedulaProductor)
      if (prod) {
        setProductorInfo(prod)
        setMostrarRegistroProductor(false)
      } else {
        setProductorInfo({ cedula: tk.cedulaProductor, nombre: 'NO REGISTRADO' })
        setMostrarRegistroProductor(true)
      }
    }
  }

  const bruto = (ticketSeleccionado?.pesoNeto || 0) * precio
  const parcial = bruto + parseFloat(prima || 0)
  const valorIVA = parcial * (ivaPorcentaje / 100)
  const subtotalConIva = parcial + valorIVA
  const valorRetenido = subtotalConIva * (retencionPorcentaje / 100)
  const totalAPagar = subtotalConIva - valorRetenido
  const montoAbonado = Object.values(pagos).reduce(
    (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
    0
  )
  const saldoADeber = totalAPagar - montoAbonado

  const handlePagoChange = (tipo, valor) => {
    const nuevoValor = parseFloat(valor || 0)
    const otrosPagos = Object.entries(pagos)
      .filter(([k]) => k !== tipo)
      .reduce((acc, [_, v]) => acc + parseFloat(v || 0), 0)
    if (otrosPagos + nuevoValor > totalAPagar + 0.01) return
    setPagos({ ...pagos, [tipo]: valor })
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-2 md:px-6 py-4 text-gray-800 bg-white font-sans">
        {/* CABECERA (ADAPTATIVA) */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start border-b-2 border-gray-800 pb-4 mb-6 gap-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <MdBusiness size={45} className="text-gray-800" />
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                {empresa.nombre}
              </h1>
              <p className="text-[10px] font-bold text-gray-600 uppercase">
                {empresa.ruc} | {empresa.direccion}
              </p>
            </div>
          </div>
          <div className="md:text-right w-full md:w-auto">
            <h2 className="text-base md:text-lg font-black uppercase border-b-2 border-gray-800 inline-block md:block">
              Liquidación de Compra
            </h2>
            <p className="font-mono font-bold text-sm mt-1 uppercase">Borrador: 001-001-X</p>
          </div>
        </div>

        {/* SELECCIÓN Y REGISTRO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 py-4 border-b border-gray-200">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase mb-1 block text-gray-400">
              Ticket de Recepción
            </label>
            <select
              onChange={(e) => handleTicketChange(e.target.value)}
              className="w-full border border-gray-800 p-2 text-sm font-bold uppercase outline-none bg-white h-[42px]"
            >
              <option value="">-- SELECCIONE UN TICKET --</option>
              {ticketsPendientes.map((tk) => (
                <option key={tk.id} value={tk.id}>
                  #{tk.numero} - CI: {tk.cedulaProductor}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase mb-1 block text-gray-400">
              Beneficiario
            </label>
            <div
              className={`border border-gray-800 p-2 text-sm font-black uppercase h-[42px] flex items-center justify-between ${mostrarRegistroProductor ? 'bg-red-50' : 'bg-gray-50'}`}
            >
              {productorInfo?.nombre || ''}
              {mostrarRegistroProductor && (
                <MdPersonAdd className="text-red-600 animate-pulse" size={20} />
              )}
            </div>
          </div>
        </div>

        {/* REGISTRO RÁPIDO (GRID MÓVIL) */}
        {mostrarRegistroProductor && (
          <div className="mb-6 p-4 border-2 border-gray-800 bg-gray-50">
            <h4 className="text-[10px] font-black uppercase mb-3 flex items-center gap-2">
              <MdPersonAdd /> Nuevo Productor
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                readOnly
                value={productorInfo?.cedula}
                className="border p-2 text-xs font-bold bg-gray-200"
              />
              <input
                type="text"
                placeholder="NOMBRE"
                className="border border-gray-800 p-2 text-xs font-bold uppercase outline-none"
              />
              <input
                type="text"
                placeholder="TELÉFONO"
                className="border border-gray-800 p-2 text-xs font-bold outline-none"
              />
              <input
                type="email"
                placeholder="CORREO (OPC)"
                className="border border-gray-800 p-2 text-xs font-bold uppercase outline-none"
              />
            </div>
            <button className="mt-3 w-full bg-gray-900 text-white font-black text-[10px] uppercase p-3">
              Guardar Productor
            </button>
          </div>
        )}

        {/* DETALLE (VERSION DESKTOP VS MOBILE) */}
        <div className="mb-8 hidden md:block">
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead className="bg-gray-800 text-white text-[9px] font-black uppercase">
              <tr>
                <th className="p-2 border-r border-gray-600 text-left">Producto</th>
                <th className="p-2 border-r border-gray-600 text-center">Calif.</th>
                <th className="p-2 border-r border-gray-600 text-center">Unidad</th>
                <th className="p-2 border-r border-gray-600 text-center">Peso Final</th>
                <th className="p-2 border-r border-gray-600 text-center">Precio</th>
                <th className="p-2 border-r border-gray-600 text-center">Prima</th>
                <th className="p-2 border-r border-gray-600 text-center">IVA %</th>
                <th className="p-2 text-right">Parcial</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800 text-center font-black">
                <td className="p-3 border-r border-gray-800 text-left text-[11px]">
                  {ticketSeleccionado ? 'CACAO CCN51 SECO' : '---'}
                </td>
                <td className="p-3 border-r border-gray-800">
                  <input
                    type="text"
                    className="w-full text-center outline-none"
                    placeholder="..."
                  />
                </td>
                <td className="p-3 border-r border-gray-800">
                  <input type="text" value={unidad} className="w-full text-center outline-none" />
                </td>
                <td className="p-3 border-r border-gray-800 font-mono text-xl">
                  {ticketSeleccionado?.pesoNeto || '0.00'}
                </td>
                <td className="p-3 border-r border-gray-800">
                  <input
                    type="number"
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3 border-r border-gray-800">
                  <input
                    type="number"
                    onChange={(e) => setPrima(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3 border-r border-gray-800">
                  <input
                    type="number"
                    onChange={(e) => setIvaPorcentaje(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none"
                    placeholder="0"
                  />
                </td>
                <td className="p-3 text-right font-mono text-xl bg-gray-50">
                  ${parcial.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DETALLE MOBILE CARD */}
        <div className="md:hidden space-y-4 mb-6">
          <div className="border-2 border-gray-800 p-4 bg-gray-50">
            <h3 className="text-[10px] font-black uppercase border-b border-gray-800 mb-3">
              Detalle del Producto
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[8px] font-bold uppercase text-gray-400">Peso Final</label>
                <p className="font-mono font-black text-lg">
                  {ticketSeleccionado?.pesoNeto || '0.00'}
                </p>
              </div>
              <div>
                <label className="text-[8px] font-bold uppercase text-gray-400">Precio</label>
                <input
                  type="number"
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full font-mono font-black text-lg bg-transparent border-b border-gray-800 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-gray-400">Parcial</label>
                <p className="font-mono font-black text-2xl">${parcial.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CIERRE Y PAGOS (COLUMNA EN MÓVIL) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="border border-gray-800 p-4 space-y-4">
            <p className="text-[10px] font-black uppercase border-b border-gray-800 pb-1">
              Retenciones
            </p>
            <input
              type="text"
              placeholder="DESCRIPCIÓN"
              className="w-full border border-gray-400 p-2 text-[10px] font-bold uppercase"
            />
            <div className="flex justify-between items-center">
              <input
                type="number"
                placeholder="%"
                onChange={(e) => setRetencionPorcentaje(e.target.value)}
                className="border border-gray-800 p-2 font-mono font-black text-xl w-24"
              />
              <div className="text-right">
                <span className="text-[9px] font-black uppercase text-gray-500">Valor:</span>
                <p className="text-xl font-mono font-black">-${valorRetenido.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-800 p-4 bg-gray-50">
            <div className="flex justify-between font-black text-2xl uppercase border-b-2 border-gray-800 mb-4 pb-2">
              <span>A PAGAR:</span>
              <span>${totalAPagar.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {['efectivo', 'cheque', 'transferencia'].map((m) => (
                <div key={m}>
                  <label className="text-[8px] font-black uppercase block mb-1">{m}</label>
                  <input
                    type="number"
                    value={pagos[m]}
                    onChange={(e) => handlePagoChange(m, e.target.value)}
                    className="w-full border border-gray-800 p-3 font-mono font-black text-xl outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-gray-800 p-2 text-center">
                <p className="text-[9px] font-black uppercase">Abonado</p>
                <p className="text-xl font-mono font-black">${montoAbonado.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 text-white p-2 text-center">
                <p className="text-[9px] font-black uppercase">Deuda</p>
                <p className="text-xl font-mono font-black">${saldoADeber.toFixed(2)}</p>
              </div>
            </div>
            <button className="w-full bg-gray-900 text-white font-black py-4 uppercase text-xs mt-4 shadow-md">
              Finalizar Liquidación
            </button>
          </div>
        </div>

        {/* HISTORIAL (TABLA DESKTOP / CARDS MOBILE) */}
        <div className="mt-12">
          <h3 className="text-sm font-black uppercase border-b-2 border-gray-800 pb-1 mb-4">
            Historial de Transacciones
          </h3>

          {/* VISTA DESKTOP */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100 text-[9px] font-black uppercase">
                <tr>
                  <th className="p-2 border border-gray-300 text-left">Fecha/Hora</th>
                  <th className="p-2 border border-gray-300 text-left">Comprobante</th>
                  <th className="p-2 border border-gray-300 text-left">Productor</th>
                  <th className="p-2 border border-gray-300 text-right">Total</th>
                  <th className="p-2 border border-gray-300 text-right">Abono</th>
                  <th className="p-2 border border-gray-300 text-right text-red-600">Saldo</th>
                  <th className="p-2 border border-gray-300 text-center">Estado</th>
                  <th className="p-2 border border-gray-300 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {liquidaciones.map((liq) => (
                  <tr
                    key={liq.id}
                    className="text-[10px] font-bold uppercase hover:bg-gray-50 border-b border-gray-300"
                  >
                    <td className="p-2 font-mono text-[12px]">{liq.fecha}</td>
                    <td className="p-2 font-mono font-black text-[12px]">{liq.comprobante}</td>
                    <td className="p-2 font-black">{liq.productor}</td>
                    <td className="p-2 text-right font-mono text-[12px]">
                      ${liq.total.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-700 text-[12px]">
                      ${liq.abono.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-mono text-red-600 text-[12px]">
                      ${liq.saldo.toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-0.5 border text-[8px] font-black ${liq.saldo <= 0 ? 'bg-gray-800 text-white' : 'border-gray-800 text-gray-800'}`}
                      >
                        {liq.saldo <= 0 ? 'PAGADO' : 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="p-2 text-center flex justify-center gap-3">
                      <MdPrint className="cursor-pointer" size={16} />
                      <MdDelete className="cursor-pointer hover:text-red-600" size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MOBILE (CARDS) */}
          <div className="lg:hidden space-y-3">
            {liquidaciones.map((liq) => (
              <div
                key={liq.id}
                className="border border-gray-800 p-3 text-[10px] bg-white shadow-sm"
              >
                <div className="flex justify-between border-b border-gray-200 pb-2 mb-2 italic">
                  <span>{liq.fecha}</span>
                  <span className="font-black">{liq.comprobante}</span>
                </div>
                <p className="font-black text-xs uppercase mb-1">{liq.productor}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    Total: <span className="font-mono font-black">${liq.total.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    Saldo:{' '}
                    <span className="font-mono font-black text-red-600 ">
                      ${liq.saldo.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2 py-0.5 border text-[8px] font-black ${liq.saldo <= 0 ? 'bg-gray-800 text-white' : 'border-gray-800'}`}
                  >
                    {liq.saldo <= 0 ? 'PAGADO' : 'PENDIENTE'}
                  </span>
                  <div className="flex gap-4">
                    <MdPrint size={18} />
                    <MdDelete size={18} className="text-red-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Compras
