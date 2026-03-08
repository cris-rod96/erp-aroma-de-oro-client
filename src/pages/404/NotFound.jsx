import { useNavigate } from 'react-router-dom'
import { MdExploreOff, MdArrowBack } from 'react-icons/md'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <main className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-900 overflow-hidden text-center p-6">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <img src="/fondo_cacao.jpg" alt="" className="w-full h-full object-cover grayscale" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg">
        {/* Número 404 Estilizado */}
        <h1 className="text-[12rem] font-black leading-none text-white/5 italic select-none absolute -top-24">
          404
        </h1>

        <div className="w-24 h-24 bg-amber-400/10 rounded-[2rem] flex items-center justify-center border border-amber-400/20 mb-8 animate-bounce">
          <MdExploreOff className="text-amber-400" size={48} />
        </div>

        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
          Ruta no encontrada
        </h2>

        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mb-10 leading-loose">
          Parece que te has desviado del camino. <br />
          Esta sección no existe en <span className="text-amber-400 italic">Aroma de Oro</span>.
        </p>

        <button
          onClick={() => navigate('/inicio')}
          className="group flex items-center gap-3 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-900/20 active:scale-95"
        >
          <MdArrowBack size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Inicio
        </button>
      </div>

      <div className="absolute bottom-10">
        <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">
          Error Code: NULL_PATH_EXCEPTION
        </span>
      </div>
    </main>
  )
}

export default NotFound
