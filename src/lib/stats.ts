export const updateDashboardStats = (type: 'baca' | 'kuis', amount: number = 1) => {
    if (typeof window === 'undefined') return; // Mencegah error di Next.js SSR
  
    // Ambil data lama
    const saved = localStorage.getItem('user_stats');
    
    // PERBAIKAN: Gunakan const sesuai saran ESLint
    const stats = saved ? JSON.parse(saved) : { baca: 0, kuis: 0, target: 50 };
  
    // Tambahkan angkanya
    stats[type] += amount;
  
    // Simpan kembali ke memori HP
    localStorage.setItem('user_stats', JSON.stringify(stats));
  };