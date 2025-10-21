<template>
  <q-page class="q-pa-lg bg-grey-2">
    <div class="row items-center q-mb-md">
      <q-icon name="view_list" size="md" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold text-dark">Mis Préstamos Activos</div>
      <q-space />
      <q-btn 
        color="secondary" 
        icon="refresh" 
        label="Actualizar Lista" 
        flat 
        dense
        @click="loadLoans"
      />
    </div>

    <q-card flat bordered class="q-mt-sm">
      <q-card-section>
        <q-table
          title="Préstamos Pendientes de Devolución"
          :rows="activeLoans"
          :columns="columns"
          row-key="id"
          :filter="filter"
          :loading="loading"
          no-data-label="No tienes préstamos activos."
          :pagination-label="paginationLabel"
          :row-class="getRowClass"  >
          <template v-slot:top-right>
            <q-input 
              borderless 
              dense 
              debounce="300" 
              v-model="filter" 
              placeholder="Buscar por ítem"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge 
                :color="getStatusColor(props.row.dueDate)" 
                class="q-px-sm q-py-xs text-weight-bold"
              >
                {{ getStatusLabel(props.row.dueDate) }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn 
                icon="event_repeat" 
                label="Aplazar" 
                color="orange-8" 
                size="sm" 
                flat 
                dense
                :disable="!canRequestExtension(props.row)"
                @click="openExtendDialog(props.row)"
              >
                <q-tooltip v-if="!canRequestExtension(props.row)">
                  Ya tienes una solicitud de aplazamiento pendiente.
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showExtendDialog" persistent>
        <q-card style="width: 400px; max-width: 95%;">
            <q-toolbar class="bg-orange-8 text-white">
                <q-icon name="event_repeat" size="sm" class="q-mr-sm" />
                <q-toolbar-title class="text-weight-bold">
                    Solicitar Aplazamiento
                </q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>

            <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                    Ítem: <span class="text-weight-bold">{{ loanToExtend.itemName }}</span>
                    <br>Fecha actual de devolución: <span class="text-negative text-weight-bold">{{ loanToExtend.dueDate }}</span>
                </div>

                <q-form @submit="submitExtension" class="q-gutter-md">
                    
                    <q-input
                        v-model="newDueDate"
                        label="Nueva Fecha y Hora de Devolución"
                        mask="####-##-## ##:##"
                        outlined
                        dense
                        color="orange-8"
                        :rules="[
                            val => !!val || 'Fecha requerida',
                            val => isDateLater(val, loanToExtend.dueDate) || 'La nueva fecha debe ser estrictamente posterior a la actual.',
                            val => isDateFutureOrToday(val) || 'No puedes aplazar a una fecha pasada.'
                        ]"
                    >
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer" color="orange-8">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date 
                                        v-model="newDueDate" 
                                        mask="YYYY-MM-DD HH:mm" 
                                        :options="date => date >= todayDateString"
                                    >
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                            <q-icon name="access_time" class="cursor-pointer" color="orange-8">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-time v-model="newDueDate" mask="YYYY-MM-DD HH:mm" format24h>
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>

                    <q-input
                        v-model="extensionReason"
                        label="Motivo del aplazamiento"
                        type="textarea"
                        rows="2"
                        outlined
                        dense
                        color="secondary"
                        :rules="[val => val && val.length > 10 || 'Especifique el motivo (mín. 10 caracteres)']"
                    />

                    <q-card-actions align="right" class="q-mt-lg q-pb-none">
                        <q-btn flat label="Cancelar" color="grey" v-close-popup />
                        <q-btn label="Enviar Solicitud" type="submit" color="orange-8" :loading="extensionLoading" />
                    </q-card-actions>
                </q-form>

            </q-card-section>
        </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar, date } from 'quasar';

const $q = useQuasar();

// --- ESTADO GENERAL ---
const filter = ref('');
const loading = ref(false);
const showExtendDialog = ref(false);
const extensionLoading = ref(false);
const loanToExtend = ref({});
const newDueDate = ref('');
const extensionReason = ref('');

// Usar el tiempo actual para las comparaciones
const currentDate = Date.now();
// Formato solo para la restricción visual del calendario
const todayDateString = date.formatDate(currentDate, 'YYYY-MM-DD'); 

// --- DATOS SIMULADOS ---
const activeLoans = ref([
  { 
    id: 101, 
    itemName: 'Microscopio Biológico Profesional', 
    quantity: 1, 
    startDate: '2025-10-15 10:00', 
    dueDate: '2025-10-22 17:00', // Próximo
    status: 'Activo',
    extensionPending: false, 
    adminNote: null
  },
  { 
    id: 102, 
    itemName: 'Proyector 4K (Vencido)', 
    quantity: 1, 
    startDate: '2025-10-01 09:00', 
    dueDate: '2025-10-20 12:00', // 💡 VENCIDO (la hora actual es 3:30 PM)
    status: 'Activo',
    extensionPending: false,
    adminNote: null
  },
  { 
    id: 103, 
    itemName: 'Kit de Robótica V3', 
    quantity: 2, 
    startDate: '2025-10-18 14:00', 
    dueDate: '2025-10-28 16:00',
    status: 'Activo',
    extensionPending: true, 
    adminNote: 'Pendiente de aprobación de la extensión'
  },
]);

