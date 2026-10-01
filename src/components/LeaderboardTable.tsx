import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Plus, 
  Download, 
  Printer, 
  UserCheck, 
  UserX,
  Sparkles,
  Award
} from 'lucide-react';
import { Participant, Round, CompetitionConfig } from '../types';

interface LeaderboardTableProps {
  participants: Participant[];
  selectedParticipantId: string;
  onSelectParticipant: (id: string) => void;
  onQuickAdd: (id: string, amount: number) => void;
  onToggleStatus: (id: string) => void;
  rounds: Round[];
  config: CompetitionConfig;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  participants,
  selectedParticipantId,
  onSelectParticipant,
  onQuickAdd,
  onToggleStatus,
  rounds,
  config,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort participants by score descending
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);

  // Filter based on search query
  const filtered = sorted.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.members && p.members.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Peringkat', 'Nama Peserta', 'Anggota', 'Kelas', 'Skor Total', 'Benar', 'Salah', 'Status'];
    const rows = sorted.map((p, index) => [
      index + 1,
      `"${p.name}"`,
      `"${p.members || '-'}"`,
      `"${p.grade}"`,
      p.totalScore,
      p.correctAnswers,
      p.wrongAnswers,
      p.status === 'active' ? 'Aktif' : 'Tereliminasi',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-nilai-sang-juara-${config.schoolName.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTable = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200">
      
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
            Papan Peringkat Real-Time
          </h3>
          <p className="text-xs text-slate-500">
            Urutan otomatis terbarui setiap kali ada perubahan nilai
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari regu / murid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            title="Unduh Rekap Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh CSV</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrintTable}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            title="Cetak Rekap Nilai"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-3 text-center w-16">Peringkat</th>
              <th className="py-3 px-3">Peserta & Regu</th>
              <th className="py-3 px-3 hidden md:table-cell">Kelas</th>
              <th className="py-3 px-3 text-center">Skor Total</th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">Benar / Salah</th>
              <th className="py-3 px-3 text-center hidden lg:table-cell">Status</th>
              <th className="py-3 px-3 text-right">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  Tidak ditemukan peserta yang sesuai pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((p, index) => {
                const rankNumber = index + 1;
                const isSelected = p.id === selectedParticipantId;
                const isEliminated = p.status === 'eliminated';

                // Rank badge styling
                let rankBadge = (
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center mx-auto">
                    {rankNumber}
                  </span>
                );

                if (rankNumber === 1) {
                  rankBadge = (
                    <div className="relative flex items-center justify-center">
                      <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-sm flex items-center justify-center shadow-md border border-amber-300 mx-auto">
                        <Crown className="w-5 h-5 text-amber-950 fill-amber-950" />
                      </span>
                    </div>
                  );
                } else if (rankNumber === 2) {
                  rankBadge = (
                    <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shadow border border-slate-300 mx-auto">
                      🥈 2
                    </span>
                  );
                } else if (rankNumber === 3) {
                  rankBadge = (
                    <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-700 to-orange-700 text-amber-100 font-black text-xs flex items-center justify-center shadow border border-amber-600 mx-auto">
                      🥉 3
                    </span>
                  );
                }

                // Rank change indicator
                let rankDiff = null;
                if (p.previousRank && p.previousRank !== rankNumber) {
                  if (rankNumber < p.previousRank) {
                    rankDiff = (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center">
                        <ArrowUp className="w-3 h-3" />
                      </span>
                    );
                  } else {
                    rankDiff = (
                      <span className="text-[10px] font-bold text-rose-600 flex items-center justify-center">
                        <ArrowDown className="w-3 h-3" />
                      </span>
                    );
                  }
                }

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectParticipant(p.id)}
                    className={`cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-blue-50/70 font-semibold'
                        : 'hover:bg-slate-50'
                    } ${isEliminated ? 'opacity-50 line-through-text' : ''}`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        {rankBadge}
                        {rankDiff}
                      </div>
                    </td>

                    {/* Participant Info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0 shadow-sm border border-slate-200">
                          {p.avatar}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                            {p.name}
                            {rankNumber === 1 && (
                              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">
                                Juara 1
                              </span>
                            )}
                          </div>
                          {p.members && (
                            <div className="text-xs text-slate-500 font-normal line-clamp-1">
                              Anggota: {p.members}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 font-normal md:hidden">
                            {p.grade}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3 px-3 text-slate-600 text-xs font-semibold hidden md:table-cell">
                      {p.grade}
                    </td>

                    {/* Total Score */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-base sm:text-lg font-black ${
                          rankNumber === 1 ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {p.totalScore}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Poin</span>
                      </div>
                    </td>

                    {/* Correct / Wrong */}
                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <div className="inline-flex items-center gap-2 text-xs font-bold">
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          ✓ {p.correctAnswers}
                        </span>
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          ✗ {p.wrongAnswers}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(p.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          p.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Klik untuk ubah status aktif/gugur"
                      >
                        {p.status === 'active' ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>Gugur</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Inline Quick Action Buttons */}
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onQuickAdd(p.id, 100)}
                          className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xs transition-colors"
                          title="Tambah +100 Poin"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => onQuickAdd(p.id, 50)}
                          className="px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-black text-xs transition-colors"
                          title="Tambah +50 Poin"
                        >
                          +50
                        </button>
                        <button
                          onClick={() => onQuickAdd(p.id, -50)}
                          className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs transition-colors"
                          title="Kurang -50 Poin"
                        >
                          -50
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
