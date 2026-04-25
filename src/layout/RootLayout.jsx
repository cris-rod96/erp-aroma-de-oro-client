import { NavLink, Outlet } from 'react-router-dom'
import { FaPowerOff, FaUserCog } from 'react-icons/fa'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'
import { useState } from 'react'
import { IoMenu } from 'react-icons/io5'
import { Aside } from '../components/index.components'

const RootLayout = () => {
  const [hiddenMenu, setHiddenMenu] = useState(false)
  const toggleHiddenMenu = () => setHiddenMenu(!hiddenMenu)
  return (
    <>
      <Aside hiddenMenu={hiddenMenu} toggleHiddenMenu={toggleHiddenMenu} />
      <main className="h-screen w-full bg-[#F5F9FF]">
        <section className="flex-1 bg-[#F5F5F5] overflow-x-hidden flex flex-col">
          <header
            className={`w-screen ${hiddenMenu ? 'px-10' : 'pl-85 px-10'}  h-20 px-5 flex items-center fixed z-10 justify-between border-b border-gray-500/20 bg-white transition-all duration-300`}
          >
            <button onClick={toggleHiddenMenu} className="cursor-pointer">
              {hiddenMenu ? (
                <IoMenu size={25} color="#375A65" />
              ) : (
                <HiOutlineSwitchHorizontal size={25} color="#375A65" />
              )}
            </button>
          </header>
          {/* Opciones */}
        </section>
        <Outlet context={{ hiddenMenu }} />
      </main>
    </>
  )
}

export default RootLayout
