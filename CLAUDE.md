@AGENTS.md

# D-Garden — Proje Rehberi

> **Durum:** Proje sahibi tarafından 2026-10-22 tarihinde onaylandı. "Doğrulanması gerekenler" başlıklı maddeler
> hâlâ ürün kararı bekliyor; bunları kesinleşmiş sayma.
> Yukarıdaki `@AGENTS.md` satırı `next dev` tarafından yönetilir; silme.

---

## 1. Hedef ve vizyon

D-Garden, okuma alışkanlığını **kişisel bir dijital bahçeye** dönüştüren bir okuma ve yazma platformudur.
Okur kitaplarını ekler, okuma ilerlemesini takip eder, bitirdiği kitabın özetini yazar ve kitaplar üzerine
yazılar üretir. Okuduğunu anladığını gösteren her kitap, bahçesindeki ağacı büyütür.

- **Oku → Düşün → Üret:** Okumak tek başına hedef değildir. Okur kitabı düşünerek bitirir (özet), ardından
  kendi yazısını üretir (inceleme, deneme, öykü, not).
- **Kişisel bahçe:** `/garden` altındaki alan okurun kendi kitaplığı, özetleri, yazıları, başarıları ve ağacıdır.
- **Okuma topluluğu:** `/explore` okurların paylaştığı yazıları, kitapları ve herkese açık bahçeleri bir araya getirir.
  Okurlar birbirini takip edebilir ve takip ettiklerinin yeni yayınlarından haberdar olur. Bu özellik şu an **demo**dur
  (bkz. §8).
- **Public / private bahçe:** Okur bahçesini herkese açık paylaşmayı seçebilir. Private bahçe ve içerikler hiçbir
  topluluk yüzeyinde (Keşfet, bildirimler, yazı detayları) görünmez.

## 2. Ürün prensipleri — vazgeçilmez kurallar

1. **Kitap eklemek ağacı büyütmez.** Kitaplığa eklemek yalnızca kayıttır.
2. **"Okundu" işaretlemek ağacı büyütmez.** Tamamlanma tek başına yeterli değildir.
3. **Ağaç yalnızca tamamlanmış kitap + doğrulanmış özet ile büyür.** Tek kaynak:
   `isVerified()` → [lib/garden/selectors.ts](lib/garden/selectors.ts) (`status === 'completed'` ve
   `summary.status === 'verified'`). Bu kuralı başka yerde yeniden yazma; bu fonksiyonu kullan.
4. **Özet değerlendirmesi karakter sayısı değildir.** Gerçek değerlendirme kitabı anlama, kapsam, doğruluk,
   özgün ifade ve açıklık gibi ölçütlere dayanmalıdır.
5. **100 karakter yalnızca form doğrulamasıdır** (`SUMMARY_MIN_LENGTH`, [lib/garden/constants.ts](lib/garden/constants.ts)).
   AI doğrulama eşiği değildir; öyleymiş gibi kullanma ya da gösterme.
6. **Mock ve gerçek AI değerlendirmesi ayrıdır.** `SummaryEvaluation.source` alanı `'mock' | 'ai'` değerini taşır;
   mock sonuçlar arayüzde her zaman "demo" olarak etiketlenir.
7. **Demo veya tamamlanmamış özellik gerçekmiş gibi gösterilmez.** Demo veriler `isDemo` / "Örnek" / "Demo"
   rozetleriyle işaretlenir. Gerçek olmayan bir backend, AI ya da çok kullanıcılı davranış iddia edilmez.
8. **Görünürlüğü kullanıcı belirler.** Public/private tercihi içeriğin kimlere görüneceğini belirler; private içerik
   hiçbir yolla (liste, arama, bildirim, detay sayfası) sızmamalıdır.
9. **Veri tutarlılığını koru.** Okuma durumu (`status`) ile özet durumu (`summary.status`) bilinçli olarak ayrıdır;
   tamamlanmış kitap ≠ doğrulanmış özet. Store aksiyonları bu ayrımı korur.

## 3. Tasarım sistemi

