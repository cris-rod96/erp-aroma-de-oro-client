import { useState, useEffect, useMemo } from 'react'
import { Container } from '../../components/index.components'
import {
  MdHistory,
  MdExpandMore,
  MdInventory2,
  MdPayments,
  MdInfoOutline,
  MdAccountBalanceWallet,
} from 'react-icons/md'
import { movimientoAPI, productoAPI, cajaAPI } from '../../api/index.api'
import { useAuthStore } from '../../store/useAuthStore'

const Kardex = () => {
  const [movimientosRaw, setMovimientosRaw] = useState([])
  const [productos, setProductos] = useState([])
  const [cajas, setCajas] = useState([])

  // ESTADOS DE FILTRO
  const [productoId, setProductoId] = useState('')
  const [cajaId, setCajaId] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [loading, setLoading] = useState(true)

  const token = useAuthStore((store) => store.token)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resProd, resMov, resCajas] = await Promise.all([
        productoAPI.listarProductos(token),
        movimientoAPI.listarTodos(token),
        cajaAPI.listarTodas(token), // Asumiendo que tienes esta ruta
      ])

      const prods = resProd.data.productos || []
      setProductos(prods)
      if (prods.length > 0 && !productoId) setProductoId(prods[0].id)

      setMovimientosRaw(resMov.data.movimientos || [])
      setCajas(resCajas.data.cajas || [])
    } catch (error) {
      console.error('Error en Kardex:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // PROCESAMIENTO CON FILTROS Y SALDOS
  const dataProcesada = useMemo(() => {
    if (!productoId) return []

    let saldoAcumulado = 0

    return (
      movimientosRaw
        .filter((m) => m.ProductoId === productoId)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map((m) => {
          const esEntrada = m.categoria === 'Compra'
          const cantidadMov = esEntrada ? parseFloat(m.cantidad || 0) : -parseFloat(m.cantidad || 0)
          saldoAcumulado += cantidadMov

          return {
            ...m,
            cantidadMov,
            saldoAcumulado,
            // Mapeo para los filtros de la interfaz
            tipoInterfaz:
              m.categoria === 'Compra' || m.categoria === 'Venta' ? 'inventario' : 'gastos',
          }
        })
        // Aplicamos filtros de Interfaz (Caja y Tipo)
        .filter((m) => {
          const coincideCaja = cajaId === 'todas' ? true : m.CajaId === cajaId
          const coincideTipo = filtroTipo === 'todos' ? true : m.tipoInterfaz === filtroTipo
          return coincideCaja && coincideTipo
        })
        .reverse()
    )
  }, [movimientosRaw, productoId, cajaId, filtroTipo])

  const productoActual = productos.find((p) => p.id === productoId)

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4">
        {/* ENCABEZADO Y FILTROS */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter flex items-center gap-3">
              <MdHistory className="text-amber-500" /> Kardex Operativo
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Gestión de Stock y Movimientos de Caja
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            {/* SELECTOR PRODUCTO */}
            <div className="relative flex-1 min-w-[200px]">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-amber-600 uppercase z-10">
                Producto
              </label>
              <select
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-xs font-black text-gray-700 appearance-none focus:border-amber-400 outline-none shadow-sm uppercase"
              >
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <MdExpandMore
                className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>

            {/* SELECTOR CAJA */}
            <div className="relative flex-1 min-w-[200px]">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-emerald-600 uppercase z-10">
                Filtrar por Caja
              </label>
              <select
                value={cajaId}
                onChange={(e) => setCajaId(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl pl-9 pr-10 py-2.5 text-xs font-black text-gray-700 appearance-none focus:border-emerald-400 outline-none shadow-sm uppercase"
              >
                <option value="todas">Todas las Cajas</option>
                {cajas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre || `Caja ${c.id.slice(0, 4)}`}
                  </option>
                ))}
              </select>
              <MdAccountBalanceWallet
                className="absolute left-3 top-3 text-emerald-500"
                size={16}
              />
              <MdExpandMore
                className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>

            {/* TABS DE TIPO */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              {['todos', 'inventario', 'gastos'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg ${filtroTipo === t ? 'bg-gray-900 text-amber-400 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t === 'todos' ? 'Ver Todo' : t === 'inventario' ? 'Stock' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLA KARDEX */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5 text-left">Fecha / Hora</th>
                <th className="px-6 py-5 text-left">Concepto Operativo</th>
                <th className="px-6 py-5 text-center bg-amber-50/30">Mov. Bodega</th>
                <th className="px-6 py-5 text-center">Mov. Caja</th>
                <th className="px-6 py-5 text-right">Saldo Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {dataProcesada.length > 0 ? (
                dataProcesada.map((m) => (
                  <tr key={m.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400 font-mono">
                      {new Date(m.fecha).toLocaleString('es-EC')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-8 rounded-full ${m.tipoInterfaz === 'inventario' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-gray-300'}`}
                        ></div>
                        <div>
                          <div className="text-sm font-black text-gray-800 uppercase tracking-tighter">
                            {m.categoria}
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            Ref: {m.idReferencia.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-center text-xs font-black bg-amber-50/10 ${m.cantidadMov > 0 ? 'text-emerald-600' : m.cantidadMov < 0 ? 'text-rose-600' : 'text-gray-300'}`}
                    >
                      {m.cantidadMov !== 0
                        ? `${m.cantidadMov > 0 ? '+' : ''}${m.cantidadMov.toFixed(2)} ${productoActual?.unidadMedida.toUpperCase()}`
                        : '---'}
                    </td>
                    <td
                      className={`px-6 py-4 text-center text-xs font-black ${m.tipoMovimiento === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {m.tipoMovimiento === 'Ingreso' ? '+' : '-'}${parseFloat(m.monto).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-gray-900 bg-gray-100 px-4 py-1.5 rounded-xl border border-gray-200">
                        {m.saldoAcumulado.toFixed(2)}{' '}
                        <small className="text-gray-400 text-[9px]">
                          {productoActual?.unidadMedida}
                        </small>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-20 text-center text-gray-300 font-black uppercase tracking-widest italic"
                  >
                    <MdInfoOutline size={40} className="mx-auto mb-2 opacity-20" /> No hay datos con
                    estos filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* TOTALES */}
          <div className="bg-gray-900 px-8 py-6 flex flex-wrap justify-between items-center">
            <div className="flex gap-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400/10 rounded-xl text-amber-400">
                  <MdInventory2 size={22} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">
                    Stock Disponible
                  </p>
                  <p className="text-white text-lg font-black mt-1 uppercase">
                    {dataProcesada.length > 0 ? dataProcesada[0].saldoAcumulado.toFixed(2) : '0.00'}{' '}
                    {productoActual?.unidadMedida}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-[10px] font-black text-gray-600 uppercase italic tracking-widest bg-black/30 px-4 py-1.5 rounded-full border border-gray-800">
              Aroma de Oro | ERP v2.0
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Kardex
