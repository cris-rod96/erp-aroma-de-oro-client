import { useOutletContext } from 'react-router-dom'

const Container = ({ children, fullWidth = false }) => {
  const { hiddenMenu } = useOutletContext()

  // Clases base para el fondo y layout
  const baseStyles = 'flex-1 bg-[#F5F9FF] min-h-screen transition-all duration-300'

  // Padding dinámico basado en si el menú está oculto
  const paddingStyles = hiddenMenu ? 'pl-10' : 'pl-40'

  return (
    <section className={`${baseStyles} ${paddingStyles} pr-10 py-28`}>
      {fullWidth ? (
        // Si es para tablas, usamos un div simple sin Grid rígida
        <div className="w-full max-w-350 mx-auto">{children}</div>
      ) : (
        // Tu diseño original de Grid para otros componentes
        <div
          className={`grid gap-10 mx-auto ${
            hiddenMenu
              ? 'w-[95%] lg:grid-cols-4 md:grid-cols-2'
              : 'w-[80%] lg:grid-cols-3 md:grid-cols-2'
          }`}
        >
          {children}
        </div>
      )}
    </section>
  )
}

export default Container