Renkler [app/globals.css](app/globals.css) içindeki `@theme` bloğunda Tailwind token'ı olarak tanımlıdır
(doğrulandı). Yeni kodda mümkünse token sınıflarını (`bg-forest`, `text-ink`, `border-line` …) kullan; eski
bileşenlerde aynı değerler hex olarak (`text-[#193128]`) geçer — ikisi de aynı paletin parçasıdır.

| Ad | Değer | Token |
|---|---|---|
| Forest Green | `#1F5D42` | `forest` |
| Deep Forest | `#153D2D` | `forest-deep` |
| Sage | `#8FB9A3` | `sage` |
| Soft Mint | `#DDEFE5` | `mint` |
| Mist | `#F4FAF6` | `mist` |
| Ink | `#193128` | `ink` |
| Ink Light | `#65766D` | `ink-light` |
| Border | `#DCE8E1` | `line` |

- **Fontlar** ([app/layout.tsx](app/layout.tsx), `next/font/google`): başlıklar **Fraunces** (`font-display`),
  gövde ve arayüz **Inter** (`font-sans`, varsayılan).
- **Durum renkleri:** `components/garden/ui.tsx` içindeki `Badge`/`Notice` tonları (yeşil, amber, kırmızı, mavi,
  mor = demo). Demo içerik için mor `DemoBadge` / `Notice tone="demo"` kullanılır.
- **Ağaç teması:** [app/garden-theme.css](app/garden-theme.css) ağaç sahnesi ve canvas renkleri için ayrı
  `--garden-*` değişkenleri tanımlar. Koyu tema yalnızca `html.dark` ile açılır; uygulamanın geri kalanı açık temadır.
- **Görsel dil:** Açık tema, sade ve modern; doğa ve dijital bahçe hissi. Yuvarlatılmış kartlar (`rounded-2xl`),
  ince kenarlıklar (`border-line`), mist/mint yüzeyler.
- **Responsive:** Mobil öncelikli. Kontrol edilen genişlikler: 320, 375, 768, 1024, 1440 px; yatay taşma olmamalı.
- **Erişilebilirlik:** Klavye ile kullanım, görünür odak (`focus-visible:outline-*`; `.garden-app` altında global
  odak halkası var), anlamlı ARIA adları, `prefers-reduced-motion` desteği (`motion-reduce:*` ve garden-theme.css).
- **Yeni renk, font veya görsel stil ekleme.** Mevcut paletle çelişen bir şey gerekiyorsa önce sor.

## 4. Teknik mimari

### Sürümler (package.json + node_modules ile doğrulandı)

- Next.js **16.3.4** (App Router, Turbopack), React / React DOM **19.2.8**, TypeScript **5.9.3** (`strict`)
- Tailwind CSS **4.3.3** (`@tailwindcss/postcss`, CSS tabanlı `@theme` yapılandırması; `tailwind.config` dosyası yok)
- Tiptap **2.27.3** (zengin metin editörü), lucide-react **1.47.0** (ikonlar), clsx + tailwind-merge (`cn()`)
- ESLint **9.39.5** (`eslint-config-next` core-web-vitals + typescript), Prettier 3
- Paket yöneticisi **pnpm** (`packageManager: pnpm@12.3.4`). React Compiler kapalı.
- Next.js sürümü eğitim verisinden farklı olabilir: API kullanmadan önce `node_modules/next/dist/docs/` içindeki
  ilgili rehberi oku (bkz. AGENTS.md). Örn. `params`/`searchParams` Promise'tir; `useSearchParams` statik sayfada
  `<Suspense>` gerektirir.

### Klasörler

