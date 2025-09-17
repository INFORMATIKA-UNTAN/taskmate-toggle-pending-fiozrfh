// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { colorOfName } from '../constants/categories';
// import { colorOfPriority } from '../constants/priorities';
// import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

// export default function TaskItem({ task, categories, onToggle, onDelete }) {
//   const isDone = task.status === 'done';
//   // [UPDATE] Warna badge diambil dari util sesuai kategori & prioritas
//   const catColor = colorOfName(task.category ?? 'Umum', categories);
//   const prioColor = colorOfPriority(task.priority ?? 'Low');

//   // [OPSIONAL] progress 0-100 → jika tidak ada, tidak akan dirender
//   const pct = typeof task.progress === 'number' ? Math.max(0, Math.min(100, task.progress)) : null;

//   return (
//     <View style={[styles.card, isDone && styles.cardDone]}>
//       {/* [AKSI] Ketuk area utama untuk toggle status Done/Pending */}
//       <TouchableOpacity onPress={() => onToggle?.(task)} style={{ flex: 1 }} activeOpacity={0.8}>
//         <Text style={[styles.title, isDone && styles.strike]}>{task.title}</Text>

//         {!!task.deadline && <Text style={styles.deadline}>Deadline: {task.deadline}</Text>}
//         {!!task.description && <Text style={styles.desc}>{task.description}</Text>}

//         {/* [UPDATE] Badge untuk kategori & prioritas */}
//         <View style={styles.badgeContainer}>
//           <View style={[styles.badge, { borderColor: catColor, backgroundColor: `${catColor}20` }]}>
//             <Text style={[styles.badgeText, { color: catColor }]}>{task.category ?? 'Umum'}</Text>
//           </View>
//           <View style={[styles.badge, { borderColor: prioColor, backgroundColor: `${prioColor}20` }]}>
//             <Text style={[styles.badgeText, { color: prioColor }]}>{task.priority ?? 'Low'}</Text>
//           </View>
//         </View>

//         {/* [OPSIONAL] Progress bar tipis */}
//         {pct !== null && (
//           <View style={styles.progressWrap}>
//             <View style={[styles.progressBar, { width: `${pct}%` }]} />
//             <Text style={styles.progressText}>{pct}%</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* [AKSI] Tombol hapus task */}
//       <TouchableOpacity onPress={() => onDelete?.(task)} style={styles.deleteButton}>
//         <Ionicons name="trash-outline" size={22} color="#94a3b8" />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     padding: 14, borderRadius: 16, backgroundColor: '#fff', marginBottom: 12,
//     flexDirection: 'row', alignItems: 'flex-start', // Diubah ke flex-start
//     borderWidth: 1, borderColor: '#e2e8f0',
//     // [STYLE] Shadow lembut
//     shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
//     elevation: 2,
//   },
//   cardDone: { backgroundColor: '#f8fafc' },
//   title: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#0f172a' },
//   strike: { textDecorationLine: 'line-through', color: '#64748b' },
//   deadline: { fontSize: 12, color: '#334155', marginBottom: 4 },
//   desc: { color: '#475569' },
//   badgeContainer: { 
//     flexDirection: 'row', 
//     gap: 8, 
//     marginTop: 10 
//   },
//   badge: { 
//     alignSelf: 'flex-start', 
//     paddingVertical: 4, 
//     paddingHorizontal: 10, 
//     borderRadius: 999, 
//     borderWidth: 1 
//   },
//   badgeText: { 
//     fontSize: 12, 
//     fontWeight: '700' 
//   },
//   progressWrap: { 
//     marginTop: 12, 
//     height: 8, 
//     backgroundColor: '#e5e7eb', 
//     borderRadius: 999, 
//     overflow: 'hidden', 
//     position: 'relative' 
//   },
//   progressBar: { 
//     height: '100%', 
//     backgroundColor: '#0f172a' 
//   },
//   progressText: { 
//     position: 'absolute', 
//     right: 8, 
//     top: -18, 
//     fontSize: 12, 
//     color: '#334155', 
//     fontWeight: '600' 
//   },
//   deleteButton: {
//     padding: 4,
//     marginLeft: 8,
//   }
// });

