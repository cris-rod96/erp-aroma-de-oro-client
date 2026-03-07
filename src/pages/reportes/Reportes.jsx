import { useState } from 'react'
import {
  MdAssessment,
  MdFileDownload,
  MdTimeline,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdBarChart,
  MdInventory,
} from 'react-icons/md'
import { FaFilePdf, FaFileExcel } from 'react-icons/fa'
import { Container } from '../../components/index.components'

const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  // Estadísticas Generales (KPIs)
  const stats = [
    {
      label: 'Ingresos Totales',
      value: '$45,280.00',
      icon: <MdTrendingUp />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Egresos Totales',
      value: '$28,150.00',
      icon: <MdTrendingDown />,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },

    {
      label: 'Saldos Pendientes',
      value: '$12,400.00',
      icon: <MdTimeline />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 pb-20">
        {/* CABECERA GENERAL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Centro de Reportes</h1>
            <p className="text-gray-500 text-sm">
              Análisis de rendimiento financiero y operativo del sistema.
            </p>
          </div>
        </div>

        {/* TARJETAS DE INDICADORES (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 text-2xl`}
              >
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-black ${stat.color} font-mono italic`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* PANEL DE GENERACIÓN */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                <MdFilterList className="text-indigo-600" size={24} />
                <h2 className="text-sm font-black text-gray-700 uppercase italic tracking-widest">
                  Configurar Reporte
                </h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                    Categoría de Datos
                  </label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-bold text-gray-700 outline-none focus:border-indigo-500">
                    <option>Ventas y Despachos</option>
                    <option>Compras y Liquidaciones</option>
                    <option>Gestión de Nómina</option>
                    <option>Movimientos de Inventario</option>
                    <option>Estado de Cartera (Cuentas)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic text-gray-400">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-600 outline-none focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic text-gray-400">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-600 outline-none focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2">
                    <MdAssessment size={20} /> Previsualizar Reporte
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-red-50 text-red-600 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-red-100 hover:bg-red-100 transition-all">
                      <FaFilePdf size={14} /> PDF
                    </button>
                    <button className="bg-emerald-50 text-emerald-600 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition-all">
                      <FaFileExcel size={14} /> EXCEL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA DE DOCUMENTOS RECIENTES */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
                <MdTimeline className="text-indigo-600" size={24} />
                <h2 className="text-sm font-black text-gray-700 uppercase italic tracking-widest">
                  Últimos Documentos Generados
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase italic">
                        Documento
                      </th>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase italic">
                        Fecha
                      </th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase italic">
                        Descarga
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      {
                        nombre: 'Reporte_Ventas_Mensual.pdf',
                        tipo: 'Ventas',
                        fecha: 'Hoy, 10:09 PM',
                      },
                      {
                        nombre: 'Resumen_Compras_Insumos.xlsx',
                        tipo: 'Compras',
                        fecha: 'Ayer, 04:30 PM',
                      },
                      {
                        nombre: 'Nomina_General_Semana_10.pdf',
                        tipo: 'Nómina',
                        fecha: '04 Mar 2026',
                      },
                    ].map((doc, i) => (
                      <tr key={i} className="hover:bg-indigo-50/20 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white border border-gray-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                              <MdFileDownload size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-700">{doc.nombre}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                Categoría: {doc.tipo}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-xs font-bold text-gray-500">{doc.fecha}</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-all">
                            <MdFileDownload size={22} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-center bg-gray-50/50">
                <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">
                  Ver Historial Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Reportes
