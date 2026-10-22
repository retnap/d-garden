# Eser Yazma Sayfası (`/write`) — Final Audit ve QA Raporu

- **Tarih:** 2026-10-21
- **Kapsam:** `/write` sayfasının mevcut frontend kapsamı (yalnızca `localStorage` taslağı; backend yok)
- **Ortam:** Next.js 16.3.4 (Turbopack), React 19.2.8, TypeScript 5.9.3, Tailwind CSS 4.3.3, Tiptap 2.27.3, pnpm 12.3.4, Node 26.0.0, macOS, Google Chrome (headless)

---

## 1. Yönetici özeti

İlk incelemede sayfada bir **P0 veri kaybı hatası** bulundu: Taslak geri yükleme kodu eksikti. `readDraft()` hiçbir yerde çağrılmıyordu, `hydrated` hiçbir zaman `true` olmuyordu ve bu yüzden otomatik kayıt hiç çalışmıyordu. Kullanıcı "Kaydet"e bassa bile sayfa yenilendiğinde taslak boş açılıyordu.

Bunun dışında şu sorunlar tespit edildi:

- XSS'e açık iki HTML ayrıştırma noktası (P1)
- Bozuk taslak verisinin sessizce silinmesi (P1)
- Dolu bölümlerin onaysız silinmesi (P1)
- Çok sayıda P2/P3 sorun: kelime sayacı, yayınlama doğrulaması, önizleme tutarlılığı, görsel boyutu, mobil taşma ve erişilebilirlik

Tüm P0/P1 sorunlar ve kapsam içindeki P2/P3 sorunların büyük kısmı düzeltildi. Yeni bağımlılık eklenmedi.

Doğrulama sonuçları:

- ESLint: `/write` dosyalarında 0 hata, 0 uyarı
- `tsc --noEmit`: temiz
- `next build`: başarılı
- Gerçek Chrome üzerinde 33 E2E senaryosu: **33/33 PASS**

**Karar: READY WITH LIMITATIONS.** Sınırlamalar §16'da ayrıntılı olarak listelenmiştir; başlıcaları şunlardır:

- Base64 görseller `localStorage` kotasını hızla dolduruyor.
- Safari, Firefox ve gerçek cihazlarda test yapılmadı.
- Gerçek yayınlama ve sunucu tarafı temizleme backend gerektiriyor.

---

## 2. İncelenen dosyalar

| Dosya | Not |
|---|---|
| `app/write/page.tsx` | Sayfa, taslak state'i, kayıt, bölümler, önizleme, yayınlama doğrulaması |
| `components/write/RichTextEditor.tsx` | Tiptap editörü ve araç çubuğu |
| `app/globals.css` (yalnızca "Rich Text Editor" bölümü) | Editör ve önizleme tipografisi, görsel hizalama |
| `app/layout.tsx` | Fraunces/Inter font değişkenleri |
| `package.json`, `eslint.config.mjs`, `tsconfig.json`, `next.config.ts` | Sürümler, lint kuralları (react-hooks 7.1.1), React Compiler kapalı |
| `node_modules/@tiptap/extension-link`, `@tiptap/core` | Link protokol doğrulaması, `generateHTML`/`generateJSON` |
| `AGENTS.md` / `CLAUDE.md` | Proje talimatları |

