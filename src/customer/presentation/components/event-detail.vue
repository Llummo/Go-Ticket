<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import ClientLayout from "../../../shared/presentation/components/client-layout.vue";

const route = useRoute();
const router = useRouter();
const eventId = route.params.id;
const loggedUserId = ref(localStorage.getItem('user_id'));

const event = ref(null);
const posts = ref([]);
const loading = ref(true);

const newPost = ref({ content: '', image_url: '', rating: 5 });
const uploadingImage = ref(false);
const imageFile = ref(null);
const imagePreview = ref(null);

const loadData = async () => {
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    const [resEvents, resPosts] = await Promise.all([
      axios.get(`${baseApi}/events`),
      axios.get(`${baseApi}/events/${eventId}/posts`)
    ]);

    event.value = resEvents.data.find(e => e.id_event === eventId);
    posts.value = resPosts.data;
  } catch (error) {
    console.error("Error cargando detalles:", error);
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const submitPost = async () => {
  if (!newPost.value.content.trim()) return;
  try {
    uploadingImage.value = true;
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    let finalImageUrl = null;

    if (imageFile.value) {
      const formData = new FormData();
      formData.append('image', imageFile.value);
      const uploadRes = await axios.post(`${baseApi}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      finalImageUrl = `http://localhost:3000${uploadRes.data.url}`;
    }

    await axios.post(`${baseApi}/events/${eventId}/posts`, {
      content: newPost.value.content,
      rating: newPost.value.rating,
      image_url: finalImageUrl
    });

    newPost.value = { content: '', image_url: '', rating: 5 };
    imageFile.value = null;
    imagePreview.value = null;
    await loadData();
  } catch (e) {
    alert("Hubo un problema al subir tu publicación.");
  } finally {
    uploadingImage.value = false;
  }
};

const toggleLike = async (post) => {
  if (!loggedUserId.value) return router.push('/login');
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    const res = await axios.post(`${baseApi}/posts/${post._id}/like`);
    
    if (res.data.isLiked) {
      if (!post.likes) post.likes = [];
      post.likes.push(loggedUserId.value);
    }
  } catch (e) {
    console.error("Error al dar like");
  }
};

const isLikedByMe = (post) => {
  return post.likes && post.likes.includes(loggedUserId.value);
};

const goToTickets = () => router.push(`/tickets/buy/${eventId}`);
const goToProfile = (userId) => router.push(`/profile/${userId}`);

onMounted(loadData);
</script>

<template>
  <ClientLayout>
    <div class="event-detail-container" v-if="!loading && event">
      <div class="event-hero">
        <div class="hero-image" :style="{ backgroundImage: `url(${event.image_url})` }">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <span class="category-badge">{{ event.category_name }}</span>
            <h1>{{ event.event_title }}</h1>
            <div class="hero-meta">
              <span><i class="pi pi-map-marker"></i> {{ event.venue_name }}</span>
              <span><i class="pi pi-calendar"></i> {{ new Date(event.start_date).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
        <div class="action-bar">
          <div class="description-block">
            <h3>Acerca del evento</h3>
            <p>{{ event.description }}</p>
          </div>
          <button class="btn-buy" @click="goToTickets">Comprar Asientos <i class="pi pi-arrow-right"></i></button>
        </div>
      </div>

      <div class="social-board">
        <h2>Comunidad y Reseñas</h2>
        
        <div class="create-post-card" v-if="loggedUserId">
          <textarea v-model="newPost.content" placeholder="¿Qué opinas sobre este evento? Únete a la conversación..." rows="3"></textarea>
          <div v-if="imagePreview" class="image-preview-container">
            <img :src="imagePreview" alt="Previsualización" />
            <button class="remove-img-btn" @click="imageFile = null; imagePreview = null"><i class="pi pi-times"></i></button>
          </div>
          <div class="post-controls">
            <div class="left-controls">
              <label class="upload-btn">
                <i class="pi pi-image"></i> Agregar Foto
                <input type="file" accept="image/*" @change="handleFileChange" hidden />
              </label>
              <div class="rating-selector">
                <i class="pi pi-star-fill text-yellow"></i>
                <select v-model="newPost.rating">
                  <option :value="5">5</option><option :value="4">4</option><option :value="3">3</option><option :value="2">2</option><option :value="1">1</option>
                </select>
              </div>
            </div>
            <button class="btn-publish" @click="submitPost" :disabled="!newPost.content.trim() || uploadingImage">
              {{ uploadingImage ? 'Subiendo...' : 'Publicar' }}
            </button>
          </div>
        </div>
        <div v-else class="empty-feed" style="margin-bottom:20px;">Inicia sesión para compartir tu experiencia.</div>

        <div class="posts-list">
          <div v-if="posts.length === 0" class="empty-feed">Aún no hay comentarios. ¡Sé el primero en publicar!</div>
          <div v-for="post in posts" :key="post._id" class="post-card">
            <div class="post-header">
              <img :src="post.id_user.avatar" alt="Avatar" class="post-avatar" @click="goToProfile(post.id_user._id)" />
              <div class="post-author-info" @click="goToProfile(post.id_user._id)">
                <strong>{{ post.id_user.name }}</strong>
                <span class="post-date">{{ new Date(post.created_at).toLocaleString() }}</span>
              </div>
              <div class="post-rating" v-if="post.rating"><i class="pi pi-star-fill text-yellow"></i> {{ post.rating }}/5</div>
            </div>
            <p class="post-body">{{ post.content }}</p>
            <div v-if="post.image_url" class="post-image-wrapper"><img :src="post.image_url" alt="Imagen del post" /></div>
            
            <div class="post-footer">
              <button class="like-btn" :class="{ 'liked': isLikedByMe(post) }" @click="toggleLike(post)">
                <i :class="isLikedByMe(post) ? 'pi pi-heart-fill' : 'pi pi-heart'"></i>
                <span>{{ post.likes ? post.likes.length : 0 }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading-state"><i class="pi pi-spin pi-spinner"></i><p>Cargando información del evento...</p></div>
  </ClientLayout>
</template>

<style scoped>
.event-detail-container { max-width: 900px; margin: 0 auto; padding-bottom: 50px; }
.event-hero { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-bottom: 40px; border: 1px solid #e5e7eb; }
.hero-image { position: relative; height: 350px; background-size: cover; background-position: center; display: flex; align-items: flex-end; }
.hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.2) 100%); }
.hero-content { position: relative; z-index: 10; padding: 30px; color: white; width: 100%; }
.category-badge { background: var(--gt-yellow); color: var(--gt-dark); padding: 6px 12px; border-radius: 6px; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 15px; display: inline-block; }
.hero-content h1 { font-size: 2.5rem; font-weight: 900; margin: 0 0 15px 0; line-height: 1.2; }
.hero-meta { display: flex; gap: 20px; font-size: 1.05rem; font-weight: 600; color: #cbd5e1; }
.hero-meta i { color: var(--gt-yellow); }
.action-bar { padding: 30px; display: flex; justify-content: space-between; align-items: center; gap: 40px; background: white; }
.description-block h3 { margin: 0 0 10px 0; color: #111827; font-size: 1.2rem; }
.description-block p { margin: 0; color: #4b5563; line-height: 1.6; }
.btn-buy { background: var(--gt-red); color: white; padding: 16px 32px; border: none; border-radius: 12px; font-weight: 800; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; white-space: nowrap; }
.btn-buy:hover { background: var(--gt-red-hover); transform: translateY(-3px); box-shadow: 0 10px 20px rgba(225,29,72,0.3); }

.social-board h2 { font-size: 1.8rem; color: #111827; margin-bottom: 25px; }
.create-post-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }

/* CORRECCIÓN TEXTAREA */
.create-post-card textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 12px; padding: 15px; font-size: 1.05rem; resize: vertical; outline: none; margin-bottom: 15px; background: #f8fafc; color: #111827; }

.create-post-card textarea:focus { border-color: #0d9488; background: white; }
.image-preview-container { position: relative; display: inline-block; margin-bottom: 15px; }
.image-preview-container img { max-height: 150px; border-radius: 10px; border: 1px solid #e5e7eb; }
.remove-img-btn { position: absolute; top: -10px; right: -10px; background: var(--gt-red); color: white; border: none; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.post-controls { display: flex; justify-content: space-between; align-items: center; }
.left-controls { display: flex; gap: 15px; align-items: center; }
.upload-btn { display: flex; align-items: center; gap: 8px; color: #0d9488; font-weight: 700; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: 0.2s; }
.upload-btn:hover { background: #f0fdfa; }
.rating-selector { display: flex; align-items: center; gap: 5px; background: #fffbeb; padding: 6px 12px; border-radius: 8px; border: 1px solid #fde68a; }
.rating-selector select { border: none; background: transparent; font-weight: 700; color: #92400e; outline: none; cursor: pointer; }
.btn-publish { background: #0d9488; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-publish:hover:not(:disabled) { background: #0f766e; }
.btn-publish:disabled { opacity: 0.6; cursor: not-allowed; }
.posts-list { display: flex; flex-direction: column; gap: 20px; }
.post-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.post-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
.post-avatar { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; cursor: pointer; }
.post-author-info { display: flex; flex-direction: column; cursor: pointer; flex: 1; }
.post-author-info strong { color: #111827; font-size: 1.05rem; }
.post-date { color: #6b7280; font-size: 0.85rem; margin-top: 2px; }
.post-rating { background: #fffbeb; color: #92400e; font-weight: 700; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; }
.post-body { color: #374151; font-size: 1.05rem; line-height: 1.6; margin: 0 0 15px 0; }
.post-image-wrapper img { max-width: 100%; border-radius: 12px; border: 1px solid #e5e7eb; max-height: 400px; object-fit: cover; }
.text-yellow { color: var(--gt-yellow); }
.loading-state { text-align: center; padding: 100px 20px; color: #6b7280; font-size: 1.2rem; }
.loading-state i { font-size: 3rem; margin-bottom: 15px; }
.empty-feed { text-align: center; padding: 40px; background: white; border-radius: 16px; border: 1px dashed #cbd5e1; color: #64748b; font-weight: 600; }
.post-footer { margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
.like-btn { background: transparent; border: none; display: flex; align-items: center; gap: 8px; color: #64748b; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 1.05rem; }
.like-btn:hover { color: var(--gt-red); }
.like-btn.liked { color: var(--gt-red); }
@media (max-width: 768px) { .action-bar { flex-direction: column; text-align: center; gap: 20px; } .btn-buy { width: 100%; justify-content: center; } .post-controls { flex-direction: column; align-items: stretch; gap: 15px; } .left-controls { justify-content: space-between; } }
</style>