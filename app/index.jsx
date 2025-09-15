// import { useState } from 'react';
// import { SafeAreaView, StyleSheet, Text, FlatList } from 'react-native';
// import TaskItem from '../src/components/TaskItem';
// import { dummyTasks } from '../src/data/dummyTasks';
// export default function HomeScreen() {
// const [tasks, setTasks] = useState(dummyTasks);
// const handleToggle = (task) => {
// setTasks(prev =>
// prev.map(t => t.id === task.id
// ? { ...t, status: t.status === 'done' ? 'pending' : 'done' }
// : t
// )
// );
// };
// return (
// <SafeAreaView style={styles.container}>
// <Text style={styles.header}>TaskMate – Daftar Tugas</Text>
// <FlatList
// data={tasks}
// keyExtractor={(item) => item.id}
// contentContainerStyle={{ padding: 16 }}
// renderItem={({ item }) => <TaskItem task={item} onToggle={handleToggle} />}
// />
// </SafeAreaView>
// );
// }
// const styles = StyleSheet.create({
// container: { flex: 1, backgroundColor: '#f8fafc' },
// header: { fontSize: 20, fontWeight: '700', padding: 16 },
// });

// Import hook dari React
import { useState, useEffect, useMemo } from 'react';
// Import komponen dari React Native
import { SafeAreaView, StyleSheet, Text, FlatList, View, TouchableOpacity } from 'react-native';
// Import komponen custom TaskItem
import TaskItem from '../src/components/TaskItem';
// Import helper untuk interaksi dengan AsyncStorage
import { loadTasks, saveTasks } from '../src/storage/taskStorage';

export default function HomeScreen() {
  // State untuk menyimpan daftar tugas, diawali dengan array kosong
  const [tasks, setTasks] = useState([]);
  // State untuk melacak filter yang aktif ('all', 'todo', 'done')
  const [activeFilter, setActiveFilter] = useState('all');

  // useEffect: Dijalankan sekali saat komponen pertama kali dimuat
  useEffect(() => {
    // Fungsi async untuk memuat data dari storage
    const fetchData = async () => {
      const data = await loadTasks();
      setTasks(data); // Simpan data ke state
    };
    fetchData();
  }, []); // Dependensi kosong [] berarti hanya dijalankan sekali

  // Fungsi untuk mengubah status tugas (pending <-> done)
  const handleToggle = async (task) => {
    const updatedTasks = tasks.map(t =>
      t.id === task.id
        ? { ...t, status: t.status === 'done' ? 'pending' : 'done' }
        : t
    );
    setTasks(updatedTasks); // Update state di UI
    await saveTasks(updatedTasks); // Simpan perubahan ke AsyncStorage
  };

  // Fungsi untuk menghapus tugas
  const handleDelete = async (task) => {
    const updatedTasks = tasks.filter((t) => t.id !== task.id);
    setTasks(updatedTasks); // Update state di UI
    await saveTasks(updatedTasks); // Simpan perubahan ke AsyncStorage
  };

  // Memoize daftar tugas yang sudah difilter untuk optimasi
  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') {
      return tasks;
    }
    const statusToFilter = activeFilter === 'done' ? 'done' : 'pending';
    return tasks.filter(task => task.status === statusToFilter);
  }, [tasks, activeFilter]); // Dijalankan ulang hanya jika tasks atau activeFilter berubah

  // Komponen kecil untuk tombol filter
  const FilterButton = ({ title, filter }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton,
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.activeFilterButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>TaskMate – Daftar Tugas</Text>

      {/* Kontainer untuk tombol Filter */}
      <View style={styles.filterContainer}>
        <FilterButton title="All" filter="all" />
        <FilterButton title="Todo" filter="todo" />
        <FilterButton title="Done" filter="done" />
      </View>

      {/* Daftar Tugas */}
      <FlatList
        data={filteredTasks} // Menampilkan data yang sudah difilter
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete} // Prop onDelete ditambahkan di sini
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada tugas dalam kategori ini</Text>}
      />
    </SafeAreaView>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    color: '#0f172a',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#1e293b',
  },
  filterButtonText: {
    color: '#334155',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#f8fafc',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748b',
    fontSize: 16,
  },
});