import { FaUserEdit, FaMapMarkerAlt } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { MdDelete, MdPhone } from 'react-icons/md'

const Productores = () => {
  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Productores</h1>
            <p className="text-gray-500 text-sm">
              Administra el directorio de proveedores y productores registrados.
            </p>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95">
            + Nuevo Productor
          </button>
        </div>

        {/* Contenedor Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* --- VISTA ESCRITORIO --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Productor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Identificación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
                        CR
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 leading-none">
                          Cristhian Rodríguez
                        </div>
                        <div className="flex items-center text-[10px] text-gray-400 font-medium mt-1 uppercase">
                          <FaMapMarkerAlt className="mr-1 text-orange-400" /> Guayas, Ecuador
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 font-medium italic">Cédula</div>
                    <div className="text-xs text-gray-400 font-mono tracking-tighter">
                      0940501596
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <MdPhone className="mr-2 text-indigo-400" size={16} />
                      0967148226
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all cursor-pointer">
                        <FaUserEdit size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* --- VISTA MÓVIL --- */}
          <div className="md:hidden divide-y divide-gray-100">
            <div className="p-5 flex flex-col gap-4 bg-white">
              {/* Header Card */}
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-lg">
                    CR
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-extrabold text-gray-900 leading-tight">
                      Cristhian Rodríguez
                    </div>
                    <div className="flex items-center text-[11px] text-gray-400 font-bold uppercase mt-0.5">
                      <FaMapMarkerAlt className="mr-1" /> Zona Costera
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                  Productor
                </span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">
                    Cédula / RUC
                  </span>
                  <span className="text-sm font-mono text-gray-800 font-semibold">0940501596</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">
                    Teléfono
                  </span>
                  <span className="text-sm text-gray-800 font-semibold">0967148226</span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center text-[10px] font-black text-green-600 tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  VERIFICADO
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                    <FaUserEdit size={14} /> EDITAR
                  </button>
                  <button className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl">
                    <MdDelete size={16} /> BORRAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Productores
