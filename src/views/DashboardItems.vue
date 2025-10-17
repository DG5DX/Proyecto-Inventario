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
        :to="`/dashboard/aulas/${zoneId}`"
        class="cursor-pointer"
      />
      <q-breadcrumbs-el 
        :label="currentAulaName" 
        icon="meeting_room"
      />
    </q-breadcrumbs>

    <div class="row items-center q-mb-lg">
        <div class="text-h5 text-weight-bold text-secondary">
            Inventario en: {{ currentAulaName }}
        </div>
        <q-space />
        
        <q-select
            dense
            outlined
            v-model="categoryFilter"
            :options="availableCategories"
            label="Filtrar por Categoría"
            clearable
            class="bg-white q-mt-sm"
            style="width: 200px;"
            color="primary"
        />
    </div>

    <div v-if="filteredItems.length === 0" class="text-center q-py-xl">
        <q-icon name="search_off" size="64px" color="accent" class="q-mb-md" />
        <div class="text-h6 text-accent">
            No se encontraron ítems que coincidan con los filtros o la búsqueda.
        </div>
        <div class="text-subtitle1 text-grey-6">
            Intenta limpiando el filtro de categoría o modificando la búsqueda global.
        </div>
    </div>
    
    <div class="row q-col-gutter-lg" v-else>
      
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card 
          class="item-card cursor-pointer"
          @click="goToItemDetail(item.id)"
        >
          <q-img 
            :src="item.imageUrl || 'https://cdn.quasar.dev/img/material.png'"
            height="180px"
            fit="cover"
          >
            <q-badge 
                :color="item.available > 0 ? 'positive' : 'negative'" 
                floating 
                class="q-px-sm q-py-xs text-caption text-weight-bold"
            >
                {{ item.available > 0 ? 'DISPONIBLE' : 'AGOTADO' }} ({{ item.available }})
            </q-badge>
          </q-img>

          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-dark ellipsis">{{ item.name }}</div>
            <div class="text-caption text-grey-7">{{ item.category }}</div>
            <div class="text-caption text-grey-6 q-mt-sm">
                Código: {{ item.id }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn 
                flat 
                icon-right="info" 
                label="Ver Detalle" 
                color="primary"
            />
          </q-card-actions>
        </q-card>
      </div>
      
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearchStore } from '../stores/search'; 

const route = useRoute();
const router = useRouter();
const searchStore = useSearchStore(); 

const zoneId = route.params.zonaId;
const aulaId = route.params.aulaId;
const categoryFilter = ref(null);

// --- SIMULACIÓN DE DATOS DE ÍTEMS ---
const currentZoneName = ref('Zona Simulada');
const currentAulaName = ref('Aula Simulada');

const itemsDatabase = ref([
    { id: 'I-001', name: 'Microscopio Biológico Profesional', category: 'Óptica', total: 5, available: 3, imageUrl: 'https://cdn.quasar.dev/img/parallax2.jpg' },
    { id: 'I-002', name: 'Balanza de Precisión Electrónica', category: 'Medición', total: 10, available: 0, imageUrl: 'https://cdn.quasar.dev/img/parallax1.jpg' },
    { id: 'I-003', name: 'Kit de Disección Avanzada', category: 'Herramientas', total: 2, available: 1, imageUrl: '' },
]);

const availableCategories = computed(() => {
    const categories = itemsDatabase.value.map(item => item.category);
    return [...new Set(categories)];
});

// Lógica de Filtrado Global y Local
const filteredItems = computed(() => {
  const globalQuery = searchStore.searchQuery.toLowerCase();
  
  return itemsDatabase.value.filter(item => {
    const passesCategoryFilter = !categoryFilter.value || item.category === categoryFilter.value;
    
    const passesGlobalSearch = !globalQuery || 
                               item.name.toLowerCase().includes(globalQuery) ||
                               item.id.toLowerCase().includes(globalQuery);

    return passesCategoryFilter && passesGlobalSearch;
  });
});

const goToItemDetail = (itemId) => {
  // Redirige al dashboard de detalle: /dashboard/item/:itemId
  router.push(`/dashboard/item/${itemId}`);
};
</script>

<style scoped>
.item-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}
.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>