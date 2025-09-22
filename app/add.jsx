import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert,
  Platform, ScrollView, KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { loadTasks, saveTasks } from '../src/storage/taskStorage';
import { loadCategories, saveCategories } from '../src/storage/categoryStorage'; 
import { pickColor } from '../src/constants/categories';
import { Picker } from '@react-native-picker/picker';
import AddCategoryModal from '../src/components/AddCategoryModal';
import { PRIORITIES } from '../src/constants/priorities';

export default function AddTaskScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState(''); 
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('Umum');
  const [showCatModal, setShowCatModal] = useState(false);
  const [priority, setPriority] = useState('Low');

  useEffect(() => {
    const fetchCategories = async () => {
      const loadedCategories = await loadCategories();
      setCategories(loadedCategories);
    };
    fetchCategories();
  }, []);

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Gagal', 'Judul tugas tidak boleh kosong!');
      return;
    }

    try {
      const existingTasks = await loadTasks();
      const newTask = {
        id: uuidv4(),
        title: title.trim(),
        description: desc.trim(),
        deadline: deadline.trim(),
        category,
        priority,
        status: 'pending',
        // [TAMBAHAN] Tambahkan progress default
        progress: 0, 
      };
      await saveTasks([...existingTasks, newTask]);
      
      // [TAMBAHAN] Reset form setelah berhasil menyimpan
      setTitle('');
      setDesc('');
      setDeadline('');
      setCategory('Umum');
      setPriority('Low');

      router.replace('/');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menyimpan tugas.');
    }
  };

  const onSubmitCategory = async ({ key, color }) => {
    const trimmedKey = key.trim();
    if (categories.some(c => c.key.toLowerCase() === trimmedKey.toLowerCase())) {
      Alert.alert('Info', 'Kategori sudah ada.');
      setShowCatModal(false);
      return;
    }
    const newCategory = { key: trimmedKey, color: color || pickColor(categories.length) };
    const nextCategories = [...categories, newCategory];
    setCategories(nextCategories);
    await saveCategories(nextCategories);
    setCategory(trimmedKey);
    setShowCatModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Tambah Tugas Baru</Text>

        <Text style={styles.label}>Judul Tugas</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Contoh: Belajar Component" />

        <Text style={styles.label}>Deskripsi (Opsional)</Text>
        <TextInput style={[styles.input, styles.textArea]} value={desc} onChangeText={setDesc} placeholder="Detail singkat mengenai tugas..." multiline />
        
        <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={deadline} onChangeText={setDeadline} placeholder="Contoh: 2025-12-31" />

        <Text style={styles.label}>Kategori</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={category} onValueChange={(itemValue) => {
            if (itemValue === '__ADD__') {
              setShowCatModal(true);
            } else {
              setCategory(itemValue);
            }
          }}>
            {categories.map(cat => <Picker.Item key={cat.key} label={cat.key} value={cat.key} />)}
            <Picker.Item label="＋ Tambah Kategori Baru..." value="__ADD__" style={{ color: '#0ea5e9' }} />
          </Picker>
        </View>

        <Text style={styles.label}>Prioritas</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={priority} onValueChange={setPriority}>
            {PRIORITIES.map(p => <Picker.Item key={p} label={p} value={p} />)}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Simpan Tugas" onPress={handleAddTask} />
        </View>
      </ScrollView>

      <AddCategoryModal
        visible={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSubmit={onSubmitCategory}
        suggestedColor={pickColor(categories.length)}
      />
    </KeyboardAvoidingView>
  );
}

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
    textAlignVertical: 'top',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 48,
  }
});