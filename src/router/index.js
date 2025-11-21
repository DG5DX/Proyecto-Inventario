// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Auth/Login.vue'; 
import Register from '../views/Auth/Register.vue';
import PasswordRecover from '../views/Auth/PasswordRecover.vue';

// Componentes del Layout y Vistas
import MainLayout from '../views/MainLayout.vue';
import DashboardZonas from '../views/User/DashboardZonas.vue';
import DashboardAulas from '../views/User/DashboardAulas.vue';
import DashboardItems from '../views/User/DashboardItems.vue';
import DashboardPrestamos from '../views/User/DashboardPrestamos.vue';
import AdminSolicitudes from '../views/Admin/AdminSolicitudes.vue';
import AdminPrestamos from '../views/Admin/AdminPrestamos.vue';
import AdminZonas from '../views/Admin/GestionZonas.vue';
import AdminAulas from '../views/Admin/GestionAulas.vue';
import AdminItems from '../views/Admin/GestionItems.vue';
import ItemDetail from '../views/User/ItemDetail.vue';

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
                    component: DashboardZonas,
                    meta: { requiresAuth: true } 
                },

                {
                    path: '/prestamos',
                    name: 'dashboard-prestamos',
                    component: DashboardPrestamos,
                    meta: { requiresAuth: true }    
                },
                

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
                    path: 'adminsolicitudes', 
                    name: 'admin-solicitudes', 
                    component: AdminSolicitudes, 
                    meta: { requiresAuth: true, requiresAdmin: true } // Asumimos que esta es solo para Admin
                },
                { 
                    path: 'adminprestamos', 
                    name: 'admin-prestamos', 
                    component: AdminPrestamos, 
                    meta: { requiresAuth: true, requiresAdmin: true } // Asumimos que esta es solo para Admin
                },
                // Panel de gestion
                { 
                    path: 'admingestion', 
                    name: 'admin-gestion', 
                    component: AdminZonas, 
                    meta: { requiresAuth: true, requiresAdmin: true } // Asumimos que esta es solo para Admin
                },
                { 
                    path: 'admingestion/aulas/:zoneId', 
                    name: 'admin-aulas', 
                    component: AdminAulas, 
                    meta: { requiresAuth: true, requiresAdmin: true } // Asumimos que esta es solo para Admin
                },
                { 
                    path: 'admingestion/items/:zoneId/:classroomId', 
                    name: 'admin-items', 
                    component: AdminItems, 
                    meta: { requiresAuth: true, requiresAdmin: true } 
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