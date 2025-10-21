<template>
  <q-page class="row items-center justify-center bg-dark q-pa-md"
    style="background-image: url('https://source.unsplash.com/random/1920x1080/?nature,forest,blur'); background-size: cover; background-position: center;">

    <q-card class="glass-card q-pa-lg text-white" style="width: 450px; max-width: 95%;">

      <div class="glass-avatar-container q-mb-md">
        <q-icon name="person_add" size="70px" class="glass-avatar" />
      </div>

      <q-card-section class="text-center q-pt-none q-mt-xl">
        <div class="text-h5 text-weight-bold q-mb-xs" style="color: white;">Crear Cuenta</div>
        <div class="text-subtitle1 text-grey-4">Regístrate para usar el Inventario de Aula</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleRegister" class="q-gutter-md">

          <q-input v-model="name" dark filled bg-color="rgba(255, 255, 255, 0.1)" input-class="text-white"
            label-color="grey-4" type="text" label="Nombre Completo" clearable :rules="[
              val => (val && val.length > 0) || 'El nombre es requerido'
            ]">
            <template v-slot:prepend>
              <q-icon name="person" color="white" />
            </template>
          </q-input>

          <q-input v-model="email" dark filled bg-color="rgba(255, 255, 255, 0.1)" input-class="text-white"
            label-color="grey-4" type="email" label="Correo Electrónico" clearable :rules="[
              val => (val && val.length > 0) || 'El email es requerido',
              val => /.+@.+\..+/.test(val) || 'Ingresa un email válido'
            ]">
            <template v-slot:prepend>
              <q-icon name="email" color="white" />
            </template>
          </q-input>

          <q-input v-model="password" dark filled bg-color="rgba(255, 255, 255, 0.1)" input-class="text-white"
            label-color="grey-4" type="password" label="Contraseña (mín. 6 caracteres)" clearable :rules="[
              val => (val && val.length > 0) || 'La contraseña es requerida',
              val => val.length >= 6 || 'Mínimo 6 caracteres'
            ]">
            <template v-slot:prepend>
              <q-icon name="lock" color="white" />
            </template>
          </q-input>

          <q-input v-model="passwordConfirm" dark filled bg-color="rgba(255, 255, 255, 0.1)" input-class="text-white"
            label-color="grey-4" type="password" label="Confirmar Contraseña" clearable :rules="[
              val => (val && val.length > 0) || 'Confirma la contraseña',
              val => val === password || 'Las contraseñas no coinciden' // <-- VALIDACIÓN CRUCIAL
            ]">
            <template v-slot:prepend>
              <q-icon name="lock_reset" color="white" />
            </template>
          </q-input>

          <q-btn label="REGISTRARME" type="submit" color="primary" text-color="black" size="lg"
            class="full-width q-mt-lg" rounded :loading="loading" :disable="loading">
            <template v-slot:loading>
              <q-spinner-tail class="on-left" color="black" />
              Procesando...
            </template>
          </q-btn>

        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-lg">
        <p class="text-grey-4 text-body2">
          ¿Ya tienes cuenta?
          <router-link to="/" class="text-primary text-weight-medium">Inicia Sesión</router-link>
        </p>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const loading = ref(false);

const router = useRouter();
const $q = useQuasar();

const handleRegister = async () => {
  loading.value = true;

  try {
    // SIMULACIÓN DE LLAMADA A API (2 segundos de retraso)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulación de respuesta exitosa
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // NOTIFICACIÓN DE ÉXITO Y SIMULACIÓN DE CORREO
      $q.notify({
        type: 'positive',
        message: 'Registro exitoso. Se ha enviado un correo de confirmación a tu email.',
        position: 'top',
        icon: 'mark_email_read',
        timeout: 5000
      });

      // Redirigir al Login para que el usuario pueda intentar acceder
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } else {
      // Simulación de un error (ej. "correo ya registrado")
      throw new Error('El correo electrónico ya se encuentra registrado. Intenta iniciar sesión.');
    }

  } catch (error) {
    // NOTIFICACIÓN DE ERROR
    const errorMessage = error.message || 'Error desconocido al intentar registrar el usuario.';

    $q.notify({
      type: 'negative',
      message: `Fallo en el Registro: ${errorMessage}`,
      position: 'top',
      icon: 'warning'
    });

  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Copiamos los estilos Glassmorphism de Login.vue */
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeIn 0.8s ease-out;
}

.glass-avatar-container {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  z-index: 1;
}

.glass-avatar {
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.router-link-active,
.router-link-exact-active,
a {
  text-decoration: none;
}
</style>