<template>
  <q-page class="row items-center justify-center bg-dark q-pa-md"
    style="background-image: url('https://source.unsplash.com/random/1920x1080/?nature,forest,blur'); background-size: cover; background-position: center;">

    <q-card class="glass-card q-pa-lg text-white" style="width: 450px; max-width: 95%;">

      <div class="glass-avatar-container q-mb-md">
        <q-icon name="person" size="70px" class="glass-avatar" />
      </div>

      <q-card-section class="text-center q-pt-none q-mt-xl">
        <div class="text-h5 text-weight-bold q-mb-xs" style="color: white;">Bienvenido</div>
        <div class="text-subtitle1 text-grey-4">Accede a tu cuenta de Inventario</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleLogin" class="q-gutter-md">

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
            label-color="grey-4" type="password" label="Contraseña" clearable :rules="[
              val => (val && val.length > 0) || 'La contraseña es requerida',
              val => val.length >= 6 || 'Mínimo 6 caracteres'
            ]">
            <template v-slot:prepend>
              <q-icon name="lock" color="white" />
            </template>
          </q-input>


          <div class="row justify-center q-mt-sm">
            <router-link to="/passwordrecover" class="text-grey-4 text-weight-medium text-caption">
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>

          <q-btn label="ACCEDER" type="submit" color="primary" text-color="black" size="lg" class="full-width q-mt-xl"
            rounded :loading="loading" :disable="loading">
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" color="black" />
              Verificando...
            </template>
          </q-btn>

        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-lg">
        <p class="text-grey-4 q-mb-xs text-body2">
          ¿No tienes cuenta?
          <router-link to="/register" class="text-primary text-weight-medium">Regístrate ahora</router-link>
        </p>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const email = ref('');
const password = ref('');
const loading = ref(false);

const router = useRouter();
const $q = useQuasar();

const handleLogin = async () => {
  loading.value = true;

  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('role', 'user');

      $q.notify({
        type: 'positive',
        message: '¡Acceso exitoso! Redirigiendo al Panel.',
        position: 'top',
        icon: 'check_circle',
        timeout: 2500
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } else {
      throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
    }

  } catch (error) {
    const errorMessage = error.message || 'Error de conexión con el servidor.';

    $q.notify({
      type: 'negative',
      message: `Acceso fallido: ${errorMessage}`,
      position: 'top',
      icon: 'warning'
    });

  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Los estilos Glassmorphism se mantienen sin cambios ya que son independientes del color de tu tema */
.glass-card {
  position: relative;
  /* Necesario para posicionar el avatar */
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