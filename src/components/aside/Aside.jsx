import { NavLink } from 'react-router-dom'
import { MENU_DATA } from '../../data'

const Aside = ({ hiddenMenu }) => {
  return (
    <aside
      className={`fixed h-screen w-80 bg-[#2f424a] flex flex-col z-50 ${!hiddenMenu ? 'left-0' : '-left-full'} transition-all duration-300`}
    >
      <section className="p-10 flex flex-col gap-3 items-center border-b border-gray-600">
        <div className="w-40 h-40 rounded-full bg-white border-2 border-gray-400">
          {/* Imagen de perfil */}
        </div>
        {/* Nombre */}
        <h3 className="text-xl font-bold text-white">Administrador</h3>
        {/* Rol */}
        <h5 className="text-[16px] font-semibold text-gray-300">Administrador</h5>
      </section>

      {/* Menu de opciones */}
      <section className="flex flex-col overflow-y-auto flex-1 custom-scrollbar">
        {/* Opciones */}
        {MENU_DATA.map((item) => (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'px-8 py-5  flex flex-row items-center w-full gap-3 text-white bg-gray-500/20'
                : 'px-8 py-5  flex flex-row items-center w-full gap-3 text-white hover:bg-gray-500/20 transition-all duration-300'
            }
          >
            <item.icon size={20} />
            <h3 className="text-lg">{item.label}</h3>
          </NavLink>
        ))}
      </section>
    </aside>
  )
}

export default Aside
