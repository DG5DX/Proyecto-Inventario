import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; 

import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'; 

import { Quasar, Notify, Loading } from 'quasar';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedState); 

app.use(pinia);

app.use(router); 

app.use(Quasar, {
plugins: {
Notify,
Loading,
}, 
});

app.mount('#app');