# Görüntünün ölçümü: referans ve bizim kopya

Üç referans videonun **hook'u** (r01 ilk 40 sn, r02 ilk 47 sn, r03 ilk 50 sn) ve bizim 40 saniyelik kopyamız aynı yöntemle, kare kare ölçüldü.
Bu sayfa ölçüm dosyalarından otomatik üretildi. Veri: `veri/gorsel_r01.json` … `veri/gorsel_bizim_*.json` (her saniyeden bir örnek dahil).

| Ölçü | r01 | r02 | r03 | Aralık | Biz v1 | Biz v2 | Biz v3 | Biz v4 | Biz v5 | Biz v6 | Biz v7 | Biz v9 | Not |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Siyah bantlı kare (%) | 99,3 | 99,5 | 100,0 | 99,3 – 100,0 | 99,9 | 99,9 | 99,9 | 99,9 | 99,8 | 99,9 | 99,9 | 99,9 | Üstte ve altta sinema bandı olan karelerin payı |
| Bant, açık hâli (px, 1080 üzerinden) | 62 | 62 | 62 | 62 – 62 | **60** | **60** | **60** | **60** | **60** | **60** | **60** | 62 | tam yükseklikte ölçüldü |
| Dar bantlı kare (%) | 22,1 | 2,0 | 0,000 | 0,000 – 22,1 | 0,200 | 0,100 | 0,100 | 0,100 | 0,200 | 0,000 | 0,000 | 16,7 | bandın 128 piksele kapandığı kareler; ayrıntı aşağıda |
| En koyu %5 (parlaklık) | 0,056 | 0,042 | 0,043 | 0,042 – 0,056 | **0,011** | **0,031** | 0,054 | 0,054 | 0,054 | 0,054 | 0,054 | 0,054 | Siyahlar kaldırılmış mı: 0 = simsiyah |
| Ortanca parlaklık | 0,168 | 0,341 | 0,108 | 0,108 – 0,341 | 0,116 | 0,135 | 0,141 | 0,142 | 0,140 | 0,116 | 0,116 | 0,116 |  |
| En parlak %5 | 0,575 | 0,679 | 0,330 | 0,330 – 0,679 | 0,544 | 0,568 | 0,569 | 0,567 | 0,527 | 0,498 | 0,460 | 0,459 |  |
| Kontrast (p95 − p5) | 0,521 | 0,598 | 0,281 | 0,281 – 0,598 | 0,508 | 0,506 | 0,495 | 0,489 | 0,470 | 0,454 | 0,423 | 0,424 |  |
| Çok karanlık piksel (%) | 7,7 | 11,2 | 18,0 | 7,7 – 18,0 | **26,9** | 15,6 | 9,8 | 9,9 | 10,1 | 10,0 | 10,0 | 10,4 | parlaklık < 0,06 |
| Çok parlak piksel (%) | 1,3 | 1,9 | 0,530 | 0,530 – 1,9 | **2,8** | **3,0** | **3,1** | **3,1** | 1,8 | 1,7 | 1,7 | 1,7 | parlaklık > 0,8 |
| Renk yoğunluğu, ortanca | 12,3 | 10,7 | 6,8 | 6,8 – 12,3 | **18,7** | **15,4** | **13,7** | 11,2 | 11,1 | 11,0 | 11,0 | 11,1 | Lab kroma |
| Renk yoğunluğu, en renkli %10 | 30,5 | 19,5 | 16,8 | 16,8 – 30,5 | **30,8** | 24,1 | 22,2 | 19,8 | 19,8 | 19,9 | 17,7 | 17,6 |  |
| Sıcak renk payı (%) | 22,4 | 22,4 | 2,3 | 2,3 – 22,4 | 6,2 | 7,5 | 7,0 | 7,7 | 7,4 | 7,4 | 6,9 | 6,2 | kırmızı-turuncu-sarı, kroma > 12 |
| Mor / eflatun payı (%) | 35,9 | 0,400 | 14,6 | 0,400 – 35,9 | **59,2** | **48,2** | **46,8** | 27,6 | 29,2 | 25,7 | 25,6 | 24,7 |  |
| Mavi payı (%) | 0,500 | 8,0 | 9,3 | 0,500 – 9,3 | 4,5 | 6,6 | 6,1 | 6,8 | 5,8 | 5,9 | 5,4 | 8,4 |  |
| Vinyet (köşe / merkez parlaklığı) | 0,302 | 0,706 | 0,284 | 0,284 – 0,706 | **0,275** | 0,284 | 0,347 | 0,348 | 0,382 | 0,402 | 0,393 | 0,389 | küçük = koyu köşeler |
| Net alan (%) | 37,5 | 37,5 | 28,1 | 28,1 – 37,5 | 31,2 | 31,2 | 31,2 | 31,2 | 31,2 | 28,1 | 28,1 | 28,1 | karenin keskin kalan kısmı; gerisi alan derinliği bulanıklığında |
| Silüet (%) | 10,1 | 13,3 | 32,2 | 10,1 – 32,2 | 15,2 | 13,8 | **8,9** | 10,4 | 10,5 | 12,8 | 12,7 | 12,6 | neredeyse siyah ve renksiz pikseller |
| Kamera sabit (%) | 35,3 | 23,2 | 45,3 | 23,2 – 45,3 | **19,9** | 28,6 | 29,5 | 29,5 | 28,2 | 31,6 | 30,0 | 30,8 |  |
| Kamera kayıyor (%) | 23,2 | 39,8 | 18,1 | 18,1 – 39,8 | **17,1** | 20,5 | 20,0 | 20,5 | 27,3 | 28,7 | 29,5 | 30,3 |  |
| Kamera itiyor (%) | 46,0 | 53,5 | 28,9 | 28,9 – 53,5 | **67,8** | **57,1** | 53,3 | **53,8** | 49,3 | 42,6 | 44,1 | 43,0 | yavaş yaklaşma |
| Kamera çekiliyor (%) | 14,7 | 16,9 | 24,7 | 14,7 – 24,7 | **6,2** | **12,4** | 14,8 | **13,8** | 17,2 | 19,1 | 16,8 | 17,6 | yavaş uzaklaşma |
| İtme hızı (% / kare) | 0,051 | 0,114 | 0,051 | 0,051 – 0,114 | 0,051 | 0,051 | 0,051 | 0,051 | 0,051 | 0,051 | 0,051 | 0,051 |  |
| Kesme + geçiş, 10 saniyede | 4,8 | 4,5 | 2,4 | 2,4 – 4,8 | 4,0 | 4,0 | 4,0 | 4,0 | 3,8 | 3,8 | 3,8 | 3,8 | kesme, flaş, efekt geçişi |

