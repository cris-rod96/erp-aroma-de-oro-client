import { useEffect, useState } from 'react'
import { GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import {
  MdAccountBalance,
  MdArrowDownward,
  MdArrowForward,
  MdArrowUpward,
  MdAssignmentReturn,
  MdAttachMoney,
  MdChevronLeft, // Nuevo
  MdChevronRight,
  MdClose,
  MdGroups,
  MdHandshake,
  MdMonetizationOn,
  MdMoreHoriz,
  MdPrint,
  MdPublishedWithChanges,
  MdReceiptLong,
  MdSecurity,
  MdShoppingBag,
} from 'react-icons/md'
import { useAuthStore } from '../../store/useAuthStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { exportarCajaDetallePDF } from '../../utils/cajaReport'
import { formatFecha, formatMoney } from '../../utils/fromatters'

const CajasTable = ({ fetching, cajas, error, reabrirCaja }) => {
  const [selectedCaja, setSelectedCaja] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // const token = useAuthStore((store) => store.token)

  // const [showModalUpdateCaja, setShowModalUpdateCaja] = useState(false)

  // --- LÓGICA DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 // Cantidad de filas por página

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCajas = cajas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(cajas.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const user = useAuthStore((store) => store.user)
  const empresa = useEmpresaStore((store) => store.empresa)

  // const [montoCierre, setMontoCierre] = useState(0)

  // const handleShowUpdateCaja = async (caja) => {
  //   setSelectedCaja(caja)
  //   setShowModalUpdateCaja(!showModalUpdateCaja)
  // }

  // const handleUpdateCaja = async () => {
  //   if (montoCierre === 0) {
  //     return Swal.fire('Error', 'Necesitas ingresar un monto de cierre', 'error')
  //   }

  //   try {
  //     const resp = await cajaAPI.actualizarDataCaja(token, selectedCaja.id, montoCierre)
  //     if (resp.status === 200) {
  //       Swal.fire('Éxito', 'Se ha actualizado el valor de la caja', 'success')
  //     }
  //   } catch (error) {
  //     const msg = error.response?.data?.message || 'Error al actualizar caja'
  //     Swal.fire('Error', msg, 'error')
  //   }
  // }

  // Resetear a página 1 si cambian los datos (por ejemplo, al filtrar o refrescar)
  useEffect(() => {
    setCurrentPage(1)
  }, [cajas.length])

  const handleVerDetalle = (caja) => {
    setSelectedCaja(caja)
    setShowModal(true)
    console.log(caja)
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
      case 'Gasto General':
        return <MdReceiptLong className="text-orange-500" />
      case 'Préstamo':
        return <MdHandshake className="text-blue-500" />
      case 'Cobro Préstamo':
        return <MdAssignmentReturn className="text-emerald-600" />
      case 'Cobro Anticipo':
        return <MdPublishedWithChanges className="text-teal-600" />
      case 'Cuentas por Cobrar':
        return <GiReceiveMoney />
      case 'Cuentas por Pagar':
        return <GiPayMoney />
      case 'Anticipo':
        return <MdMonetizationOn className="text-emerald-500" />
      default:
        return <MdMoreHoriz />
    }
  }

  const calcularDesglose = (caja) => {
    if (!caja || !caja.Movimientos)
      return { efectivoNeto: 0, bancosNeto: 0, soloEfectivoEsperado: 0 }
    let efec = 0
    let banc = 0

    console.log(caja.Movimientos)
    caja.Movimientos.forEach((m) => {
      const monto = parseFloat(m.monto)
      const isIngreso = m.tipoMovimiento === 'Ingreso'
      const isVirtual =
        (m.descripcion?.toUpperCase().includes('BANCO') ||
          m.descripcion?.toUpperCase().includes('CHEQUE') ||
          m.descripcion?.toUpperCase().includes('TRANSFERENCIA') ||
          m.descripcion?.toUpperCase().includes('BANCARIO')) &&
        !m.descripcion?.toUpperCase().includes('INYECCIÓN')
      if (isVirtual) {
        banc += isIngreso ? monto : -monto
      } else {
        efec += isIngreso ? monto : -monto
      }
    })

    return {
      efectivoNeto: efec,
      bancosNeto: banc,
      soloEfectivoEsperado: parseFloat(caja.montoApertura) + efec,
    }
  }

  const desglose = selectedCaja
    ? calcularDesglose(selectedCaja)
    : { efectivoNeto: 0, bancosNeto: 0, soloEfectivoEsperado: 0 }

  const esReabribleHoy = (caja) => {
    if (!caja.fechaCierre) return false
    const hoy = new Date().toISOString().split('T')[0]
    const fechaCaja = caja.fechaCierre.split('T')[0]
    return caja.estado === 'Cerrada' && hoy === fechaCaja
  }

  return (
    <div className="font-sans space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-5 text-left">Apertura / N°</th>
                <th className="px-6 py-5 text-right">Fondo Inicial</th>
                <th className="px-6 py-5 text-right text-amber-600 bg-amber-50/30">
                  Saldo Real (Efectivo)
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
                    Cargando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-rose-50 p-4 rounded-3xl mb-4 border border-rose-100">
                        <MdSecurity size={50} className="text-rose-400" />
                      </div>
                      <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
                        Acceso Restringido
                      </h3>
                      <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs mx-auto">
                        {error}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentCajas.map((caja, index) => (
                  <tr key={caja.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-400 text-[10px]">
                        #{cajas.length - (indexOfFirstItem + index)}
                      </div>
                      <div className="text-[12px] font-bold text-gray-700 font-mono">
                        {formatFecha(caja.fechaApertura)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-black text-gray-900 font-mono">
                      {formatMoney(caja.montoApertura)}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-black text-amber-700 font-mono bg-amber-50/10">
                      {formatMoney(caja.saldoActual || caja.montoEsperado)}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-black text-gray-800 font-mono">
                      {caja.estado === 'Abierta' ? '---' : formatMoney(caja.montoCierre)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-xs font-black font-mono ${
                        !caja.diferencia || parseFloat(caja.diferencia) === 0
                          ? 'text-gray-400' // Gris si es 0 o no hay valor
                          : parseFloat(caja.diferencia) > 0
                            ? 'text-emerald-500' // Verde si es mayor a 0 (puedes usar 'text-green-500')
                            : 'text-rose-600' // Rojo si es menor a 0
                      }`}
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
                      <div className="flex flex-col items-end gap-3">
                        {' '}
                        {/* Aumentamos el gap para dar aire */}
                        {/* Enlace de Movimientos: Más sutil */}
                        <button
                          onClick={() => handleVerDetalle(caja)}
                          className="text-amber-600 hover:text-amber-700 text-[10px] font-black flex items-center justify-end gap-1.5 uppercase tracking-wider italic transition-all group"
                        >
                          Ver Movimientos
                          <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        {/* <button
                          onClick={() => handleShowUpdateCaja(caja)}
                          className="text-amber-600 hover:text-amber-700 text-[10px] font-black flex items-center justify-end gap-1.5 uppercase tracking-wider italic transition-all group"
                        >
                          Actualizar Caja
                          <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                        </button> */}
                        {/* Botón Reabrir: Ahora integrado al estilo de la app */}
                        {user?.rol === 'Administrador' && esReabribleHoy(caja) && (
                          <button
                            onClick={() => reabrirCaja(caja.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
                   bg-slate-50 text-slate-600 border border-slate-200
                   hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 
                   text-[9px] font-black uppercase tracking-tighter 
                   transition-all duration-200 shadow-sm"
                          >
                            <MdPublishedWithChanges size={14} className="text-amber-500" />
                            Reabrir Turno
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- CONTROLES DE PAGINACIÓN --- */}
        {!fetching && !error && cajas.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Mostrando <span className="text-gray-900">{indexOfFirstItem + 1}</span> a{' '}
              <span className="text-gray-900">{Math.min(indexOfLastItem, cajas.length)}</span> de{' '}
              <span className="text-gray-900">{cajas.length}</span> turnos
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
              >
                <MdChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)]
                  .map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-gray-900 text-amber-400 shadow-lg' : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'}`}
                    >
                      {i + 1}
                    </button>
                  ))
                  .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedCaja && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl overflow-hidden border border-gray-200 flex flex-col transition-all">
            {/* Cabecera */}
            <div className="p-6 flex justify-between items-center border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="bg-gray-900 p-3 rounded-2xl text-amber-400 shadow-xl">
                  <MdReceiptLong size={24} />
                </div>
                <div>
                  <h2 className="font-black uppercase tracking-tighter text-2xl text-gray-900 leading-none">
                    Auditoría de Flujos
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Caja ID: {selectedCaja.id.split('-')[0]} |{' '}
                    {formatFecha(selectedCaja.fechaApertura)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-100 text-gray-400 hover:text-gray-900 p-2 rounded-full transition-all"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* TARJETAS DE DESGLOSE (ESTO ES LO QUE DA CLARIDAD) */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50/50">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Fondo Apertura</p>
                <p className="text-xl font-black font-mono text-gray-900">
                  {formatMoney(selectedCaja.montoApertura)}
                </p>
              </div>

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
                <MdAttachMoney
                  className="absolute -right-2 -bottom-2 text-amber-200/50"
                  size={80}
                />
                <p className="text-[9px] font-black text-amber-600 uppercase mb-2">
                  Dinero en Mano (Efectivo)
                </p>
                <p className="text-xl font-black font-mono text-amber-700">
                  {formatMoney(Number(selectedCaja.saldoActual) || 0.0)}
                </p>
                <span className="text-[8px] font-bold text-amber-500 uppercase italic">
                  Solo billetes físicos
                </span>
              </div>

              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                <MdAccountBalance
                  className="absolute -right-2 -bottom-2 text-blue-200/50"
                  size={80}
                />
                <p className="text-[9px] font-black text-blue-600 uppercase mb-2">
                  Cheques | Transferencias
                </p>
                <p className="text-xl font-black font-mono text-blue-700">
                  {formatMoney(desglose.bancosNeto)}
                </p>
                <span className="text-[8px] font-bold text-blue-500 uppercase italic">
                  Movimientos virtuales
                </span>
              </div>

              {/* <div className="bg-gray-900 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                <MdAccountBalanceWallet
                  className="absolute -right-2 -bottom-2 text-white/5"
                  size={80}
                />
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">
                  Saldo Total Sistema
                </p>
                <p className="text-xl font-black font-mono text-white">
                  {formatMoney(selectedCaja.saldoActual || selectedCaja.montoCierre)}
                </p>
                <span className="text-[8px] font-bold text-gray-400 uppercase italic">
                  Efectivo + Bancos
                </span>
              </div> */}
            </div>

            {/* Listado de Movimientos */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr className="text-[9px] font-black text-gray-400 uppercase">
                      <th className="px-4 py-4 text-center">Flujo</th>
                      <th className="px-4 py-4 text-left">Fecha / Hora</th>
                      <th className="px-4 py-4 text-left">Origen</th>
                      <th className="px-4 py-4 text-left">Descripción del Movimiento</th>
                      <th className="px-4 py-4 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedCaja.Movimientos?.filter((m) => m.CajaId !== null).map((mov) => {
                      const isVirtual =
                        mov.descripcion?.toUpperCase().includes('BANCO') ||
                        mov.descripcion?.toUpperCase().includes('CHEQUE') ||
                        mov.descripcion?.toUpperCase().includes('BANCARIO') ||
                        (mov.descripcion?.toUpperCase().includes('TRANSFERENCIA') &&
                          !mov.descripcion?.toUpperCase().includes('INYECCIÓN'))
                      const isIngreso = mov.tipoMovimiento === 'Ingreso'

                      return (
                        <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 text-center">
                            <div
                              className={`mx-auto w-7 h-7 rounded-lg flex items-center justify-center ${isIngreso ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
                            >
                              {isIngreso ? <MdArrowUpward /> : <MdArrowDownward />}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-[10px] font-black text-gray-700 font-mono">
                              {new Date(mov.fecha).toLocaleDateString()}
                            </div>
                            <div className="text-[8px] font-bold text-gray-400 uppercase">
                              {new Date(mov.fecha).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{getIcon(mov.categoria)}</span>
                              <span className="text-[9px] font-black text-gray-500 uppercase">
                                {mov.categoria}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-[10px] font-black text-gray-800 uppercase italic leading-none">
                              {mov.categoria?.toLowerCase().includes('gasto')
                                ? `${mov.detalleGasto?.categoria ?? ''} ${mov.detalleGasto?.descripcion ?? ''}`
                                : mov.descripcion?.split('|')[0] || 'General'}
                            </p>
                            <span
                              className={`text-[7px] font-black px-1.5 py-0.5 rounded mt-1 inline-block uppercase tracking-tighter ${!isVirtual ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}
                            >
                              {!isVirtual ? '💸 Dinero Físico' : '🏦 Operación Bancaria'}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-4 text-right font-mono font-black text-xs ${isIngreso ? 'text-emerald-600' : 'text-rose-600'}`}
                          >
                            {isIngreso ? '+' : '-'}
                            {formatMoney(mov.monto)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
              <button
                className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-500 hover:text-gray-900 transition-all"
                onClick={() => exportarCajaDetallePDF(selectedCaja, empresa)}
              >
                <MdPrint size={18} /> Imprimir Reporte de Auditoría
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 
      <Modal
        isOpen={showModalUpdateCaja}
        onClose={() => setShowModalUpdateCaja(false)}
        title="Actualizar data de caja"
      >
        <form onSubmit={handleUpdateCaja} className="p-4 space-y-6">
          <div className="space-y-2 text-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Monto Cierre
            </label>
            <div className="flex items-center h-20 bg-gray-50 rounded-2xl border-2 border-gray-100 px-6">
              <MdAttachMoney className="text-amber-500 text-3xl mr-2" />
              <input
                type="number"
                value={montoCierre}
                onChange={(e) => setMontoCierre(e.target.value)}
                step="0.01"
                required
                className="bg-transparent w-full outline-none text-3xl font-black font-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-5 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em]"
          >
            Actualizar Data
          </button>
        </form>
      </Modal> */}
    </div>
  )
}

export default CajasTable
