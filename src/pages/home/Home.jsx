import { ITEMS_DATA } from '../../data'
import { NavLink, useOutletContext } from 'react-router-dom'

const Home = () => {
  const { hiddenMenu } = useOutletContext()
  return (
    <section className="flex-1 bg-[#F5F9FF]">
      <div
        className={`grid md:grid-cols-2 sm:grid-cols-1 items-center  ${hiddenMenu ? 'w-[90%] lg:grid-cols-4' : 'w-[80%] pl-56 lg:grid-cols-3'}  mx-auto gap-10 px-10 py-28 transition-all duration-300`}
      >
        {ITEMS_DATA.map((item) => (
          <NavLink
            className="flex flex-col border border-gray-200 rounded-2xl w-full bg-[#FFFFFF] cursor-pointer hover:scale-105 transition-all duration-300 "
            to={item.path}
          >
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
  )
}

export default Home
