import { useState } from 'react'
import { toast, Toaster } from 'sonner' // Asegúrate de instalar 'sonner'
import Swal from 'sweetalert2' // Asegúrate de instalar 'sweetalert2'
import {
  MdNotificationsActive,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdAdsClick,
  MdTouchApp,
} from 'react-icons/md'
import { Container } from '../../components/index.components'

const Alerta = () => {
  // Lógica para SweetAlert2
  const mostrarSwal = (icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: '#4f46e5', // Indigo-600 para mantener tu marca
      borderRadius: '2rem',
      customClass: {
        popup: 'rounded-[2rem] font-sans',
        confirmButton: 'rounded-xl px-6 py-2 text-xs font-black uppercase tracking-widest',
      },
    })
  }

  // Lógica para Sonner
  const mostrarSonner = (type) => {
    const config = {
      style: { borderRadius: '1rem', padding: '16px' },
    }

    if (type === 'success')
      toast.success('¡Operación Exitosa!', {
        ...config,
        description: 'El registro se guardó correctamente.',
      })
    if (type === 'error')
      toast.error('Error de Sistema', {
        ...config,
        description: 'No se pudo conectar con el servidor.',
      })
    if (type === 'info')
      toast.info('Aviso Importante', {
        ...config,
        description: 'Recuerde cerrar caja al final del día.',
      })
  }

  return (
    <Container fullWidth={true}>
      {/* El Toaster de Sonner debe estar presente en el árbol */}
      <Toaster position="top-right" richColors />

      <div className="w-full px-4 md:px-8 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">
            Estilo de Notificaciones
          </h1>
          <p className="text-gray-500 text-sm italic">
            Haga clic en los botones para que el cliente elija el estilo que prefiera.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* OPCIÓN A: SONNER (TOASTS) */}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 p-8 shadow-sm hover:border-indigo-300 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <MdNotificationsActive size={28} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-800 leading-none tracking-tight">
                  Opción A: Sonner
                </h2>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                  Estilo Moderno (Toast)
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-xs mb-8 leading-relaxed">
              Notificaciones discretas que aparecen en la esquina de la pantalla. Son ideales para
              flujos de trabajo rápidos ya que no interrumpen la vista principal.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => mostrarSonner('success')}
                className="flex items-center justify-between bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl transition-all group/btn"
              >
                <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-widest">
                  <MdCheckCircle size={20} /> Éxito
                </div>
                <MdTouchApp
                  size={18}
                  className="opacity-0 group-hover/btn:opacity-100 transition-all"
                />
              </button>

              <button
                onClick={() => mostrarSonner('error')}
                className="flex items-center justify-between bg-red-50 hover:bg-red-100 text-red-700 px-6 py-4 rounded-2xl transition-all group/btn"
              >
                <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-widest">
                  <MdError size={20} /> Error
                </div>
                <MdTouchApp
                  size={18}
                  className="opacity-0 group-hover/btn:opacity-100 transition-all"
                />
              </button>

              <button
                onClick={() => mostrarSonner('info')}
                className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-4 rounded-2xl transition-all group/btn"
              >
                <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-widest">
                  <MdInfo size={20} /> Informativo
                </div>
                <MdTouchApp
                  size={18}
                  className="opacity-0 group-hover/btn:opacity-100 transition-all"
                />
              </button>
            </div>
          </div>

          {/* OPCIÓN B: SWEETALERT2 (MODAL) */}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 p-8 shadow-sm hover:border-indigo-300 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gray-100 text-gray-500 rounded-2xl group-hover:bg-gray-800 group-hover:text-white transition-all">
                <MdAdsClick size={28} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-800 leading-none tracking-tight">
                  Opción B: SweetAlert2
                </h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Estilo Clásico (Modal)
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-xs mb-8 leading-relaxed">
              Alertas tipo ventana emergente que bloquean la pantalla hasta que el usuario confirma.
              Ideales para mensajes críticos que requieren atención total.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => mostrarSwal('success', '¡Excelente!', 'Los datos se han procesado.')}
                className="bg-gray-900 text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Ver Alerta de Éxito
              </button>
              <button
                onClick={() =>
                  mostrarSwal('error', 'Algo salió mal', 'No se pudo completar la transacción.')
                }
                className="border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                Ver Alerta de Error
              </button>
            </div>
          </div>
        </div>

        {/* PIE DE PÁGINA PARA EL CLIENTE */}
        <div className="mt-16 bg-indigo-600 rounded-[3rem] p-10 text-center text-white shadow-2xl shadow-indigo-200">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-2">
            ¿Cuál prefiere para Aroma de Oro?
          </h3>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest leading-loose">
            La Opción A es más rápida y moderna.
            <br />
            La Opción B es más formal y segura.
          </p>
        </div>
      </div>
    </Container>
  )
}

export default Alerta
