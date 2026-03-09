import { useState } from 'react'
import { MdPrint } from 'react-icons/md'
import { Container } from '../../components/index.components'

const Compras = () => {
  const [ticket] = useState({
    numero: '0052628',
    idCompra: 'AD-2026-0098',
    fecha: '09-01-2026',
    usuario: 'SISTEMA CENTRAL',
    pesoNeto: 199.26,
    cantidad: 202.3,
    precio: 230.0,
    subtotal: 45829.8,
    retencion: 458.3,
    totalLiquidacion: 45371.5,
    abonoAnt: 30000.0,
    totalAPagar: 15371.5,
  })

  return (
    <Container fullWidth={true}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          /* 1. Reset agresivo para eliminar márgenes externos del ERP */
          header, aside, nav, footer, .no-print, [class*="sidebar"], [class*="header"], button { 
            display: none !important; 
          }
          
          /* Forzamos que el body y el contenedor padre no tengan restricciones */
          html, body, #root, .main-content, .container { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important;
            max-width: none !important;
            min-width: 100% !important;
            overflow: visible !important;
          }

          @page { 
            size: landscape; 
            margin: 0.5cm !important; /* Margen mínimo de impresora */
          }

          /* 2. Contenedor Maestro de la Factura */
          #aroma-oro-print {
            display: block !important;
            width: 100vw !important; /* 100% del ancho de ventana */
            position: absolute;
            left: 0;
            top: 0;
            padding: 0;
            margin: 0;
          }

          /* Estilos de tabla y bordes */
          .b-black { border: 1.2pt solid black !important; }
          .b-r-black { border-right: 1.2pt solid black !important; }
          .b-b-black { border-bottom: 1.2pt solid black !important; }
          .bg-gold { background-color: #b48c36 !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-zinc { background-color: #f4f4f5 !important; -webkit-print-color-adjust: exact; }
          
          /* Ajuste de fuentes para que no desborde verticalmente */
          .text-print-xs { font-size: 8px !important; }
          .text-print-sm { font-size: 10px !important; }
          .text-print-base { font-size: 12px !important; }
        }
      `,
        }}
      />

      <div className="no-print p-6 flex flex-col items-center">
        <button
          onClick={() => window.print()}
          className="bg-zinc-900 text-amber-500 px-10 py-3 rounded font-black shadow-xl"
        >
          IMPRIMIR FACTURA (ANCHO TOTAL)
        </button>
      </div>

      {/* Usamos un ID específico para el reset de impresión */}
      <div id="aroma-oro-print" className="hidden print:block font-sans text-black">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-1 border-b-4 border-amber-600 pb-1">
          <div>
            <h1 className="text-4xl font-serif font-black">AROMA DE ORO</h1>
            <p className="text-amber-600 font-bold tracking-[0.5em] text-[10px] uppercase">
              Fine Cacao & Trading
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold text-zinc-400 italic text-right uppercase">
              Excelencia en Origen
              <br />
              Guayas - Ecuador
            </span>
            <div className="border-2 border-amber-600 p-2 px-8 bg-zinc-50 rounded-tl-xl text-center">
              <span className="text-[10px] font-black uppercase text-amber-700 block">
                Liquidación de Compra
              </span>
              <span className="text-2xl font-mono font-bold tracking-tighter">
                {ticket.idCompra}
              </span>
            </div>
          </div>
        </div>

        {/* INFO PROVEEDOR - Tabla al 100% */}
        <div className="w-full b-black flex flex-col mb-1 text-print-sm">
          <div className="flex b-b-black h-8 items-center">
            <div className="w-[12%] bg-zinc-100 h-full p-2 font-black b-r-black">PROVEEDOR</div>
            <div className="w-[58%] p-2 px-4 font-black uppercase text-print-base b-r-black">
              VERA PINCAY KELVIN STEVEN
            </div>
            <div className="w-[10%] bg-zinc-100 h-full p-2 font-black b-r-black text-center">
              RUC / C.I.
            </div>
            <div className="w-[20%] p-2 text-center font-black tracking-widest text-print-base">
              1311248940001
            </div>
          </div>
          <div className="flex h-8 items-center">
            <div className="w-[12%] bg-zinc-100 h-full p-2 font-black b-r-black">ORIGEN</div>
            <div className="w-[58%] p-2 px-4 italic font-bold uppercase text-[9px] b-r-black">
              VIA A QUEVEDO RECINTO KM 3 CAÑA DULCE - EL EMPALME
            </div>
            <div className="w-[10%] bg-zinc-100 h-full p-2 font-black b-r-black text-center">
              TICKET
            </div>
            <div className="w-[20%] p-2 text-center font-black">{ticket.numero}</div>
          </div>
        </div>

        {/* DETALLE PRODUCTO */}
        <table className="w-full b-black border-collapse text-center mb-1">
          <thead>
            <tr className="bg-gold text-[10px] h-8 tracking-tighter">
              <th className="b-r-black w-[40%]">DESCRIPCIÓN DEL PRODUCTO</th>
              <th className="b-r-black">CALIDAD</th>
              <th className="b-r-black">UNIDAD</th>
              <th className="b-r-black">CANT.</th>
              <th className="b-r-black">PESO NETO</th>
              <th className="b-r-black">PRECIO U.</th>
              <th className="bg-zinc-800">TOTAL PARCIAL</th>
            </tr>
          </thead>
          <tbody className="font-bold text-print-sm">
            <tr className="h-10 b-b-black">
              <td className="b-r-black text-left px-4 italic uppercase font-serif text-print-base">
                Cacao CCN51 Seco Premium
              </td>
              <td className="b-r-black">1.5 %</td>
              <td className="b-r-black uppercase">Quintal</td>
              <td className="b-r-black font-mono">{ticket.cantidad}</td>
              <td className="b-r-black font-mono">{ticket.pesoNeto}</td>
              <td className="b-r-black font-mono">${ticket.precio.toFixed(2)}</td>
              <td className="font-mono text-print-base bg-zinc-50 italic">
                ${ticket.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* BLOQUE RETENCIONES Y TOTALES */}
        <div className="flex w-full b-black h-32 overflow-hidden mb-1">
          <div className="w-[65%] b-r-black flex flex-col">
            <div className="flex bg-zinc-100 b-b-black h-6 font-black text-[9px] items-center uppercase italic">
              <div className="w-[10%] b-r-black text-center">ID</div>
              <div className="w-[60%] b-r-black px-2">Descripción Retención</div>
              <div className="w-[30%] text-center">Valor</div>
            </div>
            <div className="flex h-7 items-center border-b border-zinc-50">
              <div className="w-[10%] b-r-black text-center">02</div>
              <div className="w-[60%] b-r-black px-2 italic uppercase font-bold text-[9px]">
                Retención Fuente 1% - Producción Agrícola
              </div>
              <div className="w-[30%] text-center font-mono font-bold">
                -${ticket.retencion.toFixed(2)}
              </div>
            </div>
            <div className="flex-grow"></div>
            {/* Firmas en una sola línea para ahorrar espacio vertical */}
            <div className="flex h-12 border-t border-black bg-zinc-50/30">
              <div className="w-1/2 b-r-black flex flex-col justify-end items-center pb-1">
                <div className="w-3/4 border-t border-black text-[8px] font-black text-center pt-1">
                  Responsable Comercial
                </div>
              </div>
              <div className="w-1/2 flex flex-col justify-end items-center pb-1">
                <div className="w-3/4 border-t border-amber-600 text-[8px] font-black text-amber-700 text-center pt-1 uppercase">
                  Aroma de Oro S.A.
                </div>
              </div>
            </div>
          </div>

          <div className="w-[35%] flex flex-col font-bold">
            {[
              { l: 'Subtotal Grado 0%', v: ticket.subtotal },
              { l: 'Total Retenciones', v: ticket.retencion },
              { l: 'Total Liquidación', v: ticket.totalLiquidacion, bg: true },
              { l: 'Neto a Recibir', v: ticket.totalAPagar, main: true },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-1 b-b-black last:border-b-0 items-center ${item.bg ? 'bg-zinc-100' : ''} ${item.main ? 'bg-zinc-900 text-white' : ''}`}
              >
                <div className="w-1/2 px-2 text-[9px] uppercase font-black">{item.l}</div>
                <div
                  className={`w-1/2 text-right px-4 font-mono ${item.main ? 'text-lg text-amber-400 italic' : 'text-print-sm'}`}
                >
                  ${item.v.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMAS DE PAGO */}
        <div className="w-full b-black bg-white mb-1">
          <div className="flex bg-zinc-100 b-b-black text-[9px] text-center h-6 items-center font-black uppercase">
            <div className="w-[20%] b-r-black">Efectivo</div>
            <div className="w-[20%] b-r-black">Cheque</div>
            <div className="w-[20%] b-r-black">Transferencia</div>
            <div className="w-[20%] b-r-black bg-amber-50">Abono Anterior</div>
            <div className="w-[20%] bg-zinc-800 text-white">Total Pagado</div>
          </div>
          <div className="flex text-center h-8 items-center font-mono font-bold text-print-base">
            <div className="w-[20%] b-r-black">$0.00</div>
            <div className="w-[20%] b-r-black">$0.00</div>
            <div className="w-[20%] b-r-black">$0.00</div>
            <div className="w-[20%] b-r-black text-amber-700">
              ${ticket.abonoAnt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="w-[20%] font-black text-lg underline underline-offset-4">
              ${ticket.totalAPagar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* FOOTER COMPACTO */}
        <div className="flex justify-between items-center text-[8px] font-black text-zinc-400 uppercase tracking-widest px-1 italic">
          <span>Aroma de Oro | Fine Cacao & Trading</span>
          <span>Copia Contabilidad - 2026</span>
          <span>Ecuador</span>
        </div>
      </div>
    </Container>
  )
}

export default Compras
