import { FaFilePdf, FaShoppingBasket, FaTruckLoading, FaUsers } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { MdOutlinePayments, MdPriceCheck, MdOutlineRequestQuote } from 'react-icons/md'
import { TbCashRegister } from 'react-icons/tb'

export const ITEMS_DATA = [
  {
    path: '/inicio/cajas',
    label: 'CAJAS',
    icon: TbCashRegister,
    onlyAdmin: true,
  },

  {
    path: '/inicio/productores',
    label: 'PRODUCTORES',
    icon: FaTruckFast,
    onlyAdmin: true,
  },

  {
    path: '/inicio/usuarios',
    label: 'USUARIOS',
    icon: FaUsers,
    onlyAdmin: true,
  },

  {
    path: '/inicio/inventario',
    label: 'INVENTARIO',
    icon: FaBoxesStacked,
    onlyAdmin: true,
  },

  {
    path: '/inicio/kardex',
    label: 'KARDEX',
    icon: FaTruckLoading,
    onlyAdmin: true,
  },

  {
    path: '/inicio/nomina',
    label: 'NÓMINA',
    icon: GrUserWorker,
    onlyAdmin: true,
  },

  {
    path: '/inicio/anticipos',
    label: 'ANTICIPOS',
    icon: MdPriceCheck,
    onlyAdmin: true,
  },

  {
    path: '/inicio/prestamos',
    label: 'PRÉSTAMOS',
    icon: MdOutlinePayments,
    onlyAdmin: true,
  },

  // --- NUEVA OPCIÓN: GASTOS GENERALES ---
  {
    path: '/inicio/gastos',
    label: 'GASTOS',
    icon: MdOutlineRequestQuote,
    onlyAdmin: true,
  },

  {
    path: '/inicio/compras',
    label: 'COMPRAS',
    icon: FaShoppingBasket,
    onlyAdmin: true,
  },

  {
    path: '/inicio/ventas',
    label: 'VENTAS',
    icon: GiCash,
    onlyAdmin: true,
  },

  {
    path: '/inicio/reportes',
    label: 'REPORTES',
    icon: FaFilePdf,
    // Disponible para contabilidad
  },

  {
    path: '/inicio/cuentas-por-pagar',
    label: 'POR PAGAR',
    icon: GiPayMoney,
    onlyAdmin: true,
  },

  {
    path: '/inicio/cuentas-por-cobrar',
    label: 'POR COBRAR',
    icon: GiReceiveMoney,
    onlyAdmin: true,
  },

  {
    path: '/inicio/configuracion',
    label: 'CONFIGURACIÓN',
    icon: GiGears,
    onlyAdmin: true,
  },
]
