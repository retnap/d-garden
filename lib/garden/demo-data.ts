/**
 * Örnek bahçe verisi. Tüm kayıtlar `isDemo: true` ile işaretlenir ve arayüzde
 * "Örnek" olarak gösterilir. Tarihler yükleme anına göre hesaplanır ki aylık
 * istatistikler her zaman anlamlı bir aralıkta kalsın.
 */
import { evaluateSummaryMock } from './evaluation';
import type { GardenData, LibraryBook, Work } from './types';

const KURK_SUMMARY =
  'Kürk Mantolu Madonna, Sabahattin Ali\'nin içine kapanık bir memur olan Raif Efendi\'nin gençlik yıllarını anlatan romanıdır. ' +
  'Anlatıcı, Raif Efendi\'nin defterini okuyarak onun Berlin\'de geçen hayatını öğrenir. ' +
  'Raif genç yaşta bir sergide gördüğü tablodan etkilenir ve tablodaki kadın olan Maria Puder ile tanışır. ' +
  'İkisi arasında temkinli ama derin bir dostluk kurulur; Maria erkeklere güvenmediğini açıkça söyler, Raif ise ilk kez birine tüm benliğiyle bağlanır. ' +
  'Bir yanlış anlaşılma ve kötü zamanlama yüzünden yolları ayrılır, Raif yıllarca sessiz ve kabuğuna çekilmiş bir hayat sürer. ' +
  'Roman bana insanların dışarıdan göründüğü gibi olmadığını, en sıradan görünen hayatların bile büyük duygular taşıyabileceğini düşündürdü. ' +
  'Yalnızlık, cesaretsizlik ve iletişimsizlik kitabın merkezinde duruyor; söylenmemiş sözlerin bir ömrü nasıl şekillendirdiğini görüyoruz.';

const KUCUK_PRENS_SUMMARY =
  'Küçük Prens bir pilotun çölde tanıştığı çocuğun hikâyesi. Çok güzel bir kitap, herkes okumalı. Gezegenler ve gül var. Sonu biraz üzücü.';

const SUC_VE_CEZA_DRAFT =
  'Raskolnikov yoksul bir öğrenci ve kendini sıradan insanlardan üstün gördüğü bir fikir geliştiriyor. Bu fikir onu bir suça sürüklüyor';

const DAY = 24 * 60 * 60 * 1000;

export function createDemoData(now = new Date()): GardenData {
  const daysAgo = (n: number) => new Date(now.getTime() - n * DAY).toISOString();

  const kurkEvaluation = evaluateSummaryMock(
    { bookTitle: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', summary: KURK_SUMMARY },
    new Date(now.getTime() - 70 * DAY),
  );
  const prensEvaluation = evaluateSummaryMock(
    { bookTitle: 'Küçük Prens', author: 'Antoine de Saint-Exupéry', summary: KUCUK_PRENS_SUMMARY },
    new Date(now.getTime() - 38 * DAY),
  );

  const books: LibraryBook[] = [
    {
      id: 'demo-book-kurk',
      title: 'Kürk Mantolu Madonna',
      author: 'Sabahattin Ali',
      category: 'Roman',
      status: 'completed',
      coverColor: '#6B4038',
      pageCount: 160,
      currentPage: 160,
      addedAt: daysAgo(96),
      startedAt: daysAgo(90),
      completedAt: daysAgo(72),
      summary: {
        text: KURK_SUMMARY,
        status: kurkEvaluation.outcome,
        updatedAt: daysAgo(71),
        submittedAt: daysAgo(71),
        evaluation: kurkEvaluation,
        attempts: 1,
      },
      isDemo: true,
    },
    {
      id: 'demo-book-simyaci',
      title: 'Simyacı',
      author: 'Paulo Coelho',
      category: 'Roman',
      status: 'reading',
      coverColor: '#B58B55',
      pageCount: 188,
      currentPage: 112,
      addedAt: daysAgo(20),
      startedAt: daysAgo(12),
      isDemo: true,
    },
    {
      id: 'demo-book-hayvan',
      title: 'Hayvan Çiftliği',
      author: 'George Orwell',
      category: 'Klasik',
      status: 'reading-list',
      coverColor: '#4D725D',
      pageCount: 152,
      addedAt: daysAgo(6),
      isDemo: true,
    },
    {
      id: 'demo-book-prens',
      title: 'Küçük Prens',
      author: 'Antoine de Saint-Exupéry',
      category: 'Klasik',
      status: 'completed',
      coverColor: '#597C92',
      pageCount: 112,
      currentPage: 112,
      addedAt: daysAgo(50),
      startedAt: daysAgo(45),
      completedAt: daysAgo(40),
      summary: {
        text: KUCUK_PRENS_SUMMARY,
        status: prensEvaluation.outcome,
        updatedAt: daysAgo(38),
        submittedAt: daysAgo(38),
        evaluation: prensEvaluation,
        attempts: 1,
      },
      isDemo: true,
    },
    {
      id: 'demo-book-suc',
      title: 'Suç ve Ceza',
      author: 'Fyodor Dostoyevski',
      category: 'Klasik',
      status: 'completed',
      coverColor: '#3F4E6B',
      pageCount: 671,
      currentPage: 671,
      addedAt: daysAgo(34),
      startedAt: daysAgo(30),
      completedAt: daysAgo(8),
      summary: {
        text: SUC_VE_CEZA_DRAFT,
        status: 'draft',
        updatedAt: daysAgo(3),
        attempts: 0,
      },
      isDemo: true,
    },
    {
      id: 'demo-book-donusum',
      title: 'Dönüşüm',
      author: 'Franz Kafka',
      category: 'Klasik',
      status: 'completed',
      coverColor: '#2F5D62',
      pageCount: 96,
      currentPage: 96,
      addedAt: daysAgo(140),
      startedAt: daysAgo(136),
      completedAt: daysAgo(130),
      isDemo: true,
    },
    {
      id: 'demo-book-sapiens',
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      category: 'Tarih',
      status: 'reading-list',
      coverColor: '#8C5A3C',
      pageCount: 412,
      addedAt: daysAgo(2),
      isDemo: true,
    },
  ];

  const works: Work[] = [
    {
      id: 'demo-work-yalnizlik',
      title: 'Söylenmemiş sözlerin ağırlığı',
      type: 'essay',
      tags: ['yalnızlık', 'Sabahattin Ali'],
      content:
        '<p>Raif Efendi\'nin hikâyesini okurken en çok söylenmeyen sözlerin bir insanın hayatını nasıl biçimlendirdiğini düşündüm.</p><p>Hepimizin içinde, kimseye açmadığımız bir defter var belki de.</p>',
      status: 'completed',
      relatedBookId: 'demo-book-kurk',
      createdAt: daysAgo(65),
      updatedAt: daysAgo(64),
      isDemo: true,
    },
    {
      id: 'demo-work-yavas',
      title: 'Yavaş okumak üzerine',
      type: 'note',
      tags: ['okuma alışkanlığı'],
      content: '<p>Bir kitabı acele etmeden okumak, onu ikinci kez yazmak gibi.</p>',
      status: 'draft',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      isDemo: true,
    },
  ];

  return {
    version: 1,
    books,
    works,
    profile: {
      displayName: 'Okur',
      username: 'okur',
      bio: '',
      avatarColor: '#1F5D42',
    },
    preferences: {
      animateTree: true,
      librarySort: 'recent',
      notifyEvaluation: true,
      notifyWeeklySummary: false,
      simulateEvaluationFailure: false,
    },
  };
}
