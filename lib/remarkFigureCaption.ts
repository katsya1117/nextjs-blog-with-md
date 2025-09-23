import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import type { Image, Paragraph, Parent } from "mdast";

type Options = {
  figureClass?: string;
  captionClass?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
const NO_CAPTION_PLACEHOLDER = "";

export const remarkFigureCaption: Plugin<[Options?]> = (options = {}) => {
  const {
    figureClass = "wp-block-image size-large",
    captionClass = "wp-element-caption",
  } = options;

  return (tree) => {
    visit(tree, "paragraph", (node: Paragraph, index, parent?: Parent) => {
      if (!parent || node.children.length === 0) return;

      const firstChild = node.children[0];
      if (firstChild.type !== "image") return;

      const image = firstChild as Image;
      let caption = image.title || "";

      const inlineCaption = toString({
        type: "paragraph",
        children: node.children.slice(1),
      }).trim();

      if (inlineCaption.length > 0) {
        caption = inlineCaption;
      } else {
        const nextNode = parent.children[index + 1];
        const currentEndLine = node.position?.end.line ?? null;
        const nextStartLine = nextNode?.type === "paragraph" ? nextNode.position?.start.line ?? null : null;
        const isAdjacentParagraph =
          nextNode?.type === "paragraph" &&
          currentEndLine !== null &&
          nextStartLine !== null &&
          nextStartLine === currentEndLine + 1;

        if (isAdjacentParagraph) {
          const candidate = toString(nextNode).trim();
          if (candidate.length > 0) {
            caption = candidate;
            parent.children.splice(index + 1, 1);
          }
        }
      }

      if (!caption && image.alt) {
        caption = image.alt;
      }

      if (!caption) {
        caption = NO_CAPTION_PLACEHOLDER;
      }

      parent.children[index] = {
        type: "html",
        value: [
          `<figure class="${figureClass}">`,
          `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt ?? "")}" loading="lazy" decoding="async" />`,
          caption !== NO_CAPTION_PLACEHOLDER
            ? `<figcaption class="${captionClass}">${escapeHtml(caption)}</figcaption>`
            : "",
          `</figure>`,
        ].join(""),
      };
    });
  };
};
