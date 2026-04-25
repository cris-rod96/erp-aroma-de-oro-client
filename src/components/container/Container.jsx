import { useOutletContext } from 'react-router-dom'

const Container = ({ children, fullWidth = false }) => {
  const { hiddenMenu } = useOutletContext()

  // 1. Quitamos los paddings redundantes y usamos margen izquierdo exacto
  // Si el menú NO está oculto, desplazamos 320px (w-80). Si está oculto, dejamos un margen de seguridad.
  const baseStyles = 'flex-1 bg-[#F5F9FF] min-h-screen transition-all duration-300'
  const marginStyles = hiddenMenu ? 'ml-0' : 'ml-80'

  return (
    // Agregamos pt-20 para que el contenido no quede debajo del header fixed
    <section className={`${baseStyles} ${marginStyles} pt-24 pb-10`}>
      {fullWidth ? (
        // Simplificamos: solo un padding horizontal para que no pegue a los bordes
        <div className="w-full px-10">{children}</div>
      ) : (
        <div
          className={`grid gap-10 mx-auto transition-all ${
            hiddenMenu
              ? 'w-[95%] lg:grid-cols-4 md:grid-cols-2'
              : 'w-[90%] lg:grid-cols-3 md:grid-cols-2'
          }`}
        >
          {children}
        </div>
      )}
    </section>
  )
}

export default Container
