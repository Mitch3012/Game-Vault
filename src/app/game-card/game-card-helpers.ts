export const formatList = (items: string[], max = 3, separator = ' · '): string =>
  items.slice(0, max).join(separator);

export const releaseYear = (date: string, fallback = 'TBA'): string => (date ? date.slice(0, 4) : fallback);
