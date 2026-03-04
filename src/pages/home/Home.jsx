import { BiSolidBusiness } from 'react-icons/bi'
import { FaFilePdf, FaPowerOff, FaShoppingBasket, FaTruckLoading, FaUserCog } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast, FaUsers } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { TbCashRegister, TbLayoutDashboardFilled } from 'react-icons/tb'
import { ITEMS_DATA, MENU_DATA } from '../../data'
import { NavLink } from 'react-router-dom'
import { GoArrowSwitch } from 'react-icons/go'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'

const Home = () => {
  return (
    <main className="h-screen w-full bg-[#F5F9FF]">
      <aside className="fixed h-screen w-80 bg-[#2f424a] flex flex-col z-50">
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
      {/* Cuerpo */}

      <section className="flex-1 bg-[#F5F5F5] overflow-x-hidden flex flex-col">
        <header className="w-screen pl-85 pr-10 h-20 px-5 flex items-center fixed z-10 justify-between border-b border-gray-500/20 bg-white">
          <button>
            <HiOutlineSwitchHorizontal size={25} color="#375A65" />
          </button>

          <div className="flex flex-row gap-5">
            <NavLink>
              <FaUserCog size={20} color="#375A65" />
            </NavLink>

            <NavLink>
              <FaPowerOff size={20} color="#375A65" />
            </NavLink>
          </div>
        </header>
        {/* Opciones */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 items-center  w-[80%] mx-auto gap-10 px-10 py-28 pl-56 ">
          {ITEMS_DATA.map((item) => (
            <NavLink className="flex flex-col border border-gray-200 rounded-2xl w-full bg-[#FFFFFF] cursor-pointer hover:scale-105 transition-all duration-300 ">
              <header className="h-16 flex justify-center items-center border-b border-gray-200">
                <h2 className="text-xl font-bold text-[#375A65]">{item.label}</h2>
              </header>
              <main className="p-10 flex flex-row items-center justify-center">
                <item.icon size={80} color="#375A65" />
              </main>
            </NavLink>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
