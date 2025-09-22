import { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, Text, SectionList, StyleSheet, View, Button, Alert } from 'react-native';
import TaskItem from '../src/components/TaskItem';
import FilterToolbarFancy from '../src/components/FilterToolbarFancy';
import AddCategoryModal from '../src/components/AddCategoryModal';
import { loadTasks, saveTasks, clearTasks } from '../src/storage/taskStorage';
import { loadCategories, saveCategories } from '../src/storage/categoryStorage';
import { pickColor } from '../src/constants/categories';
import { weightOfPriority } from '../src/constants/priorities';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCatModal, setShowCatModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      setTasks(await loadTasks());
      setCategories(await loadCategories());
    };
    init();
  }, []);

  const handleToggle = async (task) => {
    let newStatus = task.status;
    switch (task.status) {
      case 'pending':
        newStatus = 'inprogress';
        break;
      case 'inprogress':
        newStatus = 'done';
        break;
      case 'done':
        newStatus = 'pending'; 
        break;
    }

    const updated = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
    setTasks(updated);
    await saveTasks(updated);
  };

  const handleDelete = async (task) => {
    Alert.alert('Konfirmasi Hapus', `Anda yakin ingin menghapus tugas "${task.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        const updated = tasks.filter(t => t.id !== task.id);
        setTasks(updated);
        await saveTasks(updated);
      }}
    ]);
  };

  const doneCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const overdueCount = useMemo(() =>
    tasks.filter(t => t.deadline && t.deadline < today && t.status !== 'done').length
  , [tasks, today]);

  const handleClearDone = () => {
    if (!doneCount) { Alert.alert('Info', 'Tidak ada tugas yang selesai.'); return; }
    Alert.alert('Hapus Tugas Selesai', `Yakin ingin menghapus ${doneCount} tugas yang sudah selesai?`, [
      { text:'Batal' }, { text:'Hapus', style:'destructive', onPress: async () => {
        const kept = tasks.filter(t => t.status !== 'done'); setTasks(kept); await saveTasks(kept);
      }}
    ]);
  };

  const handleClearAll = () => {
    if (!tasks.length) { Alert.alert('Info', 'Daftar tugas sudah kosong.'); return; }
    Alert.alert('Konfirmasi', 'Yakin ingin menghapus semua tugas? Aksi ini tidak dapat dibatalkan.', [
      { text:'Batal' }, { text:'Ya, Hapus Semua', style:'destructive', onPress: async () => { setTasks([]); await clearTasks(); } }
    ]);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const byStatus = (() => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'pending') return t.status === 'pending';
        if (statusFilter === 'inprogress') return t.status === 'inprogress';
        if (statusFilter === 'done') return t.status === 'done';
        return false;
      })();
      
      const byCategory = categoryFilter === 'all' || (t.category ?? 'Umum') === categoryFilter;
      const byPriority = priorityFilter === 'all' || (t.priority ?? 'Low') === priorityFilter;
      
      return byStatus && byCategory && byPriority;
    });
  }, [tasks, statusFilter, categoryFilter, priorityFilter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const wa = weightOfPriority(a.priority ?? 'Low');
      const wb = weightOfPriority(b.priority ?? 'Low');
      if (wa !== wb) return wb - wa;
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [filteredTasks]);
  
  const sections = useMemo(() => {
    const grouped = sortedTasks.reduce((acc, task) => {
      const category = task.category || 'Umum';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, {});
    
    if (categoryFilter !== 'all') {
      return grouped[categoryFilter] ? [{ title: categoryFilter, data: grouped[categoryFilter] }] : [];
    }

    return Object.keys(grouped).map(key => ({
      title: key,
      data: grouped[key],
    }));
  }, [sortedTasks, categoryFilter]);

  const handleSubmitCategory = async (cat) => {
    if (categories.some(c => c.key.toLowerCase() === cat.key.toLowerCase())) {
      Alert.alert('Info', 'Nama kategori sudah ada.');
      setShowCatModal(false);
      return;
    }
    const color = cat.color || pickColor(categories.length);
    const next = [...categories, { key: cat.key, color }];
    setCategories(next);
    await saveCategories(next);
    setCategoryFilter(cat.key);
    setShowCatModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>TaskMate – Daftar Tugas</Text>

      <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
        <FilterToolbarFancy
          categories={categories}
          categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
        />
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>Done: {doneCount} / {tasks.length}</Text>
          <Text style={[styles.toolbarText, { color: overdueCount ? '#dc2626' : '#334155' }]}>
            Overdue: {overdueCount}
          </Text>
          <View style={styles.actions}>
            <Button title="CLEAR DONE" onPress={handleClearDone} disabled={!doneCount} />
            <Button title="CLEAR ALL" onPress={handleClearAll} />
          </View>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem task={item} categories={categories} onToggle={handleToggle} onDelete={handleDelete} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada tugas yang cocok</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      />
      
      <AddCategoryModal
        visible={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSubmit={handleSubmitCategory}
        suggestedColor={pickColor(categories.length)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 20, fontWeight: '700', padding: 16, paddingBottom: 8 },
  sectionHeader: { 
    fontSize: 16, 
    fontWeight:'800', 
    color:'#0f172a', 
    marginTop: 12, 
    marginBottom: 8, 
    textTransform: 'uppercase',
    paddingHorizontal: 8
  },
  toolbar: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
    padding: 12, gap: 8
  },
  toolbarText: { fontWeight: '600', color: '#334155', fontSize: 13 },
  actions: { 
    flexDirection: 'row', 
    gap: 8, 
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 8,
    marginTop: 4
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748b'
  }
});