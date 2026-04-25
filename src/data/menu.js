import { TbBellFilled, TbLayoutDashboardFilled, TbCashRegister } from 'react-icons/tb'
import { FaFilePdf, FaShoppingBasket, FaTruckLoading, FaUsers, FaHandshake } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { HiOutlineTicket } from 'react-icons/hi'
import { MdPriceCheck, MdOutlinePayments, MdOutlineRequestQuote } from 'react-icons/md'

export const MENU_DATA = [
  {
    path: '/inicio',
    label: 'Panel principal',
    icon: TbLayoutDashboardFilled,
  },

  // --- GRUPO 1: OPERACIONES CORE (COMPRA Y VENTA) ---
  {
    path: '/inicio/compras',
    label: 'Compras',
    icon: FaShoppingBasket,
    onlyAdmin: true,
  },
  {
    path: '/inicio/ventas',
    label: 'Ventas',
    icon: GiCash,
    onlyAdmin: true,
  },
  {
    path: '/inicio/productores',
    label: 'Productores',
    icon: FaTruckFast,
    onlyAdmin: true,
  },
  {
    path: '/inicio/compradores',
    label: 'Compradores',
    icon: FaHandshake, // Icono diferenciado para trato comercial
    onlyAdmin: true,
  },

  // --- GRUPO 2: FINANZAS Y CAJA ---
  {
    path: '/inicio/cajas',
    label: 'Cajas',
    icon: TbCashRegister,
    onlyAdmin: true,
  },
  {
    path: '/inicio/gastos',
    label: 'Gastos',
    icon: MdOutlineRequestQuote,
    onlyAdmin: true,
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

  // --- GRUPO 3: NÓMINA Y CRÉDITOS A EMPLEADOS ---
  {
    path: '/inicio/nomina',
    label: 'Nómina',
    icon: GrUserWorker,
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

  // --- GRUPO 4: LOGÍSTICA E INVENTARIO ---
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

  // --- GRUPO 5: CONTROL Y SISTEMA ---
  {
    path: '/inicio/reportes',
    label: 'Reportes',
    icon: FaFilePdf,
  },
  {
    path: '/inicio/usuarios',
    label: 'Usuarios',
    icon: FaUsers,
    onlyAdmin: true,
  },
  {
    path: '/inicio/configuracion',
    label: 'Configuración',
    icon: GiGears,
    onlyAdmin: true,
  },
]
