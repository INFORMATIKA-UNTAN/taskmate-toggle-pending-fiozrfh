import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { colorOfName } from '../constants/categories';
import { colorOfPriority } from '../constants/priorities';
import { Ionicons } from '@expo/vector-icons';

// Fungsi helper untuk informasi deadline
function deadlineInfo(deadline) {
  if (!deadline) return { status: 'none', text: '' };

  // Normalisasi tanggal hari ini ke awal hari
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalisasi tanggal deadline ke awal hari
  const parts = deadline.split('-');
  const deadlineDate = new Date(parts[0], parts[1] - 1, parts[2]);
  deadlineDate.setHours(0, 0, 0, 0);

  if (isNaN(deadlineDate.getTime())) {
    return { status: 'none', text: '' };
  }

  const diffMs = deadlineDate - today;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return { status: 'overdue', text: 'Overdue' };
  if (days === 0) return { status: 'today', text: 'Jatuh tempo: Hari ini' };
  return { status: 'future', text: `Sisa ${days} hari` };
}

export default function TaskItem({ task, categories, onToggle, onDelete }) {
  const router = useRouter();
  const isDone = task.status === 'done';
  const catColor = colorOfName(task.category ?? 'Umum', categories);
  const prioColor = colorOfPriority(task.priority ?? 'Low');
  
  // Progress: fallback ke 0 jika undefined, lalu dibatasi 0–100
  const rawProgress = typeof task.progress === 'number' ? task.progress : 0;
  const pct = Math.max(0, Math.min(100, rawProgress));

  const info = deadlineInfo(task.deadline);

  // Tentukan warna latar kartu berdasarkan status deadline (jika belum selesai)
  const cardStyle = [styles.card, isDone && styles.cardDone];
  if (!isDone) {
    if (info.status === 'overdue') {
      cardStyle.push(styles.cardOverdue);
    } else if (info.status === 'future') {
      // Anda bisa menambahkan style untuk deadline 'mendekat' jika mau
      // cardStyle.push(styles.cardFuture); 
    }
  }

  return (
    <View style={cardStyle}>
      {/* Area utama yang bisa diklik untuk toggle status */}
      <TouchableOpacity onPress={() => onToggle?.(task)} style={{ flex: 1 }} activeOpacity={0.8}>
        <Text style={[styles.title, isDone && styles.strike]}>{task.title}</Text>

        {!!task.deadline && !isDone && (
          <Text style={[ styles.deadline, info.status === 'overdue' && styles.deadlineOverdue ]}>
            Deadline: {task.deadline} {info.text ? `• ${info.text}` : ''}
          </Text>
        )}

        {!!task.description && <Text style={styles.desc}>{task.description}</Text>}

        {/* Badge kategori & prioritas */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { borderColor: catColor, backgroundColor: `${catColor}20` }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>
              {task.category ?? 'Umum'}
            </Text>
          </View>
          <View style={[styles.badge, { borderColor: prioColor, backgroundColor: `${prioColor}20` }]}>
            <Text style={[styles.badgeText, { color: prioColor }]}>
              {task.priority ?? 'Low'}
            </Text>
          </View>
        </View>

        {/* Progress bar selalu tampil */}
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${pct}%` }]} />
          <Text style={styles.progressText}>{pct}%</Text>
        </View>
      </TouchableOpacity>

      {/* Aksi Edit & Hapus */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/edit/${task.id}`)}>
          <Ionicons name="pencil-outline" size={22} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onDelete?.(task)}>
          <Ionicons name="trash-outline" size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14, borderRadius: 16, backgroundColor: '#fff', marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardDone: { backgroundColor: '#f8fafc' },
  cardOverdue: { borderColor: '#fecaca', backgroundColor: '#fff1f2' },
  // cardFuture: { borderColor: '#fde68a', backgroundColor: '#fffbeb' }, // Opsional
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#0f172a' },
  strike: { textDecorationLine: 'line-through', color: '#64748b' },
  deadline: { fontSize: 12, color: '#334155', marginBottom: 4 },
  deadlineOverdue: { color: '#dc2626', fontWeight: '700' },
  desc: { color: '#475569' },
  badgeContainer: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: {
    alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 999, borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  progressWrap: {
    marginTop: 12, height: 10, backgroundColor: '#e5e7eb',
    borderRadius: 999, overflow: 'hidden', position: 'relative',
  },
  progressBar: { height: '100%', backgroundColor: '#2563eb' },
  progressText: {
    position: 'absolute', right: 8, top: -18, fontSize: 12,
    color: '#334155', fontWeight: '600',
  },
  actionsContainer: {
    marginLeft: 10,
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
  }
});