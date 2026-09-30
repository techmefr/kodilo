export const PAGE_SUFFIX: string = import.meta.env.PUBLIC_PAGE_SUFFIX ?? '';

export const homePath = (base: string, hash = ''): string => `${base}${PAGE_SUFFIX}${hash}`;