| Yol | Sorumluluk |
|---|---|
| `app/` | Rotalar. `layout.tsx` fontları ve `SiteLayout`'u bağlar. |
| `app/garden/` | Kişisel bahçe (kitaplık, okuma listeleri, özetler, yazılar, başarılar, istatistik, ayarlar). `layout.tsx` → `GardenShell`. |
| `app/explore/` | Keşfet: okur yazıları, kitaplar, public bahçeler, takip ve bildirim (demo). |
| `app/articles/[id]`, `app/books/[id]` | Yazı ve kitap detayları. `articles` `lib/social` verisine bağlı; `books` hâlâ statik. |
| `app/write/` | Bağımsız eser yazma sayfası (Tiptap, kendi localStorage taslağı). |
| `app/login`, `register`, `forgot-password` | Yalnızca arayüz + form doğrulaması; kimlik doğrulama yok. |
| `components/homepage/` | Anasayfa bölümleri, `Navbar`, `Footer`. |
| `components/layout/SiteLayout.tsx` | `/garden` dışındaki tüm sayfalara Navbar + Footer ekler. |
| `components/garden/` | Bahçe ekranları ve ortak UI (`ui.tsx`: `cn`, `buttonStyles`, `Badge`, `Notice`, `EmptyState`, `LoadingState`, `ErrorState`, `formatDate`…; `Modal.tsx`: native `<dialog>`). |
| `components/explore/` | Keşfet kartları, `FollowButton`, `NotificationInbox`, `ExploreContent`. |
| `components/write/` | `RichTextEditor` ve `editorExtensions` (`sanitizeRichText`). |
| `lib/garden/` | Bahçe veri modeli (`types`), store, seçiciler, sabitler, demo veri, mock değerlendirici. |
| `lib/garden-tree/` | Ağaç modeli, aşamalar ve canvas çizicisi. |
| `lib/social/` | Topluluk modeli: kullanıcılar, yazılar, public bahçeler, takip, bildirim (demo veri + görünürlük kuralları + store). |
| `docs/qa/` | QA / audit raporları. |

### Server / Client Component ayrımı

- Varsayılan Server Component'tir. `localStorage`, state, olay işleyici ya da tarayıcı API'si gereken dosyalar
  `"use client"` ile başlar (bahçe ekranları, `/write`, Keşfet içeriği, yazı detayı).
- Sayfa metadata'sı yalnızca Server Component sayfadan export edilir (örn. `app/explore/page.tsx` ince bir server
  sayfadır, etkileşimli kısım `ExploreContent`'tedir).
- localStorage verisi `useSyncExternalStore` ile okunur; sunucuda ve hydration sırasında snapshot `null` döner ve
  bileşen yükleniyor/pasif durum gösterir. Hydration uyumsuzluğu yaratacak şekilde render'da `localStorage` okuma.

### State ve veri modeli

- **Bahçe:** [lib/garden/store.ts](lib/garden/store.ts) tek veri kaynağıdır (`dgarden-garden-v1`). Bileşenler
  `useGarden()` / `useGardenSnapshot()` ve export edilen aksiyonları kullanır; doğrudan localStorage'a yazmaz.
  Bozuk kayıt yedeklenir (`…-unreadable-backup`), depolama yazılamazsa `storage: 'unavailable'` gösterilir.
- **Değerlendirme:** `SummaryEvaluator` arayüzü ([lib/garden/evaluation.ts](lib/garden/evaluation.ts)); şu an
  `createMockEvaluator`. Gerçek servis aynı arayüzle `setSummaryEvaluator()` üzerinden bağlanmalı.
- **Topluluk:** [lib/social/](lib/social/) — `types.ts` (backend'e taşınabilir model), `demo-data.ts` (örnek
  içerik, bilerek private kayıtlar içerir), `selectors.ts` (`canViewArticle`, `canViewGarden`, `canViewGardenUpdate`
  … tüm görünürlük kuralları), `store.ts` (`dgarden-social-v1`: takipler, bildirimler, simüle edilen yayınlar).
- **/write:** Kendi taslağını `dgarden-write-draft-v1` anahtarında tutar; bahçedeki `works` ile bağlı değildir.

### İsimlendirme ve kod stili

- Rotalar küçük harf, İngilizce klasör adları (`/garden/reading-list`, `/explore`). Arayüz metinleri Türkçe.
- Bileşenler PascalCase dosya adı ve default export (homepage'de birkaç eski istisna var: `Last_Articles`,
  `eventSection`, `newestWorks` — yeniden adlandırma yapma).
- İçe aktarmalarda `@/` takma adı. Yorumlar Türkçe ve kısa; çevredeki kodun stiline uy
  (`components/garden` ve `lib` tek tırnak, `components/homepage`/`explore` sayfaları çift tırnak).

