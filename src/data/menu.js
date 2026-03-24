import { TbBellFilled, TbLayoutDashboardFilled } from 'react-icons/tb'
import { FaFilePdf, FaShoppingBasket, FaTruckLoading, FaUsers } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { TbCashRegister } from 'react-icons/tb'
import { HiOutlineTicket } from 'react-icons/hi'
import { MdPriceCheck, MdOutlinePayments, MdOutlineRequestQuote } from 'react-icons/md' // Importado MdOutlineRequestQuote

export const MENU_DATA = [
  {
    path: '/inicio',
    label: 'Panel principal',
    icon: TbLayoutDashboardFilled,
  },

  {
    path: '/inicio/cajas',
    label: 'Cajas',
    icon: TbCashRegister,
    onlyAdmin: true,
  },

  {
    path: '/inicio/productores',
    label: 'Productores',
    icon: FaTruckFast,
    onlyAdmin: true,
  },

  {
    path: '/inicio/usuarios',
    label: 'Usuarios',
    icon: FaUsers,
    onlyAdmin: true,
  },

  {
    path: '/inicio/inventario',
    label: 'Inventario',
    icon: FaBoxesStacked,
    onlyAdmin: true,
  },

  {
    path: '/inicio/kardex',
    label: 'Kardex',
    icon: FaTruckLoading,
    onlyAdmin: true,
  },

  {
    path: '/inicio/nomina',
    label: 'Nómina',
    icon: GrUserWorker,
    onlyAdmin: true,
  },

  // {
  //   path: '/inicio/tickets',
  //   label: 'Tickets',
  //   icon: HiOutlineTicket,
  //   onlyAdmin: true,
  // },

  {
    path: '/inicio/compras',
    label: 'Compras',
    icon: FaShoppingBasket,
    onlyAdmin: true,
  },

  {
    path: '/inicio/anticipos',
    label: 'Anticipos',
    icon: MdPriceCheck,
    onlyAdmin: true,
  },

  {
    path: '/inicio/prestamos',
    label: 'Préstamos',
    icon: MdOutlinePayments,
    onlyAdmin: true,
  },

  // --- AGREGADO: GASTOS ---
  {
    path: '/inicio/gastos',
    label: 'Gastos',
    icon: MdOutlineRequestQuote,
    onlyAdmin: true,
  },

  {
    path: '/inicio/ventas',
    label: 'Ventas',
    icon: GiCash,
    onlyAdmin: true,
  },

  {
    path: '/inicio/reportes',
    label: 'Reportes',
    icon: FaFilePdf,
  },

  {
    path: '/inicio/cuentas-por-pagar',
    label: 'Cuentas por pagar',
    icon: GiPayMoney,
    onlyAdmin: true,
  },

  {
    path: '/inicio/cuentas-por-cobrar',
    label: 'Cuentas por cobrar',
    icon: GiReceiveMoney,
    onlyAdmin: true,
  },

  {
    path: '/inicio/configuracion',
    label: 'Configuración',
    icon: GiGears,
    onlyAdmin: true,
  },
]
