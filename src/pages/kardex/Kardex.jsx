import { useState } from 'react'
import { Container } from '../../components/index.components'
import { MdInventory2, MdEngineering, MdHistory, MdExpandMore, MdCheckCircle } from 'react-icons/md'

const Kardex = () => {
  // 1. Estados de filtros
  const [productoId, setProductoId] = useState('1')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  // Simulación de datos (En producción vendrían de tus tablas: producto, movimiento, nomina)
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
      concepto: 'Pago Jornal: Limpieza',
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
    {
      id: 4,
      pId: '2',
      fecha: '2026-03-06',
      tipo: 'inventario',
      concepto: 'Cosecha Maíz',
      cant: 200,
      monto: 0,
      saldo: 200,
    },
  ]

  // Lógica de filtrado combinada
  const datosFiltrados = movimientos.filter((m) => {
    const coincideProducto = m.pId === productoId
    const coincideTipo = filtroTipo === 'todos' ? true : m.tipo === filtroTipo
    return coincideProducto && coincideTipo
  })

  // Obtener unidad del producto actual
  const unidadActual = productos.find((p) => p.id === productoId)?.unidad || 'und'

  return (
    <Container fullWidth={true}>
      <div className="w-full px-6 py-6 bg-gray-50 min-h-screen">
        {/* PANEL DE CONTROL SUPERIOR */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md text-white">
              <MdHistory size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none uppercase">
                Kardex
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* SELECTOR DE PRODUCTO */}
            <div className="relative flex-1 lg:flex-none min-w-[200px]">
              <select
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-xs font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
              <MdExpandMore
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* TABS DE FILTRO POR TIPO */}
            <div className="flex bg-gray-200/50 p-1 rounded-lg border border-gray-200 overflow-hidden">
              {['todos', 'inventario', 'gastos'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter transition-all rounded-md ${filtroTipo === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t === 'todos' ? 'Ver Todo' : t === 'inventario' ? 'Stock' : 'Jornales'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLA CORPORATIVA */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Concepto / Operación
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  Mov. Bodega
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Mov. Caja
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Saldo Final
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {datosFiltrados.length > 0 ? (
                datosFiltrados.map((m) => (
                  <tr key={m.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500 font-mono italic">
                      {m.fecha}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1 h-6 rounded-full ${m.tipo === 'inventario' ? 'bg-indigo-200' : 'bg-orange-300'}`}
                        ></div>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{m.concepto}</div>
                          <div className="text-[9px] text-gray-400 font-black uppercase">
                            {m.tipo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-center text-xs font-bold bg-gray-50/30 ${m.cant > 0 ? 'text-green-600' : m.cant < 0 ? 'text-red-600' : 'text-gray-300 italic'}`}
                    >
                      {m.cant !== 0
                        ? `${m.cant > 0 ? '+' : ''}${m.cant.toFixed(2)} ${unidadActual}`
                        : '---'}
                    </td>
                    <td
                      className={`px-6 py-4 text-center text-xs font-black ${m.monto > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {m.monto !== 0
                        ? `${m.monto > 0 ? '+' : '-'}$${Math.abs(m.monto).toFixed(2)}`
                        : '$0.00'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                        {m.saldo.toFixed(2)}{' '}
                        <small className="text-gray-400 font-normal uppercase">
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
                    className="px-6 py-10 text-center text-gray-400 text-xs italic font-medium"
                  >
                    No se encontraron registros para esta selección.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* STATUS BAR (SLIM) */}
          <div className="bg-gray-900 px-6 py-3 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">
                  Total Stock
                </span>
                <span className="text-white text-xs font-black">
                  50.00 {unidadActual.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col border-l border-gray-700 pl-6">
                <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter">
                  Balance Caja
                </span>
                <span className="text-white text-xs font-black">-$145.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Kardex
