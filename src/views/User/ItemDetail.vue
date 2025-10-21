<template>
  <q-page class="q-pa-lg bg-grey-2">

    <q-breadcrumbs class="text-secondary q-mb-md">
      <q-breadcrumbs-el label="Zonas" icon="view_module" to="/dashboard" class="cursor-pointer" />
      <q-breadcrumbs-el :label="currentAulaName" icon="meeting_room"
        :to="`/dashboard/items/${item.zoneId}/${item.aulaId}`" class="cursor-pointer" />
      <q-breadcrumbs-el :label="item.name" icon="inventory_2" />
    </q-breadcrumbs>

    <div class="text-h4 text-weight-bold text-dark q-mb-lg">
      Detalle del Ítem: {{ item.name }}
    </div>

    <div class="row q-col-gutter-lg">

      <div class="col-12 col-md-7">
        <q-card class="shadow-2 q-mb-lg item-details-card">

          <q-img :src="item.imageUrl || 'https://cdn.quasar.dev/img/material.png'" height="350px" fit="cover"
            spinner-color="primary" />

          <q-card-section>
            <div class="text-h6 text-secondary q-mb-sm">Especificaciones Técnicas</div>
            <q-list separator class="q-mt-sm">
              <q-item>
                <q-item-section side><q-icon name="tag" color="grey-6" size="xs" /></q-item-section>
                <q-item-section><q-item-label caption>Código</q-item-label>{{ item.id }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side><q-icon name="category" color="grey-6" size="xs" /></q-item-section>
                <q-item-section><q-item-label caption>Categoría</q-item-label>{{ item.category }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side><q-icon name="place" color="grey-6" size="xs" /></q-item-section>
                <q-item-section><q-item-label caption>Ubicación</q-item-label>{{ item.zoneName }} / {{ item.aulaName
                  }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side><q-icon name="info" color="grey-6" size="xs" /></q-item-section>
                <q-item-section><q-item-label caption>Requiere Capacitación</q-item-label>
                  <q-badge :color="item.needsTraining ? 'negative' : 'positive'" outline>
                    {{ item.needsTraining ? 'SÍ' : 'NO' }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-section>
            <div class="text-h6 text-secondary q-mb-sm">Descripción</div>
            <p class="text-grey-8">{{ item.description }}</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="shadow-2 q-pa-md sticky-card">

          <div class="text-h5 text-weight-bold q-mb-sm text-dark">
            Estado y Solicitud
          </div>
          <q-card-section class="q-pa-md rounded-borders text-white q-mb-lg availability-status"
            :class="item.available > 0 ? 'bg-positive' : 'bg-negative'">
            <div class="row items-center">
              <q-icon :name="item.available > 0 ? 'check_circle' : 'cancel'" size="lg" class="q-mr-md" />
              <div>
                <div class="text-h6 text-weight-bold">
                  {{ item.available > 0 ? 'DISPONIBLE PARA PRÉSTAMO' : 'AGOTADO' }}
                </div>
                <div class="text-subtitle1 q-mt-xs">
                  Unidades disponibles: <span class="text-weight-bolder">{{ item.available }} / {{ item.total }}</span>
                </div>
              </div>
            </div>
          </q-card-section>

          <div class="text-h6 text-secondary q-mb-md">
            Solicitar Préstamo
          </div>

          <q-form @submit="submitRequest" class="q-gutter-md">

            <q-input v-if="item.available > 0" outlined v-model.number="request.quantity" type="number"
              label="Cantidad a solicitar" color="primary" :rules="[
                val => !!val || 'La cantidad es requerida',
                val => val > 0 || 'Debe solicitar al menos 1 unidad',
                val => val <= item.available || `Máximo disponible: ${item.available}`,
                // 💡 VALIDACIÓN DE CANTIDAD ENTERA (sin decimales)
                val => Number.isInteger(Number(val)) || 'Solo cantidades enteras (sin puntos decimales)'
              ]" />

            <q-input outlined v-model="request.returnDate" type="date" label="Fecha de Devolución (Estimada)"
              stack-label color="primary" :rules="[
                val => !!val || 'Campo requerido',
                // 💡 VALIDACIÓN DE FECHA FUTURA/HOY
                val => !val || isDateValid(val) || 'La fecha no puede ser anterior al día de hoy.'
              ]">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer" />
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="request.returnDate" :options="date => date >= todayDateString" />
                </q-popup-proxy>
              </template>
            </q-input>

            <q-input outlined v-model="request.reason" type="textarea" label="Motivo o actividad donde lo usará"
              rows="3" color="primary"
              :rules="[val => val && val.length > 10 || 'Especifique el motivo (mín. 10 caracteres)']" />

            <q-btn type="submit" label="Enviar Solicitud" color="primary" icon="send" class="full-width q-mt-md"
              :disable="item.available <= 0 || loading" :loading="loading" />

            <div v-if="item.available <= 0" class="text-negative text-center q-mt-sm text-weight-bold">
              No puede solicitar este ítem.
            </div>

          </q-form>

        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar, date } from 'quasar'; // 💡 Importar 'date'

const route = useRoute();
const $q = useQuasar();

const itemId = route.params.itemId;
const loading = ref(false);
const item = ref({});

// 💡 Fecha de hoy en formato YYYY/MM/DD para comparación
const todayDateString = date.formatDate(Date.now(), 'YYYY/MM/DD');

// --- SIMULACIÓN AVANZADA DE BASE DE DATOS DE ÍTEMS (Mantenido) ---
const MOCK_ITEMS_DB = [
  {
    id: 'I-001', name: 'Microscopio Biológico', category: 'Óptica', total: 5, available: 3,
    imageUrl: 'https://cdn.quasar.dev/img/parallax2.jpg', needsTraining: true,
    description: 'Microscopio de laboratorio de alta resolución...',
    zoneId: '1', zoneName: 'Salud y Laboratorio', aulaId: 'S1', aulaName: 'Lab Química',
  },
  {
    id: 'I-002', name: 'Balanza de Precisión', category: 'Medición', total: 10, available: 0,
    imageUrl: 'https://picsum.photos/id/11/500/300', needsTraining: false,
    description: 'Balanza digital con precisión de 0.001g, ideal para mediciones sensibles...',
    zoneId: '1', zoneName: 'Salud y Laboratorio', aulaId: 'S2', aulaName: 'Simulación Clínica',
  },
  {
    id: 'I-003', name: 'Kit de disección Avanzada', category: 'Multimedia', total: 2, available: 1,
    imageUrl: 'https://picsum.photos/id/12/500/300', needsTraining: false,
    description: 'Proyector de alta luminosidad y resolución 4K...',
    zoneId: '3', zoneName: 'Informática y Redes', aulaId: 'C1', aulaName: 'Sala de Cómputo 1',
  },
];

onMounted(() => {
  const foundItem = MOCK_ITEMS_DB.find(i => i.id === itemId);

  if (foundItem) {
    item.value = foundItem;
  } else {
    item.value = { id: itemId, name: 'Ítem No Encontrado', total: 0, available: 0, zoneId: '0', aulaId: '0', zoneName: 'N/A', aulaName: 'N/A', description: 'N/A' };
    $q.notify({ type: 'negative', message: 'Ítem no encontrado.' });
  }
});

const request = ref({
  itemId: itemId,
  quantity: 1,
  // 💡 Inicializar la fecha con la fecha actual para que la validación funcione bien
  returnDate: new Date().toISOString().slice(0, 10),
  reason: '',
});

// 💡 FUNCIÓN DE VALIDACIÓN DE FECHA
const isDateValid = (selectedDate) => {
  // Si la fecha seleccionada no existe (val = null), la validación inicial ya fallará.
  if (!selectedDate) return false;

  // Calcula la diferencia en días. Debe ser 0 (hoy) o positivo (futuro).
  const diff = date.getDateDiff(selectedDate, todayDateString, 'days');
  return diff >= 0;
};

const currentZoneName = computed(() => item.value.zoneName);
const currentAulaName = computed(() => item.value.aulaName);

const submitRequest = async () => {
  if (item.value.available <= 0) {
    $q.notify({ type: 'negative', message: 'No es posible solicitar, el ítem está agotado.' });
    return;
  }

  loading.value = true;
  await new Promise(resolve => setTimeout(resolve, 2000));
  loading.value = false;

  $q.notify({
    type: 'positive',
    message: `Solicitud de ${request.value.quantity} unidad(es) enviada con éxito.`,
    caption: `Se solicitará el ítem ${item.value.name}.`,
    timeout: 5000
  });

  request.value.quantity = 1;
  request.value.reason = '';
};
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

.availability-status {
  border-radius: 6px;
}

@media (min-width: 992px) {
  .sticky-card {
    position: sticky;
    top: 85px;
  }
}
</style>