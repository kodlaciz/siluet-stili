# Uykusuz: "Ya hiç uyuman gerekmeseydi?"

40 saniyelik hook, 16:9, 24 kare/sn. Silüet "What If" stilinde. Hook formülü referansın üç videosundan alındı (bkz. `analiz/script.md`):
1. Güç iş başında
2. Bir tanık şaşırıyor
3. Sayı karşılaştırması
4. Başlık sorusu
5. "Bak, olay şöyle."

## Metin (58 kelime)

| # | Kim | Satır | Başlangıç |
|---|---|---|---|
| L01 | anlatıcı | Gece üçü kırk yedi geçiyor. Bütün şehir uyuyor. | 0,7 sn |
| L02 | anlatıcı | Sen hariç. | 5,4 sn |
| L03 | anlatıcı | Bu gece üç kitap bitirdin. | 8,0 sn |
| L04 | anlatıcı | Gitarda yeni bir şarkı çıkardın. | 10,45 sn |
| L05 | anlatıcı | Bir de Japonca öğrenmeye başladın. | 13,2 sn |
| L06 | arkadaş | Sen… hiç yatmadın mı? | 17,45 sn |
| L07 | sen | Yatmak mı? | 20,4 sn |
| L08 | anlatıcı | Seksen yıllık bir ömrün yaklaşık yirmi yedi yılı uykuda geçer. | 22,9 sn |
| L09 | anlatıcı | Senin için? | 27,7 sn |
| L10 | anlatıcı | Sıfır. | 29,3 sn |
| L11 | anlatıcı | Peki ya hiç uyuman gerekmeseydi? | 31,2 sn |
| L12 | anlatıcı | Bak, olay şöyle. | 38,0 sn |

Satırlar `voice/satirlar.json` dosyasında, zamanlar `story.js` içindeki `LINES` dizisinde. Ses yenilenirse yalnızca bu zamanlar kaydırılır.

**Ses:** Google AI Studio (Gemini TTS). Üç ayrı ses var: anlatıcı, arkadaş ve sen. Sesler, stil talimatları ve satır süreleri `voice/ses_tarifi.md` içinde. Satırlar `voice/satir/L01.wav` … `L12.wav`; biri yenilenirse `python audio/mix.py ../stories/uykusuz` (`engine/` klasöründen) miksi yeniden kurar.

## Sinema bandı

Bant 62 pikselde duruyor ve iki yerde 128 piksele kapanıyor. Kapalıyken görüntü soğuk renge dönüyor, kapanırken alçak bir ses kabarması duyuluyor. Zamanlar `story.js` içindeki `TIGHT` dizisinde.

| Saniye | Nerede | Neden |
|---|---|---|
| 5,4–6,6 | "cephe" planının içinde, "Sen hariç." sözünde | Gücün ilk göründüğü an: şehir uyuyor, tek ışık seninki. Bant, kamera içeri dalmadan önce açılıyor |
| 9–14,6 | yığın, gitar, saat ve japonca planları (kesmeden kesmeye) | Gücün iş başında olduğu yakın planlar. Bant, gökyüzü şafağa dönerken açılıyor |

Toplam 6,8 saniye, hook'un %17'si (referans hook'larında %0–22).

## Planlar (17 plan, 14 kesme, 1 flaş, 1 geçiş efekti)

| Saniye | Plan | Ne oluyor |
|---|---|---|
| 0–3 | dış | Gece, sokağa karşıdan geniş plan: üç bina, ortadaki alçak binanın üstünde gökyüzü bandı ve ay. Pencerelerde komşular: biri son çayını içiyor, biri telefonda, biri televizyonun karşısında. Işıklar tek tek sönüyor. Sağ üstte saat: 03:47 |
| 3–5 | pencereler | Soldaki binaya açılı yakın plan: biri esneyip düğmeye uzanıyor ve ışığı kapatıyor, biri koltukta kumandayla televizyonu kapatıyor, biri perdeyi çekiyor |
| 5–7,4 | cephe | Tek ışık seninki: balkon kapısının ardında masada kitap okuyorsun, çatıda bir kedi. "Sen hariç." sözünde bant kapanıyor, görüntü soğuyor; sonra açılıyor. Kamera içeri dalıyor, beyaz flaş |
| 7,4–9 | oda | Sandalyede, masanın ucunda kitap okuyorsun; sayfa çeviriyorsun, bitirdiğin kitap yığına düşüyor. Masada açık laptop ve lamba |
| 9–10,2 | yığın | Bant kapanıyor. Yakın plan: kitaplar üst üste düşüyor |
| 10,2–11,8 | gitar | Kucağında akustik gitar: bir el tellerde, diğeri sapta akor değiştiriyor. Notalar uçuşuyor |
| 11,8–13 | saat | Duvar saati hızla dönüyor |
| 13–14,6 | japonca | Laptop yakın planı: dil uygulamasında kana kartları değişiyor (あ a, い i, う u…), ilerleme çubuğu doluyor |
| 14,6–15,8 | gökyüzü | Bant açılıyor, renk geri geliyor. Pencereden: ay batıyor, güneş doğuyor |
| 15,8–17,3 | şafak | Kapı açılıyor, arkadaşın esneyerek çıkıyor |
| 17,3–18,9 | arkadaş | Yakın plan: "Sen… hiç yatmadın mı?" |
| 18,9–20 | kule | Kitap kulesi arkadaşının üstüne yıkılıyor |
| 20–22,4 | yakın | Omzunun üstünden arkadaşına bakıp "Yatmak mı?" diyorsun. Sonra arkana yaslanıp kupadan tek bir yudum alıyorsun (21,55 sn): kupa dudakta, gözler kapalı |
| 22,4–27,6 | kart | 80 figür, biri bir yıl. 27'si uykuya dalıyor, sayaç 27 yıl |
| 27,6–30,4 | kart 2 | "Senin için?" Hepsi uyanıyor, sayaç sıfıra iniyor. "SIFIR" |
| 30,4–35,5 | başlık | Şafakta aynı sokak: gökyüzü bandında başlık. Fırın açılmış, fırıncı tepsiyle ekmek taşıyor; sırt çantalı biri önünden geçiyor. İki komşu penceresinde geriniyor, biri ilk kahvesini içiyor |
| 35,5–40 | son | Balkonda, bir elin korkulukta. Bir yudum (36,55 sn), sonra kupayı kameraya kaldırıyorsun. Kamera sana yaklaşıyor, netlik seni takip ediyor; kararma |

## Olgular

| İddia | Dayanak | Metindeki karar |
|---|---|---|
| Ömrün yaklaşık üçte biri uykuda geçer | Yetişkinlere günde 7–9 saat uyku öneriliyor; günde 8 saat = günün üçte biri | Kullanıldı |
| 80 yıllık ömrün yaklaşık 27 yılı | 80 × 8/24 = 26,7 yıl | "Yaklaşık yirmi yedi" denildi |

**Devamı yazılırsa kullanılabilecek gerçek bilim:**
- Uyku sırasında beyin, gün boyu biriken atıkları temizliyor ("glimfatik sistem").
- Uyku, hafızanın pekişmesi için gerekli.
- Kayıtlı en uzun uykusuzluk deneyi yaklaşık 11 gün (264 saat, 1964).
- Bazı insanlar kalıtsal olarak günde 4–6 saatle yetiniyor.

Bunlar referanstaki "kural ve bedel" kısmına denk geliyor. Metne koymadan önce kaynaklarıyla doğrulanmalı.
