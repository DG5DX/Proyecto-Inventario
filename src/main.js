// src/main.js (Modificado)

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // ¡Importa el router!

const app = createApp(App)

app.use(router) // Usa el router en la app

app.mount('#app')