Projede daha önce bir test altyapısı (test script'i veya test dosyası) ya da `docs/` dizini bulunmuyordu. Bu rapor `docs/qa/` altında oluşturulan ilk belgedir.

## 3. Mevcut mimari

- **Rota:** `app/write/page.tsx` bir istemci bileşenidir (`"use client"`).
  - `WritePage` yalnızca sunucu ve istemci ayrımını yapar. `useSyncExternalStore` ile sunucuda ve hydration sırasında bir yükleme görünümü, istemcide `WriteWorkspace` render edilir.
  - `WriteWorkspace` taslağı, lazy `useState(loadInitialState)` ile ilk render'da `localStorage`'dan okur. Effect içinde senkron `setState` çağrısı yoktur.
- **State:** Tek kaynak `draft: Draft` state'idir. Kayıt durumu ayrıca tutulmaz; `serialized`, `savedSnapshot` ve `failedSnapshot` değerlerinden türetilir.
- **Kayıt:** Tek bir `persist()` fonksiyonu vardır. Otomatik kayıt (500 ms debounce), manuel "Kaydet" ve `pagehide`/`visibilitychange` sırasında bekleyen kaydın yazılması aynı fonksiyonu kullanır.
- **Editör:** `RichTextEditor` her bölüm için `key={activeChapter.id}` ile yeniden mount edilir. Böylece bir bölümün içeriği diğerine taşınamaz.
  - Tiptap eklenti listesi `components/write/editorExtensions.ts` içindedir. Editör ve önizleme temizleme fonksiyonu aynı listeyi kullanır.
- **Önizleme:** HTML, `sanitizeRichText()` ile editör şemasından geçirilir (`generateJSON` → `generateHTML`). Ardından `dangerouslySetInnerHTML` ile gösterilir.
- **Stiller:** `.rich-text-editor` ve `.rich-text-preview` aynı tipografi ve görsel kurallarını paylaşır (`app/globals.css`).

## 4. Özellik envanteri

| Özellik | Durum |
|---|---|
| Eser türü (inceleme/deneme/hikâye/roman) | Çalışıyor; varsayılan kategori türle birlikte değişir, özel kategori korunur |
| Başlık (120), açıklama (240), ilişkili kitap (160) | Çalışıyor; `maxLength` uygulanıyor |
| Kategori | Yalnızca tanımlı değerler kabul edilir |
| Etiketler | `#`/boşluk normalizasyonu, büyük/küçük harfe duyarsız (tr-TR) tekrar engeli, 10 etiket / 30 karakter sınırı, kaldırma |
| Bölüm yönetimi | Ekleme, yeniden adlandırma, onaylı silme, son bölümün korunması, aktif bölüm seçimi, mobil şerit ve masaüstü panel |
| Zengin metin | Kalın, italik, altı çizili, H1–H3, 4 hizalama, renk, vurgu, listeler, alıntı, bağlantı, geri al/yinele |
| Görseller | PNG/JPEG/WebP/GIF, 5 MB sınırı, hazır boyutlar, manuel genişlik/yükseklik, sıfırlama, sol/orta/sağ hizalama |
| Kelime sayacı | Blok sınırlarını doğru ayıran, yalnızca harf veya rakam içeren parçaları sayan, görünür bölümlerin toplamı |
| Otomatik kayıt / manuel kayıt / geri yükleme | Çalışıyor (önceden tamamen devre dışıydı) |
| Kayıt göstergesi | Yükleniyor / Kaydediliyor / Kaydedildi · ss:dd / Kaydedilemedi |
| Önizleme | Temizlenmiş HTML, editörle aynı stiller, Escape ile kapanma, odak yönetimi |
| Yayınlama doğrulaması | Başlık, bölüm başlıkları ve her görünür bölümde içerik kontrolü. **Gerçek yayınlama yoktur**; kullanıcıya bu açıkça söylenir. |

## 5–6. Tespit edilen sorunlar ve önem dereceleri

| # | Önem | Sorun | Yer | Durum |
|---|---|---|---|---|
| 1 | **P0** | Taslak hiç geri yüklenmiyor ve otomatik kayıt hiç çalışmıyordu. `readDraft()` kullanılmıyordu, `setHydrated` çağrılmıyordu (lint uyarısıyla doğrulandı). Yenilemede tüm içerik kayboluyordu. | `page.tsx` `WritePage` | Düzeltildi |
| 2 | P1 | Kelime sayacı ve `publish()` HTML'i `document.createElement("div").innerHTML` ile ayrıştırıyordu. Kurcalanmış bir taslaktaki `<img onerror>` bu yolla çalışır (XSS). | `page.tsx` `wordCount`, `publish` | Düzeltildi (`DOMParser`, etkisiz belge) |
| 3 | P1 | Önizleme, aktif olmayan bölümlerin ham `localStorage` HTML'ini temizlemeden basıyordu. | `page.tsx` `renderPreviewContent` | Düzeltildi (`sanitizeRichText`) |
| 4 | P1 | `readDraft()` bozuk JSON'da `null` döndürüyordu; ilk düzenleme eski veriyi sessizce eziyordu. Başlığı eksik bölümleri içerikleriyle birlikte atıyordu. | `page.tsx` `readDraft` | Düzeltildi (yedek + bildirim, içerik kurtarma) |
| 5 | P1 | Dolu bir bölüm onay alınmadan, geri alınamaz şekilde siliniyordu. | `page.tsx` `deleteChapter` | Düzeltildi (`confirm`) |
| 6 | P2 | Yinelenen bölüm kimlikleri, bir düzenlemenin iki bölümü birden değiştirmesine yol açıyordu. React'te de anahtar çakışması oluşuyordu. | `readDraft` | Düzeltildi |
| 7 | P2 | Seçili bir görsel varken yeni görsel eklemek, seçili görselin yerine geçiyordu. | `RichTextEditor` görsel yükleme | Düzeltildi (arkasına ekleme) |
| 8 | P2 | Kelime sayacı paragrafları birleştiriyordu (`<p>bir</p><p>iki</p>` = 1). Gizli bölümleri ve "—" gibi işaretleri de sayıyordu. | `wordCount` | Düzeltildi (`countWords`) |
| 9 | P2 | Boş editör (`<p></p>`) "içerik var" sayılıyordu. Yalnızca görsel içeren içerik reddediliyordu. Boş bölümler ve boş bölüm başlıkları yayın kontrolünden geçiyordu. | `publish` | Düzeltildi |
| 10 | P2 | Tür değiştirmek, kullanıcının seçtiği özel kategoriyi eziyordu. | `changeWorkType` | Düzeltildi |
| 11 | P2 | Manuel görsel yüksekliği etkisizdi: `height` HTML niteliği CSS'teki `height:auto` tarafından eziliyordu. | `Image.extend` | Düzeltildi (inline style; eski `height` niteliği okunmaya devam ediyor) |
| 12 | P2 | Önizlemede H1/H3 stilleri, görsel kenar boşlukları ve köşe yuvarlaması yoktu; editörle görünüm farklıydı. | `globals.css`, önizleme | Düzeltildi (stiller paylaşıldı) |
| 13 | P2 | Görsel boyut menüsü başka bir görsel seçildiğinde açık kalıyor ve eski ölçüleri yeni görsele uyguluyordu. Geçersiz girdi `NaNpx` üretiyordu. | `RichTextEditor` | Düzeltildi |
| 14 | P2 | 320 ve 375 px'te sayfa yatay taşıyordu (layout genişliği 430 px). Nedeni, gizli ama yer kaplayan (`visibility:hidden`) renk paletleriydi. | `RichTextEditor` paletler | Düzeltildi |
| 15 | P2 | Görsel ekleme klavyeyle kullanılamıyordu (`display:none` input'a bağlı odaklanamaz bir `label`). | `RichTextEditor` | Düzeltildi (düğme) |
| 16 | P2 | Mobil bölüm şeridinde silme düğmesi yoktu. | `page.tsx` mobil `nav` | Düzeltildi |
| 17 | P2 | Önizleme modalı Escape ile kapanmıyordu, odak modala taşınmıyor ve kapanınca geri dönmüyordu. | `page.tsx` | Düzeltildi |
| 18 | P2 | Son 500 ms içindeki değişiklikler sayfa yenilenince kayboluyordu. | Otomatik kayıt | Düzeltildi (`pagehide`/`visibilitychange`) |
| 19 | P2 | Hata ve başarı mesajları aynı yeşil kutuda gösteriliyordu; hatalar `role="alert"` değildi. | Durum mesajı | Düzeltildi |
| 20 | P3 | Etiket normalizasyonu eksikti (`##a`, iç boşluklar, `Roman`/`roman` tekrarı). | `addTag` | Düzeltildi |
| 21 | P3 | Tiptap "SSR has been detected" konsol uyarısı veriyordu. | `useEditor` | Düzeltildi (`immediatelyRender: false`) |
| 22 | P3 | Seçim boşken bağlantı ekleme hiçbir şey yapmıyordu. | `addLink` | Düzeltildi (adres, bağlantılı metin olarak eklenir) |
| 23 | P3 | Dokunmatik cihazlarda paletler yalnızca hover ile açılıyordu. | Palet düğmeleri | Düzeltildi (tıklamada odak), gerçek cihazda test edilmedi |
| 24 | P3 | Araç çubuğunda yinelenen ayırıcı vardı; biçim düğmelerinde `aria-pressed` eksikti. | `RichTextEditor` | Düzeltildi |
| 25 | P3 | `#8A9890` küçük metinde beyaz üzerinde yaklaşık 3:1 kontrast veriyordu (WCAG AA altı). | `page.tsx` yardımcı metinler | Mevcut Ink Light `#65766D` tokenına geçildi |
| 26 | P2 | Base64 görseller `localStorage` kotasını (Chrome'da origin başına yaklaşık 5 MB) hızla dolduruyor. 5 MB'lık tek bir görsel bile kaydı başarısız kılabilir. | Görsel ekleme / kayıt | **Kısmen ele alındı:** hata artık doğru bildiriliyor. Kök çözüm backend veya IndexedDB gerektiriyor (§17). |
| 27 | P3 | Taslak formatında bir sürüm alanı yok; sürüm yalnızca anahtar adında (`-v1`) geçiyor. | `Draft` | Raporlandı; migrasyon yapılmadı |
| 28 | P3 | Modalda odak tuzağı ve arka plan kaydırma kilidi yok. | Önizleme | Ertelendi |

## 7. Uygulanan düzeltmeler (özet)

1. **Taslak yükleme (React 19 uyumlu):** `useSyncExternalStore` ile istemci tespiti yapılıyor, ardından lazy `useState(loadInitialState)` çalışıyor. Effect içinde senkron `setState` yok. ESLint kuralı kapatılmadı; `react-hooks` 7.1.1 kurallarının hepsi geçiyor.
2. **Kayıt durumu türetiliyor:** `saveState`, `serialized`, `savedSnapshot` ve `failedSnapshot` değerlerinden hesaplanır.
   - Açılışta başlangıç değeri "kaydedilmiş" kabul edilir. Böylece boş taslak yazılmaz ve düzeltilmiş bir taslak, kullanıcı değişiklik yapana kadar ham veriyi ezmez.
   - `lastSavedAt` yalnızca `setItem` başarılı olduğunda güncellenir.
   - Başarısız olan içerik değişene kadar otomatik olarak yeniden denenmez; "Kaydet" ile manuel tekrar mümkündür.
   - Zamanlayıcı her değişiklikte temizlenir, bu yüzden eski içerik yenisinin üzerine yazılamaz.
   - Effect içindeki zamanlayıcı geri çağrısı `useEffectEvent` ile tanımlanmıştır.
3. **`readDraft` sağlamlaştırıldı:**
   - Depolama erişim hatası ve bozuk JSON ayrı ayrı ele alınır; bozuk JSON durumunda ham veri `dgarden-write-draft-v1-unreadable-backup` anahtarına yedeklenip kullanıcı bilgilendirilir.
   - Eksik alanlı bölümlerin içeriği kurtarılır, yinelenen kimlikler yeniden üretilir.
   - Etiketler normalize edilir ve geçersiz aktif bölüm düzeltilir.
   - Herhangi bir alan düzeltildiyse kullanıcıya bildirim gösterilir.
4. **Güvenlik:** HTML ayrıştırma `DOMParser` ile yapılıyor; önizleme editör şemasından geçiriliyor (`sanitizeRichText`). Tiptap Link eklentisi `javascript:` bağlantılarını hem ayrıştırırken hem render ederken reddediyor; bu davranış test edildi.
5. **İçerik doğrulama:** `countWords()` ve `hasMeaningfulContent()` yardımcıları eklendi. Yayınlama kontrolü bölüm başlığını ve her görünür bölümün içeriğini denetliyor; yalnızca görsel içeren bölümler geçerli sayılıyor.
6. **Bölümler:**
   - Dolu bölüm silinirken onay isteniyor.
   - Aktif bölüm silinince bir önceki bölüm seçiliyor.
   - Mobil şeride silme düğmesi eklendi.
   - Masaüstü listesi `max-h-[60vh]` ile kaydırılabilir hâle getirildi.
   - Boş başlıklar için "Başlıksız bölüm" yedek metni gösteriliyor.
   - `aria-current` eklendi.
   - Tek parça türe geçildiğinde gizlenen bölümlerin korunduğu bilgisi gösteriliyor.
7. **Görseller:** Yükseklik inline style olarak saklanıyor. Geçersiz ölçüler artık `NaN` yerine "otomatik" kabul ediliyor. Boyut menüsü seçili görselin konumuna bağlandı. Seçili görsel varken eklenen görsel onun arkasına ekleniyor. Görsel ekleme düğmesi klavyeyle erişilebilir. Kabul edilen türler açık bir listeyle sınırlandırıldı.
8. **CSS:** Editördeki h1–h3, p, ul, ol, blockquote, a, img ve `img[data-align]` kuralları önizlemeyle paylaşıldı. Yinelenen önizleme görsel kuralları kaldırıldı. Kapalı paletler `display:none` yapıldı; mobilde paletler araç çubuğuna göre konumlanıyor.

## 8. Değiştirilen dosyalar

| Dosya | Değişiklik | Neden |
|---|---|---|
| `app/write/page.tsx` | Yükleme ve kayıt akışı yeniden yazıldı; `readDraft` sağlamlaştırıldı; doğrulama, bölüm, etiket, önizleme ve erişilebilirlik düzeltmeleri yapıldı | #1–6, 8–10, 16–20, 25 |
| `components/write/RichTextEditor.tsx` | Paylaşılan eklentiler, görsel yükleme düğmesi, boyut menüsü, paletler, bağlantı ekleme, `aria-pressed`, `immediatelyRender` | #7, 11, 13–15, 21–24 |
| `components/write/editorExtensions.ts` (yeni) | Tiptap eklenti listesi + `sanitizeRichText()` | Editör ve önizleme tek şemayı kullanıyor (#3, #11) |
| `app/globals.css` | Yalnızca "Rich Text Editor" bölümü: seçiciler önizlemeyle paylaşıldı, önizleme kök kuralı ve boş paragraf kuralı eklendi | #12. Ağaç sahnesi ve diğer global stillere dokunulmadı. |
| `docs/qa/write-page-final-audit.md` (yeni) | Bu rapor | — |

## 9. Çalıştırılan komutlar

```bash
pnpm exec eslint app/write components/write   # başlangıç: 2 uyarı (readDraft, setHydrated kullanılmıyor)
pnpm exec tsc --noEmit
pnpm build                                     # değişikliklerden sonra iki kez
pnpm lint                                      # tüm proje, son kontrol
node write-e2e.mjs                             # headless Chrome + CDP, dev sunucusu (localhost:3000)
node overflow-debug.mjs                        # 320 px taşma kaynağını bulmak için
```

E2E betiği Node'un yerleşik `WebSocket`/`fetch` API'leriyle Chrome DevTools Protocol'ü kullanır ve bağımlılık eklemez. Projede test altyapısı olmadığından betik repoya **eklenmedi**. İstenirse `scripts/qa/` altına alınabilir.

## 10. Test sonuçları

| Sonuç | Kanıt | |
|---|---|---|
| ESLint (`/write` dosyaları) | `pnpm exec eslint app/write components/write` | **PASS** — 0 hata, 0 uyarı |
| ESLint (tüm proje) | `pnpm lint` | **PASS** — 0 hata. 6 uyarının hepsi `/write` dışındaki dosyalarda ve önceden vardı. |
| TypeScript | `pnpm exec tsc --noEmit` | **PASS** |
| Production build | `pnpm build` | **PASS** — `/write` statik olarak prerender edildi |
| Birim/entegrasyon testleri | Projede yok | **NOT RUN** (altyapı yok) |

**E2E (gerçek Chrome, 33/33 PASS):**

| Senaryo | Test | Sonuç |
|---|---|---|
| A | İlk açılışta boş taslak yazılmıyor (`localStorage=null`) | PASS |
| A | Hydration ve konsol: hata/uyarı yok | PASS (düzeltmeden önce FAIL: Tiptap SSR uyarısı) |
| A | Form alanları, otomatik kayıt ("Kaydediliyor…" → "✓ Kaydedildi · 22:22"), kelime sayısı = 6 | PASS |
| A | Etiket: `##Roman`, `roman` tekrarı engellendi, 10 sınırı, kaldırma | PASS |
| A/H | Yenileme sonrası tüm alanlar ve HTML korunuyor; yenileme kaydı değiştirmiyor | PASS |
| A | Yazmanın ~80 ms ardından yenileme: son metin korunuyor (`pagehide`) | PASS |
| 5.1 | Özel kategori korunuyor; varsayılan kategori türle değişiyor | PASS |
| B | 3 bölüm, içerikler ayrı, geçişler doğru, toplam kelime = 7 | PASS |
| B | Yenileme: sıra, başlıklar ve aktif bölüm korunuyor | PASS |
| B | Silme onayı; iptal edilince silinmiyor | PASS |
| B | Aktif bölüm silinince bir önceki seçiliyor | PASS |
| B | Son bölüm silinemiyor | PASS |
| B | Yeniden adlandırma; boş başlık reddediliyor | PASS |
| B | Mobil şerit: ekleme ve silme | PASS |
| B | 39 bölüm: panel kaydırılabiliyor; 1440 ve 375 px'te yatay taşma yok | PASS |
| F | Boş başlık, `<p></p>`, yalnızca boşluk, boş bölüm, boş bölüm başlığı, yalnızca görsel | PASS |
| C | SVG reddediliyor, 6 MB dosya reddediliyor | PASS |
| C | Küçük = 240 px; manuel 300×150 (hesaplanan boyut doğrulandı); orta/sağ/sol hizalama; sıfırlama; `NaN` yok; ikinci görsel bağımsız; menü başka görsele taşınmıyor | PASS (düzeltmeden önce FAIL: seçili görsel yeni eklenenle değişiyordu) |
| C | 320×200, ortalanmış: kayıt → yenileme → önizlemede aynı boyut ve hizalama (sol/sağ boşluk 184/184 px); görsel silinince kayıttan da çıkıyor | PASS |
| D | Kalın/italik/altı çizili, `aria-pressed`, geri al/yinele | PASS |
| D | H1, H3, ortala, iki yana, renk, vurgu, ul, ol, alıntı | PASS |
| D | Palet düğmesine tıklama paleti açıyor | PASS |
| D | `javascript:` reddediliyor; https bağlantısı ekleniyor ve kaldırılıyor; seçim boşken metin olarak ekleniyor | PASS |
| D | Editör ve önizlemede 14 hesaplanmış stil özelliği birebir aynı (h1 36px Fraunces, h2 30px, h3 24px, disc/decimal, blockquote 4px, center, renk, vurgu, alt çizgi, 16px paragraf boşluğu, 32px satır yüksekliği); boş paragraf görünür; Escape kapatıyor ve odak "Önizle"ye dönüyor | PASS |
| Güvenlik | Kurcalanmış taslak (`img onerror`, `script`, `javascript:` link, `iframe`): hiçbiri çalışmadı, önizleme HTML'inden temizlendi | PASS |
| 5.6 | Bozuk JSON: yedeklendi, bildirildi, düzenleme olmadan ezilmedi | PASS |
| 5.6 | Geçersiz tür/kategori/başlık türü, karışık etiketler, yinelenen/eksik bölüm alanları, var olmayan aktif bölüm | PASS |
| 5.6 | Eski `height="120px"` niteliği → 200×120, sağa hizalı | PASS |
| E | `setItem` hatası (mock): "Kaydedilemedi", `role=alert`, saat güncellenmiyor, manuel kayıt da hata gösteriyor; düzelince kaydediliyor | PASS |
| E | `getItem` erişim hatası (mock): bildirim gösteriliyor | PASS |
| G | 320/375/430/768/1024/1440 px: sayfa, araç çubuğu, görsel ve önizleme modalında yatay taşma yok; modal kaydırılabiliyor | PASS (düzeltmeden önce FAIL: 320 ve 375 px) |
| Erişilebilirlik | Görünen tüm düğme ve alanların erişilebilir adı var; görsel ekleme odaklanabiliyor | PASS |
| Konsol | Beklenmeyen hata yok | PASS |

İlk çalıştırmadaki diğer başarısızlıklar test betiğinin kendi hatalarıydı (regex'in `style` niteliğini hesaba katmaması, testler arasında kalan dialog kuyruğu, imleç taşıma yöntemi). Bunlar düzeltildikten sonra tüm senaryolar yeniden koşturuldu.

**Çalıştırılmayanlar:** Safari, Firefox ve gerçek iOS/Android cihazlar **BLOCKED** (ortamda yok). Ekran okuyucu testi **NOT RUN**.

## 11. Responsive kontrol sonuçları

Headless Chrome'da 320, 375, 430, 768, 1024 ve 1440 px genişliklerde (768 px altı mobil emülasyonla) roman türü, 720 px genişlikte görsel, 120 karakterlik başlık, uzun açıklama, 30 karakterlik etiket ve 150 karakterlik kitap adıyla test edildi. Sonuç: **PASS**. 375 ve 1440 px ekran görüntüleri incelendi; uzun içerikler kırılıyor, araç çubuğu satır atlıyor ve modal `85vh` içinde kayıyor.

Bilinen not: Mobilde bölüm şeridi yatay kaydırma kullanıyor (bilinçli tasarım). Uzun bölüm adları `max-w-48` ile kısaltılıyor.

## 12. Güvenlik değerlendirmesi

- **Kapatılan açıklar:**
  - Bağlı (`document` sahipli) `div.innerHTML` kullanımı kaldırıldı.
  - Önizleme HTML'i artık editör şemasından geçiyor. Şemada olmayan etiketler (`script`, `iframe`), olay nitelikleri (`onerror`) ve izin verilmeyen protokoller ayıklanıyor.
- **Bağlantılar:** Araç çubuğu yalnızca `http(s)://` kabul ediyor. Tiptap Link eklentisinin `isAllowedUri` kontrolü yapıştırma, ayrıştırma ve render sırasında `javascript:` adreslerini reddediyor. Bağlantılara `rel="noopener noreferrer nofollow"` ekleniyor.
- **Tehdit modeli:** Mevcut hâlde HTML yalnızca kullanıcının kendi tarayıcısından geliyor (self-XSS / kurcalanmış depolama).
- **Sınır:** Bu istemci tarafı önlemler **sunucu tarafı doğrulamanın yerine geçmez**. Yayınlanan içerik başka kullanıcılara gösterileceği zaman sunucu şunları yapmalıdır:
  - HTML'i izin listesi tabanlı bir temizleyiciyle temizlemek
  - Görsel kaynaklarını kendi depolamasına taşımak (`data:` URI kabul etmemek)
  - Uzunluk ve boyut sınırlarını yeniden uygulamak
  - Bir CSP başlığı tanımlamak

## 13. Veri kaybı riskleri

| Kontrol | Sonuç |
|---|---|
| Boş başlangıç verisi mevcut taslağı ezmiyor | Doğrulandı (A1, A5) |
| Eski zamanlayıcı daha yeni içeriği ezmiyor | Tasarım gereği: her değişiklik bekleyen zamanlayıcıyı iptal eder |
| Bölüm değişiminde içerik kaybı yok | Doğrulandı (B1, B2) |
| Hatada başarılı kayıt mesajı gösterilmiyor | Doğrulandı (E1) |
| Bozuk taslak sessizce silinmiyor | Yedekleniyor ve bildiriliyor (R1) |
| Dolu bölüm onaysız silinmiyor | Doğrulandı (B3) |
| Tek parça türe geçişte gizlenen bölümler korunuyor | Korunuyor ve bilgi metni gösteriliyor |

**Kalan riskler:**

- `localStorage` kotası (base64 görseller)
- Tek bir tarayıcıya ve tek bir taslağa bağlı saklama
- `pagehide` olayının her durumda tetikleneceği garanti değil (ör. tarayıcının çökmesi); bu durumda son ≤500 ms kaybolabilir
- Kullanıcı tarayıcı verisini temizlerse taslak kaybolur

## 14. Performans değerlendirmesi

- `JSON.stringify(draft)` her taslak değişikliğinde bir kez hesaplanıyor (`useMemo`). Aynı değer hem kayıtta hem kirli kontrolünde kullanılıyor. Aynı içerik tekrar tekrar kaydedilmiyor.
- Kelime sayacı her değişiklikte görünür bölümlerin tümünü `DOMParser` ile ayrıştırıyor. 39 bölümlük testte gözle fark edilir bir gecikme olmadı, ancak bu **ölçülmedi**. Çok sayıda büyük bölümde, bölüm başına önbellek eklemek bir iyileştirme adayı.
- Base64 görseller hem kayıt boyutunu hem `stringify` maliyetini büyütüyor. Kök çözüm, görsellerin URL olarak saklanması (backend).
- Zamanlayıcılar ve olay dinleyicileri effect cleanup'ında temizleniyor.
- Bölüm değişiminde editörün yeniden mount edilmesi bilinçli bir tercih: içerik izolasyonu sağlıyor, karşılığında o bölümün geri alma geçmişi sıfırlanıyor.

## 15. Erişilebilirlik değerlendirmesi

- **Yapılanlar:**
  - Tüm alanların ve ikon düğmelerinin erişilebilir adı var (otomatik test).
  - Biçim düğmelerinde `aria-pressed`, aktif bölümde `aria-current`, paletlerde `aria-haspopup` kullanılıyor.
  - Hata mesajları `role="alert"`, bilgi mesajları ve kayıt göstergesi `role="status"`.
  - Görsel ekleme klavyeyle kullanılabiliyor.
  - Modal açılınca odak kapatma düğmesine gidiyor; Escape ile kapanıyor ve odak geri dönüyor.
  - Küçük yardımcı metinlerin kontrastı yükseltildi (`#65766D`).
- **Eksikler:**
  - Modalda odak tuzağı yok (Tab ile arka plana çıkılabilir).
  - Renk swatch'ları renk kodlarıyla adlandırılıyor ("Yazı rengi #DC2626"); renk adları daha anlaşılır olurdu.
  - `window.prompt/confirm/alert` erişilebilir ama tasarım dilinin dışında.
  - Ekran okuyucuyla test yapılmadı.

## 16. Bilinen sınırlamalar

1. Taslaklar yalnızca bu tarayıcıda ve tek bir taslak olarak saklanıyor.
2. Base64 görseller kotayı hızla dolduruyor; birkaç büyük görselden sonra kayıt başarısız olabilir. Hata kullanıcıya doğru biçimde bildiriliyor.
3. Gerçek yayınlama yok; "Yayınla" yalnızca doğrulama yapıyor ve bunu açıkça söylüyor.
4. Testler yalnızca Chromium üzerinde yapıldı (Safari/Firefox/gerçek cihaz yok).
5. Bölüm değiştirince o bölümün geri alma geçmişi sıfırlanıyor.
6. `maxLength` değerinden uzun eski başlık/açıklama değerleri veri kaybını önlemek için kırpılmıyor.

## 17. Backend gerektiren işler

- Gerçek yayınlama API'si, kimlik doğrulamayla ilişkilendirilmiş yazar
- Kullanıcı hesabına bağlı taslak saklama ve cihazlar arası eşitleme
- Görsel yükleme servisi (URL ile saklama, boyut ve tür doğrulama, yeniden boyutlandırma)
- Sunucu tarafında HTML temizleme ve şema doğrulama, uzunluk sınırları, CSP
- İlişkili kitap alanının kitap veritabanına bağlanması (şu an serbest metin)

Bunlar ayrı iş gerektiriyor; çünkü projede API rotası, veritabanı ve kimlik doğrulamayla bağlantılı bir veri katmanı bulunmuyor. Bu işler kapsam dışında bırakıldı.

## 18. Ertelenen iyileştirmeler

- Modal odak tuzağı ve arka plan kaydırma kilidi
- `prompt/confirm/alert` yerine tasarım diline uygun dialoglar
- Görselleri kaydetmeden önce istemcide küçültme / sıkıştırma, ya da IndexedDB
- Bölüm başına kelime sayısı önbelleği
- Taslak formatına açık bir `version` alanı eklenmesi (eski kayıtlar sürümsüz okunmaya devam etmeli)
- E2E betiğinin repoya alınması ve CI'ye bağlanması

## 19. Teknik borç

- **Azaldı:**
  - Ölü kod (`readDraft`, `setHydrated`) kaldırıldı.
  - Tek bir kayıt fonksiyonu kullanılıyor.
  - Kayıt durumu türetiliyor (yinelenen state yok).
  - Editör ve önizleme stilleri ile Tiptap şeması tek kaynaktan geliyor.
- **Kalan:**
  - `RichTextEditor.tsx` dosyasındaki tutarsız biçimlendirme (satır arası boş satırlar) korundu; ilgisiz yeniden biçimlendirme yapılmadı.
  - Projede Prettier kurulu ama bir script'i yok.
  - Test altyapısı yok.

## 20. Açık sorular

1. Görseller için kalıcı çözüm ne olacak: backend yükleme mi, IndexedDB mi? Bu karar 5 MB sınırını da belirler.
2. Tek parça türe geçildiğinde gizlenen bölümler yayınlamada tamamen yok mu sayılmalı (şu anki davranış), yoksa kullanıcı uyarılmalı mı?
3. Bölümlü eserlerde boş bölümle yayınlamaya izin verilmeli mi? Şu an engelleniyor.
4. E2E betiği repoya eklensin mi?

## 21. Son hazır olma değerlendirmesi

### Bağımsız son kontrol

- **Yeni hata oluştu mu?** Bulunmadı. Tüm senaryolar değişikliklerden sonra yeniden koşturuldu: 33/33 PASS.
- **Mevcut özelliklerden biri bozuldu mu?** Hayır; envanterdeki tüm özellikler test edildi.
- **Taslak verisi kaybolabilir mi?** Yalnızca §13'te belgelenen durumlarda.
- **Otomatik kayıt durumu gerçeği yansıtıyor mu?** Evet; E1 ile doğrulandı.
- **React 19 lint kuralları geçiliyor mu?** Evet (react-hooks 7.1.1, hiçbir kural kapatılmadı).
- **TypeScript hatası var mı?** Yok.
- **Production build başarılı mı?** Evet.
- **Önizleme ve editör arasında biçim farkı var mı?** 14 hesaplanmış stil özelliğinde fark yok.
- **Görsel hizalaması korunuyor mu?** Evet; mekanizma `data-align` niteliği ve buna karşılık gelen CSS. Hesaplanan kenar boşluklarıyla doğrulandı.
- **Mobilde önemli bir sorun kaldı mı?** Chromium'da yok; Safari'de test edilmedi.
- **Belgelenmemiş güvenlik riski var mı?** Yok; sunucu tarafı gereksinimler §12'de belgelendi.

### Kapsam denetimi

| Soru | Sonuç |
|---|---|
| Kapsam dışına çıkıldı mı? | Hayır. Yeni rota, backend, veritabanı veya auth değişikliği yok. |
| Gereksiz özellik eklendi mi? | Hayır. Eklenen küçük UI parçaları (mobil silme düğmesi, etiket sayacı, gizli bölüm bilgisi, önizlemede kategori, "Henüz içerik yok") var olan işlevlerin eksik yüzleri. |
| Gelecek aşama işi yapıldı mı? | Hayır. |
| Tasarım sistemiyle çelişen karar var mı? | Hayır. Yalnızca mevcut tokenlar kullanıldı. `#8A9890` → `#65766D` geçişi kontrast için yapıldı. Hata mesajlarında Tailwind `red-50/700` kullanıldı (sayfada zaten `red-600/700` kullanılıyordu). |
| Proje kurallarına aykırı değişiklik var mı? | Hayır. |
| Belgelenmemiş teknik karar var mı? | Hayır; kararlar §3 ve §7'de. |
| Gereksiz dosya değişikliği var mı? | Hayır. `globals.css` dosyasında yalnızca editör bölümü değişti. |
| Kullanıcı değişikliklerine müdahale edildi mi? | Hayır. `package.json`, `pnpm-lock.yaml`, `layout.tsx` ve diğer dosyalardaki önceki değişikliklere dokunulmadı. |
| Yeni bağımlılık eklendi mi? | Hayır. `generateHTML`/`generateJSON`, mevcut `@tiptap/react` paketinden geliyor. |
| Teknik borç azaldı mı, arttı mı? | Azaldı (§19). |

### Karar: **READY WITH LIMITATIONS**

Mevcut frontend kapsamındaki zorunlu kontroller (lint, tip kontrolü, build ve 33 E2E senaryosu) başarıyla tamamlandı. Engelleyici olmayan sınırlamalar şunlar:

- `localStorage` kotası ve base64 görseller
- Chromium dışı tarayıcılarda ve gerçek cihazlarda test yapılmaması
- Backend gerektiren yayınlama ve sunucu tarafı temizleme
