type Node = {
  type: string;
  value?: string;
  url?: string;
  children?: Node[];
};

function toUrl(value: string): string | undefined {
  const candidate = value.trim().replace(/[.,!?;:]+$/, '');
  if (!/^https?:\/\//i.test(candidate)) return undefined;

  try {
    return new URL(candidate).href;
  } catch {
    return undefined;
  }
}

function standaloneLink(node: Node): { href: string; title?: string } | undefined {
  if (node.type !== 'paragraph' || node.children?.length !== 1) return undefined;

  const child = node.children[0];
  if (child.type === 'link' && child.url) {
    const href = toUrl(child.url);
    if (!href) return undefined;

    const label = child.children?.map((item) => item.value ?? '').join('').trim();
    return { href, title: label && label !== child.url ? label : undefined };
  }

  if (child.type === 'text' && child.value) {
    const href = toUrl(child.value);
    return href ? { href } : undefined;
  }

  return undefined;
}

export default function remarkLinkCard() {
  return (tree: { children?: Node[] }) => {
    if (!tree.children) return;

    const cards = tree.children.flatMap((node) => {
      const link = standaloneLink(node);
      if (!link) return [node];

      const attributes = [
        { type: 'mdxJsxAttribute', name: 'href', value: link.href },
      ];
      if (link.title) {
        attributes.push({ type: 'mdxJsxAttribute', name: 'title', value: link.title });
      }

      return [{
        type: 'mdxJsxFlowElement',
        name: 'LinkCard',
        attributes,
        children: [],
      } as Node];
    });

    if (cards.length === tree.children.length && cards.every((node, index) => node === tree.children?.[index])) return;

    tree.children = cards;
  };
}
