<template>
  <q-page class="q-pa-lg bg-grey-2">
    <div class="row items-center q-mb-md">
      <q-btn 
        icon="arrow_back" 
        flat 
        round 
        dense 
        color="primary" 
        @click="router.back()" 
        class="q-mr-sm"
      />
      <q-icon name="meeting_room" size="md" color="secondary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold text-dark">
        Aulas en Zona: <span class="text-primary">{{ zoneName }}</span>
      </div>
    </div>

    <q-card flat bordered class="q-mt-sm">
      <q-card-section class="row items-center">
        <div class="text-h6">Listado de Aulas</div>
        <q-space />
        <q-btn 
          color="secondary" 
          icon="add" 
          label="Crear Nueva Aula" 
          @click="openClassroomDialog({})"
        />
      </q-card-section>

      <q-separator />

      <q-list separator>
        <q-item v-for="classroom in filteredClassrooms" :key="classroom.id" clickable v-ripple>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ classroom.name }}</q-item-label>
            <q-item-label caption>Capacidad: {{ classroom.capacity }} personas</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center q-gutter-x-sm">
                <q-btn
                    color="primary"
                    icon="inventory_2"
                    label="Ver Inventario"
                    size="sm"
                    flat
                    dense
                    @click="goToInventory(classroom)"
                />
                <q-btn icon="edit" color="blue" size="sm" flat dense @click="openClassroomDialog(classroom)">
                    <q-tooltip>Editar Aula</q-tooltip>
                </q-btn>
                <q-btn icon="delete" color="negative" size="sm" flat dense @click="deleteClassroom(classroom)">
                    <q-tooltip>Eliminar Aula</q-tooltip>
                </q-btn>
            </div>
          </q-item-section>
        </q-item>

        <q-item v-if="filteredClassrooms.length === 0">
            <q-item-section class="text-center text-grey-7 q-py-lg">
                No hay aulas registradas en esta zona.
            </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-dialog v-model="showClassroomDialog" persistent>
        <q-card style="width: 400px; max-width: 95%;">
            <q-toolbar :class="`bg-${isEditMode ? 'blue' : 'secondary'} text-white`">
                <q-icon name="meeting_room" size="sm" class="q-mr-sm" />
                <q-toolbar-title class="text-weight-bold">
                    {{ isEditMode ? 'Editar Aula' : 'Crear Nueva Aula' }}
                </q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>

            <q-card-section>
                <q-form @submit="saveClassroom" class="q-gutter-md">
                    <q-input
                        v-model="classroomForm.name"
                        label="Nombre del Aula"
                        outlined
                        dense
                        :rules="[val => !!val || 'El nombre es obligatorio']"
                    />
                    <q-input
                        v-model.number="classroomForm.capacity"
                        label="Capacidad Máxima"
                        type="number"
                        outlined
                        dense
                        :rules="[val => val > 0 || 'Debe ser mayor que 0']"
                    />

                    <q-card-actions align="right" class="q-mt-lg">
                        <q-btn flat label="Cancelar" color="grey" v-close-popup />
                        <q-btn :label="isEditMode ? 'Guardar Cambios' : 'Crear Aula'" type="submit" :color="isEditMode ? 'blue' : 'secondary'" />
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
import { useRouter, useRoute } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// --- Obtener parámetros de la URL ---
const zoneId = Number(route.params.zoneId);
const zoneName = route.query.zoneName || `ID ${zoneId}`;

// --- DATOS SIMULADOS ---
const allClassrooms = ref([
  { id: 101, zoneId: 1, name: 'Laboratorio de Cómputo 1', capacity: 25 },
  { id: 102, zoneId: 1, name: 'Sala de Juntas B', capacity: 10 },
  { id: 201, zoneId: 2, name: 'Taller de Maquinaria Pesada', capacity: 15 },
  { id: 202, zoneId: 2, name: 'Aula de Diseño CAD', capacity: 20 },
]);

const filteredClassrooms = computed(() => {
    return allClassrooms.value.filter(c => c.zoneId === zoneId);
});

// --- ESTADO LOCAL ---
const showClassroomDialog = ref(false);
const classroomForm = ref({ id: null, zoneId: zoneId, name: '', capacity: 0 });

const isEditMode = computed(() => !!classroomForm.value.id);

// --- MÉTODOS DE GESTIÓN DE AULAS ---

const openClassroomDialog = (classroom) => {
    if (classroom.id) {
        classroomForm.value = { ...classroom }; // Copia para edición
    } else {
        classroomForm.value = { id: null, zoneId: zoneId, name: '', capacity: 0 }; // Nuevo
    }
    showClassroomDialog.value = true;
};

const saveClassroom = () => {
    if (isEditMode.value) {
        // Lógica de Edición
        const index = allClassrooms.value.findIndex(c => c.id === classroomForm.value.id);
        if (index !== -1) {
            allClassrooms.value[index] = { ...classroomForm.value };
        }
        $q.notify({ type: 'info', message: `Aula "${classroomForm.value.name}" actualizada.` });
    } else {
        // Lógica de Creación
        const newId = Math.max(...allClassrooms.value.map(c => c.id), 0) + 1;
        allClassrooms.value.push({ ...classroomForm.value, id: newId, zoneId: zoneId });
        $q.notify({ type: 'positive', message: `Aula "${classroomForm.value.name}" creada con éxito.` });
    }
    showClassroomDialog.value = false;
};

const deleteClassroom = (classroom) => {
    $q.dialog({
        title: 'Confirmar Eliminación',
        message: `¿Está seguro de que desea eliminar el Aula "${classroom.name}"?`,
        cancel: true,
        persistent: true,
        color: 'negative'
    }).onOk(() => {
        allClassrooms.value = allClassrooms.value.filter(c => c.id !== classroom.id);
        $q.notify({ type: 'negative', message: `Aula "${classroom.name}" eliminada.` });
    });
};

// --- MÉTODO DE NAVEGACIÓN A INVENTARIO ---

const goToInventory = (classroom) => {
    // Navega a la ruta anidada, pasando el ID y el nombre del aula como parámetros
    router.push({ 
        name: 'admin-inventario', 
        params: { 
            zoneId: zoneId, // Mantiene el zoneId en la URL
            classroomId: classroom.id 
        },
        query: { 
            zoneName: zoneName,
            classroomName: classroom.name 
        } 
    });
};
</script>

<style scoped>
.bg-grey-2 {
    background-color: #f0f4f8;
}
</style>