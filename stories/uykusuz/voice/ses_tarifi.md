# Uykusuz: ses tarifi (Google AI Studio)

Üç ses var: anlatıcı, arkadaş ve sen. Her satır ayrı üretildi ve ayrı indirildi.

- **Videoya giden satırlar:** `satir/L01.wav … L12.wav`. Ham indirmelerin baştaki boşluğu 0,08 sn'ye, sondaki boşluğu 0,25 sn'ye indirildi.

## Ayarlar

- **Sayfa:** aistudio.google.com/generate-speech, "Create new dialog", tek konuşma bloğu.
- **Model:** Gemini 3.8 Flash TTS, temperature 0,8.
- **Ses seçimi:** Speaker 1 menüsünde Gender filtresi Masculine.
- **Stil:** blok üstündeki "Describe the voice style" kutusuna yazıldı.

Stil talimatları İngilizce yazıldı; okunan metin Türkçe.

Voice Design (sesi kelimelerle tarif edip yeni ses yaratma) ücretli katmanda çalışıyor ve API anahtarı istiyor. Kullanılmadı.

## Anlatıcı (L01–L05, L08–L12)

- **Ses:** Bodi ("Quiet and intimate", low pitch)
- **Perde:** low (ölçülen ortanca 80–110 Hz)
- **Karakter:** Sıcak, sakin, gizemli, hafif muzip gece anlatıcısı
- **Stil:** `Late-night storyteller in native Turkish: warm, low and intimate, a hint of playful wonder. Natural conversational pace, never slow or drawn out; only a brief pause at a full stop.`

İlk denemede "unhurried, about two words per second" yazılıydı. L01 5,3 sn sürdü ve 4,4 sn'lik yerine sığmadı. "Natural conversational pace" ile 3,9 sn'ye indi.

## Arkadaş (L06)

- **Ses:** Zeno ("Cool and confident", medium-high pitch, erkek)
- **Perde:** mid-high
- **Karakter:** Biraz uykulu, şaşkın ev arkadaşı
- **Stil:** `Roommate in native Turkish, a little sleepy and surprised. Start speaking immediately: no yawns, sighs, groans or other sounds before or after the words. Natural pace, only a short pause at the dots.`

Leda bir kadın sesi çıktı, bu yüzden bırakıldı. "Groggy, heavy with sleep, slurred" tarifi ise başa uzun "ahh ıhh" sesleri ekledi. Esneme ve iç çekme açıkça yasaklanınca düzeldi.

## Sen (L07)

- **Ses:** Puck ("Upbeat", middle pitch, erkek)
- **Perde:** mid
- **Karakter:** Dinç, şaşkın, uykuyu hiç bilmeyen genç
- **Stil:** `Young person in native Turkish, wide awake and genuinely puzzled, as if hearing this word for the first time. Quick and bright, a tiny amused laugh in the voice. Very short.`

## Satırlar

Süre sınırı, satırın videodaki yerinden geliyor: bir sonraki satır başlamadan ya da plan değişmeden bitmeli.

| Satır | Kim | Metin | Konuşma süresi | Süre sınırı |
|---|---|---|---|---|
| L01 | anlatıcı | Gece üçü kırk yedi geçiyor. Bütün şehir uyuyor. | 3,9 sn | 4,4 sn |
| L02 | anlatıcı | Sen hariç. | 0,8 sn | 2,4 sn |
| L03 | anlatıcı | Bu gece üç kitap bitirdin. | 2,0 sn | 2,3 sn |
| L04 | anlatıcı | Gitarda yeni bir şarkı çıkardın. | 1,7 sn | 2,6 sn |
| L05 | anlatıcı | Bir de Japonca öğrenmeye başladın. | 1,7 sn | 2,6 sn |
| L06 | arkadaş | Sen... hiç yatmadın mı? | 2,8 sn | 2,8 sn |
| L07 | sen | Yatmak mı? | 0,8 sn | 1,2 sn |
| L08 | anlatıcı | Seksen yıllık bir ömrün yaklaşık yirmi yedi yılı uykuda geçer. | 4,3 sn | 4,6 sn |
| L09 | anlatıcı | Senin için? | 0,7 sn | 1,5 sn |
| L10 | anlatıcı | Sıfır. | 0,6 sn | 1,8 sn |
| L11 | anlatıcı | Peki ya hiç uyuman gerekmeseydi? | 2,5 sn | 3,5 sn |
| L12 | anlatıcı | Bak, olay şöyle. | 1,0 sn | 2,0 sn |

## Miks notu

`voice/ses.json` dosyasında `"ayri_sesler": true` yazıyor. Bu yüzden `engine/audio/mix.py` arkadaşın ve senin satırlarının perdesini kaydırmıyor.

Bu kaydırma, bütün satırlar tek bir TTS sesiyle üretildiğinde arkadaşı ve seni anlatıcıdan ayırmak için var. Tek sesle üretirseniz `ayri_sesler` değerini false yapın.
