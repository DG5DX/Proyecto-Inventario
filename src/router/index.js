// src/router/index.js (Solo la estructura principal)

import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Auth/Login.vue'; 
import Register from '../views/Auth/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import PasswordRecover from '../views/Auth/PasswordRecover.vue';

// Función de chequeo de autenticación simulada (temporal)
const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rutas de autenticación: ahora van directo al componente
    { path: '/', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/passwordrecover', name: 'recover', component: PasswordRecover},
    
    // Rutas protegidas
    { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
    
  ],
});

// Guardia de navegación para rutas protegidas
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next('/');
    } else {
        next();
    }
});

export default router;