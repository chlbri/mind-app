/**
 * Converts an HTML Image element into a base64 encoded PNG data URL.
 *
 * @param img - The HTML image element to render and encode.
 *
 * @returns Base64 data URL string, or `null` if conversion fails.
 */
export const convertToBase64 = (img: HTMLImageElement): string | null => {
  const canvas = document.createElement('canvas');

  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    // Convertir en base64
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Erreur lors de la conversion en base64:', error);
    return null;
  } finally {
    // Nettoyer le canvas
    canvas.remove();
    document.body.removeChild(canvas);
  }
};
