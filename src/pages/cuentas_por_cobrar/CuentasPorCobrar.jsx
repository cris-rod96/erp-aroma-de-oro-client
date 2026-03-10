import { useState, useEffect, useMemo } from 'react'
import {
  MdPayments,
  MdCalendarToday,
  MdAttachMoney,
  MdReceipt,
  MdSearch,
  MdInbox,
} from 'react-icons/md'
import { FaHistory } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import { cuentasPorCobrarAPI } from '../../api/index.api'

const CuentasPorCobrar = () => {
  const token = useAuthStore((state) => state.token)

  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // --- CARGA DE DATOS ---
  const fetchCuentas = async () => {
    try {
      setLoading(true)
      const resp = await cuentasPorCobrarAPI.listarTodas(token)
      // Adaptamos según la estructura que devuelva tu backend (ej: resp.data.cuentas)
      setCuentas(resp.data.cuentasPorCobrar || resp.data || [])
    } catch (error) {
      console.error('Error al cargar cuentas por cobrar:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCuentas()
  }, [])

  // --- FILTRADO Y CÁLCULOS ---
  const cuentasFiltradas = useMemo(() => {
    return cuentas.filter(
      (c) =>
        c.VentaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.Venta?.Cliente?.nombreCompleto || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [cuentas, searchTerm])

  const carteraTotal = useMemo(() => {
    return cuentas.reduce((acc, curr) => acc + parseFloat(curr.montoPorCobrar), 0)
  }, [cuentas])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Cuentas por Cobrar
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Seguimiento de saldos, abonos y vencimientos de ventas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="BUSCAR POR REFERENCIA O CLIENTE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-amber-400 outline-none transition-all w-72 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* TABLA / CONTENIDO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Referencia Venta</th>
                  <th className="px-6 py-4 text-left">Detalle Montos</th>
                  <th className="px-6 py-4 text-center">Abonos</th>
                  <th className="px-6 py-4 text-center">Saldo Pendiente</th>
                  <th className="px-6 py-4 text-left">Vencimiento</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  // ESQUELETO DE CARGA
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-8 shadow-inner bg-gray-50/20"></td>
                    </tr>
                  ))
                ) : cuentasFiltradas.length > 0 ? (
                  cuentasFiltradas.map((cuenta) => (
                    <tr key={cuenta.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center shadow-md">
                            <MdReceipt size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-black text-gray-900 leading-none uppercase tracking-tighter">
                              {cuenta.VentaId.split('-')[0]}...{cuenta.VentaId.slice(-4)}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">
                              {cuenta.Venta?.Cliente?.nombreCompleto || 'Consumidor Final'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                            Total Venta
                          </span>
                          <span className="text-sm font-black text-gray-700 font-mono">
                            ${parseFloat(cuenta.montoTotal).toFixed(2)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100 uppercase">
                          <MdAttachMoney size={14} />
                          {parseFloat(cuenta.abonoAnticipado).toFixed(2)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-base font-black text-amber-600 font-mono">
                          ${parseFloat(cuenta.montoPorCobrar).toFixed(2)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MdCalendarToday size={16} className="text-amber-500" />
                          <div className="text-xs font-bold font-mono">
                            {cuenta.fechaLimite
                              ? new Date(cuenta.fechaLimite).toLocaleDateString()
                              : 'SIN FECHA'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button className="flex items-center gap-1.5 bg-gray-900 text-amber-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md active:scale-95 italic">
                            <MdPayments size={16} /> Registrar Cobro
                          </button>
                          <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-100">
                            <FaHistory size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // ESTADO VACÍO (NO HAY DATOS)
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                          <MdInbox size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                          {searchTerm
                            ? 'No se encontraron resultados'
                            : 'No hay cuentas pendientes'}
                        </h3>
                        <p className="text-[10px] text-gray-400 uppercase mt-2">
                          {searchTerm
                            ? 'Pruebe con otra referencia o nombre'
                            : 'Todas las facturas están al día'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de resumen real */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Facturas Pendientes: {cuentasFiltradas.length}
            </span>
            <div className="text-[10px] font-black">
              <span className="text-gray-400 uppercase tracking-widest">Cartera Total:</span>{' '}
              <span className="text-amber-600 ml-1 font-mono text-sm">
                ${carteraTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CuentasPorCobrar
