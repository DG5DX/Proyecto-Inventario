<template>
  <div>
    <h1>Iniciar Sesión</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Correo Electrónico:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Entrar</button>
    </form>
    <p>¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

// Función que se llama al enviar el formulario
const handleLogin = async () => {
    try {
        // 1. Envía la petición al backend (Express)
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: email.value,
            password: password.value,
        });

        // 2. Almacena el token recibido (¡Clave para la autenticación!)
        const token = response.data.token;
        const role = response.data.role; // También almacenamos el rol
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);

        // 3. Redirige al usuario al dashboard
        router.push('/dashboard'); 

    } catch (error) {
        console.error('Error al iniciar sesión:', error.response.data.message);
        alert('Credenciales inválidas o error de servidor.');
    }
};
</script>

<style scoped>
</style>