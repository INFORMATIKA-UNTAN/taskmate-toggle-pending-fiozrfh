// Import AsyncStorage dari library resmi
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key untuk menyimpan data di AsyncStorage
const STORAGE_KEY = 'TASKMATE_TASKS';

// Simpan array tugas ke AsyncStorage
export async function saveTasks(tasks) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Gagal menyimpan:', e);
  }
}

// Load array tugas dari AsyncStorage
export async function loadTasks() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : []; // jika kosong → array kosong
  } catch (e) {
    console.error('Gagal membaca:', e);
    return [];
  }
}

// [TAMBAHAN] Hapus semua task dari storage
export async function clearTasks() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Gagal menghapus semua task:', e);
  }
}

// [TAMBAHAN] Ambil 1 task berdasarkan id
export async function getTaskById(id) {
  try {
    const tasks = await loadTasks();
    return tasks.find(t => t.id === id) || null;
  } catch (e) {
    console.error('Gagal mengambil task by id:', e);
    return null;
  }
}

// [TAMBAHAN] Update task berdasarkan id (merge fields)
export async function updateTask(id, patch) {
  try {
    const tasks = await loadTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return false; // Gagal jika task tidak ditemukan

    // Gabungkan data lama dengan data baru (patch)
    const updatedTask = { ...tasks[idx], ...patch };
    tasks[idx] = updatedTask;

    await saveTasks(tasks);
    return true; // Berhasil
  } catch (e) {
    console.error('Gagal mengupdate task:', e);
    return false;
  }
}