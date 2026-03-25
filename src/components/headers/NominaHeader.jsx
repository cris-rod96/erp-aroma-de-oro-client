import { FaUserPlus, FaHistory, FaUsers } from 'react-icons/fa'

const NominaHeader = ({ activeTab, setActiveTab, handleOpenModal, error }) => {
  return (
    <div className="w-full mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-gray-800 mb-8">
        <div className="border-l-4 border-amber-400 pl-4">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
            {activeTab === 'empleados' ? 'Gestión de Personal' : 'Historial de Nómina'}
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Sistema de Pagos Aroma de Oro
          </p>
        </div>

        {activeTab === 'empleados' && !error && (
          <button
            onClick={handleOpenModal}
            className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 justify-center border-b-4 border-amber-600"
          >
            <FaUserPlus size={16} /> Registrar Personal
          </button>
        )}
      </div>

      {/* TABS CON ESTILO REFINADO */}
      <div className="flex gap-4 md:gap-8 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('empleados')}
          className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'empleados'
              ? 'border-b-2 border-amber-500 text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FaUsers size={14} /> Lista de Personal
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'historial'
              ? 'border-b-2 border-amber-500 text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FaHistory size={12} /> Historial de Pagos
        </button>
      </div>
    </div>
  )
}

export default NominaHeader
