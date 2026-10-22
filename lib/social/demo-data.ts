/**
 * Keşfet sayfasının ÖRNEK (demo) içerikleri.
 *
 * Buradaki kişiler, yazılar ve bahçeler gerçek kullanıcı içeriği değildir. Bazı kayıtlar
 * bilerek `private` işaretlidir; gizlilik kurallarının (bkz. `selectors.ts`) onları
 * Keşfet'ten ve bildirimlerden uzak tuttuğunu göstermek için vardır.
 *
 * `publishedAt` alanı olmayan yazı/güncellemeler "yayımlanmayı bekleyen" demo kuyruğudur;
 * bildirim kutusundaki simülasyon düğmesiyle bu tarayıcıda yayımlanmış sayılırlar.
 *
 * TODO(backend): Bu dosya API'den gelen verilerle değiştirilecek.
 */
import type { CommunityArticle, CommunityBook, CommunityUser, GardenUpdate, PublicGarden } from './types';

/** Bu tarayıcıdaki ziyaretçi. Gerçek kimlik doğrulama yokken tüm takipler bu kimlikle tutulur. */
export const DEMO_VIEWER_ID = 'demo-viewer';

export const COMMUNITY_USERS: CommunityUser[] = [
  {
    id: 'deniz',
    displayName: 'Deniz Yılmaz',
    username: 'deniz.yilmaz',
    bio: 'Kitapların insanın iç dünyasına açılan kapılar olduğuna inanıyor.',
    avatarColor: '#1F5D42',
    profileVisibility: 'public',
  },
  {
    id: 'ece',
    displayName: 'Ece Demir',
    username: 'ece.demir',
    bio: 'Psikoloji ve anlam üzerine okuyor, kısa notlar yazıyor.',
    avatarColor: '#597C92',
    profileVisibility: 'public',
  },
  {
    id: 'mert',
    displayName: 'Mert Kaya',
    username: 'mert.kaya',
    bio: 'Çocuk kitaplarını yetişkin gözüyle yeniden okuyor.',
    avatarColor: '#B58B55',
    profileVisibility: 'public',
  },
  {
    id: 'ayse',
    displayName: 'Ayşe Karan',
    username: 'ayse.karan',
    bio: 'Felsefe ve roman okuyucusu. Her kitabın bir düşünce tohumu olduğuna inanıyor.',
    avatarColor: '#2F5D62',
    image: '/images/ayse-karan.png',
    profileVisibility: 'public',
  },
  {
    id: 'mehmet',
    displayName: 'Mehmet Yıldız',
    username: 'mehmet.yildiz',
    bio: 'Klasik edebiyat tutkunu. Rus edebiyatına özel bir ilgisi var.',
    avatarColor: '#6B4038',
    image: '/images/mehmet-yildiz.png',
    profileVisibility: 'public',
  },
  {
    id: 'selin',
    displayName: 'Selin Demir',
    username: 'selin.demir',
    bio: 'Bilim kitapları okuyor, zaman zaman şiirle nefes alıyor.',
    avatarColor: '#7A5C8E',
    image: '/images/selin-demir.png',
    profileVisibility: 'public',
  },
  {
    // Private profil: hiçbir içeriği Keşfet'te görünmemeli
    id: 'kaan',
    displayName: 'Kaan Arslan',
    username: 'kaan.arslan',
    bio: 'Profilini gizli tutuyor.',
    avatarColor: '#3F4E6B',
    profileVisibility: 'private',
  },
];

