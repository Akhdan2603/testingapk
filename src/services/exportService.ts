import { StorageService, getCurrentCycle } from './storageService';

export class ExportService {
  static exportToCSV(): void {
    const todos = StorageService.getTodos();
    const expenses = StorageService.getExpenses();
    const gymSessions = StorageService.getGymSessions();
    const schedules = StorageService.getTeachingSchedules();
    const allocation = StorageService.getAllocationConfig();
    const cycle = getCurrentCycle();

    let csvContent = `DATA EXPORT - OBSIDIAN SANCTUARY COMMAND CENTER\n`;
    csvContent += `Tanggal Cetak,${new Date().toLocaleString('id-ID')}\n`;
    csvContent += `Periode Siklus,${cycle.cycleLabel}\n\n`;

    // 1. EXPENSES
    csvContent += `=== LAPORAN PENGELUARAN SIKLUS BERJALAN ===\n`;
    csvContent += `ID,Tanggal,Kategori,Deskripsi,Beban Tetap?,Nominal (IDR)\n`;
    expenses.forEach(e => {
      csvContent += `"${e.id}","${e.date}","${e.category}","${e.description.replace(/"/g, '""')}","${e.isFixed ? 'Ya' : 'Tidak'}",${e.amount}\n`;
    });
    csvContent += `\n`;

    // 2. GYM SESSIONS
    csvContent += `=== LAPORAN PERFORMA GYM TRACKER ===\n`;
    csvContent += `ID,Tanggal,Gerakan Latihan,Jumlah Set,Referensi Minggu Lalu,Catatan\n`;
    gymSessions.forEach(g => {
      const setsSummary = g.sets.map(s => `Set ${s.setNumber}: ${s.reps} reps @ ${s.weightKg}kg (${s.completed ? 'OK' : 'Skip'})`).join('; ');
      csvContent += `"${g.id}","${g.date}","${g.exerciseName}","${setsSummary}","${g.previousWeekReference}","${g.notes.replace(/"/g, '""')}"\n`;
    });
    csvContent += `\n`;

    // 3. TEACHING SCHEDULES
    csvContent += `=== JADWAL MENGAJAR PERMANEN ===\n`;
    csvContent += `Hari,Jam Mulai,Jam Selesai,Mata Kuliah,Ruangan,Status,Catatan\n`;
    schedules.forEach(s => {
      csvContent += `"${s.day}","${s.startTime}","${s.endTime}","${s.subject}","${s.room}","${s.isPermanent ? 'Permanen' : 'Tambahan'}","${s.notes || ''}"\n`;
    });
    csvContent += `\n`;

    // 4. TODOS
    csvContent += `=== DAFTAR TUGAS (TO-DO) ===\n`;
    csvContent += `Judul,Tanggal,Batas Waktu,Prioritas,Selesai?,Overdue?,Carry Over Dari\n`;
    todos.forEach(t => {
      csvContent += `"${t.title.replace(/"/g, '""')}","${t.date}","${t.timeLimit || '-'}","${t.priority}","${t.completed ? 'Ya' : 'Belum'}","${t.isOverdue ? 'Ya' : 'Tidak'}","${t.carriedOverFrom || '-'}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Obsidian_Sanctuary_Rekap_${cycle.cycleKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static exportToPDF(): void {
    const expenses = StorageService.getExpenses();
    const gymSessions = StorageService.getGymSessions();
    const schedules = StorageService.getTeachingSchedules();
    const allocation = StorageService.getAllocationConfig();
    const breakdown = StorageService.calculateAllocationBreakdown(allocation);
    const cycle = getCurrentCycle();

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laporan Bulanan - Obsidian Sanctuary</title>
        <style>
          @page { size: A4 portrait; margin: 16mm; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #111317;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            font-size: 11pt;
            line-height: 1.4;
          }
          .header {
            border-bottom: 2px solid #8FBC8F;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .title { font-size: 18pt; font-weight: 700; color: #1E2024; margin: 0; }
          .subtitle { font-size: 9.5pt; color: #555; margin-top: 4px; }
          .badge {
            background: #8FBC8F;
            color: #ffffff;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 9pt;
            font-weight: 600;
          }
          h2 {
            font-size: 13pt;
            color: #1E2024;
            border-left: 4px solid #8FBC8F;
            padding-left: 8px;
            margin-top: 24px;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 10pt;
          }
          th {
            background: #f4f6f4;
            color: #234c29;
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ccc;
            font-weight: 600;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #eee;
          }
          .metric-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 18px;
          }
          .metric-card {
            background: #fbfbfb;
            border: 1px solid #e5e5e5;
            padding: 12px;
            border-radius: 6px;
          }
          .metric-label { font-size: 8.5pt; color: #666; text-transform: uppercase; }
          .metric-val { font-size: 14pt; font-weight: 700; color: #1E2024; margin-top: 4px; }
          .footer {
            margin-top: 32px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            font-size: 8.5pt;
            color: #777;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">OBSIDIAN SANCTUARY</h1>
            <div class="subtitle">Laporan Bulanan Multi-Purpose Command Center</div>
            <div class="subtitle"><strong>${cycle.cycleLabel}</strong></div>
          </div>
          <div style="text-align: right;">
            <span class="badge">STATUS: TERVERIFIKASI</span>
            <div class="subtitle" style="margin-top: 6px;">Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Gaji / Income Bulan Ini</div>
            <div class="metric-val">Rp ${breakdown.monthlyIncome.toLocaleString('id-ID')}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Beban Tetap (SPayLater/Laptop/Gym)</div>
            <div class="metric-val">Rp ${breakdown.totalFixed.toLocaleString('id-ID')}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Pengeluaran Berjalan</div>
            <div class="metric-val" style="color: #c53030;">Rp ${totalExpense.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <h2>1. Rekapitulasi Alokasi Otomatis (Tanggal 10)</h2>
        <table>
          <thead>
            <tr>
              <th>Pos Alokasi</th>
              <th>Persentase</th>
              <th>Nominal Anggaran</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Beban Tetap</strong> (SPayLater + Laptop + Gym)</td>
              <td>Tetap</td>
              <td>Rp ${breakdown.totalFixed.toLocaleString('id-ID')}</td>
              <td>Dipotong otomatis di awal siklus</td>
            </tr>
            <tr>
              <td><strong>Tabungan & Investasi</strong></td>
              <td>${allocation.remainderPercentages.savings}%</td>
              <td>Rp ${breakdown.distribution.savingsAmount.toLocaleString('id-ID')}</td>
              <td>Dari sisa gaji</td>
            </tr>
            <tr>
              <td><strong>Bensin & Transport</strong></td>
              <td>${allocation.remainderPercentages.gas}%</td>
              <td>Rp ${breakdown.distribution.gasAmount.toLocaleString('id-ID')}</td>
              <td>Dari sisa gaji</td>
            </tr>
            <tr>
              <td><strong>Makan & Kebutuhan Harian</strong></td>
              <td>${allocation.remainderPercentages.food}%</td>
              <td>Rp ${breakdown.distribution.foodAmount.toLocaleString('id-ID')}</td>
              <td>Dari sisa gaji</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Rekapitulasi Jam Mengajar Permanen</h2>
        <table>
          <thead>
            <tr>
              <th>Hari</th>
              <th>Jam</th>
              <th>Mata Kuliah / Sesi</th>
              <th>Ruangan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${schedules.map(s => `
              <tr>
                <td><strong>${s.day}</strong></td>
                <td>${s.startTime} - ${s.endTime}</td>
                <td>${s.subject}</td>
                <td>${s.room}</td>
                <td>${s.isPermanent ? 'Jadwal Permanen' : 'Tambahan'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>3. Rekapitulasi Performa Gym Tracker</h2>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Gerakan Latihan</th>
              <th>Detail Set & Beban</th>
              <th>Referensi Minggu Lalu</th>
            </tr>
          </thead>
          <tbody>
            ${gymSessions.map(g => `
              <tr>
                <td>${g.date}</td>
                <td><strong>${g.exerciseName}</strong></td>
                <td>${g.sets.map(s => `Set ${s.setNumber}: ${s.reps}x @ ${s.weightKg}kg`).join(', ')}</td>
                <td style="color: #666;">${g.previousWeekReference}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Laporan digenerate secara privat & offline oleh Obsidian Sanctuary Command Center · Tanpa server cloud pihak ketiga.
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 350);
    } else {
      // Fallback: download as printable HTML
      const blob = new Blob([printHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Bulanan_${cycle.cycleKey}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}