**Kalın** = referansın en küçüğü ile en büyüğü arasındaki aralığın dışında.

## Kopyanın son hâli (v9)

Bütün ölçüler referansın aralığında.

## Okuma notları

- **Siyah bant:** bant hiç kalkmıyor ama sabit de değil: 62 pikselde duruyor, bazı anlarda 128 piksele kapanıyor. Ayrıntısı aşağıda, "Sinema bandı" bölümünde.
- **Siyahlar kaldırılmış:** en koyu %5'lik dilim 0,04–0,06 parlaklıkta. Silüet karakterler bile simsiyah değil.
- **Alan derinliği:** karenin yalnızca %28–38'i keskin. Karakter net, arka plan ve ön plandaki nesneler bulanık.
- **Renk sakin:** ortanca kroma 7–12. Renk, sıcak ışıklarda ve kıyafetlerde toplanıyor; setler mor-mavi ve gri.
- **Kamera:** zamanın üçte biri ile yarısı arasında çok yavaş bir itme var (kare başına %0,05). Sabit ve geri çekilen planlar da var.
- **Kesme:** 10 saniyede 2,4 ile 4,8 arası kesme ya da geçiş. Geçişler flaş ve "glitch" efektleri.

## Bizim kopyada sürümden sürüme ne değişti

- **v1 → v2:** mor payı çok yüksekti ve siyahlar fazla derindi. Gece renkleri griye çekildi, odaya sıcak ışık eklendi, karakterler setten ayrı renklendirildi. Kamera artık bazı planlarda sabit duruyor, bazılarında geri çekiliyor.
- **v2 → v3:** vinyet, siyahları kaldıran ayarın önüne alındı. Köşeler karanlık kalıyor ama simsiyah olmuyor. Dış çekimlerin doygunluğu düşürüldü.
- **v3 → v4:** mor payı doygunlukla değil renk tonuyla düşürüldü. Gece paleti maviye, şafaktaki cephe turuncuya kaydırıldı.
- **v4 → v5:** çok parlak pikseller azaltıldı (pencere ışıkları, masa lambası, ekran, sayı kartındaki figürler, yazıların beyaz özü). Bir plan sabit kaldı, bir plan geri çekilen kameraya çevrildi.
- **v5 → v6:** ölçüler tutuyordu ama referansla yan yana konunca dış çekimler yalın kaldı. Sokak yeniden kuruldu:
  - Kamera göz hizasında. Üç bina yan yana, ortadaki alçak, üstünde gökyüzü bandı.
  - Pencereler cephede gerçek boşluklar. Arkalarında ışıklı odalar ve komşular var.
  - Zemin katta fırın açılıyor. Önde çit, bank, lamba, ağaç ve araba katman katman duruyor.
  - Cepheler koyulaştı, pencereler kehribar oldu. Işık duvara taşıyor.
  - Yakın planlar açılı çekildi. Alan derinliği dar, önde bulanık bir dal var.
  - Bu turda ölçüm sapmadı: mor payı ve silüet payı referansa doğru kaydı.
