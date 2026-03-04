export const createUserSlice = (set) => ({
  user: {
    name: '',
    email: '',
  },
  addInfo: (newData) =>
    set((state) => ({
      user: {
        ...state.user,
        ...newData,
      },
    })),
})
