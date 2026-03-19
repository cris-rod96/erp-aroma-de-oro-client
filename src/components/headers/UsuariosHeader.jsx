import { FaUserPlus } from 'react-icons/fa'

const UsuariosHeader = ({ handleOpenModal }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-gray-800">
      <div className="border-l-4 border-amber-400 pl-4">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
          Control de acceso Aroma de Oro
        </p>
      </div>
      <button
        onClick={() => handleOpenModal(false)}
        className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 justify-center"
      >
        <FaUserPlus size={16} /> Nuevo Usuario
      </button>
    </div>
  )
}

export default UsuariosHeader
