<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import ClientLayout from "../../../shared/presentation/components/client-layout.vue";

const route = useRoute();
const router = useRouter();

const profile = ref(null);
const activity = ref([]);
const loading = ref(true);

const activeTab = ref('activity'); 

const loggedUserId = ref(localStorage.getItem('user_id'));

const isFollowing = computed(() => {
  if (!profile.value || !profile.value.followers) return false;
  return profile.value.followers.some(f => f._id === loggedUserId.value);
});

const loadProfile = async (id) => {
  loading.value = true;
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    const res = await axios.get(`${baseApi}/users/${id}/profile`);
    profile.value = res.data.profile;
    activity.value = res.data.activity;
  } catch (error) {
    console.error("Error cargando perfil", error);
  } finally {
    loading.value = false;
  }
};

const toggleFollow = async () => {
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    if (isFollowing.value) {
      await axios.post(`${baseApi}/users/${profile.value._id}/unfollow`);
    } else {
      await axios.post(`${baseApi}/users/${profile.value._id}/follow`);
    }
    const res = await axios.get(`${baseApi}/users/${profile.value._id}/profile`);
    profile.value = res.data.profile;
  } catch (error) {
    console.error("Error al cambiar estado de seguimiento", error);
  }
};

const goToProfile = (id) => {
  router.push(`/profile/${id}`);
};

onMounted(() => loadProfile(route.params.id));

watch(() => route.params.id, (newId) => {
  activeTab.value = 'activity';
  loadProfile(newId);
});
</script>

<template>
  <ClientLayout>
    <div class="profile-container">
      <div v-if="loading" class="text-center p-5 loading-box">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Cargando perfil...</p>
      </div>

      <div v-else-if="profile">
        
        <div class="profile-header">
          <img :src="profile.avatar" alt="Avatar" class="profile-avatar" />
          
          <div class="profile-info-wrapper">
            <div class="profile-info">
              <h1>{{ profile.name }}</h1>
              <span class="username">@{{ profile.username }}</span>
              <p class="bio">{{ profile.bio }}</p>
            </div>
            
            <div class="profile-actions" v-if="loggedUserId && loggedUserId !== profile._id">
              <button 
                class="btn-teal" 
                :class="{ 'outlined': isFollowing }"
                @click="toggleFollow"
              >
                <i :class="isFollowing ? 'pi pi-user-minus' : 'pi pi-user-plus'"></i>
                {{ isFollowing ? 'Dejar de seguir' : 'Seguir' }}
              </button>
            </div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-box" :class="{'active': activeTab === 'activity'}" @click="activeTab = 'activity'">
            <strong>{{ activity.length }}</strong>
            <span>Posts</span>
          </div>
          <div class="stat-box" :class="{'active': activeTab === 'followers'}" @click="activeTab = 'followers'">
            <strong>{{ profile.followers?.length || 0 }}</strong>
            <span>Seguidores</span>
          </div>
          <div class="stat-box" :class="{'active': activeTab === 'following'}" @click="activeTab = 'following'">
            <strong>{{ profile.following?.length || 0 }}</strong>
            <span>Seguidos</span>
          </div>
        </div>

        <div class="content-section">
          
          <div v-if="activeTab === 'activity'">
            <div v-if="activity.length === 0" class="empty-state">
              Este usuario aún no tiene publicaciones.
            </div>
            <div v-else class="post-feed">
              <div v-for="post in activity" :key="post._id" class="post-card">
                <div class="event-context">
                  <i class="pi pi-calendar"></i> {{ post.id_event?.event_title }}
                </div>
                <p class="post-content">"{{ post.content }}"</p>
                <div class="post-meta">
                  <span v-if="post.rating"><i class="pi pi-star-fill text-yellow"></i> {{ post.rating }}/5</span>
                  <span class="date">{{ new Date(post.created_at).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'followers'">
            <div v-if="!profile.followers || profile.followers.length === 0" class="empty-state">
              Aún no tiene seguidores.
            </div>
            <div v-else class="users-grid">
              <div v-for="user in profile.followers" :key="user._id" class="user-card" @click="goToProfile(user._id)">
                <img :src="user.avatar" alt="Avatar" />
                <div class="user-details">
                  <strong>{{ user.name }}</strong>
                  <span>@{{ user.username }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'following'">
            <div v-if="!profile.following || profile.following.length === 0" class="empty-state">
              No sigue a nadie todavía.
            </div>
            <div v-else class="users-grid">
              <div v-for="user in profile.following" :key="user._id" class="user-card" @click="goToProfile(user._id)">
                <img :src="user.avatar" alt="Avatar" />
                <div class="user-details">
                  <strong>{{ user.name }}</strong>
                  <span>@{{ user.username }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </ClientLayout>
</template>

<style scoped>
.profile-container { 
  max-width: 800px; 
  margin: 0 auto; 
}
.loading-box { color: #6b7280; }

.profile-header { 
  display: flex; 
  align-items: flex-start; 
  gap: 25px; 
  background: white; 
  padding: 30px; 
  border-radius: 16px 16px 0 0; 
  border: 1px solid #e5e7eb;
  border-bottom: none;
}
@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.profile-avatar { 
  width: 120px; 
  height: 120px; 
  border-radius: 50%; 
  border: 4px solid var(--gt-red); 
  object-fit: cover; 
}
.profile-info-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  gap: 20px;
}

.profile-info h1 { margin: 0; font-size: 2rem; color: var(--gt-text-main); }
.username { color: var(--gt-red); font-weight: 700; font-size: 1.1rem; }
.bio { margin-top: 10px; color: var(--gt-text-muted); line-height: 1.5; }

/* Botón Teal */
.btn-teal {
  background: #0d9488;
  color: white;
  border: 2px solid #0d9488;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}
.btn-teal:hover {
  background: #0f766e;
  border-color: #0f766e;
}
.btn-teal.outlined {
  background: transparent;
  color: #0d9488;
}
.btn-teal.outlined:hover {
  background: #f0fdfa;
}

/* Estadísticas y Tabs */
.stats-row {
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 16px 16px;
  margin-bottom: 30px;
  overflow: hidden;
}
.stat-box {
  flex: 1;
  text-align: center;
  padding: 15px;
  cursor: pointer;
  border-right: 1px solid #e5e7eb;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
}
.stat-box:last-child { border-right: none; }
.stat-box:hover { background: #f8fafc; }
.stat-box.active {
  background: #f0fdfa;
  border-bottom: 3px solid #0d9488;
}
.stat-box strong { font-size: 1.2rem; color: #111827; }
.stat-box span { font-size: 0.85rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-top: 4px; }

/* Sección de Contenido */
.content-section {
  min-height: 300px;
}

/* Feed de Posts */
.post-feed { display: flex; flex-direction: column; gap: 15px; }
.post-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; }
.event-context { font-size: 0.85rem; color: var(--gt-text-muted); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; }
.post-content { font-size: 1.1rem; color: #111827; font-style: italic; margin-bottom: 15px; }
.post-meta { display: flex; justify-content: space-between; font-size: 0.9rem; color: #6b7280; }
.text-yellow { color: var(--gt-yellow); }

/* Grid de Usuarios (Followers/Following) */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}
.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border-color: #0d9488;
}
.user-card img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}
.user-details {
  display: flex;
  flex-direction: column;
}
.user-details strong { color: #111827; font-size: 0.95rem; }
.user-details span { color: #6b7280; font-size: 0.85rem; }

.empty-state { text-align: center; padding: 40px; color: #9ca3af; background: white; border-radius: 12px; border: 1px dashed #e5e7eb; }
</style>