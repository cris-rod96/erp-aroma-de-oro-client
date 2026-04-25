import { FaUserPlus, FaHistory, FaUsers, FaSearch } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'

const NominaHeader = ({
  activeTab,
  setActiveTab,
  handleOpenModal,
  searchTerm,
  setSearchTerm,
  verEliminados,
  setVerEliminados,
}) => {
  return (
    <div className="w-full mb-10">
      {/* SECCIÓN SUPERIOR: TÍTULO Y ACCIONES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-gray-800 mb-8">
        <div className="border-l-4 border-amber-400 pl-4">
          <h1 className="text-3xl font-black uppercase  tracking-tighter leading-none">
            {activeTab === 'empleados'
              ? verEliminados
                ? 'Personal Archivado'
                : 'Gestión de Personal'
              : 'Historial de Nómina'}
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            {verEliminados ? 'Archivo de Seguridad' : 'Sistema de Pagos Aroma de Oro'}
          </p>
        </div>

        {/* CONTROLES DINÁMICOS */}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 max-w-4xl lg:justify-end">
          {/* BUSCADOR: Solo aparece en la pestaña de empleados */}
          {activeTab === 'empleados' && (
            <div className="relative flex-1 group w-full max-w-xs">
              <FaSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="BUSCAR POR NOMBRE O CÉDULA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                className="w-full h-12 bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 text-[10px] font-black tracking-widest outline-none focus:border-amber-400 transition-all shadow-sm"
              />
            </div>
          )}

          {/* BOTÓN PAPELERA: Alterna entre activos y eliminados (Lógica de borrado lógico) */}
          {activeTab === 'empleados' && (
            <button
              onClick={() => {
                setSearchTerm('')
                setVerEliminados(!verEliminados)
              }}
              className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                verEliminados
                  ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-inner'
                  : 'bg-gray-100 text-gray-500 border-gray-100 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {verEliminados ? <FaUsers size={16} /> : <MdDelete size={18} />}
              {verEliminados ? 'Ver Activos' : 'Papelera'}
            </button>
          )}

          {/* BOTÓN REGISTRAR: Solo si no estamos viendo eliminados y estamos en la tab correcta */}
          {activeTab === 'empleados' && !verEliminados && (
            <button
              onClick={handleOpenModal}
              className="w-full md:w-auto bg-gray-900 hover:bg-black text-amber-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-2 border-b-4 border-amber-600 transition-all italic"
            >
              <FaUserPlus size={16} /> Registrar Personal
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: TABS CON ESTILO REFINADO */}
      <div className="flex gap-4 md:gap-8 border-b border-gray-100">
        <button
          onClick={() => {
            setActiveTab('empleados')
            setVerEliminados(false) // Al cambiar de tab, por defecto vemos activos
          }}
          className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'empleados' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FaUsers size={14} />
          Lista de Personal
          {activeTab === 'empleados' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 animate-in fade-in duration-500"></div>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('historial')
            setVerEliminados(false)
          }}
          className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'historial' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FaHistory size={12} />
          Historial de Pagos
          {activeTab === 'historial' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 animate-in fade-in duration-500"></div>
          )}
        </button>
      </div>
    </div>
  )
}

export default NominaHeader
