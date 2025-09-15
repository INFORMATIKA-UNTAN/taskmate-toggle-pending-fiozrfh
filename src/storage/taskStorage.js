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