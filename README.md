# siluet-stili

**Sinematik silüet çöp adam "What If" filmleri. Claude ile, koddan, kare kare.**

Bu repo, Ifverse (@IfverseTales) kanalının "What If" filmlerindeki görünümü **ölçerek** yeniden üretir:

- siyah silüet karakterler ve sıcak bir kenar ışığı,
- düz boyalı setler ve güçlü alan derinliği,
- kapanıp açılan sinema bantları,
- parlayan bir başlık kartı.

Dünya three.js ile kuruluyor. Karakterler ve setler Canvas 2D ile çizilen kartlar. Kareler Puppeteer ile tek tek yakalanıyor ve ffmpeg ile birleştiriliyor. Remotion, React ya da yapay zekâ video üreticisi yok: Claude (isterseniz Codex ya da Antigravity) ve iki npm paketi.

Örnek: **Uykusuz** (`stories/uykusuz/`). "Ya hiç uyuman gerekmeseydi?" sorusuna 40 saniyelik bir açılış. 1920×1080, 24 kare/sn.

▶ **Bitmiş video:** [`ornek/uykusuz.mp4`](ornek/uykusuz.mp4) (1920×1080, sesli, 10 MB)

## İçindekiler

| Yol | Ne |
|---|---|
| `SKILL.md` | Claude için skill: iş akışı, kurallar, tuzaklar |
| `STIL_KITABI.md` | Stilin ölçülmüş sayıları: kare, renk ve ışık, karakterler, kamera ve kurgu, ses, script |
| `analiz/` | Beş rapor: görüntü, script, kanal-konu-başlık, yorumlar, kopya kanallar. Dizini [analiz/README.md](analiz/README.md) |
| `analiz/veri/` | Raporlardaki bütün sayıların ham hâli (JSON): referans videolar ve bizim kopyanın her sürümü |
| `engine/` | Motor: `render.mjs` (kare yakalama), `src/post.js` (alan derinliği, parlama, renk), `src/bars.js` (sinema bandı), `src/stick.js` (karakterler), `src/layer.js` (boyalı kartlar), `src/camera.js`, `audio/mix.py` (ses yerleşimi, sentez müzik ve efektler) |
| `stories/uykusuz/` | Örnek hikâye: `story.js` (setler, planlar, oyunculuk), `sokak.js` (sokak seti), `props.js` (karakterlerin tuttuğu eşyalar ve tutuş pozları), `paint.js`, `room.js`, `SCRIPT.md`, `voice/` |
| `ornek/uykusuz.mp4` | Örnek hikâyenin bitmiş hâli |
| `AGENTS.md` | Codex ve benzeri ajanlar için kısa giriş: önce `SKILL.md` |
| `requirements.txt` | Python paketleri |

## Kurulum

1. Gerekenler: Node 18+, Python 3.10+, ffmpeg, Google Chrome. Chrome başka bir yerdeyse ya da Chromium kullanıyorsanız yolunu `CHROME_PATH` ile verin.
2. Paketleri kurun:
   ```bash
   cd engine && npm install
   pip install -r requirements.txt
   ```
3. **Claude Code:** klasörü `~/.claude/skills/siluet-stili/` altına kopyalayın. Sonra şunu söyleyin: *"silüet stiliyle … hakkında bir What If filmi yap"*.
4. **Codex, Antigravity ya da başka bir kod ajanı:** repo klasörünü açın ve şunu söyleyin: *"SKILL.md'yi oku, silüet stiliyle … hakkında bir What If filmi yap"*. Codex kökteki `AGENTS.md` dosyasını kendiliğinden okur; o dosya da ajanı `SKILL.md`'ye yönlendirir.

## Hızlı kullanım

Örnek hikâyenin ses satırları repoda (`stories/uykusuz/voice/satir/`, Google AI Studio TTS). `engine/` klasöründen:

```bash
node render.mjs uykusuz --stills=2,8,17,26,33 --scale=0.5
node render.mjs uykusuz --cues
python audio/mix.py ../stories/uykusuz
node render.mjs uykusuz --name=uykusuz_v1
```

1. Önce kontak sayfasına bakılır (`stories/uykusuz/out/stills.jpg`).
2. Ses ipuçları yazılır (`audio/cues.json`).
3. Miks kurulur (`audio/mix.wav`, -15 LUFS).
4. 1920×1080, 24 kare/sn render alınır (`out/uykusuz_v1.mp4`).

