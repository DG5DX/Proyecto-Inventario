<template>
  <q-page class="q-pa-lg bg-grey-2">
    <div class="row items-center q-mb-md">
      <q-icon name="apartment" size="md" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold text-dark">Gestión de Zonas</div>
    </div>

    <q-card flat bordered class="q-mt-sm">
      <q-card-section class="row items-center">
        <div class="text-h6">Listado de Zonas</div>
        <q-space />
        <q-btn 
          color="primary" 
          icon="add" 
          label="Crear Nueva Zona" 
          @click="openZoneDialog({})"
        />
      </q-card-section>

      <q-separator />

      <q-list separator>
        <q-item v-for="zone in zones" :key="zone.id" clickable v-ripple>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ zone.name }}</q-item-label>
            <q-item-label caption>{{ zone.description }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center q-gutter-x-sm">
                <q-btn
                    color="secondary"
                    icon="meeting_room"
                    label="Ver Aulas"
                    size="sm"
                    flat
                    dense
                    @click="goToClassrooms(zone)"
                />
                <q-btn icon="edit" color="blue" size="sm" flat dense @click="openZoneDialog(zone)">
                    <q-tooltip>Editar Zona</q-tooltip>
                </q-btn>
                <q-btn icon="delete" color="negative" size="sm" flat dense @click="deleteZone(zone)">
                    <q-tooltip>Eliminar Zona</q-tooltip>
                </q-btn>
            </div>
          </q-item-section>
        </q-item>

        <q-item v-if="zones.length === 0">
            <q-item-section class="text-center text-grey-7 q-py-lg">
                No hay zonas registradas.
            </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-dialog v-model="showZoneDialog" persistent>
        <q-card style="width: 400px; max-width: 95%;">
            <q-toolbar :class="`bg-${isEditMode ? 'blue' : 'primary'} text-white`">
                <q-icon name="apartment" size="sm" class="q-mr-sm" />
                <q-toolbar-title class="text-weight-bold">
                    {{ isEditMode ? 'Editar Zona' : 'Crear Nueva Zona' }}
                </q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>

            <q-card-section>
                <q-form @submit="saveZone" class="q-gutter-md">
                    <q-input
                        v-model="zoneForm.name"
                        label="Nombre de la Zona"
                        outlined
                        dense
                        :rules="[val => !!val || 'El nombre es obligatorio']"
                    />
                    <q-input
                        v-model="zoneForm.description"
                        label="Descripción de la Zona"
                        type="textarea"
                        rows="2"
                        outlined
                        dense
                    />

                    <q-card-actions align="right" class="q-mt-lg">
                        <q-btn flat label="Cancelar" color="grey" v-close-popup />
                        <q-btn :label="isEditMode ? 'Guardar Cambios' : 'Crear Zona'" type="submit" :color="isEditMode ? 'blue' : 'primary'" />
                    </q-card-actions>
                </q-form>

            </q-card-section>
        </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

// --- ESTADO Y DATOS SIMULADOS ---
const zones = ref([
  { id: 1, name: 'Edificio Central', description: 'Laboratorios y Oficinas Administrativas.' },
  { id: 2, name: 'Ala Técnica', description: 'Talleres de ingeniería y salones de cómputo.' },
]);

const showZoneDialog = ref(false);
const zoneForm = ref({ id: null, name: '', description: '' });

const isEditMode = computed(() => !!zoneForm.value.id);

// --- MÉTODOS DE GESTIÓN DE ZONAS ---

const openZoneDialog = (zone) => {
    if (zone.id) {
        zoneForm.value = { ...zone }; // Copia para edición
    } else {
        zoneForm.value = { id: null, name: '', description: '' }; // Nuevo
    }
    showZoneDialog.value = true;
};

const saveZone = () => {
    if (isEditMode.value) {
        // Lógica de Edición
        const index = zones.value.findIndex(z => z.id === zoneForm.value.id);
        if (index !== -1) {
            zones.value[index] = { ...zoneForm.value };
        }
        $q.notify({ type: 'info', message: `Zona "${zoneForm.value.name}" actualizada.` });
    } else {
        // Lógica de Creación
        const newId = Math.max(...zones.value.map(z => z.id), 0) + 1;
        zones.value.push({ ...zoneForm.value, id: newId });
        $q.notify({ type: 'positive', message: `Zona "${zoneForm.value.name}" creada con éxito.` });
    }
    showZoneDialog.value = false;
};

const deleteZone = (zone) => {
    $q.dialog({
        title: 'Confirmar Eliminación',
        message: `¿Está seguro de que desea eliminar la Zona "${zone.name}"?`,
        cancel: true,
        persistent: true,
        color: 'negative'
    }).onOk(() => {
        zones.value = zones.value.filter(z => z.id !== zone.id);
        $q.notify({ type: 'negative', message: `Zona "${zone.name}" eliminada.` });
    });
};

// --- MÉTODO DE NAVEGACIÓN A AULAS ---

const goToClassrooms = (zone) => {
    // Navega a la ruta anidada, pasando el ID y el nombre de la zona como parámetros
    router.push({ 
        name: 'admin-aulas', 
        params: { zoneId: zone.id },
        query: { zoneName: zone.name } 
    });
};
</script>

<style scoped>
.bg-grey-2 {
    background-color: #f0f4f8;
}
</style>