export const COMMUNITY_BOOKS: CommunityBook[] = [
  {
    id: 'suc-ve-ceza',
    title: 'Suç ve Ceza',
    author: 'Fyodor Dostoyevski',
    category: 'Roman',
    cover: 'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg',
    description: 'Vicdan, suç ve insan psikolojisi üzerine klasik bir eser.',
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'Bilim',
    cover: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    description: 'İnsanlık tarihine farklı bir bakış.',
  },
  {
    id: 'devlet',
    title: 'Devlet',
    author: 'Platon',
    category: 'Felsefe',
    cover: 'https://covers.openlibrary.org/b/isbn/9780140449143-L.jpg',
    description: 'Adalet, toplum ve ideal devlet üzerine düşünceler.',
  },
  {
    id: 'anlam-arayisi',
    title: 'İnsanın Anlam Arayışı',
    author: 'Viktor E. Frankl',
    category: 'Psikoloji',
    cover: 'https://covers.openlibrary.org/b/isbn/9780807014271-L.jpg',
    description: 'Zorluklar karşısında anlam bulmak üzerine bir eser.',
  },
  {
    id: 'kurk-mantolu-madonna',
    title: 'Kürk Mantolu Madonna',
    author: 'Sabahattin Ali',
    category: 'Roman',
    cover: 'https://covers.openlibrary.org/b/isbn/9789753638029-L.jpg',
    description: 'İnsan ilişkileri ve iç dünyaya dair dokunaklı bir roman.',
  },
  {
    id: 'kucuk-prens',
    title: 'Küçük Prens',
    author: 'Antoine de Saint-Exupéry',
    category: 'Roman',
    cover: 'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg',
    description: 'Dostluk, sevgi ve hayata farklı gözlerle bakmak üzerine zamansız bir hikâye.',
  },
];

