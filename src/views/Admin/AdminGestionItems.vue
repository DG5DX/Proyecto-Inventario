<template>
  <q-page class="q-pa-lg bg-grey-2">
    <div class="row items-center q-mb-md">
      <q-btn 
        icon="arrow_back" 
        flat 
        round 
        dense 
        color="secondary" 
        @click="router.back()" 
        class="q-mr-sm"
      />
      <q-icon name="inventory_2" size="md" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold text-dark">
        Inventario en Aula: <span class="text-secondary">{{ classroomName }}</span>
      </div>
      <div class="text-caption text-grey-6 q-ml-md">Zona: {{ zoneName }}</div>
    </div>

    <q-card flat bordered class="q-mt-sm">
      <q-card-section class="row items-center">
        <div class="text-h6">Gestión de Ítems (Nivel 3)</div>
        <q-space />
        <q-btn 
          color="primary" 
          icon="add" 
          label="Añadir Ítem" 
          @click="openItemDialog({})"
        />
      </q-card-section>

      <q-separator />

      <q-list separator>
        <q-item v-for="item in filteredItems" :key="item.id" clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="devices_other" :color="item.availableQuantity > 0 ? 'green-8' : 'negative'" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">{{ item.name }}</q-item-label>
            <q-item-label caption>Categoría: {{ item.category }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="column items-end">
                <span class="text-weight-bold" :class="item.availableQuantity > 0 ? 'text-green-8' : 'text-negative'">
                    Disp.: {{ item.availableQuantity }} / {{ item.totalQuantity }}
                </span>
                <div class="row items-center q-gutter-x-sm q-mt-xs">
                    <q-btn icon="edit" color="blue" size="sm" flat dense @click="openItemDialog(item)">
                        <q-tooltip>Editar Ítem</q-tooltip>
                    </q-btn>
                    <q-btn icon="delete" color="negative" size="sm" flat dense @click="deleteItem(item)">
                        <q-tooltip>Eliminar Ítem</q-tooltip>
                    </q-btn>
                </div>
            </div>
          </q-item-section>
        </q-item>

        <q-item v-if="filteredItems.length === 0">
            <q-item-section class="text-center text-grey-7 q-py-lg">
                No hay ítems registrados en esta aula.
            </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-dialog v-model="showItemDialog" persistent>
        <q-card style="width: 450px; max-width: 95%;">
            <q-toolbar :class="`bg-${isEditMode ? 'blue' : 'primary'} text-white`">
                <q-icon name="inventory_2" size="sm" class="q-mr-sm" />
                <q-toolbar-title class="text-weight-bold">
                    {{ isEditMode ? 'Editar Ítem' : 'Añadir Nuevo Ítem' }}
                </q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>

            <q-card-section>
                <q-form @submit="saveItem" class="q-gutter-md">
                    <q-input v-model="itemForm.name" label="Nombre del Ítem" outlined dense :rules="[val => !!val || 'El nombre es obligatorio']" />
                    
                    <q-select 
                        v-model="itemForm.category" 
                        :options="categories" 
                        label="Categoría" 
                        outlined 
                        dense 
                        :rules="[val => !!val || 'La categoría es obligatoria']" 
                    />

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-input 
                                v-model.number="itemForm.totalQuantity" 
                                label="Cantidad Total" 
                                type="number" 
                                outlined 
                                dense 
                                :rules="[val => val >= 0 || 'Inválido']" 
                            />
                        </div>
                        <div class="col-6">
                             <q-input 
                                v-model.number="itemForm.availableQuantity" 
                                label="Cantidad Disponible" 
                                type="number" 
                                outlined 
                                dense 
                                :rules="[
                                    val => val >= 0 || 'Inválido',
                                    val => val <= itemForm.totalQuantity || 'No puede superar el total'
                                ]" 
                            />
                        </div>
                    </div>

                    <q-card-actions align="right" class="q-mt-lg">
                        <q-btn flat label="Cancelar" color="grey" v-close-popup />
                        <q-btn :label="isEditMode ? 'Guardar Cambios' : 'Añadir Ítem'" type="submit" :color="isEditMode ? 'blue' : 'primary'" />
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
const zoneName = route.query.zoneName || 'Zona Desconocida';
const classroomId = Number(route.params.classroomId);
const classroomName = route.query.classroomName || `Aula ID ${classroomId}`;

// --- DATOS SIMULADOS ---
const categories = ['Electrónica', 'Mobiliario', 'Herramientas', 'Consumibles'];

const allItems = ref([
  { id: 1, classroomId: 101, name: 'Computadora HP All-in-One', category: 'Electrónica', totalQuantity: 20, availableQuantity: 18 },
  { id: 2, classroomId: 101, name: 'Sillas Ergonómicas', category: 'Mobiliario', totalQuantity: 25, availableQuantity: 25 },
  { id: 3, classroomId: 201, name: 'Tornillo de Banco', category: 'Herramientas', totalQuantity: 5, availableQuantity: 4 },
]);

const filteredItems = computed(() => {
    return allItems.value.filter(i => i.classroomId === classroomId);
});

// --- ESTADO LOCAL ---
const showItemDialog = ref(false);
const itemForm = ref({ id: null, classroomId: classroomId, name: '', category: null, totalQuantity: 0, availableQuantity: 0 });

const isEditMode = computed(() => !!itemForm.value.id);

// --- MÉTODOS DE GESTIÓN DE ÍTEMS ---

const openItemDialog = (item) => {
    if (item.id) {
        itemForm.value = { ...item }; // Copia para edición
    } else {
        itemForm.value = { id: null, classroomId: classroomId, name: '', category: null, totalQuantity: 0, availableQuantity: 0 }; // Nuevo
    }
    showItemDialog.value = true;
};

const saveItem = () => {
    if (isEditMode.value) {
        // Lógica de Edición
        const index = allItems.value.findIndex(i => i.id === itemForm.value.id);
        if (index !== -1) {
            allItems.value[index] = { ...itemForm.value };
        }
        $q.notify({ type: 'info', message: `Ítem "${itemForm.value.name}" actualizado.` });
    } else {
        // Lógica de Creación
        const newId = Math.max(...allItems.value.map(i => i.id), 0) + 1;
        allItems.value.push({ ...itemForm.value, id: newId, classroomId: classroomId });
        $q.notify({ type: 'positive', message: `Ítem "${itemForm.value.name}" añadido al inventario.` });
    }
    showItemDialog.value = false;
};

const deleteItem = (item) => {
    $q.dialog({
        title: 'Confirmar Eliminación',
        message: `¿Está seguro de que desea eliminar el Ítem "${item.name}"?`,
        cancel: true,
        persistent: true,
        color: 'negative'
    }).onOk(() => {
        allItems.value = allItems.value.filter(i => i.id !== item.id);
        $q.notify({ type: 'negative', message: `Ítem "${item.name}" eliminado del inventario.` });
    });
};
</script>

<style scoped>
.bg-grey-2 {
    background-color: #f0f4f8;
}
</style>