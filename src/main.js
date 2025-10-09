import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; 

// --- Importaciones de Quasar ---
import { Quasar, Notify, Loading } from 'quasar';

// 1. Importa la definición de iconos (¡Esta es la ruta correcta!)
import '@quasar/extras/material-icons/material-icons.css';
 

// 2. Importa el Quasar CSS/SASS básico. 
// Esto carga el framework y el archivo 'quasar-variables.sass'
import 'quasar/src/css/index.sass';
// -----------------------------

const app = createApp(App);

app.use(router); 

app.use(Quasar, {
  plugins: {
    Notify,
    Loading,
  }, 
});

app.mount('#app');