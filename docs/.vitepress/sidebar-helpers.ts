export type Item = [text: string, path: string];

export const arSection = (text: string, items: Item[]) => ({
  text,
  items: items.map(([t, p]) => ({ text: t, link: `/api-reference/${p}` })),
});

export const docSection = (text: string, items: Item[], prefix = "") => ({
  text,
  items: items.map(([t, p]) => ({ text: t, link: `${prefix}/${p}` })),
});
