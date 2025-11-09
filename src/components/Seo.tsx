import Head from "next/head";

type SeoProps = {
  title: string;
  description: string;
  image?: string; // путь типа "/images/preview.jpg"
  url?: string;   // абсолютный url сайта
};

export default function Seo({
  title,
  description,
  image = "/images/preview.jpg",
  url = "https://glco.us",
}: SeoProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="trucking, logistics, freight, transport, USA trucking company" />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
    </Head>
  );
}