export const COMMUNITY_ARTICLES: CommunityArticle[] = [
  {
    id: 'raskolnikov-vicdan',
    authorId: 'deniz',
    kind: 'review',
    title: "Raskolnikov'un vicdanıyla yüzleşmesi",
    excerpt:
      'Bir insan kendi doğrularını toplumun kurallarının üstünde gördüğünde, vicdanından gerçekten kaçabilir mi?',
    content: [
      'Bir insan kendi doğrularını toplumun kurallarının üstünde gördüğünde, vicdanından gerçekten kaçabilir mi? Dostoyevski, Suç ve Ceza boyunca bu soruyu farklı açılardan ele alıyor.',
      'Raskolnikov, işlediği suçun ardından yalnızca yakalanma korkusuyla değil, kendi zihninde kurduğu düşüncelerle de mücadele ediyor. Onun asıl cezası, dışarıdan gelecek bir hükümden önce kendi içinde başlıyor.',
      'Romanın etkileyici tarafı, insanı yalnızca iyi ya da kötü olarak değerlendirmemesi. Karakterin çelişkileri, korkuları ve kendini haklı çıkarma çabası, okuru kendi ahlaki sınırları üzerine düşünmeye davet ediyor.',
      "Bence Suç ve Ceza'nın bugün hâlâ güçlü olmasının nedeni de bu. Kitap, verdiğimiz kararların sonuçlarından kaçmanın mümkün olup olmadığını ve insanın kendisiyle nasıl yüzleştiğini sorgulatıyor.",
    ],
    bookId: 'suc-ve-ceza',
    readTime: 5,
    visibility: 'public',
    publishedAt: '2026-10-12T12:00:00.000Z',
  },
  {
    id: 'anlam-arayisi-dusunceler',
    authorId: 'ece',
    kind: 'thought',
    title: 'Anlam arayışı üzerine düşüncelerim',
    excerpt:
      "Frankl'ın anlatısı, koşullarımızı değiştiremediğimiz zamanlarda bile seçimlerimizin önemini hatırlatıyor.",
    content: [
      "Frankl'ın anlatısı, koşullarımızı değiştiremediğimiz zamanlarda bile seçimlerimizin önemini hatırlatıyor.",
      'Kitabı bitirdiğimde aklımda kalan en güçlü düşünce, anlamın bulunan değil kurulan bir şey olduğuydu.',
    ],
    bookId: 'anlam-arayisi',
    readTime: 4,
    visibility: 'public',
    publishedAt: '2026-10-08T12:00:00.000Z',
  },
  {
    id: 'kucuk-prens-yetiskinler',
    authorId: 'mert',
    kind: 'thought',
    title: 'Küçük Prens neden yetişkinlere de hitap ediyor?',
    excerpt:
      'Büyüdükçe unuttuğumuz soruları yeniden sormamızı sağlayan, her yaşta farklı anlamlar taşıyan bir hikâye.',
    content: [
      'Büyüdükçe unuttuğumuz soruları yeniden sormamızı sağlayan, her yaşta farklı anlamlar taşıyan bir hikâye.',
      'Çocukken tilkiyi sevimli bir karakter olarak okumuştum; şimdi ise sorumluluk üzerine söylediği her cümlede duruyorum.',
    ],
    bookId: 'kucuk-prens',
    readTime: 3,
    visibility: 'public',
    publishedAt: '2026-10-05T12:00:00.000Z',
  },
  {
    id: 'yavas-okuma-sanati',
    authorId: 'ayse',
    kind: 'post',
    title: 'Yavaş okuma sanatı: Bir kitapla gerçekten vakit geçirmek',
    excerpt:
      'Hız çağında okuyucu olmak neredeyse bir direniş eylemine dönüştü. Bir kitabı yavaş ve derin okumak bu çağın en özgün edimi.',
    content: [
      'Hız çağında okuyucu olmak neredeyse bir direniş eylemine dönüştü. Bir kitabı yavaş, derin ve bütünüyle okumak bu çağın en özgün edimi.',
      'Kendime koyduğum tek kural şu: Bir bölümü bitirdiğimde kitabı kapatıp en az bir cümle yazmak. Bahçemdeki her yaprak biraz da bu cümlelerden büyüdü.',
    ],
    readTime: 6,
    visibility: 'public',
    publishedAt: '2026-09-04T12:00:00.000Z',
  },
  {
    id: 'kurk-mantolu-sessizlik',
    authorId: 'mehmet',
    kind: 'review',
    title: "Kürk Mantolu Madonna'da sessizliğin dili",
    excerpt:
      'Raif Efendi\'nin suskunluğu, romanın en yüksek sesle konuşan karakteri gibi. Sessizliğin bir anlatım biçimi olarak gücü üzerine.',
    content: [
      "Raif Efendi'nin suskunluğu, romanın en yüksek sesle konuşan karakteri gibi.",
      'Sabahattin Ali, söylenmeyenlerle bir hayatın bütün ağırlığını taşıyabileceğini gösteriyor.',
    ],
    bookId: 'kurk-mantolu-madonna',
    readTime: 7,
    visibility: 'public',
    publishedAt: '2026-09-28T12:00:00.000Z',
  },
  {
    id: 'sapiens-sorular',
    authorId: 'selin',
    kind: 'review',
    title: "Sapiens'i okurken sorduğum sorular",
    excerpt:
      'Ortak kurgular fikri, gündelik hayatta neye inandığımızı ve neden birlikte hareket edebildiğimizi yeniden düşündürdü.',
    content: [
      'Ortak kurgular fikri, gündelik hayatta neye inandığımızı ve neden birlikte hareket edebildiğimizi yeniden düşündürdü.',
      'Kitabın bazı genellemelerine katılmasam da sorduğu sorular okuma listemi baştan şekillendirdi.',
    ],
    bookId: 'sapiens',
    readTime: 5,
    visibility: 'public',
    publishedAt: '2026-10-15T12:00:00.000Z',
  },
  {
    id: 'suc-ceza-insan-dogasi',
    authorId: 'ece',
    kind: 'thought',
    title: 'Suç, ceza ve insan doğası',
    excerpt:
      'Dostoyevski, insanın kendi içinde verdiği mücadeleyi ve ahlaki sınırların anlamını sorgulamamızı sağlıyor.',
    content: [
      'Dostoyevski, insanın kendi içinde verdiği mücadeleyi ve ahlaki sınırların anlamını sorgulamamızı sağlıyor.',
      'Sonya karakteri bana affetmenin bir zayıflık değil, bir cesaret biçimi olduğunu hatırlattı.',
    ],
    bookId: 'suc-ve-ceza',
    readTime: 4,
    visibility: 'public',
    publishedAt: '2026-10-01T12:00:00.000Z',
  },
  {
    // Public işaretli ama yazarın profili private: Keşfet'te görünmemeli
    id: 'devlet-adalet-kaan',
    authorId: 'kaan',
    kind: 'review',
    title: "Devlet'te adalet tartışması",
    excerpt: 'Gizli profile ait içerik.',
    content: ['Gizli profile ait içerik.'],
    bookId: 'devlet',
    readTime: 6,
    visibility: 'public',
    publishedAt: '2026-10-10T12:00:00.000Z',
  },
  {
    // Yazarın kendisine özel notu: Keşfet'te görünmemeli
    id: 'deniz-ozel-not',
    authorId: 'deniz',
    kind: 'thought',
    title: 'Kendime not: Budala üzerine',
    excerpt: 'Özel not.',
    content: ['Özel not.'],
    readTime: 2,
    visibility: 'private',
    publishedAt: '2026-10-14T12:00:00.000Z',
  },

  /* ---------- demo kuyruğu: henüz yayımlanmadı ---------- */
  {
    id: 'deniz-ruyalar-vicdan',
    authorId: 'deniz',
    kind: 'post',
    title: "Dostoyevski'de rüyalar ve vicdan",
    excerpt: 'Raskolnikov\'un rüyaları, romanın bilinçaltında dolaşan ikinci bir anlatı gibi.',
    content: [
      "Raskolnikov'un rüyaları, romanın bilinçaltında dolaşan ikinci bir anlatı gibi.",
      'Bu yazıda rüyaların karakterin vicdanıyla nasıl konuştuğunu izlemeye çalıştım.',
    ],
    bookId: 'suc-ve-ceza',
    readTime: 5,
    visibility: 'public',
  },
  {
    id: 'ece-frankl-ikinci-okuma',
    authorId: 'ece',
    kind: 'review',
    title: "Frankl'ı ikinci kez okumak",
    excerpt: 'Aynı kitap, farklı bir yaşta bambaşka sorular sorduruyor.',
    content: ['Aynı kitap, farklı bir yaşta bambaşka sorular sorduruyor.'],
    bookId: 'anlam-arayisi',
    readTime: 4,
    visibility: 'public',
  },
  {
    // Private kuyruk öğesi: yayımlansa bile bildirim üretmemeli
    id: 'mert-ozel-taslak',
    authorId: 'mert',
    kind: 'thought',
    title: 'Özel düşünce notu',
    excerpt: 'Özel not.',
    content: ['Özel not.'],
    readTime: 2,
    visibility: 'private',
  },
  {
    id: 'mert-tilki-sorumluluk',
    authorId: 'mert',
    kind: 'thought',
    title: 'Tilkinin sorumluluk dersi',
    excerpt: '"Evcilleştirdiğin şeyden sorumlusun" cümlesini yetişkin gözüyle yeniden okumak.',
    content: ['"Evcilleştirdiğin şeyden sorumlusun" cümlesini yetişkin gözüyle yeniden okumak.'],
    bookId: 'kucuk-prens',
    readTime: 3,
    visibility: 'public',
  },
  {
    id: 'ayse-devlet-yeniden',
    authorId: 'ayse',
    kind: 'review',
    title: "Devlet'i yeniden okurken",
    excerpt: 'Mağara alegorisi, ekranlarla çevrili bir çağda yeni bir anlam kazanıyor.',
    content: ['Mağara alegorisi, ekranlarla çevrili bir çağda yeni bir anlam kazanıyor.'],
    bookId: 'devlet',
    readTime: 8,
    visibility: 'public',
  },
  {
    id: 'mehmet-rus-klasikleri',
    authorId: 'mehmet',
    kind: 'post',
    title: 'Rus klasiklerine nereden başlamalı?',
    excerpt: 'Yeni başlayanlar için kişisel bir okuma sırası önerisi.',
    content: ['Yeni başlayanlar için kişisel bir okuma sırası önerisi.'],
    readTime: 6,
    visibility: 'public',
  },
  {
    id: 'selin-sapiens-sonrasi',
    authorId: 'selin',
    kind: 'thought',
    title: "Sapiens'ten sonra ne okudum?",
    excerpt: 'Bir kitabın açtığı soruların peşinden giden küçük bir okuma rotası.',
    content: ['Bir kitabın açtığı soruların peşinden giden küçük bir okuma rotası.'],
    bookId: 'sapiens',
    readTime: 4,
    visibility: 'public',
  },
];

