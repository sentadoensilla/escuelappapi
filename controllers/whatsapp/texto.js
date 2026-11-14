/**
 * texto.js — transformación de textos al contexto de WhatsApp.
 *
 * Los textarea de Escuelapp usan un editor WYSIWYG y entregan HTML. WhatsApp no
 * interpreta HTML: usa *negrita*, _cursiva_, ~tachado~ y ```monoespaciado```.
 * Esta función es transparente y OBLIGATORIA: `enviarWhatsApp()` la aplica a
 * todo título y cuerpo antes de encolar (ver envio.js).
 */

const ENTIDADES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü",
  iexcl: "¡", iquest: "¿", ordm: "º", ordf: "ª",
  laquo: "«", raquo: "»", mdash: "—", ndash: "–", hellip: "…",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", bull: "•",
};

function decodificarEntidades(texto) {
  return String(texto).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, codigo) => {
    if (codigo[0] === "#") {
      const hex = codigo[1]?.toLowerCase() === "x";
      const n = parseInt(codigo.slice(hex ? 2 : 1), hex ? 16 : 10);
      try {
        return Number.isFinite(n) ? String.fromCodePoint(n) : m;
      } catch {
        return m;
      }
    }
    return ENTIDADES[codigo] ?? ENTIDADES[codigo.toLowerCase()] ?? m;
  });
}

// Texto de un fragmento HTML sin etiquetas (para reutilizar dentro de las reglas).
function limpiarInline(html) {
  return decodificarEntidades(String(html).replace(/<[^>]+>/g, " "))
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Convierte el HTML del editor (o texto plano) a formato WhatsApp.
 * @param {string} entrada
 * @returns {string} texto listo para WhatsApp
 */
export function htmlAWhatsApp(entrada) {
  let t = String(entrada ?? "");
  if (!t.trim()) return "";

  // Títulos del editor → línea en negrita. Debe ir ANTES de convertir
  // </h..> en salto de línea, o el cierre se consume y se pierde la negrita.
  t = t.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (m, contenido) =>
    "\n*" + limpiarInline(contenido) + "*\n"
  );

  // Saltos de bloque.
  t = t.replace(/<br\s*\/?>/gi, "\n");
  t = t.replace(/<\/(p|div|section|article|blockquote|tr|table)>/gi, "\n");
  t = t.replace(/<(p|div|section|article|blockquote)[^>]*>/gi, "");
  t = t.replace(/<hr\s*\/?>/gi, "\n");

  // Listas.
  t = t.replace(/<li[^>]*>/gi, "• ");
  t = t.replace(/<\/li>/gi, "\n");
  t = t.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");

  // Enlaces → "texto (url)".
  t = t.replace(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (m, href, texto) => {
      const txt = limpiarInline(texto);
      return !txt || txt === href ? href : `${txt} (${href})`;
    }
  );

  // Las imágenes no viajan dentro del texto (se envían como adjunto).
  t = t.replace(/<img\b[^>]*>/gi, "");

  // Énfasis.
  t = t.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, c) => `*${limpiarInline(c)}*`);
  t = t.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, c) => `_${limpiarInline(c)}_`);
  t = t.replace(/<(s|strike|del)[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, c) => `~${limpiarInline(c)}~`);
  t = t.replace(/<(code|pre)[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, c) => "```" + limpiarInline(c) + "```");

  // Cualquier etiqueta restante.
  t = t.replace(/<[^>]+>/g, "");

  // Entidades HTML.
  t = t.replace(/&nbsp;/gi, " ");
  t = decodificarEntidades(t);

  // Markdown habitual de los editores.
  t = t.replace(/\*\*([^*\n]+)\*\*/g, "*$1*");
  t = t.replace(/__([^_\n]+)__/g, "_$1_");
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1 ($2)");

  // Normalización final.
  t = t.replace(/\r\n?/g, "\n");
  t = t.replace(/\u00a0/g, " ");
  t = t.replace(/[ \t]+\n/g, "\n");
  t = t.replace(/[ \t]{2,}/g, " ");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

/**
 * Título SIEMPRE en negrita (WhatsApp usa *...*). Quita asteriscos externos
 * para no duplicar el énfasis si el editor ya lo traía.
 */
export function tituloEnNegrita(titulo) {
  const limpio = htmlAWhatsApp(titulo)
    .replace(/\s*\n+\s*/g, " ")
    .replace(/^\*+|\*+$/g, "")
    .trim();
  return limpio ? `*${limpio}*` : "";
}

export default { htmlAWhatsApp, tituloEnNegrita };
