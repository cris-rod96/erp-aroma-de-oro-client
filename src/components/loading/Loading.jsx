import React from 'react'

const Loading = ({ mensaje = 'Cargando sistema', subtitulo = 'Aroma de Oro | 2026' }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col justify-center items-center transition-opacity duration-500">
      {/* Fondo decorativo sutil con la imagen de cacao */}
      <div className="absolute inset-0 opacity-10">
        <img src="/fondo_cacao.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative flex justify-center items-center">
        {/* Anillo de carga con el color Amber-400 de la marca */}
        <div className="w-28 h-28 border-[3px] border-white/10 border-t-amber-400 rounded-full animate-spin"></div>

        {/* Logo/Nombre Central */}
        <div className="absolute flex flex-col items-center">
          <span className="text-amber-400 font-black text-xs uppercase tracking-tighter italic leading-none">
            Aroma
          </span>
          <span className="text-white font-bold text-[8px] uppercase tracking-widest leading-none">
            de Oro
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {/* Mensaje Dinámico */}
        <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] animate-pulse italic text-center px-4">
          {mensaje}
        </h2>

        {/* Barra de progreso decorativa */}
        <div className="w-48 h-[1px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 animate-progress origin-left"></div>
        </div>

        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-2">
          {subtitulo}
        </span>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress {
          0% { transform: scaleX(0.1); }
          50% { transform: scaleX(0.8); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
      `,
        }}
      />
    </div>
  )
}

export default Loading
