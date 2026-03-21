import React from 'react'
import {
  MdFilterList,
  MdPerson,
  MdCalendarToday,
  MdHistory,
  MdLayers,
  MdFileDownload,
} from 'react-icons/md'

const ComprasHeader = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* TÍTULO E IDENTIDAD */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg rotate-3">
          <MdHistory size={28} />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">
            Historial de Compras
          </h3>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            Aroma de Oro | Registro de Auditoría
          </p>
        </div>
      </div>

      {/* PANEL DE FILTROS REFINADO */}
      <div className="flex flex-wrap md:flex-nowrap items-end gap-3 w-full lg:w-auto">
        {/* FILTRO PERÍODO */}
        <div className="flex flex-col gap-1.5 flex-1 md:w-40">
          <label className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase ml-1">
            <MdCalendarToday size={12} className="text-gray-400" /> Período
          </label>
          <input
            type="date"
            className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-xs font-bold focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer"
          />
        </div>

        {/* FILTRO PRODUCTOR */}
        <div className="flex flex-col gap-1.5 flex-1 md:w-56">
          <label className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase ml-1">
            <MdPerson size={14} className="text-gray-400" /> Productor
          </label>
          <select className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-xs font-bold focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer appearance-none">
            <option>TODOS LOS PROVEEDORES</option>
            {/* Opciones mapeadas aquí */}
          </select>
        </div>

        {/* NUEVO FILTRO: ESTADO DE PAGO */}
        <div className="flex flex-col gap-1.5 flex-1 md:w-44">
          <label className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase ml-1">
            <MdLayers size={14} className="text-gray-400" /> Estatus
          </label>
          <select className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-[11px] font-black focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer appearance-none text-gray-700">
            <option value="todos">VER TODOS</option>
            <option value="liquidado" className="text-emerald-600">
              ✅ LIQUIDADO
            </option>
            <option value="pendiente" className="text-orange-600">
              ⏳ PENDIENTE
            </option>
          </select>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-wider hover:bg-black transition-all shadow-md active:scale-95 h-[42px]">
            <MdFilterList size={18} />
            Filtrar
          </button>

          <button
            className="flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm h-[42px] aspect-square group"
            title="Exportar Reporte"
          >
            <MdFileDownload
              size={22}
              className="group-hover:translate-y-0.5 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ComprasHeader
