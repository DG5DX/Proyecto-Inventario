<template>
  <q-page class="q-pa-lg bg-grey-2">

    <div class="text-h4 text-weight-bold q-mb-md text-dark">
      Dashboard: Selección de Zona
    </div>
    <q-separator class="q-mb-lg" />

    <div v-if="filteredZones.length === 0" class="text-center q-py-xl">
      <q-icon name="search_off" size="64px" color="accent" class="q-mb-md" />
      <div class="text-h6 text-accent">No se encontraron zonas que coincidan con "{{ searchStore.searchQuery }}".</div>
      <div class="text-subtitle1 text-grey-6">Intenta una búsqueda más general o limpia el campo de búsqueda.</div>
    </div>

    <div class="row q-col-gutter-lg" v-else>

      <div v-for="(zone, index) in filteredZones" :key="zone.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="zone-card cursor-pointer" :class="getCardColorClass(index)" @click="goToZone(zone.id)">
          <q-card-section class="text-white q-pa-lg">
            <div class="row items-center">
              <div class="col-8">
                <div class="text-h3 text-weight-bolder">{{ zone.count }}</div>
                <div class="text-subtitle1 text-weight-medium q-mt-sm">{{ zone.name }}</div>
              </div>
              <div class="col-4 text-right">
                <q-icon :name="zone.icon" size="48px" />
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md text-white q-mt-md" align="right">
            <q-btn flat icon-right="chevron_right" label="Ver Aulas" />
          </q-card-actions>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// Asume que esta ruta es correcta para Pinia
import { useSearchStore } from '../../stores/search';

const router = useRouter();
const searchStore = useSearchStore();

// SIMULACIÓN DE DATOS
const zones = ref([
  { id: 1, name: 'Salud y Laboratorio', icon: 'local_hospital', count: 3 },
  { id: 2, name: 'Energías Renovables (FV)', icon: 'solar_power', count: 2 },
  { id: 3, name: 'Informática y Redes', icon: 'computer', count: 1 },
  { id: 4, name: 'Herramientas y Taller', icon: 'build', count: 0 },
  { id: 5, name: 'Diseño y Multimedia', icon: 'palette', count: 0 },
  { id: 6, name: 'Administración', icon: 'apartment', count: 0 },
  { id: 7, name: 'Aula de Prueba (Vacía)', icon: 'science', count: 0 },
]);

const filteredZones = computed(() => {
  const query = searchStore.searchQuery.toLowerCase();

  if (!query) {
    return zones.value;
  }

  return zones.value.filter(zone =>
    zone.name.toLowerCase().includes(query)
  );
});

const goToZone = (zoneId) => {
  router.push(`/dashboard/aulas/${zoneId}`);
};

// Lógica de colores (simulación)
const cardColors = [
  'primary', 'secondary', 'red-8', 'orange-8', 'deep-purple', 'blue-grey-8',
];

const getCardColorClass = (index) => {
  const color = cardColors[index % cardColors.length];
  return `bg-${color} text-white`;
};
</script>

<style scoped>
.zone-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.zone-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}
</style>