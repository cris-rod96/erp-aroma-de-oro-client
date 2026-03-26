import { FaUserPlus, FaSearch, FaTrashRestore, FaUsers } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'

const UsuariosHeader = ({
  handleOpenModal,
  searchTerm,
  setSearchTerm,
  verEliminados,
  setVerEliminados,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6 text-gray-800">
      <div className="border-l-4 border-amber-400 pl-4">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
          {verEliminados ? 'Usuarios Eliminados' : 'Gestión de Usuarios'}
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
          {verEliminados ? 'Archivo de Seguridad' : 'Control de acceso Aroma de Oro'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-3xl lg:justify-end items-center">
        {/* BUSCADOR */}
        <div className="relative flex-1 group w-full">
          <FaSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500"
            size={14}
          />
          <input
            type="text"
            placeholder="BUSCAR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="w-full h-12 bg-white border-2 border-gray-100 rounded-2xl pl-12 text-[11px] font-black outline-none focus:border-amber-400 transition-all"
          />
        </div>

        {/* BOTÓN TOGGLE ELIMINADOS */}
        <button
          onClick={() => setVerEliminados(!verEliminados)}
          className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            verEliminados
              ? 'bg-amber-100 text-amber-700 border-2 border-amber-200 shadow-inner'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {verEliminados ? <FaUsers size={16} /> : <MdDelete size={18} />}
          {verEliminados ? 'Ver Activos' : 'Papelera'}
        </button>

        {!verEliminados && (
          <button
            onClick={() => handleOpenModal(false)}
            className="h-12 bg-gray-900 text-amber-400 px-8 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 flex items-center gap-2 border-b-4 border-amber-600"
          >
            <FaUserPlus size={16} /> Nuevo
          </button>
        )}
      </div>
    </div>
  )
}

export default UsuariosHeader
