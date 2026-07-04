<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const isLoggedIn = ref(false);
const userId = ref(null);

const searchQuery = ref('');
const searchResults = ref([]);

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('token');
  userId.value = localStorage.getItem('user_id');
});

const handleSearch = async () => {
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = [];
    return;
  }
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    const res = await axios.get(`${baseApi}/users/search?q=${searchQuery.value}`);
    searchResults.value = res.data;
  } catch (error) {
    console.error("Error buscando usuarios", error);
  }
};

const goToProfile = (id) => {
  searchResults.value = [];
  searchQuery.value = '';
  router.push(`/profile/${id}`);
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_name');
  isLoggedIn.value = false;
  router.push('/');
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
          <button @click="router.push('/')" class="nav-btn"><i class="pi pi-compass"></i> Cartelera</button>
          <button v-if="isLoggedIn" @click="router.push('/tickets')" class="nav-btn"><i class="pi pi-ticket"></i> Mis Entradas</button>
        </nav>

        <!-- BUSCADOR DE USUARIOS -->
        <div class="search-container" v-if="isLoggedIn">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Buscar usuarios..." class="social-search" />
          </span>
          <div class="search-dropdown" v-if="searchResults.length > 0">
            <div v-for="user in searchResults" :key="user._id" class="search-item" @click="goToProfile(user._id)">
              <img :src="user.avatar" alt="Avatar" />
              <div class="user-info">
                <strong>{{ user.name }}</strong>
                <span>@{{ user.username }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="nav-actions">
          <button v-if="!isLoggedIn" class="login-btn" @click="router.push('/login')">
            <i class="pi pi-user"></i> Iniciar Sesión
          </button>
          <div v-else class="user-actions">
            <button class="nav-btn" @click="goToProfile(userId)">
              <i class="pi pi-user"></i> Mi Perfil
            </button>
            <button class="logout-btn" @click="logout" title="Cerrar Sesión">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
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
.navbar { background: var(--gt-dark); position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-bottom: 2px solid var(--gt-red); }
.nav-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; height: 75px; display: flex; justify-content: space-between; align-items: center; }
.logo { display: flex; align-items: center; cursor: pointer; height: 100%; padding: 10px 0;}
.logo-img { height: 45px; object-fit: contain; }
.nav-links { display: flex; gap: 10px; }
.nav-btn { background: transparent; border: none; font-size: 1rem; font-weight: 600; color: var(--gt-white); cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; transition: 0.3s; }
.nav-btn:hover { background: var(--gt-dark-surface); color: var(--gt-yellow); }
.nav-actions { display: flex; align-items: center; gap: 15px; }
.user-actions { display: flex; align-items: center; gap: 15px; }

/* BÚSQUEDA SOCIAL */
.search-container { position: relative; width: 300px; }
.social-search { width: 100%; padding: 10px 10px 10px 35px; border-radius: 20px; border: 1px solid #334155; background: #1e293b; color: white; outline: none; }
.social-search:focus { border-color: var(--gt-red); }
.search-dropdown { position: absolute; top: 45px; left: 0; width: 100%; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; z-index: 200; }
.search-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; cursor: pointer; transition: 0.2s; border-bottom: 1px solid #f1f5f9; }
.search-item:hover { background: #f8fafc; }
.search-item img { width: 35px; height: 35px; border-radius: 50%; object-fit: cover; }
.user-info { display: flex; flex-direction: column; }
.user-info strong { font-size: 0.9rem; color: #0f172a; }
.user-info span { font-size: 0.8rem; color: #64748b; }

.login-btn { background: var(--gt-red); color: var(--gt-white); border: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px; }
.login-btn:hover { background: var(--gt-red-hover); transform: translateY(-2px); }
.logout-btn { background: transparent; color: var(--gt-white); border: 1px solid var(--gt-text-muted); width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
.logout-btn:hover { background: var(--gt-red); color: white; border-color: var(--gt-red); }
.main-content { padding: 40px 20px; }
</style>