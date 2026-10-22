"use client";

import { useEffect, useRef, useState } from "react";

import { EditorContent, useEditor } from "@tiptap/react";

import { editorExtensions } from "./editorExtensions";

import { ImagePlus, ChevronDown, RotateCcw, Check } from "lucide-react";

import {

  Bold,

  Italic,

  Underline as UnderlineIcon,

  Heading1,

  Heading2,

  Heading3,

  List,

  ListOrdered,

  Quote,

  Link as LinkIcon,

  Unlink,

  Undo2,

  Redo2,

  AlignLeft,

  AlignCenter,

  AlignRight,

  AlignJustify,

  Palette,

  Highlighter,

} from "lucide-react";

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Boş veya geçersiz değer "otomatik" (null) kabul edilir.
function toPixelSize(value: string): string | null {
  const size = Math.round(Number(value));
  if (!value.trim() || !Number.isFinite(size)) return null;
  return `${Math.min(3000, Math.max(1, size))}px`;
}

type RichTextEditorProps = {

  content: string;

  onChange: (html: string, text: string) => void;

};

export default function RichTextEditor({

  content,

  onChange,

}: RichTextEditorProps) {

  // Menü, açıldığı andaki görselin konumuna bağlıdır; başka bir görsel
  // seçildiğinde eski ölçüler yeni görsele taşınmaz.
  const [imageMenuPos, setImageMenuPos] = useState<number | null>(null);
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({

    extensions: editorExtensions,

    // Next.js'te Tiptap'ın SSR uyarısını önler; editör yalnızca istemcide oluşturulur.
    immediatelyRender: false,

    content,

    onUpdate: ({ editor }) => {

      onChange(editor.getHTML(), editor.getText());

    },

    editorProps: {

      attributes: {

        class: "rich-text-editor",

      },

    },

  });

  useEffect(() => {

    if (editor && editor.getHTML() !== content) {

      editor.commands.setContent(content || "");

    }

  }, [editor, content]);

  if (!editor) {

    return (

      <div className="min-h-[420px] animate-pulse rounded-xl border border-[#DCE8E1] bg-[#F4FAF6] sm:min-h-[500px]" />

    );

  }

  const imageMenuOpen =
    imageMenuPos !== null &&
    editor.isActive("image") &&
    editor.state.selection.from === imageMenuPos;

  const buttonClass = (active: boolean) =>

    `flex size-9 shrink-0 items-center justify-center rounded-lg transition ${

      active

        ? "bg-[#DDEFE5] text-[#1F5D42]"

        : "text-[#65766D] hover:bg-[#F4FAF6] hover:text-[#1F5D42]"

    }`;

  function addLink() {

    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href as

      | string

      | undefined;

    if (previousUrl) {

      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;

    }

    const url = window.prompt("Bağlantı adresini gir:", "https://");

    if (!url?.trim()) return;

    if (!/^https?:\/\//i.test(url.trim())) {

      window.alert("Lütfen https:// ile başlayan bir bağlantı gir.");

      return;

    }

    const href = url.trim();

    if (editor.state.selection.empty) {
      // Seçili metin yoksa bağlantı adresi metin olarak eklenir.
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: href,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
      return;
    }

    editor

      .chain()

      .focus()

      .extendMarkRange("link")

      .setLink({ href })

      .run();

  }

  return (

    <div className="min-w-0">

      <div className="sticky top-20 z-20 mb-4 flex flex-wrap items-center gap-1 rounded-xl border border-[#DCE8E1] bg-white p-2 shadow-sm">

        <button

          type="button"

          title="Kalın"

          aria-label="Kalın"

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => editor.chain().focus().toggleBold().run()}

          aria-pressed={editor.isActive("bold")}

          className={buttonClass(editor.isActive("bold"))}

        >

          <Bold size={17} />

        </button>

        <button

          type="button"

          title="İtalik"

          aria-label="İtalik"

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => editor.chain().focus().toggleItalic().run()}

          aria-pressed={editor.isActive("italic")}

          className={buttonClass(editor.isActive("italic"))}

        >

          <Italic size={17} />

        </button>

        <button

          type="button"

          title="Altı çizili"

          aria-label="Altı çizili"

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => editor.chain().focus().toggleUnderline().run()}

          aria-pressed={editor.isActive("underline")}

          className={buttonClass(editor.isActive("underline"))}

        >

          <UnderlineIcon size={17} />

        </button>

        {/* Yalnızca bu bölüm değiştirildi: H1, H2 ve H3 butonları */}

        <div className="mx-1 h-6 w-px bg-[#DCE8E1]" />

        <button

          type="button"

          title="Başlık 1"

          aria-label="Başlık 1"

          aria-pressed={editor.isActive("heading", { level: 1 })}

          onMouseDown={(event) => event.preventDefault()}

          onClick={() =>

            editor.chain().focus().toggleHeading({ level: 1 }).run()

          }

          className={buttonClass(editor.isActive("heading", { level: 1 }))}

        >

          <Heading1 size={18} />

        </button>

        <button

          type="button"

          title="Başlık 2"

          aria-label="Başlık 2"

          aria-pressed={editor.isActive("heading", { level: 2 })}

          onMouseDown={(event) => event.preventDefault()}

          onClick={() =>

            editor.chain().focus().toggleHeading({ level: 2 }).run()

          }

          className={buttonClass(editor.isActive("heading", { level: 2 }))}

        >

          <Heading2 size={18} />

        </button>

        <button

          type="button"

          title="Başlık 3"

          aria-label="Başlık 3"

          aria-pressed={editor.isActive("heading", { level: 3 })}

          onMouseDown={(event) => event.preventDefault()}

          onClick={() =>

            editor.chain().focus().toggleHeading({ level: 3 }).run()

          }

          className={buttonClass(editor.isActive("heading", { level: 3 }))}

        >

          <Heading3 size={18} />

        </button>

        <div className="mx-1 h-6 w-px bg-[#DCE8E1]" />

        <button

          type="button"

          title="Sola Hizala"

          aria-label="Sola Hizala"

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => {
            if (editor.isActive("image")) {
              editor.chain().focus().updateAttributes("image", { align: "left" }).run();
            } else {
              editor.chain().focus().setTextAlign("left").run();
            }
          }}
          className={buttonClass(
            editor.isActive("image")
              ? editor.getAttributes("image").align === "left"
              : editor.isActive({ textAlign: "left" }),
          )}

        >

          <AlignLeft size={17} />

        </button>

        <button

            type="button"

            title="Ortala"

            aria-label="Ortala"

            onMouseDown={(event) => event.preventDefault()}

            onClick={() => {
              if (editor.isActive("image")) {
                editor.chain().focus().updateAttributes("image", { align: "center" }).run();
              } else {
                editor.chain().focus().setTextAlign("center").run();
              }
            }}
            className={buttonClass(
              editor.isActive("image")
                ? editor.getAttributes("image").align === "center"
                : editor.isActive({ textAlign: "center" }),
            )}

            >

            <AlignCenter size={17} />

        </button>

        <button

            type="button"

            title="Sağa hizala"

            aria-label="Sağa hizala"

            onMouseDown={(event) => event.preventDefault()}

            onClick={() => {
              if (editor.isActive("image")) {
                editor.chain().focus().updateAttributes("image", { align: "right" }).run();
              } else {
                editor.chain().focus().setTextAlign("right").run();
              }
            }}
            className={buttonClass(
              editor.isActive("image")
                ? editor.getAttributes("image").align === "right"
                : editor.isActive({ textAlign: "right" }),
            )}

            >

            <AlignRight size={17} />

        </button>

        <button

            type="button"

            title="İki yana yasla"

            aria-label="İki yana yasla"

            onMouseDown={(event) => event.preventDefault()}

            onClick={() => {
              if (editor.isActive("image")) {
                // Görsellerde iki yana yasla anlamlı olmadığı için hizalama değiştirilmez.
                return;
              }
              editor.chain().focus().setTextAlign("justify").run();
            }}
            className={buttonClass(
              !editor.isActive("image") && editor.isActive({ textAlign: "justify" }),
            )}

            >

            <AlignJustify size={17} />

        </button>

        <div className="mx-1 h-6 w-px bg-[#DCE8E1]" />

        {/* Yazı rengi */}

        <div className="group sm:relative">

        <button

            type="button"

            title="Yazı rengi"

            aria-label="Yazı rengi paletini aç"

            aria-haspopup="true"

            onMouseDown={(event) => event.preventDefault()}

            // Dokunmatik cihazlarda hover olmadığı için palet odakla açılır.
            onClick={(event) => event.currentTarget.focus()}

            className={buttonClass(editor.isActive("textStyle"))}

        >

            <Palette size={17} />

        </button>

        <div className="absolute left-2 top-full z-30 mt-2 hidden w-48 rounded-xl border border-[#DCE8E1] bg-white p-3 shadow-lg group-focus-within:block group-hover:block sm:left-0">

            <p className="mb-2 text-xs font-medium text-[#65766D]">

            Yazı rengi

            </p>

            <div className="grid grid-cols-5 gap-2">

            {[

                "#193128", "#65766D", "#9CA3AF", "#DC2626", "#EA580C",

                "#D97706", "#16A34A", "#1F5D42", "#0891B2", "#2563EB",

                "#4F46E5", "#9333EA", "#DB2777", "#92400E", "#000000",

            ].map((color) => (

                <button

                key={color}

                type="button"

                title={color}

                aria-label={`Yazı rengi ${color}`}

                onMouseDown={(event) => event.preventDefault()}

                onClick={() => editor.chain().focus().setColor(color).run()}

                className="size-6 rounded-full border border-black/10 transition hover:scale-110"

                style={{ backgroundColor: color }}

                />

            ))}

            </div>

            <button

            type="button"

            onMouseDown={(event) => event.preventDefault()}

            onClick={() => editor.chain().focus().unsetColor().run()}

            className="mt-3 w-full rounded-lg border border-[#DCE8E1] px-3 py-2 text-xs text-[#65766D] hover:bg-[#F4FAF6]"

            >

            Varsayılan rengi kullan

            </button>

        </div>

        </div>

        {/* Metin vurgulama */}

        <div className="group sm:relative">

        <button

            type="button"

            title="Metni vurgula"

            aria-label="Vurgu paletini aç"

            aria-haspopup="true"

            onMouseDown={(event) => event.preventDefault()}

            // Dokunmatik cihazlarda hover olmadığı için palet odakla açılır.
            onClick={(event) => event.currentTarget.focus()}

            className={buttonClass(editor.isActive("highlight"))}

        >

            <Highlighter size={17} />

        </button>

        <div className="absolute left-2 top-full z-30 mt-2 hidden w-48 rounded-xl border border-[#DCE8E1] bg-white p-3 shadow-lg group-focus-within:block group-hover:block sm:left-0">

            <p className="mb-2 text-xs font-medium text-[#65766D]">

            Vurgu rengi

            </p>

            <div className="grid grid-cols-5 gap-2">

            {[

                "#FEF08A", "#FDE68A", "#FED7AA", "#FECACA", "#FBCFE8",

                "#E9D5FF", "#C7D2FE", "#BAE6FD", "#A5F3FC", "#A7F3D0",

                "#BBF7D0", "#D9F99D", "#DDEFE5", "#E5E7EB", "#FFFFFF",

            ].map((color) => (

                <button

                key={color}

                type="button"

                title={color}

                aria-label={`Vurgu rengi ${color}`}

                onMouseDown={(event) => event.preventDefault()}

                onClick={() => editor.chain().focus().setHighlight({ color }).run()}

                className="size-6 rounded-full border border-black/10 transition hover:scale-110"

                style={{ backgroundColor: color }}

                />

            ))}

            </div>

            <button

            type="button"

            onMouseDown={(event) => event.preventDefault()}

            onClick={() => editor.chain().focus().unsetHighlight().run()}

            className="mt-3 w-full rounded-lg border border-[#DCE8E1] px-3 py-2 text-xs text-[#65766D] hover:bg-[#F4FAF6]"

            >

            Vurgulamayı kaldır

            </button>

        </div>

        </div>

        <div className="mx-1 h-6 w-px bg-[#DCE8E1]" />

        {/* Görsel ekleme butonu */}

        <div className="relative">

            <input
              ref={imageInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";

                if (!file) return;

                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                  window.alert("Lütfen PNG, JPEG, WebP veya GIF biçiminde bir görsel seç.");
                  return;
                }

                if (file.size > MAX_IMAGE_BYTES) {
                  window.alert("Görsel boyutu en fazla 5 MB olabilir.");
                  return;
                }

                const reader = new FileReader();

                reader.onload = () => {
                  if (typeof reader.result !== "string") return;

                  const image = { src: reader.result, alt: file.name };

                  // Seçili bir görsel varsa yerine yazılmaz, hemen arkasına eklenir.
                  if (editor.isActive("image")) {
                    editor
                      .chain()
                      .focus()
                      .insertContentAt(editor.state.selection.to, {
                        type: "image",
                        attrs: image,
                      })
                      .run();
                    return;
                  }

                  editor.chain().focus().setImage(image).run();
                };

                reader.onerror = () => {
                  console.error("Görsel okunamadı:", reader.error);
                  window.alert("Görsel okunamadı. Lütfen tekrar dene.");
                };

                reader.readAsDataURL(file);
              }}
            />

            <button
              type="button"
              title="Görsel ekle"
              aria-label="Görsel ekle"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => imageInputRef.current?.click()}
              className={buttonClass(false)}
            >
              <ImagePlus size={17} />
            </button>

        </div>

        {editor.isActive("image") && (
        <div className="sm:relative">
          <button
            type="button"
            aria-expanded={imageMenuOpen}
            aria-label="Görsel boyutunu ayarla"
            title="Görsel boyutu"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              const attrs = editor.getAttributes("image");
              setImageWidth(String(attrs.width ?? "").replace(/px$/i, ""));
              setImageHeight(String(attrs.height ?? "").replace(/px$/i, ""));
              setImageMenuPos(
                imageMenuOpen ? null : editor.state.selection.from,
              );
            }}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-[#65766D] transition hover:bg-[#F4FAF6] hover:text-[#1F5D42]"
          >
            Görsel boyutu
            <ChevronDown size={15} className={imageMenuOpen ? "rotate-180 transition" : "transition"} />
          </button>

          {imageMenuOpen && (
            <div className="absolute left-2 top-full z-40 mt-2 w-64 max-w-[calc(100%-1rem)] rounded-xl border border-[#DCE8E1] bg-white p-4 shadow-xl">
              <p className="mb-3 text-xs font-semibold text-[#193128]">Hazır boyutlar</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Küçük", width: "240" },
                  { label: "Orta", width: "480" },
                  { label: "Büyük", width: "720" },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setImageWidth(option.width);
                      setImageHeight("");
                      editor.chain().focus().updateAttributes("image", {
                        width: `${option.width}px`,
                        height: null,
                      }).run();
                    }}
                    className="rounded-lg border border-[#DCE8E1] px-2 py-2 text-xs text-[#65766D] transition hover:border-[#8FB9A3] hover:bg-[#F4FAF6] hover:text-[#1F5D42]"
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="my-4 h-px bg-[#DCE8E1]" />
              <p className="mb-3 text-xs font-semibold text-[#193128]">Manuel boyut (px)</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-[#65766D]">
                  Genişlik
                  <input
                    type="number" min="1" max="3000" value={imageWidth}
                    onChange={(event) => setImageWidth(event.target.value)}
                    placeholder="Otomatik"
                    className="mt-1 w-full rounded-lg border border-[#DCE8E1] px-2.5 py-2 text-sm text-[#193128] outline-none focus:border-[#8FB9A3]"
                  />
                </label>
                <label className="block text-xs text-[#65766D]">
                  Yükseklik
                  <input
                    type="number" min="1" max="3000" value={imageHeight}
                    onChange={(event) => setImageHeight(event.target.value)}
                    placeholder="Otomatik"
                    className="mt-1 w-full rounded-lg border border-[#DCE8E1] px-2.5 py-2 text-sm text-[#193128] outline-none focus:border-[#8FB9A3]"
                  />
                </label>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-[#65766D]">Boş bırakılan ölçü otomatik ayarlanır. Görsel, editör genişliğini aşmaz.</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    editor.chain().focus().updateAttributes("image", {
                      width: toPixelSize(imageWidth),
                      height: toPixelSize(imageHeight),
                    }).run();
                    setImageMenuPos(null);
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#1F5D42] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#153D2D]"
                >
                  <Check size={14} /> Uygula
                </button>
                <button
                  type="button" title="Boyutu sıfırla" aria-label="Boyutu sıfırla"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setImageWidth("");
                    setImageHeight("");
                    editor.chain().focus().updateAttributes("image", { width: null, height: null }).run();
                    setImageMenuPos(null);
                  }}
                  className="flex items-center justify-center rounded-lg border border-[#DCE8E1] px-3 text-[#65766D] transition hover:bg-[#F4FAF6]"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}


        <div className="mx-1 h-6 w-px bg-[#DCE8E1]" />

        <button

          type="button"

          title="Madde işaretli liste"

          aria-label="Madde işaretli liste"

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => editor.chain().focus().toggleBulletList().run()}

          aria-pressed={editor.isActive("bulletList")}

          className={buttonClass(editor.isActive("bulletList"))}

        >

          <List size={18} />

        </button>

        <button

          type="button"

          title="Numaralı liste"

          aria-label="Numaralı liste"

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => editor.chain().focus().toggleOrderedList().run()}

          aria-pressed={editor.isActive("orderedList")}

          className={buttonClass(editor.isActive("orderedList"))}

        >

          <ListOrdered size={18} />

        </button>

        <button

          type="button"

          title="Alıntı"

          aria-label="Alıntı"

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => editor.chain().focus().toggleBlockquote().run()}

          aria-pressed={editor.isActive("blockquote")}

          className={buttonClass(editor.isActive("blockquote"))}

        >

          <Quote size={17} />

        </button>

        <div className="mx-1 h-6 w-px bg-[#DCE8E1]" />

        <button

          type="button"

          title={editor.isActive("link") ? "Bağlantıyı kaldır" : "Bağlantı ekle"}

          aria-label={editor.isActive("link") ? "Bağlantıyı kaldır" : "Bağlantı ekle"}

          onMouseDown={(event) => event.preventDefault()}

          onClick={addLink}

          className={buttonClass(editor.isActive("link"))}

        >

          {editor.isActive("link") ? (

            <Unlink size={17} />

          ) : (

            <LinkIcon size={17} />

          )}

        </button>

        <div className="mx-1 h-6 w-px bg-[#DCE8E1]" />

        <button

          type="button"

          title="Geri al"

          aria-label="Geri al"

          disabled={!editor.can().undo()}

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => editor.chain().focus().undo().run()}

          className={`${buttonClass(false)} disabled:cursor-not-allowed disabled:opacity-30`}

        >

          <Undo2 size={17} />

        </button>

        <button

          type="button"

          title="Yinele"

          aria-label="Yinele"

          disabled={!editor.can().redo()}

          onMouseDown={(event) => event.preventDefault()}

          onClick={() => editor.chain().focus().redo().run()}

          className={`${buttonClass(false)} disabled:cursor-not-allowed disabled:opacity-30`}

        >

          <Redo2 size={17} />

        </button>

      </div>

      <div className="rounded-xl border border-[#DCE8E1] px-4 py-2 transition focus-within:border-[#B8CFC0] sm:px-6">

        <EditorContent editor={editor} />

      </div>

    </div>

  );

}
