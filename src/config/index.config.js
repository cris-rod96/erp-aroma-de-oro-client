let mode = import.meta.env.MODE
const server =
  mode === 'development'
    ? import.meta.env.VITE_BACKEND_URL_DEV
    : import.meta.env.VITE_BACKEND_URL_PROD

const client =
  mode === 'development'
    ? import.meta.env.VITE_FRONTEND_URL_DEV
    : import.meta.env.VITE_FRONTEND_URL_PROD

export { server, client }
