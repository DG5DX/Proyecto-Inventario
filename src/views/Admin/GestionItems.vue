<template>
  <q-page class="q-pa-md bg-grey-2">
    
    <div class="row q-col-gutter-sm items-center q-mb-md">
      
      <div class="col-auto row items-center">
        <q-btn 
          icon="arrow_back" 
          flat 
          round 
          dense 
          color="secondary" 
          @click="router.back()" 
          class="q-mr-sm"
        />
        <q-icon name="inventory_2" size="md" color="primary" />
      </div>

      <div class="col row items-end">
        <div class="col-12 text-h6 text-weight-bold text-dark q-mt-xs q-pr-sm ellipsis">
          Inventario en Aula: <span class="text-secondary">{{ classroomName }}</span>
        </div>
        <div class="text-h5 text-weight-bold text-dark">
          Zona: <span class="text-primary">{{ zoneName }}</span>
        </div>
      </div>
    </div>
    <q-card flat bordered class="q-mt-sm">
      <q-card-section class="row items-center q-col-gutter-sm">
        
        <div class="col-12 col-sm-auto text-h6 q-py-xs">
          Gestión de Ítems
        </div>
        
        <q-space class="gt-xs" /> 
        <div class="col-12 col-sm-auto row q-gutter-sm justify-end">
          <q-btn
            color="green-7"
            icon="download"
            :label="$q.screen.gt.xs ? 'Descargar Excel' : ''"
            :round="$q.screen.xs"
            @click="exportTable"
            :disable="filteredItems.length === 0"
          >
            <q-tooltip v-if="filteredItems.length === 0">No hay datos para exportar</q-tooltip>
            <q-tooltip v-else-if="$q.screen.xs">Descargar Excel</q-tooltip>
          </q-btn>
          
          <q-btn 
            color="primary" 
            icon="add" 
            :label="$q.screen.gt.xs ? 'Añadir Ítem' : ''" 
            :round="$q.screen.xs"
            @click="openItemDialog({})"
          >
            <q-tooltip v-if="$q.screen.xs">Añadir Ítem</q-tooltip>
          </q-btn>
        </div>

      </q-card-section>

      <q-separator />

      <q-table
        :rows="filteredItems"
        :columns="columns"
        row-key="id"
        :filter="filter"
        no-data-label="No hay ítems registrados en esta aula."
        flat
        :grid="$q.screen.xs" 
        :card-container-class="$q.screen.xs ? 'q-col-gutter-md' : ''"
      >
        <template v-slot:top-right>
          <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        
        <template v-slot:body-cell-availableQuantity="props">
          <q-td :props="props">
            <span 
              class="text-weight-bold" 
              :class="props.row.availableQuantity > 0 ? 'text-green-8' : 'text-negative'"
            >
              {{ props.row.availableQuantity }} / {{ props.row.totalQuantity }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn icon="edit" color="blue" size="sm" flat dense @click="openItemDialog(props.row)">
              <q-tooltip>Editar Ítem</q-tooltip>
            </q-btn>
            <q-btn icon="delete" color="negative" size="sm" flat dense @click="deleteItem(props.row)">
              <q-tooltip>Eliminar Ítem</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        
        <template v-slot:item="props">
          <div class="q-pa-xs col-12 col-sm-6 col-md-4">
            <q-card flat bordered>
              <q-card-section class="row no-wrap items-center">
                <q-icon 
                  name="devices_other" 
                  size="md" 
                  :color="props.row.availableQuantity > 0 ? 'green-8' : 'negative'"
                  class="q-mr-sm"
                />
                <div class="col ellipsis">
                  <div class="text-weight-bold ellipsis">{{ props.row.name }}</div>
                  <div class="text-caption text-grey-7">Cat.: {{ props.row.category }}</div>
                </div>
                
                <q-space />
                
                <div class="column items-end">
                  <span 
                    class="text-caption text-weight-bold" 
                    :class="props.row.availableQuantity > 0 ? 'text-green-8' : 'text-negative'"
                  >
                    Disp.: {{ props.row.availableQuantity }} / {{ props.row.totalQuantity }}
                  </span>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
                <q-btn 
                  icon="edit" 
                  color="blue" 
                  size="sm" 
                  flat 
                  dense 
                  label="Editar" 
                  @click="openItemDialog(props.row)" 
                />
                <q-btn 
                  icon="delete" 
                  color="negative" 
                  size="sm" 
                  flat 
                  dense 
                  label="Eliminar" 
                  @click="deleteItem(props.row)" 
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>
        </q-table>
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
            <q-form ref="itemFormRef" @submit="saveItem" class="q-gutter-md">
                  <q-input 
                    v-model="itemForm.name" 
                    label="Nombre del Ítem" 
                    outlined 
                    dense 
                    :rules="[val => !!val && !!val.trim() || 'El nombre es obligatorio']" 
                    lazy-rules
                  />
                  
                  <q-select 
                      v-model="itemForm.category" 
                      :options="categories" 
                      label="Categoría" 
                      outlined 
                      dense 
                      :rules="[val => !!val || 'La categoría es obligatoria']" 
                      lazy-rules
                  />

                  <div class="row q-col-gutter-md">
                      <div class="col-6">
                          <q-input 
                              v-model.number="itemForm.totalQuantity" 
                              label="Cantidad Total" 
                              type="number" 
                              outlined 
                              dense 
                              :rules="[val => val >= 0 || 'Cantidad total inválida', val => val !== null || 'Obligatorio']" 
                              lazy-rules
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
                                    val => val >= 0 || 'Cantidad disponible inválida',
                                    val => val !== null || 'Obligatorio',
                                    val => val <= itemForm.totalQuantity || 'No puede superar el total'
                                ]" 
                                lazy-rules
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
import * as XLSX from 'xlsx/xlsx.mjs'; 

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// 1. Referencia para el formulario (para forzar la validación)
const itemFormRef = ref(null); 

