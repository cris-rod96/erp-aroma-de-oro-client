import { FaUserEdit } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { MdDelete } from 'react-icons/md'

const Usuarios = () => {
  return (
    <Container fullWidth={true}>
      <div className="w-full px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col  justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
            <p className="text-gray-500 text-sm">Administra los roles y acceso de tu sistema.</p>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
            Nuevo Usuario
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Vista para escritorio */}
          <div className="hidden md:block overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nombres
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {'Cristhian Rodríguez'.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {'Cristhian Rodríguez'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {'0940501596'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {'crisrodam1996@gmail.com'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {'0967148226'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {'Administrador'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {'Activo'}
                    </span> */}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {'Inactivo'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap  text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer">
                      <FaUserEdit size={20} />
                    </button>
                    <button className="text-red-600 hover:text-red-900 cursor-pointer">
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vista para móviles (Datos estáticos de prueba) */}
          <div className="md:hidden divide-y divide-gray-200">
            {/* Tarjeta de Ejemplo 1 */}
            <div className="p-5 flex flex-col gap-4 bg-white">
              {/* 1. Identidad y Rol */}
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md">
                    C
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-bold text-gray-900">Cristhian Rodríguez</div>
                    <div className="text-xs text-gray-500">crisrodam1996@gmail.com</div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  Administrador
                </span>
              </div>

              {/* 2. Información Detallada (Cédula y Teléfono) */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 bg-gray-50/50 px-2 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Cédula
                  </span>
                  <span className="text-sm font-mono text-gray-800 font-medium">0912345678</span>
                </div>
                <div className="flex flex-col border-l border-gray-200 pl-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Teléfono
                  </span>
                  <span className="text-sm text-gray-800 font-medium">+593 987654321</span>
                </div>
              </div>

              {/* 3. Estado y Botones de Acción */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center text-xs font-bold text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  ACTIVO
                </div>
                <div className="flex gap-2">
                  <button className="text-indigo-600 hover:text-indigo-900  cursor-pointer">
                    <FaUserEdit size={20} />
                  </button>
                  <button className="text-red-600 hover:text-red-900 cursor-pointer">
                    <MdDelete size={20} />
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

export default Usuarios
