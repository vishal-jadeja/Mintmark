import axios from "axios"

const api = axios.create({
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // needed for admin cookie auth; harmless for public routes
})

export default api
