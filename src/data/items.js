import { BiSolidBusiness } from 'react-icons/bi'
import { FaFilePdf, FaShoppingBasket, FaTruckLoading, FaUsers } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { TbCashRegister } from 'react-icons/tb'

export const ITEMS_DATA = [
  {
    path: '/',
    label: 'CAJAS',
    icon: TbCashRegister,
  },

  {
    path: '/',
    label: 'PRODUCTORES',
    icon: FaTruckFast,
  },

  {
    path: '/',
    label: 'USUARIOS',
    icon: FaUsers,
  },

  {
    path: '/',
    label: 'INVENTARIO',
    icon: FaBoxesStacked,
  },

  {
    path: '/',
    label: 'KARDEX',
    icon: FaTruckLoading,
  },

  {
    path: '/',
    label: 'NÓMINA',
    icon: GrUserWorker,
  },

  {
    path: '/',
    label: 'COMPRAS',
    icon: FaShoppingBasket,
  },

  {
    path: '/',
    label: 'VENTAS',
    icon: GiCash,
  },

  {
    path: '/',
    label: 'REPORTES',
    icon: FaFilePdf,
  },

  {
    path: '/',
    label: 'EMPRESA',
    icon: BiSolidBusiness,
  },

  {
    path: '/',
    label: 'POR PAGAR',
    icon: GiPayMoney,
  },

  {
    path: '/',
    label: 'POR COBRAR',
    icon: GiReceiveMoney,
  },

  {
    path: '/',
    label: 'CONFIGURACIÓN',
    icon: GiGears,
  },
]
