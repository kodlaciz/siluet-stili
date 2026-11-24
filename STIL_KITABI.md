# Silüet stili: stil kitabı

Sayılar üç referans videonun hook'undan ölçüldü (`analiz/gorsel.md`, `analiz/script.md`). Referans ile bizim kopyanın yan yana sayıları `gorsel.md` içinde.

## 1. Kare

- **Format:** 16:9, 1920×1080, 24 kare/sn.
- **Sinema bandı:** her karede üstte ve altta siyah bant var; yüksekliği sabit değil.
  - Açık hâli 62 px. Görünen alan 1920×956, yaklaşık 2:1.
  - Dar hâli 128 px. Görünen alan 1920×824, yaklaşık 2,35:1.
  - Bant, kahramanın gücü iş başındayken kapanıyor (bkz. bölüm 4, "Dar bant").
- **Alan derinliği:** karenin yalnızca üçte biri (%28–38) keskin. Karakter net; arka plan ve kameraya yakın nesneler (saksı, direk, ağaç) bulanık.
- **Vinyet:** güçlü. İki videoda köşeler merkezin yaklaşık %30'u kadar parlak.
- **Siyahlar kaldırılmış:** en koyu %5'lik dilim 0,04–0,06 parlaklıkta. Silüet karakterler bile simsiyah değil.
- **Gren:** görüntünün üstünde hafif, hareketli bir film greni var (karelerden gözle, ölçülmedi).
- **Dış çekim (karelerden gözle):**
  - Kamera göz hizasında ve cepheye karşıdan bakıyor. Dikey çizgiler dik kalıyor.
  - Binalar yan yana diziliyor. Ortadaki bina alçak, üstünde bir gökyüzü bandı kalıyor (ay, güneş, bulutlar).
  - Işıklı pencerelerin ardında insanlar var. Zemin katta sıcak ışıklı bir dükkân duruyor.
  - Önde sokak eşyası katmanlar hâlinde: çit, bank, ışık havuzlu sokak lambası, ağaç.
  - Kopyada pencereler cephede gerçek boşluklar: odalar ve insanlar camın arkasında, kendi derinliklerinde duruyor.

## 2. Renk ve ışık

- **Renk sakin:** ortanca kroma 7–12. Setler mor-mavi ve gri; renk ışıkta ve kıyafette toplanıyor.
- **Sıcak ışık, soğuk set:** pencereler, lambalar ve güneş turuncu-krem; duvarlar ve gökyüzü mor-mavi. Sıcak renk payı %2–22, mor payı en fazla %36.
- **Parlama:** güneşin, lambaların ve başlık yazısının etrafında geniş bir hale.
- **Dar bantta renk soğuyor:** bant kapanırken aynı karelerde görüntü maviye ve mora kayıyor, yaklaşık %10 koyulaşıyor.
  - Sıcak renk payı sıfıra yakın düşüyor: turuncu ışıklar gri-eflatuna dönüyor.
  - Dar bantlı saniyelerde mavi payı %29–37, mor payı %1–26.
  - Silüetler siyah kalıyor.
  - Ekran yazıları ve HUD da aynı renge dönüyor.
  - Dönüşümün sayıları `analiz/gorsel.md` içinde; motor aynı sayıları kullanıyor (`engine/src/bars.js`).
- **Ağır çekim (karelerden gözle, ölçülmedi):** r01 ve r03'te bant kapalıyken hareket yavaşlıyor; etrafta şok dalgası halkaları beliriyor.

## 3. Karakterler

- **Kafa ve uzuvlar siyah:** kafa büyük; karakterin boyu kabaca 4–5 kafa (karelerden gözle). Kollar ve bacaklar ince çubuklar, uçları yuvarlak.
- **Boyun:** kafa ile gövde arasında ince, siyah bir boyun görünüyor (karelerden gözle).
- **Kıyafet:** tek bir renk (kapüşonlu ya da şapka). İnce siyah dış çizgisi var, gövde dar, kollar kalın tüp şeklinde. Alt maddeler karelerden gözle okundu:
  - Kapüşon başı sarmıyor; ensede duruyor ve sırta doğru sarkıyor.
  - Kollar bir manşetle bitiyor, ucunda siyah, başparmaklı bir el var. Kol, kıyafetin eteğine kadar iniyor; daha uzun değil.
  - Yakadan iki beyaz bağcık sarkıyor.
