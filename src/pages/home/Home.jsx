import { ITEMS_DATA } from '../../data'
import { NavLink, useOutletContext } from 'react-router-dom'
import { MdTrendingUp } from 'react-icons/md'

const Home = () => {
  const { hiddenMenu } = useOutletContext()

  // Simulación de datos que vendrían de tu API o Contexto
  const stats = {
    USUARIOS: '12 Activos',
    NÓMINA: '25 Empleados',
    COMPRAS: '15 Hoy',
    INVENTARIO: '450.00 qq',
    PRODUCTORES: '158 Total',
    CAJAS: '$1,250.00',
  }

  return (
    <section className="flex-1 bg-[#F5F9FF]">
      <div
        className={`grid md:grid-cols-2 sm:grid-cols-1 items-center ${
          hiddenMenu ? 'w-[90%] lg:grid-cols-4' : 'w-[80%] pl-56 lg:grid-cols-3'
        } mx-auto gap-10 px-10 py-28 transition-all duration-300`}
      >
        {ITEMS_DATA.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="group flex flex-col border border-gray-200 rounded-[2rem] w-full bg-white cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-amber-900/15 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            {/* Header con Badge de Estado */}
            <header className="h-14 flex justify-between items-center px-6 border-b border-gray-50 bg-gray-50/50 group-hover:bg-amber-50 transition-colors">
              <h2 className="text-[11px] font-black text-[#375A65] uppercase tracking-widest group-hover:text-amber-700 transition-colors italic">
                {item.label}
              </h2>
              <MdTrendingUp
                className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                size={18}
              />
            </header>

            {/* Cuerpo con Icono y Contador */}
            <main className="p-10 flex flex-col items-center justify-center gap-4 relative">
              {/* Icono Principal */}
              <div className="text-[#375A65] group-hover:text-amber-500 transition-all duration-300 transform group-hover:scale-90">
                <item.icon size={65} />
              </div>

              {/* DATOS DINÁMICOS */}
              <div className="text-center">
                <p className="text-lg font-black text-gray-800 group-hover:text-amber-600 transition-colors font-mono">
                  {stats[item.label.toUpperCase()] || '---'}
                </p>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Ver detalles del módulo
                </span>
              </div>

              {/* Barra de progreso decorativa al fondo */}
              <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-amber-400 group-hover:w-full transition-all duration-700 ease-in-out" />
            </main>
          </NavLink>
        ))}
      </div>
    </section>
  )
}

export default Home
