import { BiSolidBusiness } from 'react-icons/bi'
import { FaFilePdf, FaShoppingBasket, FaTruckLoading, FaUsers } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { TbCashRegister } from 'react-icons/tb'

export const ITEMS_DATA = [
  {
    path: '/inicio/cajas',
    label: 'CAJAS',
    icon: TbCashRegister,
  },

  {
    path: '/inicio/productores',
    label: 'PRODUCTORES',
    icon: FaTruckFast,
  },

  {
    path: '/inicio/usuarios',
    label: 'USUARIOS',
    icon: FaUsers,
  },

  {
    path: '/inicio/inventario',
    label: 'INVENTARIO',
    icon: FaBoxesStacked,
  },

  {
    path: '/inicio/kardex',
    label: 'KARDEX',
    icon: FaTruckLoading,
  },

  {
    path: '/inicio/nomina',
    label: 'NÓMINA',
    icon: GrUserWorker,
  },

  {
    path: '/inicio/compras',
    label: 'COMPRAS',
    icon: FaShoppingBasket,
  },

  {
    path: '/inicio/ventas',
    label: 'VENTAS',
    icon: GiCash,
  },

  {
    path: '/inicio/reportes',
    label: 'REPORTES',
    icon: FaFilePdf,
  },

  {
    path: '/inicio/empresa',
    label: 'EMPRESA',
    icon: BiSolidBusiness,
  },

  {
    path: '/inicio/cuentas-por-pagar',
    label: 'POR PAGAR',
    icon: GiPayMoney,
  },

  {
    path: '/inicio/cuentas-por-cobrar',
    label: 'POR COBRAR',
    icon: GiReceiveMoney,
  },

  {
    path: '/inicio/configuracion',
    label: 'CONFIGURACIÓN',
    icon: GiGears,
  },
]