// --- Obtener parámetros de la URL ---
const zoneName = route.query.zoneName || 'Zona Desconocida';
const classroomId = Number(route.params.classroomId);
const classroomName = route.query.classroomName || `Aula ID ${classroomId}`;

// --- DATOS Y CONFIGURACIÓN DE TABLA ---
const filter = ref('');

const categories = ['Electrónica', 'Mobiliario', 'Herramientas', 'Consumibles'];

const columns = [
  // Hacemos el ID y la Categoría invisible en modo GRID (Móvil) para limpiar la vista.
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true, classes: 'gt-xs' }, 
  { name: 'name', required: true, label: 'Ítem', align: 'left', field: 'name', sortable: true },
  { name: 'category', label: 'Categoría', align: 'left', field: 'category', sortable: true, classes: 'gt-xs' },
  { 
    name: 'availableQuantity', 
    label: 'Disponibilidad', 
    align: 'center', 
    field: 'availableQuantity', 
    sortable: true,
    format: (val, row) => `${val} / ${row.totalQuantity}` 
  },
  { name: 'actions', label: 'Acciones', align: 'center', field: 'actions' }
];

const allItems = ref([
  { id: 1, classroomId: 101, name: 'Computadora HP All-in-One', category: 'Electrónica', totalQuantity: 20, availableQuantity: 18 },
  { id: 2, classroomId: 101, name: 'Sillas Ergonómicas', category: 'Mobiliario', totalQuantity: 25, availableQuantity: 25 },
  { id: 3, classroomId: 201, name: 'Tornillo de Banco', category: 'Herramientas', totalQuantity: 5, availableQuantity: 4 },
  { id: 4, classroomId: 101, name: 'Proyector Epson', category: 'Electrónica', totalQuantity: 1, availableQuantity: 0 },
]);

const filteredItems = computed(() => {
    return allItems.value.filter(i => i.classroomId === classroomId);
});

// --- EXPORTAR A XLSX (Mismos métodos, no necesitan cambios responsive) ---

const exportTable = () => {
    if (filteredItems.value.length === 0) {
        $q.notify({ type: 'warning', message: 'No hay datos para exportar.' });
        return;
    }
    
    const dataForExport = filteredItems.value.map(item => ({
        'ID': item.id,
        'Ítem': item.name,
        'Categoría': item.category,
        'Cantidad Total': item.totalQuantity,
        'Cantidad Disponible': item.availableQuantity,
        'En Uso / Dañado': item.totalQuantity - item.availableQuantity,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);

    const columnWidths = [
      { wch: 5 }, 
      { wch: 30 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 18 }, 
      { wch: 18 } 
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario'); 

    const fileName = `inventario_${classroomName.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    try {
        XLSX.writeFile(workbook, fileName, { bookType: 'xlsx', type: 'base64' });
        $q.notify({ type: 'positive', message: 'Archivo XLSX generado exitosamente.' });
    } catch (error) {
        console.error("Error al exportar XLSX:", error);
        $q.notify({ 
            type: 'negative', 
            message: 'Hubo un error al generar el archivo XLSX. Revisa la consola.' 
        });
    }
};

// --- MÉTODOS DE GESTIÓN DE ÍTEMS (Sin cambios) ---

const openItemDialog = (item) => {
    if (itemFormRef.value) {
      itemFormRef.value.resetValidation();
    }
    
    if (item.id) {
        itemForm.value = { ...item }; 
    } else {
        itemForm.value = { id: null, classroomId: classroomId, name: '', category: null, totalQuantity: 0, availableQuantity: 0 }; 
    }
    showItemDialog.value = true;
};

const saveItem = async () => {
    const success = await itemFormRef.value.validate();

    if (success) {
        if (isEditMode.value) {
            const index = allItems.value.findIndex(i => i.id === itemForm.value.id);
            if (index !== -1) {
                allItems.value[index] = { ...itemForm.value };
            }
            $q.notify({ type: 'info', message: `Ítem "${itemForm.value.name}" actualizado.` });
        } else {
            const newId = Math.max(...allItems.value.map(i => i.id), 0) + 1;
            allItems.value.push({ ...itemForm.value, id: newId, classroomId: classroomId });
            $q.notify({ type: 'positive', message: `Ítem "${itemForm.value.name}" añadido al inventario.` });
        }
        showItemDialog.value = false;
    } else {
        $q.notify({ type: 'warning', message: 'Por favor, complete los campos requeridos correctamente.' });
    }
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

// --- ESTADO LOCAL ---
const showItemDialog = ref(false);
const itemForm = ref({ id: null, classroomId: classroomId, name: '', category: null, totalQuantity: 0, availableQuantity: 0 });
const isEditMode = computed(() => !!itemForm.value.id);
</script>

<style scoped>
.bg-grey-2 {
    background-color: #f0f4f8;
}
</style>