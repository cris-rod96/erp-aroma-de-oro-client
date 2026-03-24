import { FaUserEdit } from 'react-icons/fa'
import { MdDelete, MdEmail, MdPhone } from 'react-icons/md'

const UsuariosTable = ({ fetching, usuarios, handleOpenModal, handleDelete }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
      {fetching ? (
        <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
          Sincronizando seguridad...
        </div>
      ) : usuarios.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
            No hay usuarios registrados
          </p>
        </div>
      ) : (
        <>
          {/* VISTA ESCRITORIO */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Usuario
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Email
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Teléfono
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Rol
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/20 transition-colors group">
                    {/* USUARIO */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm uppercase shadow-sm">
                          {u.nombresCompletos.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                            {u.nombresCompletos}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-1">{u.cedula}</div>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <MdEmail className="mr-2 text-amber-500/50" />
                        {u.correo}
                      </div>
                    </td>

                    {/* TELÉFONO */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 font-bold tracking-tight">
                        <MdPhone className="mr-2 text-amber-500/50" />
                        {u.telefono}
                      </div>
                    </td>

                    {/* ROL */}
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
                          u.rol.toUpperCase() === 'ADMINISTRADOR'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : u.rol.toUpperCase() === 'CONTADOR'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}
                      >
                        {u.rol || 'ESTÁNDAR'}
                      </span>
                    </td>

                    {/* ESTADO */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`flex items-center text-[9px] font-black tracking-[0.15em] ${u.estaActivo ? 'text-green-600' : 'text-red-500'}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full mr-2 ${u.estaActivo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}
                          ></span>
                          {u.estaActivo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>

                    {/* ACCIONES */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(true, u)}
                          className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
                        >
                          <FaUserEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL */}
          <div className="md:hidden divide-y divide-gray-50">
            {usuarios.map((u) => (
              <div key={u.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black uppercase">
                      {u.nombresCompletos.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                        {u.nombresCompletos}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                        {u.esAdministrador ? 'Admin' : 'Estándar'}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`h-2 w-2 rounded-full ${u.estaActivo ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(true, u)}
                    className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default UsuariosTable
