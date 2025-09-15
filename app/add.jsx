// Import React hook
import { useState } from 'react';
// Komponen UI bawaan dari React Native
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
// Import helper untuk menyimpan dan memuat data dari AsyncStorage
import { loadTasks, saveTasks } from '../src/storage/taskStorage';
// Import UUID untuk generate ID unik
import 'react-native-get-random-values'; // Diperlukan untuk uuid
import { v4 as uuidv4 } from 'uuid';
// Import Expo Router untuk navigasi
import { useRouter } from 'expo-router';

export default function AddTaskScreen() {
  const router = useRouter(); // Hook untuk navigasi
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Fungsi yang dijalankan saat tombol "Simpan Tugas" ditekan
  const handleAddTask = async () => {
    // Validasi: Judul tidak boleh kosong
    if (!title.trim()) {
      Alert.alert('Gagal', 'Judul tugas tidak boleh kosong!');
      return;
    }

    try {
      // 1. Muat tugas yang sudah ada dari AsyncStorage
      const existingTasks = await loadTasks();

      // 2. Buat objek tugas baru
      const newTask = {
        id: uuidv4(),
        title: title.trim(),
        description: desc.trim(),
        category: 'Umum', // Kategori default
        deadline: '2025-09-30', // Tanggal default
        status: 'pending',
      };

      // 3. Gabungkan tugas lama dengan tugas baru
      const updatedTasks = [...existingTasks, newTask];

      // 4. Simpan kembali semua tugas ke AsyncStorage
      await saveTasks(updatedTasks);

      // 5. Kembali ke halaman utama
      router.replace('/');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menyimpan tugas.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Tambah Tugas Baru</Text>

        <Text style={styles.label}>Judul Tugas</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Contoh: Belajar React Native"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Deskripsi (Opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={desc}
          onChangeText={setDesc}
          placeholder="Detail singkat mengenai tugas..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonContainer}>
          <Button title="Simpan Tugas" onPress={handleAddTask} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Stylesheet untuk halaman
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e293b',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Agar teks dimulai dari atas pada Android
  },
  buttonContainer: {
    marginTop: 24, // Memberi jarak antara input terakhir dan tombol
  }
});