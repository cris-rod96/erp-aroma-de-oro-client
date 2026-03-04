import { useOutletContext } from 'react-router-dom'

const Container = ({ children }) => {
  const { hiddenMenu } = useOutletContext()
  return (
    <section className="flex-1 bg-[#F5F9FF]">
      <div
        className={`grid md:grid-cols-2 sm:grid-cols-1 items-center  ${hiddenMenu ? 'w-[95%] lg:grid-cols-4' : 'w-[80%] pl-40 lg:grid-cols-3'}  mx-auto gap-10 pr-10 py-28 transition-all duration-300`}
      >
        {children}
      </div>
    </section>
  )
}

export default Container
