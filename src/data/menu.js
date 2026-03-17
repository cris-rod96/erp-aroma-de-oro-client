import { TbBellFilled, TbLayoutDashboardFilled } from 'react-icons/tb'
import { FaFilePdf, FaShoppingBasket, FaTruckLoading, FaUsers } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { TbCashRegister } from 'react-icons/tb'
import { HiOutlineTicket } from 'react-icons/hi'

export const MENU_DATA = [
  {
    path: '/inicio',
    label: 'Panel principal',
    icon: TbLayoutDashboardFilled,
    // Se deja disponible para ambos para que tengan un dashboard inicial
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

  {
    path: '/inicio/tickets',
    label: 'Tickets',
    icon: HiOutlineTicket,
    onlyAdmin: true,
  },

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
    path: '/inicio/reportes',
    label: 'Reportes',
    icon: FaFilePdf,
    // Única opción habilitada para Contabilidad junto al Panel Principal
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

  {
    path: '/inicio/alertas',
    label: 'Estilo de Alertas',
    icon: TbBellFilled,
    onlyAdmin: true,
  },
]
