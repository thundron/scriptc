import type { MetadataRoute } from "next";
import { source } from "@/lib/geistdocs/source";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/compatibility` },
    ...source.getPages("en").map((page) => ({ url: `${siteUrl}${page.url}`, lastModified: (page.data as { lastModified?: Date }).lastModified })),
  ];
}
