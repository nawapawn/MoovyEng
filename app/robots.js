const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moovyeng.vercel.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/edit'],
        disallow: ['/api/', '/clips_cache/', '/exports/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
