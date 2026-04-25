import { MdClose } from 'react-icons/md'

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop con desenfoque */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        {/* Header del Modal */}
        <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">
              {title}
            </h2>
            <div className="h-1 w-10 bg-amber-400 rounded-full mt-1" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-100 text-gray-400 hover:text-amber-600 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </header>

        {/* Contenido (Scrollable en móviles si es necesario) */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export default Modal
