# FutureLex - Upgrade Plan

**Analiz Tarihi:** 2026-02-16
**Tip:** Vite + React 19 + TypeScript + Firebase

---

## Kritik Upgrades

### 1. Console.log Temizligi
**Oncelik:** KRITIK
**Dosya:** `pages/FlashcardSession.tsx`

100+ console.log satiri mevcut. Kod okunabilirligini bozuyor.

**Gorev:**
- [ ] Tum debug log'larini kaldir
- [ ] `import.meta.env.DEV` ile sarmala (opsiyonel)

---

## Yuksek Oncelikli Upgrades

### 2. Spaced Repetition Algoritmasi
**Oncelik:** YUKSEK

Basit exclude mantigi yerine gercek ogrenme algoritmasi gerekli.

```bash
npm install ts-fsrs
```

**Gorev:**
- [ ] `services/spacedRepetition.ts` olustur
- [ ] SM-2 veya FSRS algoritmasi implement et
- [ ] Due today karti konsepti ekle
- [ ] Zorluk derecesi takibi ekle

---

### 3. Quiz/Test Modu
**Oncelik:** YUKSEK

Sadece flashcard modu var. Dil ogrenme icin test modlari gerekli.

**Gorev:**
- [ ] Yazim testi modu ekle
- [ ] Coktan secmeli sorular ekle
- [ ] Dinleme modu (TTS + input) ekle

---

### 4. Kelime Veritabani Genisletme
**Oncelik:** YUKSEK
**Dosya:** `services/data.ts`

Sadece ~290 kelime, alfabetik siralama = yapay seviye sistemi.

**Gorev:**
- [ ] Firestore `words` koleksiyonu olustur
- [ ] Frequency-based kelime siralama yap
- [ ] Client'tan statik veriyi kaldir

---

## Orta Oncelikli Upgrades

### 5. LocalFirstContext Kullanilmiyor
**Dosya:** `context/LocalFirstContext.tsx`

Dead code - PlanProvider yerine kullanilmiyor.

**Gorev:**
- [ ] LocalFirstContext'i aktif et VEYA
- [ ] Dosyayi tamamen sil

---

### 6. Firebase Credentials .env'e Tasi
**Dosya:** `services/firebase.ts`

API key'ler hardcoded.

**Gorev:**
- [ ] `.env` dosyasi olustur
- [ ] VITE_FIREBASE_* env'leri tanimla
- [ ] firebase.ts'i guncelle

---

### 7. TTS Dil Eslesmesi
**Dosya:** `components/Flashcard/Card.tsx`

Web Speech API locale mapping eksik (de -> de-DE).

**Gorev:**
- [ ] Tum diller icin locale mapping ekle
- [ ] fr -> fr-FR, it -> it-IT, es -> es-ES

---

### 8. Fonetik Sistem Genisletme
**Dosya:** `components/Flashcard/Card.tsx`

Sadece ~32 kelime icin hardcoded IPA var.

**Gorev:**
- [ ] Fonetik API entegrasyonu yap VEYA
- [ ] Fonetik gosterimini tamamen kaldir

---

## Dusuk Oncelikli Upgrades

### 9. LevelSelect Dead Code
**Dosya:** `pages/LevelSelect.tsx`

Route'larda tanimli degil.

**Gorev:**
- [ ] Route'a ekle VEYA
- [ ] Dosyayi sil

---

### 10. Dashboard Istatistikleri
**Dosya:** `pages/Dashboard.tsx`

Sadece saved words gosteriyor. Ogrenme istatistikleri eksik.

**Gorev:**
- [ ] Completed words sayisi ekle
- [ ] Seviye dagilimi grafigi ekle
- [ ] Gunluk streak gostergesi ekle

---

## Onerilen Yeni Kutuphaneler

| Kategori | Kutuphane | Amac |
|----------|-----------|------|
| Spaced Rep | `ts-fsrs` | FSRS algoritmasi |
| Fonetik | `phonetics-js` | IPA transcriptions |
| TTS | `react-speech-kit` | Locale management |
| Test | `vitest` | Unit testing |
| Charts | `recharts` | Dashboard grafikleri |
| PWA | `vite-plugin-pwa` | Offline kullanim |

---

## Tahmini Is Yukleri

| Upgrade | Zorluk |
|---------|--------|
| Console Temizligi | Cok Kolay |
| Spaced Repetition | Zor |
| Quiz Modu | Orta |
| DB Genisletme | Orta |
| TTS Fix | Kolay |
