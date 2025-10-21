<template>
  <q-layout view="lHh LpR fFf">

    <q-header elevated class="bg-secondary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" aria-label="Toggle Menu" />

        <q-toolbar-title>
          <q-icon name="inventory" class="q-mr-sm" />
          Inventario
        </q-toolbar-title>

        <q-input v-model="searchStore.searchQuery" dark dense standout="bg-dark text-white"
          placeholder="Buscar ítems, zonas o aulas..." input-class="text-white" class="q-ml-md" style="width: 350px;">
          <template v-slot:prepend>
            <q-icon name="search" color="white" />
          </template>
          <template v-slot:append v-if="searchStore.searchQuery">
            <q-icon name="clear" class="cursor-pointer" @click="searchStore.clearSearch()" />
          </template>
        </q-input>

        <div class="q-ml-md row items-center gt-sm">
          <q-icon :name="isAdmin ? 'admin_panel_settings' : 'account_circle'" size="24px"
            :color="isAdmin ? 'primary' : 'white'" />
          <span :class="{ 'text-primary': isAdmin, 'text-white': !isAdmin }"
            class="q-ml-xs text-weight-bold text-caption">
            {{ isAdmin ? 'ADMIN' : 'USUARIO' }}
          </span>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered :width="260" class="bg-dark">

      <div class="q-pa-md text-center text-white" style="background-color: #35464eff;">
        <q-avatar size="60px" color="primary" text-color="dark" icon="person" class="q-mb-sm" />

        <div class="text-weight-bold text-white q-mt-sm ellipsis">
          {{ userData.name }}
        </div>
        <div class="text-caption text-grey-4 ellipsis">
          {{ userData.email }}
        </div>
        <q-separator dark class="q-mt-sm" />

      </div>

      <q-list dark>

        <template v-if="!isAdmin">
          <q-item-label header class="text-primary text-weight-bold">USUARIO</q-item-label>
          <q-item clickable v-ripple exact to="/dashboard">
            <q-item-section avatar><q-icon name="view_module" color="primary" /></q-item-section>
            <q-item-section>Catálogo por Zonas</q-item-section>
          </q-item>
          <q-item clickable v-ripple exact to="/prestamos">
            <q-item-section avatar><q-icon name="assignment" color="primary" /></q-item-section>
            <q-item-section>Mis Préstamos</q-item-section>
          </q-item>
        </template>

        <template v-else>
          <q-item-label header class="text-primary text-weight-bold">ADMINISTRACIÓN</q-item-label>
          <q-item clickable v-ripple exact to="/adminsolicitudes">
            <q-item-section avatar><q-icon name="notifications" color="primary" /></q-item-section>
            <q-item-section>Solicitudes Pendientes</q-item-section>
          </q-item>
          <q-item clickable v-ripple exact to="/adminprestamos">
            <q-item-section avatar><q-icon name="swap_horiz" color="primary" /></q-item-section>
            <q-item-section>Préstamos Activos</q-item-section>
          </q-item>
          <q-item clickable v-ripple exact to="/admingestion">
            <q-item-section avatar><q-icon name="inventory_2" color="primary" /></q-item-section>
            <q-item-section>Gestión</q-item-section>
          </q-item>
        </template>
        <q-separator dark class="q-mt-sm" />
        <q-btn label="Cerrar Sesión" icon="logout" flat dense class="q-mt-md full-width" color="red"
          @click="handleLogout" />
      </q-list>

    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSearchStore } from '../stores/search'; // Importar Pinia Store

const router = useRouter();
const searchStore = useSearchStore(); // Inicializar Pinia Store
const leftDrawerOpen = ref(false);

// --- Lógica Simulación de Rol y Datos de Usuario ---
const userData = ref({
  name: 'Usuario Común',
  email: 'Usuario@soy.sena.edu',
  role: 'admin' // Cambiar a 'admin' o 'usuario' para probar la vista de administrador o usuario
});

const isAdmin = computed(() => userData.value.role === 'admin');

// --- Funciones del Layout ---

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleLogout() {
  searchStore.clearSearch(); // Limpiar la búsqueda al cerrar sesión
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  userData.value.role = 'comun';
  router.push('/');
  console.log('Sesión cerrada. Redirigiendo a Login.');
}
</script>

<style scoped>
.q-page-container {
  background-color: #f5f5f5;
}

.bg-dark {
  background-color: #35464eff !important;
}

.bg-secondary {
  background-color: #004d40 !important;
}
</style>