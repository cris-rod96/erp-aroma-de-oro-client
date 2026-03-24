import {
  MdHistory,
  MdAccountBalanceWallet,
  MdExpandMore,
  MdPrint,
  MdEvent,
  MdInfoOutline, // Nuevo icono para el tooltip
} from 'react-icons/md'

const KardexHeader = ({
  filtroTipo,
  setFiltroTipo,
  cajaId,
  setCajaId,
  cajas,
  onExportPDF,
  filtroTiempo,
  setFiltroTiempo,
  hasData,
}) => {
  // Determinamos si el selector de caja debe estar bloqueado
  // Bloqueado si el tiempo es mayor a un día (semana, mes, etc)
  const isCajaDisabled = filtroTiempo === 'todos' && filtroTiempo !== 'dia'

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
      <div className="border-l-4 border-amber-400 pl-4">
        <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter flex items-center gap-3">
          <MdHistory className="text-amber-500" /> Historial de Movimientos
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
          {filtroTipo === 'gastos'
            ? 'Control de Gastos y Nómina'
            : 'Gestión Operativa Aroma de Oro'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
        {/* Botones de Exportación */}
        <div className="flex gap-2 mr-2">
          <button
            onClick={hasData ? onExportPDF : null}
            disabled={!hasData}
            title="Exportar Reporte PDF"
            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm"
          >
            <MdPrint size={20} />
          </button>
        </div>

        {/* Selector de Período */}
        <div className="relative min-w-[180px]">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-amber-600 uppercase z-10">
            Período
          </label>
          <select
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 rounded-xl pl-9 pr-10 py-2.5 text-xs font-black text-gray-700 appearance-none focus:border-amber-400 outline-none uppercase cursor-pointer"
          >
            <option value="todos">Histórico Total</option>
            <option value="dia">Hoy</option>
            <option value="semana">Últimos 7 días</option>
            <option value="mes">Este Mes</option>
            <option value="trimestre">Trimestre</option>
            <option value="anio">Este Año</option>
          </select>
          <MdEvent className="absolute left-3 top-3 text-amber-500" size={16} />
          <MdExpandMore
            className="absolute right-3 top-3 text-gray-400 pointer-events-none"
            size={18}
          />
        </div>

        {/* Selector de Caja (Con lógica de bloqueo) */}
        <div className="relative flex-1 min-w-[220px]">
          <label
            className={`absolute -top-2 left-3 bg-white px-1 text-[9px] font-black uppercase z-10 ${isCajaDisabled ? 'text-gray-400' : 'text-emerald-600'}`}
          >
            Caja
          </label>
          <select
            disabled={isCajaDisabled}
            value={cajaId}
            onChange={(e) => setCajaId(e.target.value)}
            className={`w-full border-2 rounded-xl pl-9 pr-10 py-2.5 text-xs font-black appearance-none outline-none uppercase transition-all ${
              isCajaDisabled
                ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-100 text-gray-700 focus:border-emerald-400 cursor-pointer'
            }`}
          >
            <option value="todas">Todas las Cajas</option>
            {cajas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre || `Caja ${c.id.slice(0, 4)}`}
              </option>
            ))}
          </select>
          <MdAccountBalanceWallet
            className={`absolute left-3 top-3 ${isCajaDisabled ? 'text-gray-300' : 'text-emerald-500'}`}
            size={16}
          />

          {/* Tooltip de ayuda cuando está desactivado */}
          {isCajaDisabled && (
            <div className="absolute -bottom-5 right-0 flex items-center gap-1 text-[8px] text-gray-400 font-bold italic">
              <MdInfoOutline /> Rango amplio requiere ver todas las cajas
            </div>
          )}

          <MdExpandMore
            className="absolute right-3 top-3 text-gray-400 pointer-events-none"
            size={18}
          />
        </div>

        {/* Tabs de Filtro */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          {['todos', 'inventario', 'gastos'].map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg ${
                filtroTipo === t
                  ? 'bg-gray-900 text-amber-400 shadow-md'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'todos' ? 'Ver Todo' : t === 'inventario' ? 'Stock' : 'Gastos'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KardexHeader
