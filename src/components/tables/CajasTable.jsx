import { useState } from 'react'
import {
  MdArrowForward,
  MdClose,
  MdReceiptLong,
  MdArrowUpward,
  MdArrowDownward,
  MdShoppingBag,
  MdAccountBalance,
  MdGroups,
  MdMoreHoriz,
  MdHistory,
  MdAttachMoney,
  MdPrint,
} from 'react-icons/md'
import { formatFecha, formatMoney } from '../../utils/fromatters'
import { useEffect } from 'react'
import { exportarCajaDetallePDF } from '../../utils/cajaReport'

const CajasTable = ({ fetching, cajas }) => {
  const [selectedCaja, setSelectedCaja] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleVerDetalle = (caja) => {
    setSelectedCaja(caja)
    setShowModal(true)
  }

  const getIcon = (cat) => {
    switch (cat) {
      case 'Compra':
        return <MdShoppingBag />
      case 'Venta':
        return <MdAttachMoney />
      case 'Nomina':
        return <MdGroups />
      case 'Bancos':
        return <MdAccountBalance />
      default:
        return <MdMoreHoriz />
    }
  }

  return (
    <div>
      {/* TABLA PRINCIPAL CON COLUMNA MONTO ESPERADO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-5 text-left">Apertura / N°</th>
                <th className="px-6 py-5 text-right">Fondo Inicial</th>
                <th className="px-6 py-5 text-right text-amber-600 bg-amber-50/30">
                  Monto Esperado
                </th>
                <th className="px-6 py-5 text-right">Monto Cierre</th>
                <th className="px-6 py-5 text-right bg-gray-100/50">Diferencia</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-20 text-center animate-pulse font-black text-gray-300 uppercase text-xs"
                  >
                    Cargando historial de cajas...
                  </td>
                </tr>
              ) : (
                cajas.map((caja, index) => {
                  // Calculamos el esperado: Saldo Inicial + Ingresos - Egresos
                  // Si tu backend ya lo envía como saldoEsperado, úsalo directamente.

                  return (
                    <tr key={caja.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-gray-400 text-[10px]">
                          #{cajas.length - index}
                        </div>
                        <div className="text-[12px] font-bold text-gray-700 font-mono">
                          {formatFecha(caja.fechaApertura)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-black text-gray-900 font-mono">
                        {formatMoney(caja.montoApertura)}
                      </td>

                      {/* NUEVA COLUMNA: MONTO ESPERADO */}
                      <td className="px-6 py-4 text-right text-xs font-black text-amber-700 font-mono bg-amber-50/10">
                        {caja.estado === 'Abierta' ? 'En curso' : formatMoney(caja.montoEsperado)}
                      </td>

                      <td className="px-6 py-4 text-right text-xs font-black text-gray-800 font-mono">
                        {caja.estado === 'Abierta' ? '---' : formatMoney(caja.montoCierre)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-xs font-black font-mono ${!caja.diferencia || parseFloat(caja.diferencia) === 0 ? 'text-gray-400' : parseFloat(caja.diferencia) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                      >
                        {caja.estado === 'Abierta' ? 'En curso' : formatMoney(caja.diferencia)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${caja.estado === 'Abierta' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                        >
                          {caja.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleVerDetalle(caja)}
                          className="text-amber-600 hover:text-amber-900 text-[10px] font-black flex items-center justify-end gap-1.5 uppercase tracking-wider italic ml-auto group"
                        >
                          Ver Movimientos{' '}
                          <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE MOVIMIENTOS (Sin cambios en tu lógica interna) */}
      {showModal && selectedCaja && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[85vh] shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
            <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500 p-3 rounded-xl text-white shadow-lg shadow-amber-200">
                  <MdReceiptLong size={24} />
                </div>
                <div>
                  <h2 className="font-black uppercase italic tracking-tighter text-2xl text-gray-900 leading-none">
                    Auditoría de Movimientos
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                    ID Transacción: {selectedCaja.id.split('-')[0].toUpperCase()} |{' '}
                    {formatFecha(selectedCaja.fechaApertura)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/30">
              <div className="p-6">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">
                  {' '}
                  Fondo Inicial{' '}
                </p>
                <p className="text-xl font-black font-mono text-gray-900 text-center">
                  {' '}
                  {formatMoney(selectedCaja.montoApertura)}{' '}
                </p>
              </div>
              <div className="p-6 bg-gray-50/50">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center font-bold">
                  {' '}
                  Saldo Final/Actual{' '}
                </p>
                <p className="text-xl font-black font-mono text-amber-600 text-center">
                  {' '}
                  {formatMoney(selectedCaja.saldoActual || selectedCaja.montoCierre)}{' '}
                </p>
              </div>
              <div className="p-6">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">
                  {' '}
                  Estado de Caja{' '}
                </p>
                <div className="flex justify-center mt-1">
                  <span
                    className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${selectedCaja.estado === 'Abierta' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                  >
                    {selectedCaja.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                      <th className="px-4 py-4 text-center w-16">Tipo</th>
                      <th className="px-4 py-4 text-left w-32">Fecha / Hora</th>
                      <th className="px-4 py-4 text-left w-32">Categoría</th>
                      <th className="px-4 py-4 text-left">Detalle de Operación</th>
                      <th className="px-4 py-4 text-left w-48">Registrado Por</th>
                      <th className="px-4 py-4 text-right w-32">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {selectedCaja.Movimientos && selectedCaja.Movimientos.length > 0 ? (
                      selectedCaja.Movimientos.map((mov) => {
                        let tituloPrimario = mov.categoria
                        let subtituloSecundario = mov.descripcion || 'Sin descripción'
                        let usuarioNombre = ''

                        if (mov.categoria === 'Nomina') {
                          tituloPrimario = 'Pago de Nómina'
                          subtituloSecundario =
                            mov.detalleNomina?.Persona?.nombreCompleto || mov.descripcion
                          usuarioNombre = mov.detalleNomina?.Usuario?.nombresCompletos || 'Sistema'
                        } else if (mov.categoria === 'Compra') {
                          tituloPrimario = `Compra: ${mov.detalleCompra?.DetalleLiquidacion?.Producto?.nombre || 'Insumos'}`
                          subtituloSecundario = `Proveedor: ${mov.detalleCompra?.Persona?.nombreCompleto || 'Varios'}`
                          usuarioNombre = mov.detalleCompra?.Usuario?.nombresCompletos || 'Sistema'
                        } else if (mov.categoria === 'Venta') {
                          tituloPrimario = 'Ingreso de Venta'
                          subtituloSecundario = `Ref: ${mov.idReferencia?.slice(0, 8).toUpperCase() || 'N/A'}`
                          usuarioNombre = mov.detalleVenta?.Usuario?.nombresCompletos || 'Sistema'
                        } else {
                          usuarioNombre = 'Sistema'
                        }

                        return (
                          <tr key={mov.id} className="hover:bg-amber-50/30 transition-colors group">
                            <td className="px-4 py-4 text-center">
                              <div
                                className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center transition-all ${mov.tipoMovimiento === 'Ingreso' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                              >
                                {mov.tipoMovimiento === 'Ingreso' ? (
                                  <MdArrowUpward />
                                ) : (
                                  <MdArrowDownward />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-[11px] font-black text-gray-700 font-mono leading-none">
                                {new Date(mov.fecha).toLocaleDateString()}
                              </div>
                              <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase italic">
                                {new Date(mov.fecha).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-lg">
                                  {getIcon(mov.categoria)}
                                </span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                                  {mov.categoria}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <p className="text-[11px] font-black text-gray-800 uppercase italic leading-none">
                                  {tituloPrimario}
                                </p>
                                <p className="text-[10px] font-bold text-amber-600 uppercase mt-1 tracking-tight truncate max-w-[200px]">
                                  {subtituloSecundario}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-400">
                                  {usuarioNombre.charAt(0)}
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase italic tracking-tight">
                                  {usuarioNombre}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`px-4 py-4 text-right font-mono font-black text-sm ${mov.tipoMovimiento === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}
                            >
                              <span className="opacity-50 text-[10px] mr-1">
                                {mov.tipoMovimiento === 'Ingreso' ? '+' : '-'}
                              </span>
                              {formatMoney(mov.monto)}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-20 text-center text-gray-300">
                          <MdHistory size={48} className="mx-auto mb-2 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Caja sin movimientos registrados
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
              <button
                className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-gray-900 transition-colors"
                onClick={() => exportarCajaDetallePDF(selectedCaja)}
              >
                <MdPrint size={18} /> Imprimir Comprobante de Arqueo
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-900 hover:bg-black text-white px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                Cerrar Informe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CajasTable
