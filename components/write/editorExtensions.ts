import { generateHTML, generateJSON } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";

// Editör ve önizleme aynı şemayı kullanır; böylece önizlemede yalnızca
// editörün tanıdığı etiket ve nitelikler görüntülenir.
export const editorExtensions = [
  StarterKit,
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
    defaultAlignment: "left",
  }),
  Color,
  TextStyle,
  Highlight.configure({
    multicolor: true,
  }),
  Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
          parseHTML: (element) =>
            element.style.width || element.getAttribute("width") || null,
          renderHTML: (attributes) =>
            attributes.width
              ? { style: `width: ${String(attributes.width)}; max-width: 100%;` }
              : {},
        },
        height: {
          default: null,
          // Eski taslaklarda yükseklik `height` niteliği olarak saklanıyordu.
          parseHTML: (element) =>
            element.style.height || element.getAttribute("height") || null,
          // CSS'teki `height: auto` HTML niteliğini ezdiği için inline style kullanılır.
          renderHTML: (attributes) =>
            attributes.height
              ? { style: `height: ${String(attributes.height)};` }
              : {},
        },
        align: {
          default: "left",
          parseHTML: (element) => element.getAttribute("data-align") || "left",
          renderHTML: (attributes) => ({
            "data-align": attributes.align || "left",
          }),
        },
      };
    },
  }).configure({ inline: false, allowBase64: true }),
];

/**
 * Taslak HTML'ini editör şemasından geçirerek tanınmayan etiketleri,
 * olay niteliklerini ve izin verilmeyen bağlantı protokollerini ayıklar.
 * Bu yalnızca istemci tarafı bir önlemdir; yayınlanan içerik sunucuda
 * ayrıca temizlenmelidir.
 */
export function sanitizeRichText(html: string): string {
  if (!html) return "";

  try {
    return generateHTML(generateJSON(html, editorExtensions), editorExtensions);
  } catch (error) {
    console.error("Önizleme içeriği işlenemedi:", error);
    return "";
  }
}