### Geliştirme kuralları

- Önce var olanı kullan: `components/garden/ui.tsx`, `Modal`, seçiciler ve store aksiyonları. Aynı işi yapan ikinci
  bir yardımcı yazma.
- Gereksiz yeniden yazım ve ilgisiz refactor yapma.
- Yeni bağımlılık eklemeden önce gerekliliğini gerekçelendir ve kullanıcıya sor.
- Her değişiklikten sonra çalıştır:
  - `npx tsc --noEmit`
  - `pnpm lint` (şu an 0 hata; `<img>` için bilinen `no-img-element` uyarıları var)
  - `pnpm build`
- Projede test script'i / test çatısı yok. E2E doğrulamalar şimdiye kadar headless Chrome (CDP) betikleriyle
  oturum içinde yapıldı; betikler repoda değil.
- Çalışma ağacında kullanıcıya ait commit'lenmemiş çok sayıda değişiklik olabilir; bunları silme, geri alma veya
  üzerine yazma.

## 5. Güvenlik ve gizlilik

- Gizli anahtarları istemci koduna koyma; `NEXT_PUBLIC_` önekiyle gizli değer yayımlama.
- Gerçek AI değerlendirmesi sunucu tarafında (Route Handler / Server Action) çalışmalı; anahtar istemciye gelmemeli.
- İstemciden gelen hiçbir veriye güvenme. Sunucu tarafında doğrulama, kimlik doğrulama ve yetkilendirme şart.
- Kullanıcı yalnızca erişim izni olan özel içeriği görüntüleyebilir veya değiştirebilir (sahiplik kontrolü).
- **Public/private kararları sunucuda da uygulanmalı.** `lib/social/selectors.ts` içindeki kurallar şu an yalnızca
  istemcide çalışıyor; backend'de sorgu seviyesinde tekrar uygulanmalı. Yalnızca arayüzde gizlemek yeterli değil.
- Takip, bildirim ve içerik işlemlerinde kimlik doğrulama + sahiplik + yetki kontrolü gerekli
  (örn. kişi kendini takip edemez, başkası adına takip/okundu işaretleme yapılamaz).
- Bildirimler private içerik başlığını, özetini veya diğer gizli verileri açığa çıkarmamalı. Mevcut model bunu
  bildirimde başlık saklamayarak ve her gösterimde görünürlüğü yeniden kontrol ederek sağlar; backend'de koru.
- Kullanıcı girdisini doğrula. Zengin metin `sanitizeRichText()` ile editör şemasından geçirilmeden
  `dangerouslySetInnerHTML` ile gösterilmez; bağlantılarda yalnızca `http(s)` kabul edilir. Sunucu tarafı
  temizleme backend aşamasında ayrıca gerekli.
- Rate limiting, tekrar gönderim koruması (idempotency) ve hata yönetimi backend aşamasında ele alınmalı.
- Hassas kullanıcı verisini loglama veya gereksiz yere dışa aktarma.
- Demo verisini gerçek kullanıcı verisinden açıkça ayır (`isDemo`, "Örnek"/"Demo" rozetleri, ayrı modüller).

## 6. Erişilebilirlik ve kalite standartları

- Tüm etkileşimler klavye ile kullanılabilir; odak her zaman görünür.
- Anlamlı HTML (`main`, `section` + başlık, `article`, `time dateTime`, `button` vs. `a` doğru kullanımı).
- Erişilebilir adlar: ikon düğmelerde `aria-label`, durum düğmelerinde `aria-pressed`, ilerlemede `role="progressbar"`,
  dinamik sonuçlarda `aria-live`.
- Durumu yalnızca renkle gösterme: metin + ikon kullan ("Takip ediliyor" ✓, "Yeni" rozeti, "Doğrulandı").
- Responsive kontroller ve mobil menü (Navbar mobil paneli, GardenShell çekmecesi).
- Her veri ekranında boş, yükleniyor ve hata durumu düşünülmeli (`EmptyState`, `LoadingState`, `ErrorState`).
- Gerektiğinde otomatik test, her durumda manuel doğrulama; test çalıştırılmadıysa çalıştırılmış gibi raporlanmaz.

## 7. Çalışma yöntemi ve kapsam disiplini

- Göreve başlamadan önce ilgili dosyaları ve mevcut davranışı incele.
- Yalnızca istenen kapsamda değişiklik yap; ilgisiz refactor ve kapsam dışı özellik ekleme.
- Önemli ürün/mimari kararlarını kendiliğinden kesinleştirme; belirsizlikleri raporla veya sor.
- Her aşamanın sonunda değişen dosyaları, çalıştırılan testleri ve gerçek sonuçlarını, teknik borcu ve sonraki
  adımları bildir.
- Kullanıcı açıkça istemedikçe commit oluşturma.
- Kullanıcı değişikliklerini silme veya üzerine yazma.
- Gerçek backend/AI entegrasyonu yapılmadıysa tamamlanmış gibi gösterme.

## 8. Bilinen sınırlamalar ve gelecek aşamalar

### Bilinen (kodda doğrulandı)

- **Veri yalnızca localStorage'da:** bahçe (`dgarden-garden-v1`), /write taslağı (`dgarden-write-draft-v1`),
  topluluk takip/bildirim (`dgarden-social-v1`). Cihazlar ve kullanıcılar arası paylaşım yok.
- **Kimlik doğrulama ve backend yok.** Kod tabanında `fetch` veya `process.env` kullanımı yok. Giriş/kayıt
  ekranları yalnızca form doğrulaması yapar; "Google ile devam et" işlevsel değildir.
- **AI değerlendirmesi mock:** yüzeysel metin ölçüleriyle deterministik demo sonuç üretir; kitabı anlamayı ölçmez.
- **Takip ve bildirim demo:** tek bir yerel ziyaretçi (`DEMO_VIEWER_ID`) için çalışır; "yeni yayın" bildirim
  kutusundaki simülasyon düğmesiyle üretilir. Gerçek kullanıcılar arası takip ve bildirim dağıtımı backend gerektirir.
- **/write ile bahçe yazıları ayrı:** `/write` taslakları `garden.works`'e düşmez; yayımlama gerçek değildir.
- **Statik detay sayfası:** `/books/[id]` id'yi kullanmaz, her zaman "Suç ve Ceza"yı gösterir.
- **Eksik rotalar:** `/blog` yok (Navbar'dan kaldırıldı); public bahçe ve public profil sayfaları yok (Keşfet'te
  pasif düğme olarak gösterilir); Footer bağlantılarının çoğu (`Blog` dahil) `href="#"`.
- **Bildirim kutusu yalnızca Keşfet sayfasında**; global bir bildirim girişi (Navbar) yok.
- **Lint:** `<img>` için `@next/next/no-img-element` uyarıları (dış kapak görselleri).

### Doğrulanması gerekenler (ürün kararı bekliyor)

- Public bahçe ve profil sayfalarının rotası ve içeriği (`/u/[username]`, `/gardens/[username]` vb.).
- Bildirim kutusunun kalıcı yeri (Navbar, GardenShell ya da ayrı `/notifications` sayfası).
- Gerçek özet değerlendirme ölçütleri, eşik ve tekrar gönderim politikası.
- `/write` ile `garden.works` birleştirilecek mi?
- Footer'daki Blog bağlantısının akıbeti.

### Gelecek aşamalar (öneri)

1. Kimlik doğrulama ve kullanıcı modeli (oturum, sahiplik).
2. Veritabanı + API: kitaplar, özetler, yazılar, görünürlük; store aksiyonlarının API'ye bağlanması.
3. Sunucu tarafı AI değerlendirmesi (`SummaryEvaluator` uygulaması).
4. Takip (`follows`, benzersiz `(follower, followee)`), yayın anında bildirim üretimi (fan-out, benzersiz
   `(recipient, content)`), okundu durumu, gerekirse gerçek zamanlı iletim.
5. Public bahçe/profil sayfaları ve sunucu tarafında görünürlük kontrolü.
6. Test altyapısı (birim + E2E) ve CI.