Taslak için `--scale=0.5` kullanın. Bir parçayı render etmek için `--from=10 --to=20` ekleyin.

Kendi hikâyeniz için `stories/uykusuz/` klasörünü kopyalayın. Ses satırlarını `voice/satir/L01.wav …` olarak koyun, kimin konuştuğunu `voice/satirlar.json` dosyasına, satırların başlama saniyelerini `story.js` içindeki `LINES` dizisine yazın.

## Ölçülmüş stil

Referans kanalın en çok izlenen üç videosu kare kare ölçüldü. Ölçülenler: sinema bandının yüksekliği, ton, renk aileleri, vinyet, net alan, silüet payı, kamera hareketi, kesmeler. Bant kapalıyken rengin ve sesin nasıl değiştiği de ayrıca ölçüldü.

Uykusuz aynı yöntemle ölçüldü. Görüntü tablosundaki 23 ölçünün hepsi referansın aralığında. Birkaçı:

| Ölçü | Referans (üç video) | Uykusuz |
|---|---|---|
| Sinema bandı, açık / dar | 62 / 128 px | 62 / 128 px |
| Dar bantlı kare (açılışta) | %0 – 22 | %16,7 |
| En koyu %5 (parlaklık) | 0,042 – 0,056 | 0,054 |
| Çok karanlık piksel | %7,7 – 18,0 | %10,4 |
| Mor / eflatun payı | %0,4 – 35,9 | %24,7 |
| Net alan | %28 – 38 | %28 |
| Kamera sabit | %23 – 45 | %31 |
| Kesme + geçiş, 10 saniyede | 2,4 – 4,8 | 3,8 |

Tablonun tamamı ve sürümden sürüme ne değiştiği [analiz/gorsel.md](analiz/gorsel.md) içinde, ham sayılar `analiz/veri/` içinde.

## Önce ölçün, sonra bakın

Ölçüm sizi doğru aralığa getirir ama her şeyi görmez. Uykusuz'da sayılar tuttuktan sonra kopyayı referansın yanına koyunca şunlar çıktı:

- sokak tek bir yüksek bina ve boş pencerelerden ibaretti,
- cepheler fazla açıktı, ışık duvara taşmıyordu, gözün gideceği tek bir pencere yoktu,
- kupa ağız yerine alna gidiyordu (kol açıyla oynatılıyordu),
- pencerelerdeki komşular boyalı lekelerdi,
- ilk ölçüm bandı "60 piksel, hep aynı" buldu; tam boyda, kare kare ölçünce bandın kapanıp açıldığı görüldü.

Hepsinin sebebi ve çözümü `SKILL.md` dosyasının "Rules learned the hard way" bölümünde.

## Notlar

- Başlık kartı ve ekran yazıları Windows'un `Segoe UI Black` ve `Bahnschrift` yazı tiplerini kullanıyor (Türkçe harfler tam). Başka bir sistemde tarayıcı yedek bir yazı tipine geçer; `stories/uykusuz/story.js` içinde değiştirebilirsiniz.
- Repoda referans kanala ait video ya da kare yok.
- `analiz/` içindeki kopya kanallar bilerek kodlandı (K01, K02 …). Yorum verisinde kullanıcı adı yok.

## Lisans

Kod ve dokümanlar MIT lisanslı. Hikâyeleriniz, karakterleriniz ve sesiniz size aittir.

`analiz/veri/` içindeki video başlıkları ve yorum metinleri sahiplerine aittir ve MIT lisansının kapsamında değildir. Yalnızca inceleme amacıyla konmuştur.

---

### English (short)

Silhouette stickman "What If" films, made from code with Claude:

- black silhouette characters with a warm rim light, flat painted sets and a strong depth of field
- letterbox bars that close in while the hero's ability is at work, with the matching cold grade and low swell
- three.js + Canvas 2D, frame-exact capture with puppeteer and ffmpeg; no Remotion

The style is measured: the reference channel's three most viewed videos, frame by frame, with the target ranges in `STIL_KITABI.md` and `analiz/`, and the raw numbers in `analiz/veri/`. The sample story is `stories/uykusuz` (finished video: `ornek/uykusuz.mp4`). Start with `SKILL.md`; Codex and other agents get there through `AGENTS.md`. Setup: `cd engine && npm install`, `pip install -r requirements.txt`, ffmpeg, Chrome (or `CHROME_PATH`).
