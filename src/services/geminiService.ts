import { GeminiDraft } from '../types';
import { StorageService } from './storageService';

export class GeminiService {
  static async parseIntent(prompt: string): Promise<GeminiDraft> {
    const teachingSchedules = StorageService.getTeachingSchedules();
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch('/api/gemini/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentContext: {
            date: todayStr,
            teachingSchedules,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          intent: data.intent || 'CREATE_TODO',
          summary: data.summary || prompt,
          parameters: data.parameters || {},
          hasConflict: !!data.hasConflict,
          conflictWarning: data.conflictWarning || '',
          requiresConfirmation: true,
        };
      }
    } catch (err) {
      console.warn('Network error calling /api/gemini/parse-intent, using local offline fallback:', err);
    }

    // Client-side fallback if server is unreachable
    return GeminiService.fallbackParse(prompt, teachingSchedules);
  }

  private static fallbackParse(prompt: string, teachingSchedules: any[]): GeminiDraft {
    const p = prompt.toLowerCase();
    const todayStr = new Date().toISOString().split('T')[0];

    if (p.includes('beli') || p.includes('bayar') || p.includes('rp') || p.includes('ribu') || p.includes('makan') || p.includes('bensin') || p.includes('pengeluaran')) {
      const numMatch = prompt.match(/\d+/);
      const amount = numMatch ? parseInt(numMatch[0], 10) * (prompt.toLowerCase().includes('ribu') ? 1000 : 1) : 45000;
      let cat = 'Makan & Minum';
      if (p.includes('bensin')) cat = 'Bensin & Transport';
      else if (p.includes('gym')) cat = 'Gym Membership';
      else if (p.includes('laptop')) cat = 'Tagihan Laptop';
      else if (p.includes('spaylater')) cat = 'SPayLater';

      return {
        intent: 'CREATE_EXPENSE',
        summary: `Catat pengeluaran Rp ${amount.toLocaleString('id-ID')} (${cat})`,
        parameters: {
          amount,
          category: cat,
          description: prompt,
          date: todayStr,
        },
        hasConflict: false,
        conflictWarning: '',
        requiresConfirmation: true,
      };
    }

    if (p.includes('jadwal') || p.includes('ngajar') || p.includes('kelas') || p.includes('jam')) {
      let day = 'Senin';
      ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'].forEach(d => {
        if (p.includes(d)) day = d.charAt(0).toUpperCase() + d.slice(1);
      });

      const times = prompt.match(/\b\d{1,2}[:.]\d{2}\b/g) || ['09:00', '11:00'];
      const startTime = times[0]?.replace('.', ':') || '09:00';
      const endTime = times[1]?.replace('.', ':') || '11:00';

      // Check conflict with permanent teaching schedule
      let hasConflict = false;
      let conflictWarning = '';
      const conflict = teachingSchedules.find(s =>
        s.day.toLowerCase() === day.toLowerCase() &&
        ((startTime >= s.startTime && startTime < s.endTime) || (endTime > s.startTime && endTime <= s.endTime))
      );
      if (conflict) {
        hasConflict = true;
        conflictWarning = `Peringatan Bentrok: Bertabrakan dengan jam mengajar permanen "${conflict.subject}" (${conflict.day} ${conflict.startTime} - ${conflict.endTime}, ${conflict.room}).`;
      }

      return {
        intent: 'CREATE_SCHEDULE',
        summary: `Jadwal: ${day} pukul ${startTime} - ${endTime}`,
        parameters: {
          day,
          startTime,
          endTime,
          subject: prompt.replace(/jadwal|ngajar|jam/gi, '').trim() || 'Sesi Tambahan',
          room: 'Ruang Teori 301',
        },
        hasConflict,
        conflictWarning,
        requiresConfirmation: true,
      };
    }

    if (p.includes('gym') || p.includes('latihan') || p.includes('calf') || p.includes('carry') || p.includes('plank') || p.includes('hang')) {
      let exerciseName = 'Seated Calf Raise';
      if (p.includes('suitcase')) exerciseName = 'Suitcase Carry';
      else if (p.includes('plank')) exerciseName = 'Side Plank';
      else if (p.includes('treadmill')) exerciseName = 'Incline Treadmill';
      else if (p.includes('hang')) exerciseName = 'Dead Hang (Dekompresi)';
      else if (p.includes('forearm') || p.includes('brachialis')) exerciseName = 'Target Forearm / Brachialis';

      return {
        intent: 'CREATE_GYM_SESSION',
        summary: `Sesi Latihan: ${exerciseName}`,
        parameters: {
          exerciseName,
          sets: 3,
          reps: 15,
          restSeconds: 60,
          targetNote: exerciseName === 'Seated Calf Raise' ? 'Regangan maksimal di soleus' : 'Fokus form dan kontrol gerakan',
        },
        hasConflict: false,
        conflictWarning: '',
        requiresConfirmation: true,
      };
    }

    return {
      intent: 'CREATE_TODO',
      summary: `Tugas Baru: ${prompt}`,
      parameters: {
        title: prompt,
        date: todayStr,
        timeLimit: '18:00',
        priority: p.includes('penting') || p.includes('urgent') ? 'high' : 'medium',
      },
      hasConflict: false,
      conflictWarning: '',
      requiresConfirmation: true,
    };
  }
}
