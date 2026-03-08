import { useNavigate } from 'react-router-dom'
import { MdGppBad, MdLockPerson } from 'react-icons/md'

const NotAuthorized = () => {
  const navigate = useNavigate()

  return (
    <main className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-900 overflow-hidden text-center p-6">
      {/* Overlay de advertencia */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
            <MdGppBad className="text-red-500" size={56} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-400 p-2 rounded-lg shadow-lg">
            <MdLockPerson className="text-amber-950" size={20} />
          </div>
        </div>

        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
          Acceso Restringido
        </h2>

        <div className="h-1 w-20 bg-red-500 mb-6 mx-auto rounded-full" />

        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-10 leading-relaxed px-8">
          Tus credenciales no tienen los privilegios necesarios <br />
          para acceder a este módulo administrativo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => navigate(-1)} // Vuelve a la página anterior
            className="flex-1 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
          >
            Regresar
          </button>
          <button
            onClick={() => navigate('/inicio')}
            className="flex-1 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-900/20 active:scale-95"
          >
            Panel Seguro
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <span className="text-[9px] text-red-400/40 font-black uppercase tracking-[0.4em]">
          Security Alert: HTTP_401_UNAUTHORIZED
        </span>
        <div className="w-10 h-1 bg-red-500/20 rounded-full" />
      </div>
    </main>
  )
}

export default NotAuthorized
