import { MdAccessTime, MdAccountBalanceWallet, MdInfoOutline } from 'react-icons/md'
import { formatFecha, formatMoney } from '../../utils/fromatters'

const CajasHeader = ({ cajaActiva, setIsClosingModal, setIsModalOpen }) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="border-l-4 border-amber-400 pl-4">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            Control de Cajas
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            Aroma de Oro | Gestión de Turnos
          </p>
        </div>

        <div className="flex gap-3">
          {cajaActiva && (
            <button
              onClick={() => setIsClosingModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <MdAccessTime size={18} /> Cerrar Turno
            </button>
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
        <div className="mb-6 bg-amber-50 border border-amber-200 p-5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="bg-amber-400 p-3 rounded-2xl text-white shadow-lg shadow-amber-200">
              <MdInfoOutline size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] leading-none mb-1">
                Operación en Curso
              </p>
              <p className="text-sm text-amber-900 font-bold">
                Caja abierta por <span className="text-amber-600">Admin</span> hoy a las{' '}
                <span className="font-mono bg-amber-100 px-2 py-0.5 rounded-lg">
                  {formatFecha(cajaActiva.fechaApertura)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 px-6 border-l-2 border-amber-200/50">
            <div className="text-center">
              <p className="text-[9px] font-black text-amber-600 uppercase">Fondo Inicial</p>
              <p className="text-lg font-black text-gray-800">
                {formatMoney(cajaActiva.montoApertura)}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-amber-200"></div>
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
