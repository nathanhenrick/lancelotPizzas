import Vue3Toastify, { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    autoClose: 3500,
    position: 'top-right',
    theme: 'colored',
    limit: 3
  })

  return {
    provide: {
      toast: {
        success: (msg: string) => toast.success(msg),
        error: (msg: string) => toast.error(msg),
        info: (msg: string) => toast.info(msg),
        warning: (msg: string) => toast.warning(msg)
      }
    }
  }
})
