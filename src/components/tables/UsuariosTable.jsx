import { useState, useEffect } from 'react'
import { FaTrashRestore, FaUserEdit } from 'react-icons/fa'
import {
  MdDelete,
  MdEmail,
  MdInbox,
  MdPhone,
  MdSecurity,
  MdChevronLeft,
  MdChevronRight,
  MdVerifiedUser,
} from 'react-icons/md'

const UsuariosTable = ({
  fetching,
  usuarios,
  handleOpenModal,
  handleDelete,
  error,
  handleRestore,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsuarios = usuarios?.slice(indexOfFirstItem, indexOfLastItem) || []
  const totalPages = Math.ceil((usuarios?.length || 0) / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    setCurrentPage(1)
  }, [usuarios?.length])

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
      {fetching ? (
        <div className="px-6 py-24 text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="animate-pulse text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">
            Sincronizando Base de Datos...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-rose-50 p-6 rounded-[2.5rem] mb-4 border-2 border-rose-100">
            <MdSecurity size={40} className="text-rose-500" />
          </div>
          <h3 className="text-gray-900 font-black uppercase text-sm tracking-widest">
            Error de Sistema
          </h3>
          <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs">{error}</p>
        </div>
      ) : !usuarios || usuarios.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <MdInbox size={80} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
            No se encontraron registros en esta sección
          </p>
        </div>
      ) : (
        <>
          {/* VISTA ESCRITORIO */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Usuario
                  </th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Contacto
                  </th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Rol / Nivel
                  </th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentUsuarios.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-all ${!u.estaActivo ? 'bg-gray-50/50 opacity-75' : 'hover:bg-amber-50/30'}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 shadow-lg ${
                            u.estaActivo
                              ? 'bg-gray-900 text-amber-400'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {u.nombresCompletos.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">
                            {u.nombresCompletos}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono font-bold tracking-widest">
                            {u.cedula}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center text-[11px] text-gray-600 font-bold tracking-tight">
                          <MdEmail className="mr-2 text-amber-500" size={14} /> {u.correo}
                        </div>
                        <div className="flex items-center text-[11px] text-gray-500 font-bold">
                          <MdPhone className="mr-2 text-amber-500" size={14} /> {u.telefono}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                          u.rol.toUpperCase() === 'ADMINISTRADOR'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : u.rol.toUpperCase() === 'CONTADOR'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <span
                          className={`flex items-center text-[9px] font-black tracking-widest px-3 py-1 rounded-full border ${
                            u.estaActivo
                              ? 'bg-green-50 text-green-600 border-green-100'
                              : 'bg-red-50 text-red-500 border-red-100'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-2 ${u.estaActivo ? 'bg-green-500' : 'bg-red-500'}`}
                          ></span>
                          {u.estaActivo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        {u.estaActivo ? (
                          <>
                            <button
                              onClick={() => handleOpenModal(true, u)}
                              className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all active:scale-90"
                              title="Editar Perfil"
                            >
                              <FaUserEdit size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                              title="Dar de Baja"
                            >
                              <MdDelete size={22} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(u.id)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                          >
                            <FaTrashRestore size={14} /> Restaurar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL */}
          <div className="md:hidden divide-y divide-gray-100">
            {currentUsuarios.map((u) => (
              <div key={u.id} className={`p-6 ${!u.estaActivo ? 'bg-gray-50 opacity-80' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black ${
                        u.estaActivo ? 'bg-gray-900 text-amber-400' : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {u.nombresCompletos.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-black text-gray-900 uppercase">
                        {u.nombresCompletos}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{u.rol}</div>
                    </div>
                  </div>
                  {!u.estaActivo && (
                    <span className="text-[8px] font-black bg-red-100 text-red-600 px-2 py-1 rounded-lg uppercase">
                      Inactivo
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {u.estaActivo ? (
                    <>
                      <button
                        onClick={() => handleOpenModal(true, u)}
                        className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 transition-all"
                      >
                        Borrar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(u.id)}
                      className="w-full py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      <FaTrashRestore /> Recuperar Acceso
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Registro <span className="text-gray-900">{indexOfFirstItem + 1}</span> -{' '}
              <span className="text-gray-900">{Math.min(indexOfLastItem, usuarios.length)}</span> de{' '}
              <span className="text-gray-900">{usuarios.length}</span>
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl border-2 border-gray-100 bg-white text-gray-400 disabled:opacity-30 hover:border-amber-400 hover:text-amber-500 transition-all"
              >
                <MdChevronLeft size={24} />
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)]
                  .map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-10 h-10 rounded-2xl text-[11px] font-black transition-all ${
                        currentPage === i + 1
                          ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600 translate-y-[-2px]'
                          : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-amber-200 hover:text-gray-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))
                  .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-2xl border-2 border-gray-100 bg-white text-gray-400 disabled:opacity-30 hover:border-amber-400 hover:text-amber-500 transition-all"
              >
                <MdChevronRight size={24} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UsuariosTable
