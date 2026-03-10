import { useState } from 'react'
import {
  MdReceipt,
  MdPrint,
  MdDelete,
  MdBusiness,
  MdPersonAdd,
  MdClose,
  MdAttachMoney,
  MdSearch,
} from 'react-icons/md'
import { Container } from '../../components/index.components'

const Ventas = () => {
  const empresa = {
    nombre: 'AROMA DE ORO S.A.',
    ruc: '0992837465001',
    direccion: 'Velasco Ibarra, Guayas, Ecuador',
  }

  // --- DATOS SIMULADOS ---
  const [compradoresDB] = useState([
    {
      ruc: '0999999999001',
      nombre: 'EXPORTADORA NOBOA',
      telefono: '042-555-555',
      direccion: 'Guayaquil, Ecuador',
    },
  ])

  const [listadoVentas, setListadoVentas] = useState([
    {
      id: 'v1',
      numero: 'FAC-001',
      fecha: '2026-03-10 09:45',
      comprador: 'EXPORTADORA NOBOA',
      producto: 'CACAO CCN-51 SECO',
      total: 18825.0,
      saldo: 8825.0,
    },
  ])

  // --- ESTADOS DEL FORMULARIO ---
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [compradorInfo, setCompradorInfo] = useState(null)
  const [mostrarRegistroComprador, setMostrarRegistroComprador] = useState(false)
  const [formData, setFormData] = useState({
    cantidad: '',
    precio: '',
    abonoManual: '',
    esCredito: false,
  })

  // --- LÓGICA DE BÚSQUEDA ---
  const handleBuscarComprador = () => {
    const encontrado = compradoresDB.find((c) => c.ruc === cedulaBusqueda)
    if (encontrado) {
      setCompradorInfo(encontrado)
      setMostrarRegistroComprador(false)
    } else {
      setCompradorInfo({ ruc: cedulaBusqueda, nombre: 'CLIENTE NO REGISTRADO' })
      setMostrarRegistroComprador(true)
    }
  }

  // --- CÁLCULOS ---
  const total = (parseFloat(formData.cantidad) || 0) * (parseFloat(formData.precio) || 0)
  const abonado = formData.esCredito ? parseFloat(formData.abonoManual) || 0 : total
  const saldo = total - abonado

  return (
    <Container fullWidth={true}>
      <div className="w-full px-6 py-4 text-gray-800 bg-white font-sans">
        {/* CABECERA */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <MdBusiness size={45} className="text-gray-800" />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                {empresa.nombre}
              </h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                Facturación de Ventas | RUC: {empresa.ruc}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black uppercase border-b-2 border-gray-800 px-2">
              Factura de Venta
            </h2>
            <p className="font-mono font-bold text-sm mt-1">Nº FAC-002</p>
          </div>
        </div>

        {/* BUSCADOR DE COMPRADOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 py-4 border-b border-gray-200">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase mb-1 block text-gray-400">
              RUC / Cédula del Comprador
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cedulaBusqueda}
                onChange={(e) => setCedulaBusqueda(e.target.value)}
                className="flex-1 border border-gray-800 p-2 text-sm font-bold uppercase outline-none focus:bg-gray-50"
                placeholder="09XXXXXXXX001"
              />
              <button
                onClick={handleBuscarComprador}
                className="bg-gray-800 text-white px-6 flex items-center gap-2 text-[10px] font-black uppercase"
              >
                <MdSearch size={16} /> Buscar
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase mb-1 block text-gray-400">
              Razón Social
            </label>
            <div
              className={`border border-gray-800 p-2 text-sm font-black uppercase h-[40px] flex items-center justify-between ${mostrarRegistroComprador ? 'bg-red-50 text-red-600 border-red-600' : 'bg-gray-50'}`}
            >
              {compradorInfo?.nombre || ''}
              {mostrarRegistroComprador && <MdPersonAdd size={18} className="animate-pulse" />}
            </div>
          </div>
        </div>

        {/* REGISTRO RÁPIDO DE COMPRADOR (Igual a Liquidaciones) */}
        {mostrarRegistroComprador && (
          <div className="mb-6 p-4 border-2 border-gray-800 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-black uppercase flex items-center gap-2">
                <MdPersonAdd /> Registro de Nuevo Comprador
              </h4>
              <button onClick={() => setMostrarRegistroComprador(false)}>
                <MdClose size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="NOMBRE / EMPRESA"
                className="border border-gray-800 p-2 text-xs font-bold uppercase outline-none focus:bg-white"
              />
              <input
                type="text"
                placeholder="TELÉFONO"
                className="border border-gray-800 p-2 text-xs font-bold outline-none focus:bg-white"
              />
              <input
                type="text"
                placeholder="DIRECCIÓN"
                className="border border-gray-800 p-2 text-xs font-bold uppercase outline-none focus:bg-white"
              />
            </div>
            <button className="mt-3 w-full md:w-auto bg-gray-900 text-white font-black text-[10px] uppercase p-3 px-10">
              Guardar Comprador
            </button>
          </div>
        )}

        {/* DETALLE DE VENTA */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead className="bg-gray-800 text-white text-[9px] font-black uppercase">
              <tr>
                <th className="p-2 border-r border-gray-600 text-left">Descripción del Producto</th>
                <th className="p-2 border-r border-gray-600 text-center w-32">Cantidad (QQ)</th>
                <th className="p-2 border-r border-gray-600 text-center w-32">Precio ($)</th>
                <th className="p-2 text-right w-40">Total ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800 font-bold">
                <td className="p-3 border-r border-gray-800 font-black text-sm uppercase">
                  <select className="bg-transparent outline-none w-full">
                    <option>CACAO CCN-51 SECO</option>
                    <option>CACAO CCN-51 EN BABA</option>
                    <option>MAÍZ AMARILLO</option>
                  </select>
                </td>
                <td className="p-3 border-r border-gray-800">
                  <input
                    type="number"
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    className="w-full text-center font-mono text-xl outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3 border-r border-gray-800 bg-gray-50/50">
                  <input
                    type="number"
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full text-center font-mono text-xl outline-none bg-transparent"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3 text-right font-mono text-xl bg-gray-50">${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PAGOS Y CIERRE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="border border-gray-800 p-4 space-y-4">
            <p className="text-[10px] font-black uppercase border-b border-gray-800 pb-1">
              Condiciones de Cobro
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFormData({ ...formData, esCredito: false })}
                className={`flex-1 p-2 text-[10px] font-black border border-gray-800 ${!formData.esCredito ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400'}`}
              >
                AL CONTADO
              </button>
              <button
                onClick={() => setFormData({ ...formData, esCredito: true })}
                className={`flex-1 p-2 text-[10px] font-black border border-gray-800 ${formData.esCredito ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400'}`}
              >
                A CRÉDITO
              </button>
            </div>
            {formData.esCredito && (
              <div className="animate-in slide-in-from-top-1 duration-200">
                <label className="text-[9px] font-black uppercase mb-1 block text-gray-400 tracking-tighter">
                  Monto Recibido como Abono
                </label>
                <input
                  type="number"
                  onChange={(e) => setFormData({ ...formData, abonoManual: e.target.value })}
                  className="w-full border border-gray-800 p-2 font-mono font-black text-lg outline-none"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div className="border-2 border-gray-800 p-4 bg-gray-50">
            <div className="flex justify-between font-black text-2xl uppercase border-b-2 border-gray-800 mb-4 pb-2">
              <span>Total a Cobrar:</span>
              <span className="font-mono text-gray-900">${total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white border border-gray-800 p-2">
                <p className="text-[9px] font-black text-gray-500 uppercase">Monto Cobrado</p>
                <p className="text-xl font-mono font-black text-emerald-700">
                  ${abonado.toFixed(2)}
                </p>
              </div>
              <div
                className={`border p-2 ${saldo > 0 ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-800 text-gray-300'}`}
              >
                <p className="text-[9px] font-black uppercase">Saldo Pendiente</p>
                <p className="text-xl font-mono font-black">${saldo.toFixed(2)}</p>
              </div>
            </div>
            <button className="w-full bg-gray-900 text-white font-black py-4 uppercase text-xs mt-4 hover:shadow-lg active:scale-95 transition-all">
              Finalizar Factura de Venta
            </button>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-1">
            <MdReceipt size={18} />
            <h3 className="text-[11px] font-black uppercase">Registro Histórico de Ventas</h3>
          </div>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100 text-[10px] font-black uppercase">
              <tr>
                <th className="p-2 border border-gray-300 text-left">Factura Nº</th>
                <th className="p-2 border border-gray-300 text-left">Cliente</th>
                <th className="p-2 border border-gray-300 text-right">Total</th>
                <th className="p-2 border border-gray-300 text-right">Saldo</th>
                <th className="p-2 border border-gray-300 text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listadoVentas.map((v) => (
                <tr key={v.id} className="text-[11px] font-bold uppercase hover:bg-gray-50">
                  <td className="p-2 border border-gray-300 font-black">{v.numero}</td>
                  <td className="p-2 border border-gray-300 font-black">{v.comprador}</td>
                  <td className="p-2 border border-gray-300 text-right font-mono">
                    ${v.total.toFixed(2)}
                  </td>
                  <td
                    className={`p-2 border border-gray-300 text-right font-mono ${v.saldo > 0 ? 'text-red-600' : 'text-gray-400'}`}
                  >
                    ${v.saldo.toFixed(2)}
                  </td>
                  <td className="p-2 border border-gray-300 text-center flex justify-center gap-4">
                    <MdPrint className="cursor-pointer hover:text-black" size={16} />
                    <MdDelete className="cursor-pointer hover:text-red-600" size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  )
}

export default Ventas
