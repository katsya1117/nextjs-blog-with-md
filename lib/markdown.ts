import { Blog } from "@/types/blog";

export function toMarkdown(blog: Blog): string {
  const frontmatter = [
    `id: "${blog.id}"`,
    `title: "${blog.title}"`,
    blog.category ? `category: "${blog.category}"` : undefined,
    blog.date ? `date: "${blog.date}"` : undefined,
    blog.publishedAt ? `publishedAt: "${blog.publishedAt}"` : undefined,
    blog.updatedAt ? `updatedAt: "${blog.updatedAt}"` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return `---\n${frontmatter}\n---\n\n${blog.body ?? ""}`;
}