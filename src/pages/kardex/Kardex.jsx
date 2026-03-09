import { useState } from 'react'
import { Container } from '../../components/index.components'
import { MdHistory, MdExpandMore, MdInventory2, MdPayments } from 'react-icons/md'

const Kardex = () => {
  const [productoId, setProductoId] = useState('1')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  const productos = [
    { id: '1', nombre: 'Cacao Seco', unidad: 'qq' },
    { id: '2', nombre: 'Maíz Amarillo', unidad: 'qq' },
    { id: '3', nombre: 'Fertilizante Urea', unidad: 'kg' },
  ]

  const movimientos = [
    {
      id: 1,
      pId: '1',
      fecha: '2026-03-05',
      tipo: 'inventario',
      concepto: 'Compra Cacao',
      cant: 100,
      monto: -250,
      saldo: 100,
    },
    {
      id: 2,
      pId: '1',
      fecha: '2026-03-05',
      tipo: 'gastos',
      concepto: 'Pago Jornal',
      cant: 0,
      monto: -45,
      saldo: 100,
    },
    {
      id: 3,
      pId: '1',
      fecha: '2026-03-06',
      tipo: 'inventario',
      concepto: 'Venta Exportadora',
      cant: -50,
      monto: 150,
      saldo: 50,
    },
  ]

  const datosFiltrados = movimientos.filter((m) => {
    const coincideProducto = m.pId === productoId
    const coincideTipo = filtroTipo === 'todos' ? true : m.tipo === filtroTipo
    return coincideProducto && coincideTipo
  })

  const unidadActual = productos.find((p) => p.id === productoId)?.unidad || 'und'

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4">
        {/* ENCABEZADO DE PÁGINA */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter flex items-center gap-3">
              <MdHistory className="text-amber-500" />
              Kardex Operativo
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Historial detallado de movimientos y saldos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* SELECTOR DE PRODUCTO */}
            <div className="relative flex-1 lg:flex-none min-w-[220px]">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-amber-600 uppercase tracking-widest z-10">
                Producto
              </label>
              <select
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl pl-4 pr-10 py-3 text-xs font-black text-gray-700 appearance-none focus:border-amber-400 transition-all shadow-sm uppercase"
              >
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <MdExpandMore
                className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>

            {/* TABS DE FILTRO */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
              {['todos', 'inventario', 'gastos'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
                    filtroTipo === t
                      ? 'bg-gray-900 text-amber-400 shadow-lg'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'todos' ? 'Ver Todo' : t === 'inventario' ? 'Stock' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLA KARDEX */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Fecha
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Concepto / Operación
                </th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-amber-50/30">
                  Mov. Bodega
                </th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Mov. Caja
                </th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Saldo Final
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {datosFiltrados.length > 0 ? (
                datosFiltrados.map((m) => (
                  <tr key={m.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400 font-mono">
                      {m.fecha}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-8 rounded-full ${m.tipo === 'inventario' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-gray-300'}`}
                        ></div>
                        <div>
                          <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                            {m.concepto}
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {m.tipo === 'inventario' ? 'Logística' : 'Finanzas'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-center text-xs font-black bg-amber-50/10 ${m.cant > 0 ? 'text-emerald-600' : m.cant < 0 ? 'text-rose-600' : 'text-gray-300'}`}
                    >
                      {m.cant !== 0
                        ? `${m.cant > 0 ? '+' : ''}${m.cant.toFixed(2)} ${unidadActual.toUpperCase()}`
                        : '---'}
                    </td>
                    <td
                      className={`px-6 py-4 text-center text-xs font-black ${m.monto > 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {m.monto !== 0
                        ? `${m.monto > 0 ? '+' : '-'}$${Math.abs(m.monto).toFixed(2)}`
                        : '$0.00'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-gray-900 bg-gray-100 px-4 py-1.5 rounded-xl border border-gray-200">
                        {m.saldo.toFixed(2)}{' '}
                        <small className="text-gray-400 text-[9px] font-black uppercase ml-1">
                          {unidadActual}
                        </small>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest"
                  >
                    Sin registros para esta selección
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* BARRA DE ESTADO INFERIOR */}
          <div className="bg-gray-900 px-8 py-5 flex flex-wrap justify-between items-center gap-6">
            <div className="flex gap-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400">
                  <MdInventory2 size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">
                    Stock Disponible
                  </span>
                  <span className="text-white text-base font-black tracking-tight mt-1 uppercase">
                    50.00 {unidadActual}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 border-l border-gray-800 pl-10">
                <div className="p-2 bg-rose-400/10 rounded-lg text-rose-400">
                  <MdPayments size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">
                    Inversión Neta
                  </span>
                  <span className="text-white text-base font-black tracking-tight mt-1">
                    -$145.00
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 py-1 rounded-full border border-gray-700 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] italic">
              Aroma de Oro v2.0
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Kardex
