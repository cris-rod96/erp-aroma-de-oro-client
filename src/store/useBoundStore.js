import { create } from 'zustand'
import { createUserSlice } from './slices/userSlice'

export const useBoundStore = create((...a) => ({
  ...createUserSlice(...a),
}))
