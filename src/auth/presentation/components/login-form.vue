<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const password = ref('');
const role = ref('cliente');

const loading = ref(false);
const error = ref(null);

const handleLogin = () => {
  loading.value = true;
  error.value = null;

  setTimeout(() => {

    //LOGIN ADMIN
    if (
        role.value === 'admin' &&
        email.value === 'admin@test.com' &&
        password.value === '1234'
    ) {
      localStorage.setItem('token', 'admin-token');
      localStorage.setItem('role', 'admin');
      router.push('/admin');
    }

    //LOGIN CLIENTE
    else if (
        role.value === 'cliente' &&
        email.value === 'cliente@test.com' &&
        password.value === '1234'
    ) {
      localStorage.setItem('token', 'cliente-token');
      localStorage.setItem('role', 'cliente');
      router.push('/');
    }

    else {
      error.value = 'Credenciales incorrectas';
    }

    loading.value = false;
  }, 1000);
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    const roleSaved = localStorage.getItem('role');

    if (roleSaved === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  }
});
</script>
<template>
  <div class="login-wrapper">
    <div class="login-hero">
      <div class="hero-content">
        <div class="hero-logo">GT</div>

        <h1>GoTicket</h1>

        <p>
          Compra entradas para conciertos, festivales y eventos
          en segundos.
        </p>

        <div class="hero-features">
          <div>
            <i class="pi pi-ticket"></i>
            Compra rápida
          </div>

          <div>
            <i class="pi pi-shield"></i>
            Pago seguro
          </div>

          <div>
            <i class="pi pi-bolt"></i>
            Acceso inmediato
          </div>
        </div>
      </div>
    </div>
    <div class="login-card">
      <h1 class="title">GoTicket</h1>
      <p class="subtitle">
        {{ role === 'admin' ? 'Panel de administración' : 'Acceso de cliente' }}
      </p>

      <form @submit.prevent="handleLogin">

        <!--  SELECTOR DE ROL -->
        <div class="role-selector">
          <button type="button" :class="{ active: role === 'admin' }" @click="role = 'admin'">
            Admin
          </button>

          <button type="button" :class="{ active: role === 'cliente' }" @click="role = 'cliente'">
            Cliente
          </button>
        </div>

        <div class="input-group">
          <label>Correo</label>
          <input v-model="email" type="email" placeholder="correo@test.com" required />
        </div>

        <div class="input-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="********" required />
        </div>

        <button class="btn" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>

        <p v-if="error" class="error">
          {{ error }}
        </p>

      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background: var(--gt-dark);
}

@media (max-width: 900px) {
  .login-wrapper {
    grid-template-columns: 1fr;
  }
}

.login-card {
  background: white;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 60px;

  max-width: 500px;
  width: 100%;
  margin: auto;
}

.title { font-size: 32px; font-weight: 800; margin-bottom: 5px; color: var(--gt-text-main); }
.subtitle { margin-bottom: 30px; color: var(--gt-text-muted); }

.role-selector {
  display: flex; margin-bottom: 25px; background: var(--gt-light);
  border-radius: 8px; padding: 4px; border: 1px solid #E5E7EB;
}

.role-selector button {
  flex: 1; padding: 10px; border: none; background: transparent;
  color: var(--gt-text-muted); cursor: pointer; transition: 0.3s; border-radius: 6px; font-weight: 600;
}

.role-selector button.active {
  background: var(--gt-white); color: var(--gt-red);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.input-group { text-align: left; margin-bottom: 20px; }
label { font-size: 14px; margin-bottom: 8px; display: block; color: var(--gt-text-main); font-weight: 600;}
input {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  color: #111827;
  background: white;

  font-size: 15px;

  transition: 0.25s;
}

input:hover {
  border-color: #94a3b8;
}

input::placeholder {
  color: #94a3b8;
}

input:focus {
  border-color: var(--gt-red);
  box-shadow: 0 0 0 4px rgba(225,29,72,0.12);
}

.btn {
  width: 100%; padding: 14px; margin-top: 15px; border-radius: 8px; border: none;
  background: var(--gt-red); color: white; font-weight: 700; cursor: pointer;
  transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;
}
.btn:hover { background: var(--gt-red-hover); transform: translateY(-2px); }
.error { color: var(--gt-red); margin-top: 15px; font-size: 14px; font-weight: 600; }

.login-hero {
  background:
      linear-gradient(
          135deg,
          rgba(15,23,42,0.95),
          rgba(30,41,59,0.92)
      ),
      url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1600');

  background-size: cover;
  background-position: center;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 60px;
}

.hero-content {
  max-width: 500px;
  color: white;
}

.hero-logo {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: var(--gt-red);

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 2rem;
  font-weight: 900;

  margin-bottom: 30px;
}

.hero-content h1 {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 1.2rem;
  line-height: 1.7;
  color: #cbd5e1;
}

.hero-features {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-features div {
  display: flex;
  align-items: center;
  gap: 14px;

  font-weight: 600;
}

.hero-features i {
  color: var(--gt-yellow);
  font-size: 1.2rem;
}
</style>