// src/components/TaskItem.jsx

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colorOfName } from '../constants/categories';
import { metaOfPriority } from '../constants/priorities'; 
import { Ionicons } from '@expo/vector-icons';

function formatDeadline(deadline) {
  if (!deadline || deadline.length < 10) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = deadline.split('-');
  const deadlineDate = new Date(parts[0], parts[1] - 1, parts[2]);
  deadlineDate.setHours(0, 0, 0, 0);

  if (isNaN(deadlineDate)) return null;

  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: 'Overdue', color: '#ef4444' };
  }
  if (diffDays === 0) {
    return { text: 'Hari ini', color: '#f59e0b' };
  }
  return { text: `Sisa ${diffDays} hari`, color: '#64748b' };
}

// Helper untuk mendapatkan teks dan warna untuk badge status
const getStatusMeta = (status) => {
  switch (status) {
    case 'inprogress':
      return { text: 'In Progress', color: '#0ea5e9', bgColor: '#f0f9ff' }; // Biru
    case 'done':
      return { text: 'Done', color: '#16a34a', bgColor: '#f0fdf4' }; // Hijau
    case 'pending':
    default:
      return { text: 'Pending', color: '#f59e0b', bgColor: '#fefce8' }; // Kuning
  }
};

export default function TaskItem({ task, categories, onToggle, onDelete }) {
  const isDone = task.status === 'done';
  const catColor = colorOfName(task.category ?? 'Umum', categories);
  
  const prioMeta = metaOfPriority(task.priority ?? 'Low');
  const prioColor = prioMeta.color;

  const statusInfo = getStatusMeta(task.status);
  // Warna latar: jika done -> abu redup; jika inprogress -> biru; jika pending -> warna prioritas
  const cardBgColor = isDone ? '#f8fafc' : (task.status === 'inprogress' ? statusInfo.bgColor : prioMeta.bgColor);
  
  const pct = typeof task.progress === 'number' ? Math.max(0, Math.min(100, task.progress)) : null;

  const deadlineInfo = formatDeadline(task.deadline);

  return (
    <View style={[styles.card, { backgroundColor: cardBgColor }]}>
      <TouchableOpacity onPress={() => onToggle?.(task)} style={{ flex: 1 }} activeOpacity={0.8}>
        <Text style={[styles.title, isDone && styles.strike]}>{task.title}</Text>
        
        {deadlineInfo && !isDone && (
          <Text style={[styles.deadline, { color: deadlineInfo.color }]}>
            Deadline: {task.deadline} ({deadlineInfo.text})
          </Text>
        )}
        
        {!!task.description && <Text style={[styles.desc, {marginTop: deadlineInfo ? 4 : 0 }]}>{task.description}</Text>}

        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { borderColor: catColor, backgroundColor: `${catColor}20` }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>{task.category ?? 'Umum'}</Text>
          </View>
          <View style={[styles.badge, { borderColor: prioColor, backgroundColor: `${prioColor}20` }]}>
            <Text style={[styles.badgeText, { color: prioColor }]}>{task.priority ?? 'Low'}</Text>
          </View>
        </View>

        {pct !== null && (
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${pct}%` }]} />
            <Text style={styles.progressText}>{pct}%</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.rightContainer}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
          <Text style={[styles.badgeText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onDelete?.(task)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14, borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#0f172a' },
  strike: { textDecorationLine: 'line-through', color: '#64748b' },
  deadline: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  desc: { color: '#475569' },
  badgeContainer: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statusBadge: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rightContainer: {
    alignItems: 'center',
    marginLeft: 10,
    justifyContent: 'space-between',
    minHeight: 50,
  },
  deleteButton: { padding: 4, },
  progressWrap: { 
    marginTop: 12, height: 8, backgroundColor: '#e5e7eb', borderRadius: 999, 
    overflow: 'hidden', position: 'relative' 
  },
  progressBar: { height: '100%', backgroundColor: '#0f172a' },
  progressText: { 
    position: 'absolute', right: 8, top: -18, fontSize: 12, 
    color: '#334155', fontWeight: '600' 
  },
});