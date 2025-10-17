<template>
  <q-page class="q-pa-lg bg-grey-2">
    
    <q-breadcrumbs class="text-secondary q-mb-md">
      <q-breadcrumbs-el 
        label="Zonas" 
        icon="view_module" 
        to="/dashboard" 
        class="cursor-pointer"
      />
      <q-breadcrumbs-el 
        :label="currentZoneName" 
        icon="map"
      />
    </q-breadcrumbs>

    <div class="row items-center q-mb-lg">
        <div class="text-h5 text-weight-bold text-secondary">
            Aulas disponibles en: {{ currentZoneName }}
        </div>
    </div>

    <q-list bordered class="rounded-borders bg-white shadow-1">
      
      <q-item
        v-for="aula in filteredAulas"
        :key="aula.id"
        clickable
        v-ripple
        @click="goToItems(aula.id)"
        class="q-py-md aula-item"
      >
        <q-item-section avatar>
          <q-icon 
            :color="aula.item_count > 0 ? 'primary' : 'grey-5'" 
            name="meeting_room" 
            size="lg" 
          />
        </q-item-section>
        
        <q-item-section>
          <q-item-label class="text-body1 text-weight-medium text-dark">{{ aula.name }}</q-item-label>
          <q-item-label caption class="text-grey-7">
            Responsable: 
            <span class="text-weight-bold">{{ aula.responsible }}</span>
          </q-item-label>
          <q-item-label caption class="text-grey-6">
            {{ aula.item_count }} ítems activos | Último inventario: {{ aula.last_inventory }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn 
            flat 
            round 
            :icon="aula.item_count > 0 ? 'arrow_forward' : 'block'" 
            :color="aula.item_count > 0 ? 'primary' : 'grey-5'"
            size="md"
          >
            <q-tooltip>{{ aula.item_count > 0 ? 'Ver Inventario' : 'No hay ítems' }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      
      <q-item v-if="filteredAulas.length === 0">
        <q-item-section class="text-center q-pa-lg">
          <q-icon name="info" size="xl" color="accent" class="q-mb-md" />
          <div v-if="searchStore.searchQuery" class="text-h6 text-accent">
            No se encontraron aulas en esta zona que coincidan con la búsqueda: "{{ searchStore.searchQuery }}".
          </div>
          <div v-else class="text-h6 text-accent">
            No hay aulas registradas en esta zona actualmente.
          </div>
        </q-item-section>
      </q-item>

    </q-list>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSearchStore } from '../stores/search'; 

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const searchStore = useSearchStore();

const zoneId = route.params.zonaId;

// Función de Simulación: Obtener ítems por Aula
const getItemsCountByAulaId = (aulaId) => {
    // Definición de ítems por Aula (Simulación)
    const itemCounts = {
        'S1': 55, 'S2': 23, 'S3': 87, 'S4': 12, // Zonas con ítems
        'F1': 35, 'F2': 15,
        'V1': 0,
        'V2': 0,
        'R1': 0,
        'C1': 10,
    };
    return itemCounts[aulaId] || 0;
};

// SIMULACIÓN DE DATOS
const zonesDatabase = {
    '1': { 
        name: 'Salud y Laboratorio', 
        aulas: [
            { id: 'S1', name: 'Laboratorio Química Avanzada', responsible: 'Dr. López', last_inventory: '2024-05-10' },
            { id: 'S2', name: 'Aula de Simulación Clínica', responsible: 'Enf. Gómez', last_inventory: '2024-05-12' },
            { id: 'V1', name: 'Aula de Pruebas (VACÍA)', responsible: 'Test User', last_inventory: '2024-10-01' },
        ]
    },
    '2': { 
        name: 'Energías Renovables (FV)', 
        aulas: [
            { id: 'V1', name: 'Taller de Paneles FV', responsible: 'Ing. Martínez', last_inventory: '2024-05-01' },
            { id: 'R1', name: 'Aula Teórica Energía', responsible: 'Ing. Soto', last_inventory: '2024-05-05' },
        ]
    },
    '3': { name: 'Informática y Redes', aulas: [{ id: 'C1', name: 'Sala de Cómputo 1', responsible: 'Prof. Ana', last_inventory: '2024-09-01' }] },
    '7': { name: 'Aula de Prueba', aulas: [{ id: 'R1', name: 'Aula de Refuerzo', responsible: 'No Asignado', last_inventory: '2024-01-01' }] },
};

const currentZoneName = computed(() => {
  return zonesDatabase[zoneId]?.name || `Zona ID: ${zoneId}`;
});

const currentAulas = computed(() => {
    const aulas = zonesDatabase[zoneId]?.aulas || [];
    // Agregamos el item_count real/simulado
    return aulas.map(aula => ({
        ...aula,
        item_count: getItemsCountByAulaId(aula.id)
    }));
});

const filteredAulas = computed(() => {
  const query = searchStore.searchQuery.toLowerCase();
  
  // Filtra por nombre del aula Y por responsable (usa el filtro global)
  return currentAulas.value.filter(aula => 
    !query || aula.name.toLowerCase().includes(query) || 
    aula.responsible.toLowerCase().includes(query)
  );
});

// --- FUNCIÓN DE REDIRECCIÓN CLAVE (Corregida) ---
const goToItems = (aulaId) => {
    const aula = currentAulas.value.find(a => a.id === aulaId);
    
    if (aula && aula.item_count === 0) {
        $q.notify({
            type: 'warning',
            message: `El aula '${aula.name}' no tiene ítems de inventario activos.`,
            caption: 'Intenta con otra aula o verifica el inventario.',
            timeout: 3000
        });
        return; // EVITAR LA REDIRECCIÓN
    }
    
    router.push(`/dashboard/items/${zoneId}/${aulaId}`);
};
</script>

<style scoped>
/* Estilos para darle un toque más limpio a la lista */
.aula-item {
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s ease;
}
.aula-item:hover {
  background-color: #f0f0f0;
}
.rounded-borders {
    border-radius: 8px;
}
</style>