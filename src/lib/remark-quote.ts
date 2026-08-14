type Node = {
  type: string;
  value?: string;
  name?: string;
  attributes?: unknown[];
  children?: Node[];
  data?: { hProperties?: { className?: string | string[] } };
};

function textContent(node: Node): string {
  return node.value ?? node.children?.map(textContent).join("") ?? "";
}

function addClass(node: Node, className: string) {
  const properties = node.data?.hProperties ?? {};
  const current = properties.className;
  const classes = Array.isArray(current)
    ? current
    : current ? [current] : [];

  node.data = {
    ...node.data,
    hProperties: { ...properties, className: [...classes, className] },
  };
}

function decorateQuoteChildren(children: Node[]) {
  for (const child of children) {
    if (child.type !== "paragraph") continue;

    const text = textContent(child).trim();
    if (text.startsWith("—")) addClass(child, "article-quote__source");

    const first = child.children?.[0];
    if (first?.type === "strong" && textContent(first).trim() === "訳") {
      addClass(child, "article-quote__translation");
    }
  }
}

function transform(nodes: Node[]) {
  for (const node of nodes) {
    if (node.type === "blockquote") {
      if (node.children) {
        decorateQuoteChildren(node.children);
        transform(node.children);
      }
      node.type = "mdxJsxFlowElement";
      node.name = "Quote";
      node.attributes = [];
      continue;
    }

    if (node.children) transform(node.children);
  }
}

export default function remarkQuote() {
  return (tree: { children?: Node[] }) => {
    if (tree.children) transform(tree.children);
  };
}
