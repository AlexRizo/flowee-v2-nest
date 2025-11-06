export const sanitizeFileName = (originalName: string): string => {
  const lastDot = originalName.lastIndexOf('.');
  const name = lastDot === -1 ? originalName : originalName.slice(0, lastDot);
  const ext = lastDot === -1 ? '' : originalName.slice(lastDot).toLowerCase();

  const sanitizedBase = name
    .normalize('NFD') // ? separa acentos de las letras
    .replace(/[\u0300-\u036f]/g, '') // ? elimina acentos
    .replace(/[^a-zA-Z0-9_-]/g, '-') // ? reemplaza caracteres no válidos
    .replace(/-+/g, '-') // ? evita guiones consecutivos
    .replace(/^-|-$/g, '') // ? elimina guiones al inicio o fin
    .toLowerCase(); // ? convierte a minúsculas

  const uniqueName = `${sanitizedBase}-${Date.now()}${ext}`;
  return uniqueName;
};