// --- DEFINICIÓN DE COLUMNAS (Mantenido) ---
const columns = [
  { name: 'id', required: true, label: 'ID Préstamo', align: 'left', field: 'id', sortable: true },
  { name: 'itemName', align: 'left', label: 'Ítem', field: 'itemName', sortable: true },
  { name: 'quantity', align: 'center', label: 'Cantidad', field: 'quantity', sortable: true },
  { name: 'startDate', align: 'center', label: 'F. Inicio', field: 'startDate', sortable: true },
  { name: 'dueDate', align: 'center', label: 'F. Devolución', field: 'dueDate', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
];

// ----------------------------------------------------
// --- LÓGICA DE CLASE PARA LA FILA (NUEVA) ---
// ----------------------------------------------------

/**
 * Determina la clase CSS para la fila de la tabla.
 * @param {Object} row - Objeto de préstamo.
 * @returns {string} Clase CSS a aplicar.
 */
const getRowClass = (row) => {
    // Si la diferencia entre la fecha de devolución y la fecha actual es negativa (ya pasó)
    const diffSeconds = date.getDateDiff(row.dueDate, currentDate, 'seconds');
    if (diffSeconds < 0) {
        return 'loan-expired'; // Aplica la clase para vencido
    }
    return '';
};

// --- LÓGICA DE ESTADO Y VENCIMIENTO (Ajustada) ---

const getStatusColor = (dueDate) => {
    const diffSeconds = date.getDateDiff(dueDate, currentDate, 'seconds');
    if (diffSeconds < 0) return 'red-8'; // Vencido
    
    // Próximo a vencer (si quedan menos de 48 horas)
    const twoDaysInSeconds = 48 * 3600;
    if (diffSeconds <= twoDaysInSeconds) return 'orange-8'; 
    
    return 'green-8'; 
};

const getStatusLabel = (dueDate) => {
    const diffDays = date.getDateDiff(dueDate, currentDate, 'days');
    const diffSeconds = date.getDateDiff(dueDate, currentDate, 'seconds');

    if (diffSeconds < 0) {
        // Formatear la diferencia para mostrar cuánto tiempo pasó
        const absDiffSeconds = Math.abs(diffSeconds);
        const daysPassed = Math.floor(absDiffSeconds / 86400); // 86400 seg en 1 día
        
        if (daysPassed > 0) return `VENCIDO (${daysPassed} días)`;
        return `VENCIDO (hoy)`;
    }
    
    const twoDaysInSeconds = 48 * 3600;
    if (diffSeconds <= twoDaysInSeconds) {
        if (diffDays === 0) return `VENCE HOY`;
        return `PRONTO (${diffDays + 1} días)`; // +1 para mejor visualización
    }
    return 'ACTIVO';
};

const paginationLabel = ({ firstIndex, lastIndex, totalRecordCount }) => {
  return `${firstIndex}-${lastIndex} de ${totalRecordCount}`;
};

// --- ACCIONES DE LA TABLA (Mantenido) ---

function loadLoans() {
    loading.value = true;
    setTimeout(() => {
        $q.notify({ type: 'info', message: 'Lista de préstamos actualizada.', position: 'top' });
        loading.value = false;
    }, 500);
}

// ----------------------------------------------------
// --- LÓGICA DE APLAZAMIENTO (Mantenido) ---
// ----------------------------------------------------

const openExtendDialog = (loan) => {
    loanToExtend.value = loan;
    const tomorrow = date.addToDate(currentDate, { days: 1 });
    newDueDate.value = date.formatDate(tomorrow, 'YYYY-MM-DD HH:mm'); 
    extensionReason.value = '';
    showExtendDialog.value = true;
};

const isDateLater = (newDateString, currentDueDateString) => {
    const diff = date.getDateDiff(newDateString, currentDueDateString, 'seconds');
    return diff > 0; 
};

const isDateFutureOrToday = (newDateString) => {
    const diff = date.getDateDiff(newDateString, currentDate, 'seconds');
    return diff >= 0;
}

const canRequestExtension = (loan) => {
    return !loan.extensionPending; 
};

const submitExtension = () => {
    extensionLoading.value = true;
    
    setTimeout(() => {
        extensionLoading.value = false;
        showExtendDialog.value = false;

        const loanIndex = activeLoans.value.findIndex(l => l.id === loanToExtend.value.id);
        if (loanIndex !== -1) {
            activeLoans.value[loanIndex].extensionPending = true;
        }

        $q.notify({
            type: 'warning',
            message: `Solicitud de aplazamiento para "${loanToExtend.value.itemName}" enviada al administrador.`,
            caption: `Nueva fecha solicitada: ${newDueDate.value}. Espera la aprobación.`,
            position: 'top'
        });
        
        console.log(`[ADMIN NOTIFICATION] Solicitud de aplazamiento recibida: Préstamo ID ${loanToExtend.value.id}. Ítem: ${loanToExtend.value.itemName}. Nueva fecha: ${newDueDate.value}. Motivo: ${extensionReason.value}`);
        
        loanToExtend.value = {};
        newDueDate.value = '';
        extensionReason.value = '';
        
    }, 1500);
};

</script>

<style scoped>
.bg-grey-2 {
    background-color: #f0f4f8;
}
.q-table {
    border-radius: 8px;
}

/* 💡 ESTILO PARA FILAS VENCIDAS */
.loan-expired {
    background-color: #ffebee !important; /* Rojo muy claro (similar a red-1) */
    color: #b71c1c !important; /* Texto rojo oscuro */
    font-weight: bold;
}
/* Asegura que el texto en la fila vencida se mantenga rojo, excepto los badges */
.loan-expired td {
    color: #b71c1c !important; 
}
</style>