import { useState, useEffect, useMemo } from 'react'
import {
  MdPayments,
  MdHourglassEmpty,
  MdCheckCircleOutline,
  MdSearch,
  MdInbox,
} from 'react-icons/md'
import { FaHistory, FaFileInvoiceDollar } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import { cuentasPorPagarAPI } from '../../api/index.api'

const CuentasPorPagar = () => {
  const token = useAuthStore((state) => state.token)

  const [deudas, setDeudas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // --- CARGA DE DATOS ---
  const fetchCuentas = async () => {
    try {
      setLoading(true)
      const resp = await cuentasPorPagarAPI.listarTodas(token)
      // Adaptamos según la respuesta de tu backend
      setDeudas(resp.data.cuentasPorPagar || resp.data || [])
    } catch (error) {
      console.error('Error al cargar cuentas por pagar:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCuentas()
  }, [])

  // --- FILTRADO Y CÁLCULOS ---
  const deudasFiltradas = useMemo(() => {
    return deudas.filter(
      (item) =>
        item.LiquidacionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Liquidacion?.Proveedor?.nombreCompleto || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
  }, [deudas, searchTerm])

  const totalPendiente = useMemo(() => {
    return deudasFiltradas.reduce((acc, curr) => acc + parseFloat(curr.saldoPendiente), 0)
  }, [deudasFiltradas])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Cuentas por Pagar
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Gestión de obligaciones y saldos pendientes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="BUSCAR LIQUIDACIÓN O PROVEEDOR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-amber-400 outline-none transition-all w-72 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* TABLA DE CUENTAS POR PAGAR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Liquidación / Beneficiario</th>
                  <th className="px-6 py-4 text-left">Total Deuda</th>
                  <th className="px-6 py-4 text-center">Abonado</th>
                  <th className="px-6 py-4 text-center">Saldo Restante</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-8 shadow-inner bg-gray-50/20"></td>
                    </tr>
                  ))
                ) : deudasFiltradas.length > 0 ? (
                  deudasFiltradas.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center shadow-md">
                            <FaFileInvoiceDollar size={18} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-black text-gray-900 leading-none uppercase tracking-tighter">
                              {item.LiquidacionId.split('-')[0]}...{item.LiquidacionId.slice(-4)}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">
                              {item.Liquidacion?.Proveedor?.nombreCompleto ||
                                'Proveedor Desconocido'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-black text-gray-700 font-mono">
                          ${parseFloat(item.montoTotal).toFixed(2)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-xs font-black text-emerald-600 font-mono bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                          +${parseFloat(item.montoAbonado).toFixed(2)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div
                          className={`text-base font-black font-mono ${parseFloat(item.saldoPendiente) > 0 ? 'text-amber-600' : 'text-gray-400'}`}
                        >
                          ${parseFloat(item.saldoPendiente).toFixed(2)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.estado === 'Pagado'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                          }`}
                        >
                          {item.estado === 'Pagado' ? (
                            <MdCheckCircleOutline size={14} />
                          ) : (
                            <MdHourglassEmpty size={14} />
                          )}
                          {item.estado}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          {parseFloat(item.saldoPendiente) > 0 && (
                            <button className="flex items-center gap-1.5 bg-gray-900 text-amber-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md active:scale-95 italic">
                              <MdPayments size={16} /> Abonar Pago
                            </button>
                          )}
                          <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-100">
                            <FaHistory size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                          <MdInbox size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                          {searchTerm ? 'Sin coincidencias' : 'Sin deudas pendientes'}
                        </h3>
                        <p className="text-[10px] text-gray-400 uppercase mt-2">
                          No se encontraron cuentas por pagar registradas.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Registros Contables: {deudasFiltradas.length}
            </span>
            <div className="text-[10px] font-black">
              <span className="text-gray-400 uppercase tracking-widest">Total por Pagar:</span>{' '}
              <span className="text-amber-600 ml-1 font-mono text-sm">
                ${totalPendiente.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CuentasPorPagar