- **v6 → v7:** bu tur ölçümle değil, gözle yapıldı. Sayıların hiçbiri karakterin sandalyeye oturmadığını ya da kupanın alna gittiğini söylemiyordu.
  - Karakter çizimi referansa yaklaştırıldı: ince boyun, ensede kapüşon, manşet ve el, ayakkabı, daha belirgin yüz.
  - Eller artık eşyanın olduğu yere uzanıyor: kupanın kenarı dudağa, bir el gitarın tellerine, diğeri sapına.
  - Sandalye oturanın kalçasının altına alındı. Laptop, gitar, kitap ve kupa yeniden çizildi; masaya bir üst yüzey eklendi.
  - Penceredeki boyalı figürler gerçek karakter oldu: çay içen, telefonda konuşan, gerinen komşular; tepsi taşıyan fırıncı.
  - Ay gökyüzü bandının içine alındı (v6'da üst bandın arkasında kalıyordu). Kamera karaktere dalarken netlik onu takip ediyor.
- **v7 → v8:** görüntü aynı kaldı, yalnızca sesler değişti (Google AI Studio). Bu yüzden v8 tabloda yok.
- **v8 → v9:** sinema bandı artık kapanıp açılıyor. İlk ölçüm 270 satırlık küçük karelerde yapılmıştı ve yalnızca ortancaya bakmıştı; 128 piksele kapanan planları kaçırmıştı.
  - Bant iki yerde 62 pikselden 128 piksele kapanıyor: "Sen hariç." sözünde ve gecenin yakın planlarında (kitaplar, gitar, saat, Japonca).
  - Bant kapalıyken görüntü soğuk renge dönüyor; sağ üstteki saat de bantla birlikte aşağı kayıyor ve soğuyor.
  - Kapanma anına alçak bir ses kabarması eklendi.
  - İlk denemede dar bantlı karelerimiz referanstan daha mavi çıktı (mavi payı %70, referansta %29–37). Renk dönüşümü referansın dar bantlı karelerine göre ayarlandı.

## Sinema bandı: kapanıp açılıyor

Bantlar bu kez tam yükseklikte (1080 satır), her karede ve videonun tamamında ölçüldü. Veri: `veri/bant_r01.json` … `veri/bant_bizim_*.json` (kare kare bant yükseklikleri, her tutuş ve her değişim).

| Ölçü | r01 | r02 | r03 | Biz v7 | Biz v9 | Not |
|---|---|---|---|---|---|---|
| Bant, açık hâli (px) | 62 | 62 | 62 | 60 | 62 | görüntü 1920×956, yaklaşık 2:1 |
| Bant, dar hâli (px) | 128 | 128 | 128 | – | 128 | görüntü 1920×824, yaklaşık 2,35:1 |
| Dar bantlı kare, hook (%) | 22,1 | 2,0 | 0,0 | 0,0 | 16,7 | hook süreleri yukarıdaki tabloyla aynı |
| Dar bantlı kare, tüm video (%) | 22,0 | 0,8 | 10,2 | – | – | bizim kopya yalnızca hook |
| Daralma sayısı, hook | 2 | 1 | 0 | 0 | 2 |  |
| Daralma sayısı, tüm video | 15 | 4 | 9 | – | – |  |
| Dar kalma süresi, ortanca (sn) | 4,2 | 0,8 | 2,9 | – | 3,2 |  |
| Dar kalma süresi, en kısa – en uzun (sn) | 1,0 – 33,7 | 0,6 – 1,7 | 0,8 – 14,1 | – | 1,0 – 5,4 |  |
| Kapanma, ortanca (kare) | 4 | 4 | 6 | – | 4 | 24 kare/sn |
| Açılma, ortanca (kare) | 5 | 5 | 5 | – | 5 |  |
| Kesmeyle birlikte kapanan / plan içinde kapanan | 14 / 1 | 2 / 2 | 2 / 7 | – | 1 / 1 | kesme, kapanmanın 2 karesi içinde |
| Kapanınca ses düzeyi (dB) | +7,5 | +5,0 | +6,1 | – | +5,8 | sonraki yarım saniye, önceki yarım saniyeye göre |
| Aynı ölçü, rastgele anlarda (dB) | -0,7 | -0,3 | +0,4 | – | -0,5 | karşılaştırma için 400 rastgele an |
| Kapanırken alçak frekans tepesi (×) | 8,0 | 13,1 | 6,1 | – | 12,9 | 150 Hz altı, videonun ortancasına göre |
| Aynı ölçü, rastgele anlarda (×) | 3,5 | 5,3 | 3,1 | – | 4,8 |  |

### Ne oluyor

- **Bant 62 pikselde duruyor, 128 piksele kapanıyor.** Kapanma 2–10 karede (videoya göre ortancası 4–6), açılma ortanca 5 karede oluyor; ikisi de yumuşak başlayıp yumuşak bitiyor.
- **Görüntü büyümüyor ve kaymıyor.** Aynı planın içinde kapanan anlarda bant öncesi ve sonrası kareler üst üste oturuyor: bant görüntünün üstüne kayıyor.
- **Ne zaman kapanıyor:** kahramanın gücü iş başındayken. r01'de bunlar ağır çekim anları (düşen fincan, top, yumruk); r02'de kısa "fark etme" anları; r03'te refleks testleri. Bant kapanınca alt yazıdaki cümle hep gücün yaptığı şeyi anlatıyor.
- **Ne kadar:** videodan videoya çok değişiyor. Konu hız ve refleks olunca (r01) videonun beşte biri dar bantlı; r02'de yüzde birin altında.
- **Ses:** kapanma anında ses 5–7,5 dB yükseliyor ve alçak frekanslarda bir kabarma oluyor. Keskin bir vuruş değil, alttan gelen bir dalga. Açılışta düzenli bir ses yok.

### Bant kapalıyken renk

Bant kapanırken aynı karelerde renk de değişiyor. Aşağıdaki tablo bantların dar ve açık olduğu saniyeleri ayrı ayrı gösteriyor.

| Ölçü | r01 dar | r01 açık | r02 dar | r02 açık | r03 dar | r03 açık | Biz v9 dar | Biz v9 açık |
|---|---|---|---|---|---|---|---|---|
| Saniye sayısı | 95 | 304 | 5 | 518 | 42 | 283 | 6 | 34 |
| Mor / eflatun payı (%) | 25,6 | 30,6 | 1,3 | 0,9 | 22,6 | 7,2 | 20,3 | 25,4 |
| Mavi payı (%) | 29,4 | 5,0 | 33,5 | 10,6 | 37,1 | 13,2 | 23,3 | 5,6 |
| Sıcak renk payı (%) | 0,7 | 18,7 | 0,1 | 15,4 | 0,1 | 2,4 | 0,0 | 7,1 |
| Renk yoğunluğu, ortanca | 13,6 | 13,4 | 9,6 | 9,1 | 14,0 | 6,9 | 11,8 | 12,0 |
| Ortanca parlaklık | 0,171 | 0,194 | 0,317 | 0,293 | 0,107 | 0,129 | 0,206 | 0,153 |

- **Sıcak renk kayboluyor.** Bant kapalıyken sıcak renk payı sıfıra yakın; turuncu ışıklar gri-eflatuna dönüyor.
- **Görüntü maviye ve mora kayıyor**, biraz da koyulaşıyor (aynı sahnenin açık ve dar kareleri arasında parlaklık oranı 0,89).
- **Dönüşüm ölçüldü.** Aynı sahnenin bant açık ve bant kapalı 8 kare çifti üst üste kondu (12.000 blok) ve renk dönüşümü en küçük karelerle bulundu.
  - Motorun kullandığı hâli: yeni renk = M × renk + o. M = (0,508, 0,367, 0,061); (0,158, 0,679, 0,105); (0,163, 0,304, 0,537); o = (-0,016, -0,012, 0,023).
  - Bu, ham uyumdan küçük bir ayarla türetildi (ayrıntı `veri/bant_renk_uyum.json` içinde). Ham uyumun hatası 0,037, kullanılanın 0,039; hiç dönüşüm uygulanmasa 0,072.
  - Referans her sahneyi ayrı renklendirmiş; tek bir dönüşüm bunların ortalaması.
- **Ağır çekim ölçülmedi.** r01 ve r03'te bant kapalıyken hareketin yavaşladığı karelerden ve alt yazıdan görülüyor ("dünya ağır çekimde"); bunun için ayrı bir ölçüm yapılmadı.
