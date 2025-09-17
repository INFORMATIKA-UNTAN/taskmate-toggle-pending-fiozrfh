// export const PRIORITY_META = [
//   { key: 'High', color: '#ef4444', weight: 3 }, // merah
//   { key: 'Medium', color: '#f59e0b', weight: 2 }, // kuning
//   { key: 'Low', color: '#64748b', weight: 1 }, // abu-abu
// ];

// // [BARU] Daftar label (untuk Picker/Chip)
// export const PRIORITIES = PRIORITY_META.map(p => p.key);

// // [BARU] Ambil warna prioritas
// export function colorOfPriority(name) {
//   const f = PRIORITY_META.find(p => p.key === name);
//   return f ? f.color : '#64748b';
// }

// // [BARU] Ambil bobot untuk sorting (High > Medium > Low)
// export function weightOfPriority(name) {
//   const f = PRIORITY_META.find(p => p.key === name);
//   return f ? f.weight : 1;
// }

// src/constants/priorities.js

export const PRIORITY_META = [
  // Tugas 1: Tambahkan properti bgColor
  { key: 'High', color: '#ef4444', weight: 3, bgColor: '#fee2e2' }, // merah muda
  { key: 'Medium', color: '#f59e0b', weight: 2, bgColor: '#fef3c7' }, // kuning muda
  { key: 'Low', color: '#64748b', weight: 1, bgColor: '#f1f5f9' }, // abu-abu muda
];

export const PRIORITIES = PRIORITY_META.map(p => p.key);

export function colorOfPriority(name) {
  const f = PRIORITY_META.find(p => p.key === name);
  return f ? f.color : '#64748b';
}

export function weightOfPriority(name) {
  const f = PRIORITY_META.find(p => p.key === name);
  return f ? f.weight : 1;
}

// Tugas 1: Fungsi baru untuk mendapatkan semua properti prioritas
export function metaOfPriority(name) {
  const fallback = { key: 'Low', color: '#64748b', weight: 1, bgColor: '#f1f5f9' };
  const f = PRIORITY_META.find(p => p.key === name);
  return f ? f : fallback;
}