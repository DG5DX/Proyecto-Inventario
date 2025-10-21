<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-icon name="notifications" size="md" color="orange-8" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold">Solicitudes de Préstamo Pendientes</div>
      <q-space />
      <q-btn color="orange-8" icon="refresh" label="Actualizar" flat dense @click="loadRequests" />
    </div>

    <q-card flat bordered class="q-mt-sm">
      <q-card-section>
        <q-table title="Préstamos por Aprobar" :rows="pendingRequests" :columns="columns" row-key="id" :filter="filter"
          :loading="loading" no-data-label="¡Felicidades! No hay solicitudes pendientes.">
          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar por solicitante o ítem">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn icon="thumb_up" label="Aprobar" color="green-8" size="sm" flat dense
                @click="approveRequest(props.row)" />
              <q-btn icon="thumb_down" label="Rechazar" color="red-8" size="sm" flat dense class="q-ml-sm"
                @click="rejectRequest(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const columns = [
  { name: 'id', required: true, label: 'ID Solicitud', align: 'left', field: row => row.id, sortable: true },
  { name: 'item', align: 'left', label: 'Ítem Solicitado', field: 'item', sortable: true },
  { name: 'solicitante', align: 'left', label: 'Solicitante', field: 'solicitante', sortable: true },
  { name: 'fecha_inicio', align: 'center', label: 'F. Inicio', field: 'fecha_inicio', sortable: true },
  { name: 'fecha_fin', align: 'center', label: 'F. Fin', field: 'fecha_fin', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
];

const filter = ref('');
const loading = ref(false);

const pendingRequests = ref([
  { id: 201, item: 'Microscopio Digital', solicitante: 'Laura Núñez', fecha_inicio: '2025-10-20 09:00', fecha_fin: '2025-10-20 11:00' },
  { id: 202, item: 'Kit de Robótica V3', solicitante: 'Roberto Gómez', fecha_inicio: '2025-10-25 15:00', fecha_fin: '2025-10-25 17:00' },
]);

function loadRequests() {
  loading.value = true;
  // Simulación de carga
  setTimeout(() => {
    $q.notify({ type: 'info', message: 'Solicitudes actualizadas.', position: 'top' });
    loading.value = false;
  }, 500);
}

function approveRequest(request) {
  $q.notify({
    type: 'positive',
    message: `Solicitud ID ${request.id} de ${request.solicitante} APROBADA.`,
    position: 'top'
  });
  // Lógica para mover la solicitud a Préstamos Activos
  pendingRequests.value = pendingRequests.value.filter(req => req.id !== request.id);
}

function rejectRequest(request) {
  $q.dialog({
    title: 'Confirmar Rechazo',
    message: `¿Deseas rechazar la solicitud ID ${request.id}?`,
    cancel: true,
    persistent: true,
    color: 'red-8'
  }).onOk(() => {
    pendingRequests.value = pendingRequests.value.filter(req => req.id !== request.id);
    $q.notify({
      type: 'negative',
      message: `Solicitud ID ${request.id} RECHAZADA.`,
      position: 'top'
    });
  });
}
</script>

<style scoped>
.q-page {
  background-color: #f0f4f8;
}
</style>