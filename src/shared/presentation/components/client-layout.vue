<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);

onMounted(() => {
  // Verificamos si existe una sesión activa
  isLoggedIn.value = !!localStorage.getItem('token');
});

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  isLoggedIn.value = false;
  router.push('/');
};

const goLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="client-view">
    <header class="navbar">
      <div class="nav-content">

        <div class="logo" @click="router.push('/')">
          <img src="../../../assets/logo.png" alt="GoTicket" class="logo-img" />
        </div>

        <nav class="nav-links">
          <button @click="router.push('/')" class="nav-btn">
            <i class="pi pi-compass"></i> Cartelera
          </button>
          <button v-if="isLoggedIn" @click="router.push('/tickets')" class="nav-btn">
            <i class="pi pi-ticket"></i> Mis Entradas
          </button>
        </nav>

        <div class="nav-actions">
          <button v-if="!isLoggedIn" class="login-btn" @click="goLogin">
            <i class="pi pi-user"></i> Iniciar Sesión
          </button>
          <button v-else class="logout-btn" @click="logout" title="Cerrar Sesión">
            <i class="pi pi-sign-out"></i>
          </button>
        </div>

      </div>
    </header>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.client-view { min-height: 100vh; background-color: var(--gt-light); }

.navbar {
  background: var(--gt-dark);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  border-bottom: 2px solid var(--gt-red);
}

.nav-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; height: 75px; display: flex; justify-content: space-between; align-items: center; }

.logo { display: flex; align-items: center; cursor: pointer; height: 100%; padding: 10px 0;}
.logo-img { height: 45px; object-fit: contain; } /* Ajusta la altura según tu imagen */

.nav-links { display: flex; gap: 20px; }
.nav-btn {
  background: transparent; border: none; font-size: 1rem; font-weight: 600;
  color: var(--gt-white); cursor: pointer; display: flex; align-items: center;
  gap: 8px; padding: 8px 16px; border-radius: 8px; transition: 0.3s;
}
.nav-btn:hover { background: var(--gt-dark-surface); color: var(--gt-yellow); }

.nav-actions { display: flex; align-items: center; }
.login-btn {
  background: var(--gt-red); color: var(--gt-white); border: none; padding: 10px 24px;
  border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center;
  gap: 8px; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px;
}
.login-btn:hover { background: var(--gt-red-hover); transform: translateY(-2px); }

.logout-btn {
  background: transparent; color: var(--gt-white); border: 1px solid var(--gt-text-muted);
  width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: 0.3s;
}
.logout-btn:hover { background: var(--gt-red); color: white; border-color: var(--gt-red); }

.main-content { padding: 40px 20px; }
</style>