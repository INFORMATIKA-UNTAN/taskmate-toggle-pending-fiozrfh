// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// export default function TaskItem({ task, onToggle }) {
// const isDone = task.status === 'done';
// return (
// <TouchableOpacity onPress={() => onToggle?.(task)} activeOpacity={0.7}>
// <View style={[styles.card, isDone && styles.cardDone]}>
// <View style={{ flex: 1 }}>
// <Text style={[styles.title, isDone && styles.strike]}>{task.title}</Text>
// <Text style={styles.desc}>{task.description}</Text>
// <Text style={styles.meta}>{task.category} • Due {task.deadline}</Text>
// </View>
// <View style={[styles.badge, isDone ? styles.badgeDone : styles.badgePending]}>
// <Text style={styles.badgeText}>{isDone ? 'Done' : 'Todo'}</Text>
// </View>
// </View>
// </TouchableOpacity>
// );
// }
// const styles = StyleSheet.create({
// card: { padding: 14, borderRadius: 12, backgroundColor: '#fff', marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
// cardDone: { backgroundColor: '#f1f5f9' },
// title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
// strike: { textDecorationLine: 'line-through', color: '#64748b' },
// desc: { color: '#475569', marginBottom: 6 },
// meta: { fontSize: 12, color: '#64748b' },
// badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginLeft: 12 },
// badgePending: { backgroundColor: '#fee2e2' },
// badgeDone: { backgroundColor: '#dcfce7' },
// badgeText: { fontWeight: '700', fontSize: 12 },
// });

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Fungsi untuk menentukan warna badge berdasarkan kategori (dipertahankan)
const getCategoryStyle = (category) => {
  switch (category) {
    case 'Mobile':
      return { backgroundColor: '#e0f2fe', color: '#0ea5e9' }; // Biru Muda
    case 'RPL':
      return { backgroundColor: '#dcfce7', color: '#22c55e' }; // Hijau Muda
    case 'IoT':
      return { backgroundColor: '#ffedd5', color: '#f97316' }; // Oranye Muda
    default:
      return { backgroundColor: '#e2e8f0', color: '#475569' }; // Abu-abu (Umum)
  }
};

// Komponen TaskItem sekarang menerima prop onDelete
export default function TaskItem({ task, onToggle, onDelete }) {
  const isDone = task.status === 'done';
  // Menggunakan fallback 'Umum' jika kategori tidak ada
  const categoryName = task.category ?? 'Umum';
  const categoryStyle = getCategoryStyle(categoryName);

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      {/* Bagian utama yang bisa diklik untuk toggle status */}
      <TouchableOpacity onPress={() => onToggle?.(task)} style={{ flex: 1 }} activeOpacity={0.7}>
        <Text style={[styles.title, isDone && styles.strike]}>{task.title}</Text>
        
        {/* Deskripsi hanya ditampilkan jika ada isinya */}
        {!!task.description && (
          <Text style={styles.desc}>{task.description}</Text>
        )}

        <View style={styles.footer}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.backgroundColor }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.color }]}>{categoryName}</Text>
          </View>
          <Text style={styles.meta}>Due {task.deadline}</Text>
        </View>
      </TouchableOpacity>

      {/* Kontainer untuk bagian kanan (status dan tombol hapus) */}
      <View style={styles.rightContainer}>
        <View style={[styles.badge, isDone ? styles.badgeDone : styles.badgePending]}>
          <Text style={[styles.badgeText, isDone ? styles.badgeTextDone : styles.badgeTextPending]}>
            {isDone ? 'Done' : 'Todo'}
          </Text>
        </View>
        {/* Tombol Hapus */}
        <TouchableOpacity onPress={() => onDelete?.(task)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, backgroundColor: '#fff', marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  cardDone: { backgroundColor: '#f8fafc' },
  title: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  strike: { textDecorationLine: 'line-through', color: '#94a3b8' },
  desc: { color: '#475569', marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  meta: { fontSize: 12, color: '#64748b' },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4, // untuk wrap
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 12,
  },
  rightContainer: { // Style baru untuk kontainer kanan
    alignItems: 'center',
    marginLeft: 10,
  },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
  badgePending: { backgroundColor: '#fef2f2' },
  badgeDone: { backgroundColor: '#f0fdf4' },
  badgeText: { fontWeight: '700', fontSize: 12 },
  badgeTextPending: { color: '#ef4444' },
  badgeTextDone: { color: '#22c55e' },
  deleteButton: { // Style baru untuk tombol hapus
    marginTop: 8,
    padding: 4,
  },
  deleteButtonText: { // Style baru untuk ikon hapus
    fontSize: 20,
  },
});