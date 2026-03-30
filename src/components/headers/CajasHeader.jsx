import {
  MdAccessTime,
  MdAccountBalanceWallet,
  MdInfoOutline,
  MdAccountBalance,
  MdShoppingBasket,
} from 'react-icons/md'
import { formatMoney } from '../../utils/fromatters'
import { useMemo } from 'react'

const CajasHeader = ({
  cajaActiva,
  setIsClosingModal,
  setIsModalOpen,
  setIsBancoModalOpen,
  user,
  setIsVentaModalOpen,
}) => {
  const mensajeFechaCaja = useMemo(() => {
    if (!cajaActiva?.fechaApertura) return ''
    const fechaApertura = new Date(cajaActiva.fechaApertura)
    const hoy = new Date()
    const esHoy =
      fechaApertura.getDate() === hoy.getDate() &&
      fechaApertura.getMonth() === hoy.getMonth() &&
      fechaApertura.getFullYear() === hoy.getFullYear()

    return esHoy
      ? 'hoy'
      : `el día ${new Date(cajaActiva.fechaApertura).toLocaleDateString('es-EC')}`
  }, [cajaActiva])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="border-l-4 border-amber-400 pl-4">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">
            Control de Cajas
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            Aroma de Oro | Gestión de Turnos
          </p>
        </div>

        <div className="flex gap-3">
          {cajaActiva && (
            <>
              <button
                onClick={() => setIsBancoModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
              >
                <MdAccountBalance size={18} /> Ingreso Banco
              </button>

              <button
                onClick={() => setIsClosingModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
              >
                <MdAccessTime size={18} /> Cerrar Turno
              </button>

              <button
                onClick={() => setIsVentaModalOpen(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                <MdShoppingBasket size={18} />
                Venta Rápida
              </button>
            </>
          )}

          <button
            disabled={!!cajaActiva}
            onClick={() => setIsModalOpen(true)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
              cajaActiva ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-amber-400'
            }`}
          >
            <MdAccountBalanceWallet size={18} />
            {cajaActiva ? 'Caja en uso' : 'Nueva Apertura'}
          </button>
        </div>
      </div>

      {cajaActiva && (
        <div className="mb-6 bg-white border-2 border-amber-100 p-5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-amber-50/50 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="bg-amber-400 p-3 rounded-2xl text-white shadow-lg shadow-amber-200">
              <MdInfoOutline size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] leading-none mb-1">
                Operación en Curso
              </p>
              <p className="text-sm text-amber-900 font-bold">
                Caja abierta por <span className="text-amber-600">{user?.nombresCompletos}</span>{' '}
                {mensajeFechaCaja}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 px-6 border-l-2 border-amber-100">
            <div className="text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase">Fondo Inicial</p>
              <p className="text-lg font-black text-gray-700">
                {formatMoney(cajaActiva.montoApertura)}
              </p>
            </div>

            <div className="h-8 w-[1.5px] bg-amber-100"></div>

            <div className="text-center">
              <p className="text-[9px] font-black text-emerald-600 uppercase italic">
                Saldo Actual (Efectivo)
              </p>
              <p className="text-2xl font-black text-emerald-700">
                {formatMoney(cajaActiva.saldoActual)}
              </p>
            </div>

            <div className="h-8 w-[1.5px] bg-amber-100"></div>

            <div className="text-center">
              <p className="text-[9px] font-black text-amber-600 uppercase">Estado</p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs uppercase">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Abierta
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CajasHeader
