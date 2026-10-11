// Captura envía algunos textos con UTF-8 codificado dos veces ("SesiÃ³n" en
// lugar de "Sesión"). Si el texto tiene esa forma, lo decodifica de nuevo; si
// no, lo devuelve igual.
export const repairDoubleUtf8 = (text: string): string => {
  if (!/[ÃÂ]/.test(text) || /[^\u0000-ÿ]/.test(text)) return text;
  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return text;
  }
};

// Texto para comparar en búsquedas: sin tildes y en minúsculas.
export const normalizeForSearch = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
