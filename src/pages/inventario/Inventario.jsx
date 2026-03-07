import { Container } from '../../components/index.components'
import { FaUserEdit } from 'react-icons/fa'
import { MdDelete, MdInventory } from 'react-icons/md'

const Inventario = () => {
  return (
    <Container fullWidth={true}>
      <div className="w-full px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Inventario</h1>
            <p className="text-gray-500 text-sm">Control de existencias y unidades de medida.</p>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
            + Nuevo Producto
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* --- VISTA DESKTOP --- */}
          <div className="hidden md:block overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Unidad Medida
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-amber-100 text-amber-700 flex items-center justify-center mr-3">
                        <MdInventory size={18} />
                      </div>
                      <div className="text-sm font-bold text-gray-900">Cacao Seco</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 uppercase font-medium">
                    Quintal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                      120
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer transition-colors">
                      <FaUserEdit size={20} />
                    </button>
                    <button className="text-red-600 hover:text-red-900 cursor-pointer transition-colors">
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* --- VISTA MÓVIL (Adaptada a Inventario) --- */}
          <div className="md:hidden divide-y divide-gray-200">
            <div className="p-5 flex flex-col gap-4 bg-white">
              {/* Header: Producto y Categoría sugerida */}
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                    <MdInventory size={24} />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-bold text-gray-900 leading-tight">
                      Cacao Seco
                    </div>
                    <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                      Insumo / Producto
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase">
                  En Stock
                </span>
              </div>

              {/* Grid: Unidad y Stock */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 bg-gray-50/50 px-3 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Unidad Medida
                  </span>
                  <span className="text-sm font-bold text-gray-800 uppercase">Quintal</span>
                </div>
                <div className="flex flex-col border-l border-gray-200 pl-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Stock Disponible
                  </span>
                  <span className="text-lg font-mono text-indigo-700 font-black">120.00</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center text-xs font-bold text-gray-400 italic">
                  Actualizado hoy
                </div>
                <div className="flex gap-4">
                  <button className="text-indigo-600 hover:text-indigo-900 cursor-pointer">
                    <FaUserEdit size={22} />
                  </button>
                  <button className="text-red-600 hover:text-red-900 cursor-pointer">
                    <MdDelete size={22} />
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

export default Inventario
