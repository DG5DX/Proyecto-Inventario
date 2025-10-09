// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
// Importa tus futuras vistas
import Login from '../views/Auth/Login.vue'; 
import Register from '../views/Auth/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import ItemList from '../views/ItemList.vue';
import AdminPanel from '../views/AdminPanel.vue';

// Función para verificar si hay un token de usuario (simulación de auth)
const isAuthenticated = () => {
    // En un proyecto real:
    // return localStorage.getItem('token') !== null;
    return true; // Temporalmente para desarrollo
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    // Rutas protegidas
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }, // Etiqueta esta ruta como protegida
    },
    {
      path: '/items',
      name: 'items',
      component: ItemList,
      meta: { requiresAuth: true },
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminPanel,
        meta: { requiresAuth: true, requiresAdmin: true }, // Requiere ser admin
      },
  ],
});

// Guardia de navegación global (middleware de frontend)
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        // Si la ruta requiere autenticación y el usuario NO está logueado, redirige a login
        next('/');
    } else {
        // Si no hay restricciones o el usuario está logueado, continúa
        next();
    }
});

export default router;