export const PUBLIC_GARDENS: PublicGarden[] = [
  {
    ownerId: 'ayse',
    intro: 'Felsefe ve romanlar arasında yavaş büyüyen bir bahçe.',
    visibility: 'public',
    growth: 35,
    completedBooks: 14,
    readingNow: 2,
    verifiedBookIds: ['devlet', 'kucuk-prens'],
    interests: ['Roman', 'Felsefe', 'Tarih'],
  },
  {
    ownerId: 'mehmet',
    intro: 'Rus klasikleriyle kök salmış, Türk edebiyatıyla dallanan bir bahçe.',
    visibility: 'public',
    growth: 70,
    completedBooks: 31,
    readingNow: 1,
    verifiedBookIds: ['suc-ve-ceza', 'kurk-mantolu-madonna'],
    interests: ['Roman', 'Klasik'],
  },
  {
    ownerId: 'selin',
    intro: 'Bilim kitaplarıyla büyüyen, araya şiir serpiştirilmiş bir bahçe.',
    visibility: 'public',
    growth: 25,
    completedBooks: 9,
    readingNow: 3,
    verifiedBookIds: ['sapiens'],
    interests: ['Bilim', 'Psikoloji'],
  },
  {
    ownerId: 'deniz',
    intro: 'Karakter analizleri ve vicdan üzerine notlarla dolu bir bahçe.',
    visibility: 'public',
    growth: 48,
    completedBooks: 18,
    readingNow: 1,
    verifiedBookIds: ['suc-ve-ceza', 'anlam-arayisi'],
    interests: ['Roman', 'Psikoloji'],
  },
  {
    // Private bahçe: profil public olsa bile bahçe Keşfet'te görünmemeli
    ownerId: 'ece',
    intro: 'Özel bahçe.',
    visibility: 'private',
    growth: 20,
    completedBooks: 6,
    readingNow: 1,
    verifiedBookIds: ['anlam-arayisi'],
    interests: ['Psikoloji'],
  },
  {
    // Public bahçe ama sahibinin profili private: görünmemeli
    ownerId: 'kaan',
    intro: 'Gizli profile ait bahçe.',
    visibility: 'public',
    growth: 60,
    completedBooks: 22,
    readingNow: 0,
    verifiedBookIds: ['devlet'],
    interests: ['Felsefe'],
  },
];

