import { FaPlus, FaSearch, FaTrashRestore, FaAddressBook } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'

const ProductoresHeader = ({
  handleOpenModal,
  searchTerm,
  setSearchTerm,
  verEliminados,
  setVerEliminados,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6 text-gray-800">
      {/* TÍTULO DINÁMICO */}
      <div className="border-l-4 border-amber-400 pl-4 transition-all">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
          {verEliminados ? 'Productores Inactivos' : 'Gestión de Productores'}
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
          {verEliminados ? 'Archivo Histórico Agrícola' : 'Directorio Aroma de Oro'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-3xl lg:justify-end items-center">
        {/* BUSCADOR POTENTE */}
        <div className="relative flex-1 group w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <FaSearch
              className="text-gray-400 group-focus-within:text-amber-500 transition-colors"
              size={14}
            />
          </div>
          <input
            type="text"
            placeholder="BUSCAR PRODUCTOR O IDENTIFICACIÓN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="w-full h-12 bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 text-[11px] font-black tracking-widest outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-100 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* BOTÓN PAPELERA / ACTIVOS */}
        <button
          onClick={() => setVerEliminados(!verEliminados)}
          className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
            verEliminados
              ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-inner'
              : 'bg-gray-100 text-gray-500 border-gray-100 hover:bg-gray-200'
          }`}
        >
          {verEliminados ? <FaAddressBook size={16} /> : <MdDelete size={18} />}
          {verEliminados ? 'Ver Activos' : 'Papelera'}
        </button>

        {/* BOTÓN NUEVO (SOLO EN VISTA ACTIVOS) */}
        {!verEliminados && (
          <button
            onClick={() => handleOpenModal(false)}
            className="h-12 bg-gray-900 hover:bg-black text-amber-400 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 flex items-center gap-2 border-b-4 border-amber-600 transition-all"
          >
            <FaPlus size={14} /> Nuevo Productor
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductoresHeader
