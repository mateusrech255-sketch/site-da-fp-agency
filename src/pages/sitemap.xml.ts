import type { APIRoute } from 'astro';
import data from '../data/videos.json';

const STATIC_ROUTES = [
  '/',
  '/sobre',
  '/monetize',
  '/monetize/kwaicut',
  '/monetize/kwainarrastars',
  '/inscricao',
  '/treinamento',
  '/busca',
  '/recrutador',
  '/politica-de-privacidade',
  '/termos-de-servico',
  '/aviso-legal',
];

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site || new URL('https://fpagency.com.br');
  
  // Combine static routes with dynamic video routes
  const videoRoutes = data.courses.flatMap(course => 
    course.videos.map(video => `/treinamento/${video.slug}`)
  );
  const allRoutes = [...STATIC_ROUTES, ...videoRoutes];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allRoutes.map((route) => `  <url>\n    <loc>${new URL(route, origin).toString()}</loc>\n  </url>`).join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