export const GARDEN_UPDATES: GardenUpdate[] = [
  {
    id: 'ayse-update-1',
    gardenOwnerId: 'ayse',
    text: 'Küçük Prens özeti doğrulandı; bahçeye yeni bir yaprak eklendi.',
    visibility: 'public',
    publishedAt: '2026-10-18T12:00:00.000Z',
  },
  {
    id: 'mehmet-update-1',
    gardenOwnerId: 'mehmet',
    text: 'Kürk Mantolu Madonna tamamlandı ve özeti doğrulandı.',
    visibility: 'public',
    publishedAt: '2026-10-11T12:00:00.000Z',
  },
  {
    id: 'selin-update-1',
    gardenOwnerId: 'selin',
    text: 'Okuma listesine üç bilim kitabı eklendi.',
    visibility: 'public',
    publishedAt: '2026-10-16T12:00:00.000Z',
  },

  /* ---------- demo kuyruğu ---------- */
  {
    id: 'ayse-update-2',
    gardenOwnerId: 'ayse',
    text: 'Devlet özeti doğrulandı; ağaç yeni bir dal verdi.',
    visibility: 'public',
  },
  {
    id: 'mehmet-update-2',
    gardenOwnerId: 'mehmet',
    text: 'Budala okunmaya başlandı.',
    visibility: 'public',
  },
  {
    id: 'deniz-update-1',
    gardenOwnerId: 'deniz',
    text: 'İnsanın Anlam Arayışı özeti doğrulandı.',
    visibility: 'public',
  },
  {
    id: 'selin-update-2',
    gardenOwnerId: 'selin',
    text: 'Sapiens tamamlandı; özeti değerlendirme bekliyor.',
    visibility: 'public',
  },
];
