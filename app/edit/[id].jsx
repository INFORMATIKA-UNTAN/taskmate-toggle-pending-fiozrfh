import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// Pastikan semua jalur import ini sudah benar
import { getTaskById, updateTask } from '../../src/storage/taskStorage';
import { loadCategories } from '../../src/storage/categoryStorage';
import { PRIORITIES } from '../../src/constants/priorities';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

export default function EditTask() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [task, setTask] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Umum');
  const [priority, setPriority] = useState('Low');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const t = await getTaskById(id);
      const cats = await loadCategories();
      setCategories(cats);

      if (!t) {
        Alert.alert('Error', 'Task tidak ditemukan');
        router.back();
        return;
      }

      setTask(t);
      setTitle(t.title || '');
      setDesc(t.description || '');
      setDeadline(t.deadline || '');
      setCategory(t.category || 'Umum');
      setPriority(t.priority || 'Low');
      setProgress(typeof t.progress === 'number' ? t.progress : 0);
    })();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Judul wajib diisi!');
      return;
    }

    const patch = {
      title: title.trim(),
      description: desc.trim(),
      deadline: deadline.trim(),
      category,
      priority,
      progress: Math.round(progress)
    };

    const ok = await updateTask(id, patch);

    if (!ok) {
      Alert.alert('Error', 'Gagal menyimpan perubahan');
      return;
    }

    Alert.alert('Sukses', 'Perubahan berhasil disimpan.');
    router.replace('/');
  };

  if (!task) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Tugas</Text>

      <Text style={styles.label}>Judul</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Judul" />
      
      <Text style={styles.label}>Deskripsi</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={desc} onChangeText={setDesc} placeholder="Deskripsi" multiline />
      
      <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={deadline} onChangeText={setDeadline} placeholder="2025-09-30" />
      
      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          {categories.map(k => <Picker.Item key={k.key} label={k.key} value={k.key} />)}
        </Picker>
      </View>
      
      <Text style={styles.label}>Prioritas</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={priority} onValueChange={setPriority}>
          {PRIORITIES.map(p => <Picker.Item key={p} label={p} value={p} />)}
        </Picker>
      </View>
      
      <Text style={styles.label}>Progress: {Math.round(progress)}%</Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={progress}
        onValueChange={setProgress}
      />
      
      <View style={{marginTop: 16, marginBottom: 48}}>
        <Button title="Simpan Perubahan" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});