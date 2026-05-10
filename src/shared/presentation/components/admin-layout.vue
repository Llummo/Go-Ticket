<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-home', route: '/admin' },
  { label: 'Eventos', icon: 'pi pi-calendar', route: '/events' },
  { label: 'Ventas', icon: 'pi pi-wallet', route: '/sales' }
];

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  router.push('/');
};
</script>

<template>
  <div class="layout">

    <aside class="sidebar">
      <div>
        <div class="logo">
          <div class="logo-icon">GT</div>
          <div>
            <h2>GoTicket</h2>
            <p>Administración</p>
          </div>
        </div>

        <nav class="menu">
          <button
              v-for="item in menuItems"
              :key="item.label"
              class="menu-item"
              :class="{ 'active': router.currentRoute.value.path === item.route }"
              @click="router.push(item.route)"
          >
            <i :class="item.icon"></i>
            {{ item.label }}
          </button>
        </nav>
      </div>

      <button class="logout" @click="logout">
        <i class="pi pi-sign-out"></i>
        Cerrar sesión
      </button>
    </aside>

    <main class="content">
      <slot />
    </main>

  </div>
</template>

<style scoped>
.layout { display: flex; min-height: 100vh; background: var(--gt-light); }
.sidebar {
  width: 260px; background: var(--gt-dark); padding: 24px; display: flex;
  flex-direction: column; justify-content: space-between; position: sticky; top: 0; height: 100vh;   border-right: 1px solid rgba(255,255,255,0.06);
}

.logo { display: flex; align-items: center; gap: 14px; margin-bottom: 40px; }
.logo-icon {
  width: 46px; height: 46px; border-radius: 12px; background: var(--gt-red);
  display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.2rem;
}
.logo h2 { color: var(--gt-white); font-size: 20px; margin: 0; font-weight: 800;}
.logo p { color: var(--gt-yellow); font-size: 13px; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;}

.menu { display: flex; flex-direction: column; gap: 12px; }
.menu-item {
  width: 100%; padding: 14px 16px; border: none; border-radius: 12px; background: transparent;
  color: #9CA3AF; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; font-size: 15px; font-weight: 600;
}
.menu-item:hover {
  background: rgba(255,255,255,0.08);
  transform: translateX(4px);
}
.menu-item.active { background: var(--gt-red); color: var(--gt-white); box-shadow: 0 4px 10px rgba(227, 24, 55, 0.3); }

.logout {
  width: 100%; padding: 14px; border: 1px solid #4B5563; border-radius: 12px; background: transparent;
  color: var(--gt-white); cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 10px; transition: 0.3s; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
}
.logout:hover { background: var(--gt-red); border-color: var(--gt-red); }

.content { flex: 1; padding: 35px; overflow-y: auto; }
</style>