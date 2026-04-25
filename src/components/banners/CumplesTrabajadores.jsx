import { MdCake, MdNotificationsActive } from 'react-icons/md'

const CumplesTrabajadores = ({ cumplesHoy = [], cumplesManana = [] }) => {
  if (cumplesHoy.length === 0 && cumplesManana.length === 0) return null

  return (
    <div className="w-full mb-8 flex flex-col gap-4">
      {/* SECCIÓN HOY - IMPACTO MODERADO */}
      {cumplesHoy.length > 0 && (
        <div className="bg-white border border-amber-100 rounded-[1.5rem] overflow-hidden shadow-sm">
          <div className="flex">
            <div className="bg-amber-500 w-2 shrink-0" /> {/* Barra de acento más gruesa */}
            <div className="p-6 flex items-center gap-6 w-full">
              <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 shrink-0">
                <MdCake size={28} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em]">
                  ¡Festejamos hoy!
                </span>
                {cumplesHoy.map((p) => (
                  <div key={p.id} className="flex flex-col mb-1 last:mb-0">
                    <p className="text-lg font-black text-gray-900 uppercase leading-none tracking-tight">
                      {p.mensaje}
                    </p>
                    <p className="text-xs font-bold text-gray-500 uppercase mt-1">{p.detalles}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN MAÑANA - LISTADO CLARO */}
      {cumplesManana.length > 0 && (
        <div className="bg-gray-50/80 border border-gray-100 rounded-[1.5rem] p-6">
          <div className="flex items-center gap-3 mb-4 px-1">
            <MdNotificationsActive className="text-gray-400" size={20} />
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Próximos Cumpleaños (Mañana)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cumplesManana.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col gap-1 shadow-sm"
              >
                <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                  {p.mensaje}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {p.detalles}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CumplesTrabajadores
