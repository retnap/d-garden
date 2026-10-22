import { notFound } from 'next/navigation';

/** /garden altındaki bilinmeyen adresler bahçe kabuğu içindeki 404 ekranını gösterir. */
export default function GardenCatchAll() {
  notFound();
}
