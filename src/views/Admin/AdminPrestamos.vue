<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-icon name="swap_horiz" size="md" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold">Préstamos Activos y Movimientos</div>
      <q-space />
    </div>

    <q-card flat bordered class="q-mt-sm">
      <q-card-section>
        <q-table title="Listado de Préstamos Activos" :rows="activeLoans" :columns="columns" row-key="id"
          :filter="filter" :loading="loading" :pagination="initialPagination"
          no-data-label="No hay préstamos activos en este momento">
          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar por ítem o solicitante">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn icon="check_circle" label="Finalizar" color="green-8" size="sm" flat dense
                @click="confirmFinalize(props.row)" />
              <q-btn icon="remove_red_eye" label="Ver Detalle" color="blue-8" size="sm" flat dense class="q-ml-sm"
                @click="showDetail(props.row)" />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip :color="getStatusColor(props.row.status)" text-color="white" size="sm">
                {{ props.row.status }}
              </q-chip>
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

// --- Configuración de la Tabla ---
const columns = [
  { name: 'id', required: true, label: 'ID Préstamo', align: 'left', field: row => row.id, sortable: true },
  { name: 'item', align: 'left', label: 'Ítem', field: 'item', sortable: true },
  { name: 'solicitante', align: 'left', label: 'Solicitante', field: 'solicitante', sortable: true },
  { name: 'fecha_prestamo', align: 'center', label: 'F. Préstamo', field: 'fecha_prestamo', sortable: true },
  { name: 'fecha_devolucion', align: 'center', label: 'F. Devolución (Estimada)', field: 'fecha_devolucion', sortable: true },
  { name: 'zona', align: 'left', label: 'Ubicación', field: 'zona', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
];

const initialPagination = {
  sortBy: 'fecha_prestamo',
  descending: true,
  page: 1,
  rowsPerPage: 10
};

const filter = ref('');
const loading = ref(false);

// --- Datos Simulados de Préstamos Activos ---
const activeLoans = ref([
  { id: 101, item: 'Proyector Epson EB-X400', solicitante: 'Ana Pérez', fecha_prestamo: '2025-10-17 08:30', fecha_devolucion: '2025-10-17 17:00', zona: 'Sala 101', status: 'Activo' },
  { id: 102, item: 'Laptop Dell Latitude 5400', solicitante: 'Carlos López', fecha_prestamo: '2025-10-16 14:00', fecha_devolucion: '2025-10-18 10:00', zona: 'Aula 205', status: 'Activo' },
  { id: 103, item: 'Cámara Canon EOS Rebel T7', solicitante: 'Marta Gómez', fecha_prestamo: '2025-10-15 10:45', fecha_devolucion: '2025-10-20 16:30', zona: 'Estudio de Fotografía', status: 'Retrasado' },
  { id: 104, item: 'Micrófono Shure SM58 (Kit)', solicitante: 'Pedro Ruiz', fecha_prestamo: '2025-10-17 07:00', fecha_devolucion: '2025-10-17 12:00', zona: 'Auditorio', status: 'Activo' },
]);

// --- Lógica y Funciones ---

function getStatusColor(status) {
  if (status === 'Activo') return 'green-7';
  if (status === 'Retrasado') return 'red-8';
  return 'grey-6';
}

function confirmFinalize(loan) {
  $q.dialog({
    title: 'Confirmar Finalización',
    message: `¿Estás seguro de que el ítem "${loan.item}" ha sido devuelto por ${loan.solicitante}?`,
    cancel: true,
    persistent: true,
    color: 'primary'
  }).onOk(() => {
    finalizeLoan(loan.id);
  });
}

function finalizeLoan(loanId) {
  loading.value = true;
  // Simulación de API call para finalizar el préstamo
  setTimeout(() => {
    const initialLength = activeLoans.value.length;
    activeLoans.value = activeLoans.value.filter(loan => loan.id !== loanId);

    if (activeLoans.value.length < initialLength) {
      $q.notify({
        type: 'positive',
        message: `Préstamo ID ${loanId} finalizado y devuelto con éxito.`,
        position: 'top'
      });
    }
    loading.value = false;
  }, 1000);
}

function showDetail(loan) {
  $q.notify({
    message: `Detalles del Préstamo ID ${loan.id}. Próximamente se abrirá la vista de detalle.`,
    color: 'info',
    position: 'top'
  });
  // Aquí se implementaría la navegación a una vista de detalle (e.g., router.push)
}
</script>

<style scoped>
.q-page {
  background-color: #f0f4f8;
}
</style>