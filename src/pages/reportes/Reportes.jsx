import { useState } from 'react'
import {
  MdAssessment,
  MdFileDownload,
  MdTimeline,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdBarChart,
  MdCalendarToday,
  MdFolderZip,
} from 'react-icons/md'
import { FaFilePdf, FaFileExcel } from 'react-icons/fa'
import { Container } from '../../components/index.components'

const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const stats = [
    {
      label: 'Ingresos Totales',
      value: '$45,280.00',
      icon: <MdTrendingUp />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Egresos Totales',
      value: '$28,150.00',
      icon: <MdTrendingDown />,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      label: 'Saldos Pendientes',
      value: '$12,400.00',
      icon: <MdTimeline />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
  ]

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4 pb-20">
        {/* CABECERA GENERAL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Centro de Reportes
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Análisis de rendimiento financiero y operativo
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-2xl">
            <MdBarChart className="text-gray-400" size={20} />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Estadísticas en tiempo real
            </span>
          </div>
        </div>

        {/* TARJETAS DE INDICADORES (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-[2.5rem] border-2 ${stat.border} shadow-xl shadow-gray-100/50 hover:scale-[1.02] transition-all cursor-default group`}
            >
              <div
                className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-inner group-hover:rotate-12 transition-transform`}
              >
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-2">
                {stat.label}
              </p>
              <p className={`text-3xl font-black ${stat.color} font-mono tracking-tighter`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* PANEL DE GENERACIÓN */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 p-10">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
                <MdFilterList className="text-amber-500" size={24} />
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">
                  Configurar Reporte
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                    Categoría de Datos
                  </label>
                  <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-xs font-black text-gray-700 outline-none focus:border-amber-400 appearance-none uppercase cursor-pointer">
                    <option>Ventas y Despachos</option>
                    <option>Compras y Liquidaciones</option>
                    <option>Gestión de Nómina</option>
                    <option>Movimientos de Inventario</option>
                    <option>Estado de Cartera (Cuentas)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                      Fecha Inicio
                    </label>
                    <div className="relative">
                      <MdCalendarToday
                        className="absolute left-4 top-3.5 text-amber-500"
                        size={16}
                      />
                      <input
                        type="date"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3.5 text-[11px] font-black text-gray-600 outline-none focus:bg-white focus:border-amber-400 transition-all uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                      Fecha Fin
                    </label>
                    <div className="relative">
                      <MdCalendarToday
                        className="absolute left-4 top-3.5 text-amber-500"
                        size={16}
                      />
                      <input
                        type="date"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3.5 text-[11px] font-black text-gray-600 outline-none focus:bg-white focus:border-amber-400 transition-all uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <button className="w-full bg-gray-900 text-amber-400 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 flex items-center justify-center gap-3 active:scale-95">
                    <MdAssessment size={22} /> Previsualizar Reporte
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="bg-rose-50 text-rose-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-rose-100 hover:bg-rose-100 transition-all">
                      <FaFilePdf size={14} /> Exportar PDF
                    </button>
                    <button className="bg-emerald-50 text-emerald-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-emerald-100 hover:bg-emerald-100 transition-all">
                      <FaFileExcel size={14} /> Exportar Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA DE DOCUMENTOS RECIENTES */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
              <div className="px-10 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MdTimeline className="text-amber-500" size={24} />
                  <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">
                    Últimos Documentos Generados
                  </h2>
                </div>
                <MdFolderZip className="text-gray-300" size={24} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Documento / Tipo
                      </th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Fecha Generación
                      </th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      {
                        nombre: 'Reporte_Ventas_Mensual.pdf',
                        tipo: 'Ventas',
                        fecha: 'Hoy, 10:09 PM',
                        color: 'text-amber-600',
                      },
                      {
                        nombre: 'Resumen_Compras_Insumos.xlsx',
                        tipo: 'Compras',
                        fecha: 'Ayer, 04:30 PM',
                        color: 'text-emerald-600',
                      },
                      {
                        nombre: 'Nomina_General_Semana_10.pdf',
                        tipo: 'Nómina',
                        fecha: '04 Mar 2026',
                        color: 'text-rose-600',
                      },
                    ].map((doc, i) => (
                      <tr key={i} className="hover:bg-amber-50/10 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-900 text-amber-400 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                              <MdFileDownload size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-800 tracking-tighter leading-none">
                                {doc.nombre}
                              </p>
                              <p
                                className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${doc.color}`}
                              >
                                {doc.tipo}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            {doc.fecha}
                          </p>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-gray-100">
                            <MdFileDownload size={24} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 text-center bg-gray-50/30 border-t border-gray-50">
                <button className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] hover:text-amber-700 transition-all underline underline-offset-4">
                  Ver Historial de Archivos Completo
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
