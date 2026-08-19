/** SEO metadata configuration options. */
type Props = {
  /** Page title string. */
  title: string;
  /** Meta description text. */
  description?: string;
  /** Open Graph & Twitter image URL. */
  image?: string;
  /** Meta keywords string. */
  keywords?: string;
};

/**
 * Generates an array of standard, Open Graph, and Twitter SEO meta tags.
 *
 * @param props - The SEO parameters of type {@linkcode Props}.
 *
 * @returns Array of metadata tag descriptors for HTML document head.
 */
const seo = ({ title, description, keywords, image }: Props) => {
  const tags = [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'og:type', content: 'website' },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    ...(image
      ? [
          { name: 'twitter:image', content: image },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'og:image', content: image },
        ]
      : []),
  ];

  return tags;
};

export default seo;
