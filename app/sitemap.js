const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moovyeng.com';

export default function sitemap() {
  const lastModified = new Date();

  return [
    {
      url: `${BASE_URL}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/edit`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
