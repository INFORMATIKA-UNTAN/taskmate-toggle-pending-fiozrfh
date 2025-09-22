import { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { loadTasks } from '../src/storage/taskStorage';
import { loadCategories } from '../src/storage/categoryStorage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import React from 'react';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  // Gunakan useFocusEffect agar data selalu refresh saat tab ini dibuka
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const loadedTasks = await loadTasks();
        const loadedCategories = await loadCategories();
        setTasks(loadedTasks);
        setCategories(loadedCategories);
      };
      fetchData();
    }, [])
  );

  // Ringkasan dasar
  const { doneCount, inProgressCount, avgProgress } = useMemo(() => {
    if (!tasks.length) return { doneCount: 0, inProgressCount: 0, avgProgress: 0 };
    
    const done = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    const avg = Math.round(
      tasks.reduce((acc, t) => acc + (typeof t.progress === 'number' ? t.progress : 0), 0) / total
    );
    return { doneCount: done, inProgressCount: total - done, avgProgress: avg };
  }, [tasks]);

  // Data bar chart: Done vs In Progress
  const barData = useMemo(() => ({
    labels: ['Selesai', 'Belum Selesai'],
    datasets: [{ data: [doneCount, inProgressCount], colors: [(opacity = 1) => `#16a34a`, (opacity = 1) => `#f59e0b`] }]
  }), [doneCount, inProgressCount]);

  // Distribusi per kategori (PieChart)
  const pieData = useMemo(() => {
    const counts = new Map();
    for (const t of tasks) {
      const key = t.category ?? 'Umum';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const c of categories) if (!counts.has(c.key)) counts.set(c.key, 0);

    const colorOf = (key) => categories.find(c => c.key === key)?.color || '#64748b';

    const arr = [...counts.entries()]
      .filter(([name, value]) => value > 0) // Hanya tampilkan slice > 0
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        population: value,
        color: colorOf(name),
        legendFontColor: '#0f172a',
        legendFontSize: 12
      }));

    return arr.length > 0
      ? arr
      : [{ name: 'Belum ada data', population: 1, color: '#e2e8f0', legendFontColor: '#0f172a', legendFontSize: 12 }];
  }, [tasks, categories]);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
    propsForBackgroundLines: { strokeDasharray: '', stroke: '#e2e8f0' },
    barPercentage: 0.6,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 24 }}>
      <Text style={styles.header}>Ringkasan Progress</Text>

      <View style={styles.card}>
        <Text style={styles.kpiTitle}>Rata-rata Progress</Text>
        <Text style={styles.kpiValue}>{avgProgress}%</Text>
        <Text style={styles.kpiSub}>Dari seluruh task yang ada</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status Tugas</Text>
        <BarChart
          width={screenWidth - 64}
          height={220}
          data={barData}
          chartConfig={chartConfig}
          fromZero
          withCustomBarColorFromData
          flatColor
          showValuesOnTopOfBars
          style={{ borderRadius: 12, marginLeft: -12 }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribusi per Kategori</Text>
        <PieChart
          width={screenWidth - 32}
          height={220}
          data={pieData}
          accessor="population"
          chartConfig={chartConfig}
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
    padding: 16, gap: 4
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  kpiTitle: { fontSize: 14, fontWeight: '600', color: '#475569' },
  kpiValue: { fontSize: 32, fontWeight: '900', color: '#0f172a' },
  kpiSub: { fontSize: 12, color: '#64748b' },
});