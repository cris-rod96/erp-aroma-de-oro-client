import { NavLink } from 'react-router-dom'
import { MENU_DATA } from '../../data'
import { MdLogout, MdSettings, MdChevronRight } from 'react-icons/md'

const Aside = ({ hiddenMenu }) => {
  return (
    <aside
      className={`fixed h-screen w-80 flex flex-col z-50 transition-all duration-500 ease-in-out shadow-2xl overflow-hidden ${
        !hiddenMenu ? 'left-0' : '-left-full'
      }`}
    >
      {/* IMAGEN DE FONDO CON OVERLAY */}
      <div className="absolute inset-0 z-[-1]">
        <img src="/fondo_cacao.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2529]/95 via-[#2f424a]/90 to-[#1a2529]/98" />
      </div>

      {/* PERFIL DE USUARIO */}
      <section className="p-8 flex flex-col gap-4 items-center border-b border-white/10 backdrop-blur-sm">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full bg-white/10 border-4 border-amber-400/30 overflow-hidden shadow-xl transition-transform duration-500 group-hover:scale-105">
            <img
              src="https://ui-avatars.com/api/?name=Administrador&background=ffbf00&color=482200"
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-[#2f424a] rounded-full shadow-lg"></div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
            Administrador
          </h3>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] bg-amber-400/10 px-3 py-1 rounded-full">
            Acceso Total
          </span>
        </div>
      </section>

      {/* MENU DE OPCIONES */}
      <section className="flex flex-col overflow-y-auto flex-1 py-4 custom-scrollbar">
        <span className="px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 opacity-50 italic">
          Navegación
        </span>

        {MENU_DATA.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end
            className={({ isActive }) =>
              `px-8 py-4 flex flex-row items-center justify-between w-full gap-3 transition-all duration-300 group ${
                isActive
                  ? 'text-amber-400 bg-white/10 border-r-4 border-amber-400'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-4">
              <item.icon size={22} className="group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-bold uppercase tracking-tight italic">{item.label}</h3>
            </div>
            <MdChevronRight
              size={18}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </NavLink>
        ))}
      </section>

      {/* FOOTER DEL ASIDE */}
      <div className="p-4 bg-black/20 border-t border-white/5">
        <p className="text-[9px] text-gray-500 font-black text-center uppercase tracking-widest italic">
          v1.0.0 Aroma de Oro
        </p>
      </div>
    </aside>
  )
}

export default Aside
