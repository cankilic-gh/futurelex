# FutureLex Test Senaryosu

## Test Senaryosu: Save ve Check Toggle Fonksiyonları

### Amaç
Save ve Check butonlarının birbirini dışlaması, toggle çalışması ve next/prev ile seçimlerin kaydedilmesini test etmek.

### Test Adımları

#### 1. İlk Kelime - Save Testi
- [ ] İlk kelimeye gel
- [ ] Save butonuna bas
- [ ] **Beklenen:** Save butonu aktif görünmeli (pink glow)
- [ ] **Beklenen:** Check butonu pasif olmalı (golden)
- [ ] **Beklenen:** Üstte "Saved: 1" görünmeli
- [ ] **Beklenen:** "Learned: 0" olmalı

#### 2. Save Toggle Testi
- [ ] Aynı kelimede Save butonuna tekrar bas
- [ ] **Beklenen:** Save butonu pasif olmalı
- [ ] **Beklenen:** Üstte "Saved: 0" görünmeli

#### 3. Check Testi
- [ ] Aynı kelimede Check butonuna bas
- [ ] **Beklenen:** Check butonu aktif görünmeli (green glow)
- [ ] **Beklenen:** Save butonu pasif olmalı
- [ ] **Beklenen:** Üstte "Learned: 1" görünmeli
- [ ] **Beklenen:** "Saved: 0" olmalı

#### 4. Check Toggle Testi
- [ ] Aynı kelimede Check butonuna tekrar bas
- [ ] **Beklenen:** Check butonu pasif olmalı
- [ ] **Beklenen:** Üstte "Learned: 0" görünmeli

#### 5. Save → Check Geçişi
- [ ] Save butonuna bas
- [ ] **Beklenen:** Save aktif, Check pasif
- [ ] Check butonuna bas
- [ ] **Beklenen:** Check aktif olmalı, Save otomatik pasif olmalı
- [ ] **Beklenen:** "Saved: 0", "Learned: 1" olmalı

#### 6. Check → Save Geçişi
- [ ] Check butonuna bas (aktif olsun)
- [ ] Save butonuna bas
- [ ] **Beklenen:** Save aktif olmalı, Check otomatik pasif olmalı
- [ ] **Beklenen:** "Saved: 1", "Learned: 0" olmalı

#### 7. Next ile Kaydetme - Check
- [ ] Bir kelimeyi Check yap
- [ ] Next butonuna bas
- [ ] **Beklenen:** Yeni kelime gelmeli
- [ ] **Beklenen:** Önceki kelime pool'dan çıkarılmalı (geri dönünce görünmemeli)
- [ ] **Beklenen:** "Learned: 1" korunmalı
- [ ] **Beklenen:** Check butonu yeni kelime için pasif olmalı

#### 8. Next ile Kaydetme - Save
- [ ] Bir kelimeyi Save yap
- [ ] Next butonuna bas
- [ ] **Beklenen:** Yeni kelime gelmeli
- [ ] **Beklenen:** Önceki kelime pool'da kalmalı (geri dönünce görünmeli)
- [ ] **Beklenen:** "Saved: 1" korunmalı
- [ ] **Beklenen:** Save butonu yeni kelime için pasif olmalı

#### 9. Prev ile Geri Dönme
- [ ] Prev butonuna bas
- [ ] **Beklenen:** Önceki kelimeye dönülmeli
- [ ] **Beklenen:** Save yapılmışsa Save butonu aktif görünmeli
- [ ] **Beklenen:** Check yapılmışsa Check butonu aktif görünmeli

#### 10. Çoklu Test - 5-10 Kelime
- [ ] 5 kelimeyi sırayla Check yap, her birinde Next bas
- [ ] **Beklenen:** "Learned: 5" olmalı
- [ ] **Beklenen:** Check edilen kelimeler pool'dan çıkarılmalı
- [ ] 3 kelimeyi sırayla Save yap, her birinde Next bas
- [ ] **Beklenen:** "Saved: 3" olmalı
- [ ] **Beklenen:** Save edilen kelimeler pool'da kalmalı

#### 11. Toggle Kombinasyonları
- [ ] Bir kelimeyi Save yap
- [ ] Aynı kelimede Check yap
- [ ] **Beklenen:** Save pasif, Check aktif olmalı
- [ ] Aynı kelimede Check'e tekrar bas
- [ ] **Beklenen:** Check pasif olmalı
- [ ] Aynı kelimede Save yap
- [ ] **Beklenen:** Save aktif olmalı

#### 12. Dashboard Kontrolü
- [ ] Üstteki "Saved: X" badge'ine tıkla
- [ ] **Beklenen:** Dashboard'a gitmeli
- [ ] **Beklenen:** Save edilen kelimeler görünmeli
- [ ] Geri dön
- [ ] **Beklenen:** "Learned: X" sayısı korunmalı

### Beklenen Sonuçlar

✅ **Save ve Check birbirini dışlamalı** - Birisi aktifken diğeri pasif olmalı
✅ **Toggle çalışmalı** - Aynı butona tekrar basınca pasif olmalı
✅ **Next/Prev ile kaydetme** - Check yapılmışsa Learned'e, Save yapılmışsa Saved'e eklenmeli
✅ **State tutarlılığı** - Butonlar doğru state'i göstermeli
✅ **Counter güncellemeleri** - Learned ve Saved sayıları anında güncellenmeli

### Hata Senaryoları

❌ Save ve Check aynı anda aktif olmamalı
❌ Next yapınca butonlar kitlenmemeli
❌ State'ler kaybolmamalı
❌ Counter'lar yanlış saymamalı

