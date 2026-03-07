import { FaUserEdit, FaHistory } from 'react-icons/fa'
import { MdDelete, MdPayments } from 'react-icons/md'
import { Container } from '../../components/index.components'

const Nomina = () => {
  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8">
        {/* Cabecera con estadísticas rápidas (Opcional pero recomendado) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Nómina</h1>
            <p className="text-gray-500 text-sm">
              Control de jornales, pagos y registro de empleados.
            </p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2">
            <span className="text-lg">+</span> Nuevo Empleado
          </button>
        </div>

        {/* Tabla Profesional */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Empleado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Identificación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Gestión de Pagos
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-indigo-50/30 transition-colors group">
                  {/* Columna Empleado con mejor estilo */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        CR
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 leading-none">
                          Cristhian Rodríguez
                        </div>
                        <span className="text-[10px] text-green-600 font-bold uppercase mt-1 inline-block">
                          ● Activo
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Identificación combinada */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 font-medium">Cédula</div>
                    <div className="text-xs text-gray-400 font-mono">0940501596</div>
                  </td>

                  {/* Teléfono con estilo de link */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 italic">
                    {'+593 967148226'}
                  </td>

                  {/* Gestión de Pagos: Usamos botones con más presencia */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200">
                        <MdPayments size={16} />
                        PAGAR JORNAL
                      </button>
                      <button className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200">
                        <FaHistory size={14} />
                        HISTORIAL
                      </button>
                    </div>
                  </td>

                  {/* Acciones limpias */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-3">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                        <FaUserEdit size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Nomina