- **Eşya tutuşu:** el eşyaya gidiyor. Fincan içerken fincanın kenarı dudakta, gözler kapalı.
- **Kenar ışığı:** ışık tarafında krem-turuncu bir şerit. Bu şerit, silüetin ışığa doğru kaydırılmış bir kopyası.
- **Yüz:** yalnızca beyaz işaretler: oval gözler, beyaz bir gülümseme çizgisi. Şaşkınlıkta yuvarlak gözler ve "O" ağız.
- **Konuşmalar:** anlatıcının yanında hep konuşan karakterler var. Espriyi çoğunlukla onlar yapıyor.

## 4. Kamera ve kurgu

- **Kamera:** zamanın %23–45'inde sabit, %29–54'ünde yavaşça itiyor (saniyede yaklaşık %1,2), %15–25'inde geri çekiliyor.
- **Kesme sıklığı:** hook'ta 10 saniyede 2,4–4,8 kesme ya da geçiş.
- **Geçişler:** beyaz flaş, glitch ve kameranın bir pencereye dalması.
- **Dar bant:** kahramanın gücü iş başındayken bantlar 62 pikselden 128 piksele kapanıyor.
  - **Kapanma:** 2–10 karede (videoya göre ortancası 4–6 kare), yumuşak başlayıp yumuşak bitiyor.
  - **Açılma:** ortanca 5 karede (3–6).
  - **Görüntü:** büyümüyor ve kaymıyor; bant görüntünün üstüne kayıyor.
  - **Yer:** ya bir kesmeyle birlikte kapanıyor ya da planın içinde, vurgulanan sözün üstünde. Üç videoda 28 kapanmanın 18'i kesmeyle birlikte.
  - **Süre:** bir kapanış 0,6–34 saniye dar kalıyor; ortancası videoya göre 0,8–4,2 saniye.
  - **Sıklık:** konuya bağlı. Hız ve refleks anlatan videonun %22'si dar bantlı, diğer ikisinin %0,8'i ve %10'u. Hook'larda %0–22.
  - **Ne zaman:** alt yazıdaki cümle gücün yaptığı şeyi anlatırken ("fincan düşmeye başlamadan elin altında"). Hook'larda tanık, sayı ve başlık planlarında bant açık.
- **Yakın ve geniş planlar sırayla:** eşya yakın planları (fincan, telefon, saat) geniş setlerin arasına giriyor.
- **Ekran yazıları:**
  - HUD: kronometre ve "0.025 s" gibi parlayan turuncu sayılar.
  - Başlık kartı: iki satır, üst satır küçük ve krem, alt satır büyük ve turuncu, ikisi de parlıyor.
  - Bilgi kartları: koyu lacivert zemin, hız çizgileri, küçük figürlerden grafikler.

## 5. Ses

- **Seslendirme:** sakin anlatıcı, saniyede yaklaşık 2 kelime. Hook'un üçte biri sözsüz.
- **Müzik:** yumuşak, sinematik. Başlıkta bir patlama ("boom"), anlatım dönerken stinger.
- **Bant kapanırken:** ses 5–7,5 dB yükseliyor ve alçak frekanslarda (150 Hz altı) bir kabarma oluyor. Keskin bir vuruş değil. Bant açılırken düzenli bir ses yok.
- **Ses düzeyi:** -15 LUFS civarı (referans hook'ları -14,9 ile -15,6 arası), tepe -1,5 dBFS.

## 6. Script

Hook dört adım (`analiz/script.md`):
1. Güç iş başında
2. Bir tanık şaşırıyor
3. Sayı karşılaştırması (ekranda da)
4. Başlık sorusu

Sonra "işte nasıl işliyor" ve gövde: kural, gündelik anlar, bedel, büyük seçim. Son ya devam bölümüne kanca ya da izleyiciye soru.
