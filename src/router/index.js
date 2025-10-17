// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Auth/Login.vue'; 
import Register from '../views/Auth/Register.vue';
import PasswordRecover from '../views/Auth/PasswordRecover.vue';

// Componentes del Layout y Vistas
import MainLayout from '../views/MainLayout.vue';
import DashboardZonas from '../views/DashboardZonas.vue';
import DashboardAulas from '../views/DashboardAulas.vue';
import DashboardItems from '../views/DashboardItems.vue';
import AdminPanel from '../views/AdminPanel.vue'
import ItemDetail from '../views/ItemDetail.vue';

// Función de chequeo de autenticación simulada (temporal)
const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        
        // --- 1. Rutas de Autenticación (No necesitan MainLayout) ---
        { path: '/', name: 'login', component: Login },
        { path: '/register', name: 'register', component: Register },
        { path: '/passwordrecover', name: 'recover', component: PasswordRecover},
        
        // --- 2. Ruta Contenedora con MainLayout (Rutas Protegidas) ---
        {
            path: '/', // Usa la raíz para envolver las rutas de la aplicación
            component: MainLayout, // El layout principal con QHeader y QDrawer
            children: [
                // Ruta protegida existente (DashboardZonas)
                { 
                    // El path será /dashboard, ya que se une con el path padre '/'
                    path: 'dashboard', 
                    name: 'dashboard', 
                    component: DashboardZonas, // Usando el nombre correcto según tu estructura
                    meta: { requiresAuth: true } 
                },
                
                // Nuevas rutas basadas en tu estructura de archivos y flujo de negocio:

                // Catálogo: Aulas dentro de una Zona
                { 
                    path: 'dashboard/aulas/:zonaId', 
                    name: 'dashboard-aulas', 
                    component: DashboardAulas, 
                    meta: { requiresAuth: true } 
                },
                
                // Catálogo: Ítems dentro de un Aula
                { 
                    path: 'dashboard/items/:zonaId/:aulaId', 
                    name: 'dashboard-items', 
                    component: DashboardItems, 
                    meta: { requiresAuth: true } 
                },

                // Detalle del item
                {
                    path: 'dashboard/item/:itemId',
                    name: 'item-detail',
                    component: ItemDetail,
                    meta: {requiresauth: true }
                },

                // Panel de Administrador (Vista de Admin)
                { 
                    path: 'admin', 
                    name: 'admin-panel', 
                    component: AdminPanel, 
                    meta: { requiresAuth: true, requiresAdmin: true } // Asumimos que esta es solo para Admin
                },
            ]
        },
        
        // Nota: Si usaste `import Dashboard from '../views/DashboardZonas.vue';` en la parte superior, 
        // puedes mantener ese alias, pero en el children usé el nombre real del componente para mayor claridad.
    ],
});

// Guardia de navegación para rutas protegidas (se mantiene igual)
router.beforeEach((to, from, next) => {
    // 1. Chequeo de Autenticación
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next('/');
    } 
    // 2. Chequeo de Rol de Administrador (Opcional, pero recomendado)
    // else if (to.meta.requiresAdmin && getRole() !== 'admin') {
    //     next('/dashboard'); // Redirige a una página común si no es admin
    // } 
    else {
        next();
    }
});

export default router;