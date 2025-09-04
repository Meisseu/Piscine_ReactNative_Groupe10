/**
 * Génère un UUID v4 simple
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Génère un ID simple basé sur le timestamp et un nombre aléatoire
 */
export const generateSimpleId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
