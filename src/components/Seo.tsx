// Note: In App Router, metadata should be exported from page files using the metadata API
// This component is kept for compatibility but doesn't modify head tags
// For proper SEO, use metadata exports in page files

type SeoProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

export default function Seo({
  title,
  description,
  image = "/images/preview.jpg",
  url = "https://glco.us",
}: SeoProps) {
  // In App Router, this component is a no-op for compatibility
  // Metadata should be handled via metadata exports in page files
  // This prevents errors while maintaining component structure
  return null;
}