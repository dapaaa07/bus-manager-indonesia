const acorn = require('acorn');

const code = `
const wt = { FINANCE: 1 };
const Jt = 1;
const e = { jsx: () => {}, jsxs: () => {} };
const window = { exportSaveGameOffline: () => {}, importSaveGameOffline: () => {} };

const x = Jt===wt.FINANCE&&e.jsxs("div",{className:"h-full overflow-y-auto p-4 pb-24 md:p-8 space-y-6",children:[
  e.jsxs("div",{className:"bg-slate-900/90 border border-emerald-500/40 p-5 rounded-2xl shadow-xl",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-4 border-b border-slate-800 pb-3",children:[
      e.jsxs("div",{className:"flex items-center gap-3",children:[
        e.jsx("span",{className:"text-2xl",children:"📊"}),
        e.jsxs("div",{children:[
          e.jsx("h2",{className:"text-lg font-black text-emerald-400 uppercase tracking-wider",children:"Dashboard Analitik Keuangan & BEP Armada"}),
          e.jsx("p",{className:"text-xs text-slate-400 font-medium",children:"Rincian Laba/Rugi, Pilihan BBM, & Titik Impas Per-Bus (Client-Side Local DB)"})
        ]})
      ]}),
      e.jsx("button",{onClick:()=>window.exportSaveGameOffline(),className:"px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5",children:"💾 Unduh Backup JSON"})
    ]}),
    e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",children:[
      e.jsxs("div",{className:"bg-slate-800/80 p-4 rounded-xl border border-slate-700/60",children:[
        e.jsx("span",{className:"text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1",children:"🛢️ Kategori Bahan Bakar Active"}),
        e.jsx("h3",{className:"text-sm font-black text-amber-400",children:"BioSolar B35 / Dexlite Premium"}),
        e.jsx("p",{className:"text-[11px] text-slate-300 mt-1",children:"Efisiensi: Rp 6.800/L (Hemat Grosir Tangki Garasi -15%)"})
      ]}),
      e.jsxs("div",{className:"bg-slate-800/80 p-4 rounded-xl border border-slate-700/60",children:[
        e.jsx("span",{className:"text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1",children:"🏢 Kontrak RM Rekanan Active"}),
        e.jsx("h3",{className:"text-sm font-black text-emerald-300",children:"RM Taman Selera & Begadang V"}),
        e.jsx("p",{className:"text-[11px] text-slate-300 mt-1",children:"Pendapatan Pasif: +Rp 37.000.000 / Hari"})
      ]}),
      e.jsxs("div",{className:"bg-slate-800/80 p-4 rounded-xl border border-slate-700/60",children:[
        e.jsx("span",{className:"text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1",children:"🏆 Akreditasi Kemenhub"}),
        e.jsx("h3",{className:"text-sm font-black text-cyan-300",children:"Lolos Uji Ramp Check ⭐⭐⭐⭐⭐"}),
        e.jsx("p",{className:"text-[11px] text-slate-300 mt-1",children:"Bonus Okupansi Penumpang: +30%"})
      ]})
    ]}),
    e.jsxs("div",{className:"bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3",children:[
      e.jsxs("div",{className:"text-xs text-slate-300 font-mono",children:[
        e.jsx("span",{className:"font-bold text-amber-400",children:"💡 Tips Analitik BEP: "}),
        "Rata-rata titik impas pembelian sasis besar (Mercy/Scania/Hino) tercapai dalam 24-38 hari operasional trip."
      ]}),
      e.jsxs("div",{className:"flex gap-2",children:[
        e.jsx("button",{onClick:()=>window.exportSaveGameOffline(),className:"px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold border border-slate-700",children:"📥 Ekspor Save"}),
        e.jsx("button",{onClick:()=>{const str=prompt("Masukkan teks JSON cadangan:");if(str)window.importSaveGameOffline(str)},className:"px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold border border-slate-700",children:"📤 Impor Save"})
      ]})
    ]})
  ]}),
  e.jsxs("div", {className: "max-w-5xl mx-auto"})
]})
`;

try {
  acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
  console.log("SUCCESS!");
} catch(err) {
  console.log("ERROR:");
  console.log(err.message);
}
