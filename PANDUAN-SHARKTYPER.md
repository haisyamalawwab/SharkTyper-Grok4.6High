# Panduan Memasang Shark Typer di Website Lain

Minigame mengetik bawah laut. Ada **2 cara pasang**, pilih salah satu.

| | A. Komponen React | B. File HTML mandiri |
|---|---|---|
| File | `src/components/SharkTyperDrill.tsx` | `sharktyper.html` |
| Cocok untuk | Website React (Vite / CRA / Next.js) | Website apa pun (HTML, PHP, WordPress, dll) |
| Butuh install | Tidak (hanya `react`) | Tidak sama sekali |
| Kirim hasil | Callback `onFinish(result)` | `postMessage` ke parent |
| Nilai plus | Styling terisolasi (prefix `stdrill-`), tanpa Tailwind/lucide/gambar | Satu file, bisa dibuka langsung atau via `<iframe>` |

---

## A. Pasang sebagai komponen React (disarankan untuk sesama React)

### 1. Copy file
Copy **satu file** ini ke website lain, mis. ke `src/components/SharkTyperDrill.tsx`.
Tidak perlu copy file lain — CSS, bank kata 16 misi, dan SFX sudah inline di dalamnya.

### 2. Pakai sebagai Drill
```tsx
import SharkTyperDrill from "./components/SharkTyperDrill";

function DrillPage() {
  return (
    <div style={{ height: "100dvh" }}>
      <SharkTyperDrill
        missionId={3}
        onFinish={(r) => {
          // r = { missionId, score, wpm, accuracy (0-1), maxCombo, passed }
          fetch("/api/drills/sharktyper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r),
          });
        }}
        onExit={() => window.history.back()}
      />
    </div>
  );
}
```

### 3. Props lengkap
| Prop | Default | Fungsi |
|---|---|---|
| `missionId` | `1` | 1–16, menentukan bank kata + judul otomatis |
| `words` | bank misi | Override kata drill custom, mis. `words={["git commit", "npm run build"]}` |
| `title` | judul misi | Override judul header |
| `speed` | `1` | Pengali kecepatan ikan (`0.7` santai – `1.6` ekstrem) |
| `lives` | `3` | Jumlah nyawa |
| `waves` | `3` | Jumlah gelombang per run |
| `waveSize` | `6` | Ikan per gelombang |
| `sound` | `true` | SFX WebAudio (oscillator, tanpa file audio) |
| `autoStart` | `false` | `true` = langsung main tanpa overlay pembuka |
| `compact` | `false` | `true` = sembunyikan tombol kembali (mode embed) |
| `onFinish` | — | Dipanggil **sekali** saat run berakhir (lulus/gagal) |
| `onExit` | — | Tombol kembali ditekan |

### 4. Catatan penting
- **Tinggi container**: komponen mengisi `height: 100%`, jadi parent wajib punya tinggi
  (mis. `style={{ height: "100dvh" }}` atau class `h-screen`).
- **Next.js App Router**: tambahkan `"use client";` di baris pertama file halaman yang memakainya.
- **Suara**: browser memblokir audio sebelum interaksi user — tombol "Mulai Drill" sudah
  membuka AudioContext, jadi tidak perlu setting tambahan.
- **Keyboard HP**: kolom ketik otomatis fokus; di HP, ketuk kolom ketik agar keyboard muncul.
- **TypeScript**: file ini lolos `tsc --noEmit` (strict). Tidak ada `any` / dependensi luar.

---

## B. Pasang sebagai file HTML mandiri (website apa pun)

### 1. Copy file
Copy `sharktyper.html` ke hosting, mis. sejajar `index.html` atau ke folder `public/`
(sehingga bisa diakses di `https://domain-anda/sharktyper.html`).

### 2a. Dibuka langsung
```
https://domain-anda/sharktyper.html
https://domain-anda/sharktyper.html?mission=3
https://domain-anda/sharktyper.html?mission=3&speed=1.35&embed=1&sound=0
```
Query string: `mission=1..16` · `speed=0.7..1.6` · `embed=1` (sembunyikan tombol kembali,
cocok untuk iframe) · `sound=0` (bisukan awal) · `autoplay=1` (langsung mulai).

### 2b. Di-embed via iframe (React / HTML biasa)
```tsx
<iframe
  src="/sharktyper.html?embed=1&mission=3"
  width="100%"
  height="720"
  style={{ border: 0, borderRadius: 16 }}
  allow="autoplay"
  title="Shark Typer Drill"
/>
```

### 3. Terima hasil game (iframe → parent)
Saat run berakhir, halaman game mengirim hasil via `postMessage`:
```js
window.addEventListener("message", (e) => {
  if (e.origin !== "https://domain-anda") return; // WAJIB cek origin di production
  if (e.data && e.data.type === "sharktyper:result") {
    const r = e.data.payload;
    // r = { mode, missionId, accuracy, wpm, combo, score, passed, best, at }
    saveKeBackend(r);
  }
});
```

---

## Contoh drill custom (kata sendiri)

```tsx
<SharkTyperDrill
  title="Drill: Git Dasar"
  words={["git init", "git add .", 'git commit -m "hiu"', "git push", "git pull", "git clone", "git status", "git branch"]}
  speed={0.8}
  onFinish={(r) => console.log(r)}
/>
```

---

## Troubleshooting

| Gejala | Solusi |
|---|---|
| Tidak ada suara | Normal sebelum klik "Mulai" (kebijakan autoplay browser). Cek prop `sound` / query `sound=0`. |
| Ketikan tidak masuk (desktop) | Klik area game sekali agar fokus; jangan mengetik saat kursor di input lain. |
| Keyboard HP tidak muncul | Ketuk kolom ketik di bar bawah. |
| Komponen gepeng / tinggi 0 | Parent belum punya tinggi — bungkus dengan `height: 100dvh`. |
| Style bertabrakan dengan Tailwind host | Tidak perlu khawatir — semua class diawali `stdrill-` dan CSS di-scope di dalam komponen. |
| Iframe tidak mengirim hasil | Pastikan mendengar event `message` dengan `type === "sharktyper:result"` dan origin benar. |

## Checklist file yang di-copy
- [ ] Opsi A: `src/components/SharkTyperDrill.tsx` → 1 file saja
- [ ] Opsi B: `sharktyper.html` → 1 file saja (boleh diganti nama, query string tetap jalan)
