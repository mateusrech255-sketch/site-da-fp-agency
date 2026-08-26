import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path || '';
  
  // Ex: path = "open.video/video.js"
  // targetUrl = "https://open.video/video.js"
  // For requests that might have query params:
  const urlObj = new URL(request.url);
  const targetUrl = `https://${path}${urlObj.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('origin');
  headers.delete('referer');
  // Avoid sending proxy IPs that might trigger Ezoic's bot protection
  headers.delete('x-forwarded-for');
  headers.delete('cf-connecting-ip');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
    });
    
    const contentType = response.headers.get('content-type') || '';
    
    // If it's the player JS, rewrite the URLs
    if (contentType.includes('javascript') || path.endsWith('.js')) {
      let jsText = await response.text();
      
      // Rewrite any absolute open.video URL to our proxy
      jsText = jsText.replace(/https:\/\/(([a-z0-9-]+\.)?open\.video)/g, '/api/proxy/$1');
      
      return new Response(jsText, {
        status: response.status,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // For videos, MPDs, M4S, and API JSON responses
    const proxyHeaders = new Headers(response.headers);
    proxyHeaders.delete('content-security-policy');
    proxyHeaders.delete('x-frame-options');
    proxyHeaders.set('access-control-allow-origin', '*');

    // If it's a manifest or text response, we might need to rewrite URLs inside it too!
    if (contentType.includes('text/') || contentType.includes('application/json') || contentType.includes('application/dash+xml') || contentType.includes('application/vnd.apple.mpegurl')) {
      let textContent = await response.text();
      textContent = textContent.replace(/https:\/\/(([a-z0-9-]+\.)?open\.video)/g, '/api/proxy/$1');
      return new Response(textContent, {
        status: response.status,
        headers: proxyHeaders,
      });
    }

    // Binary stream (m4s, mp4)
    return new Response(response.body, {
      status: response.status,
      headers: proxyHeaders,
    });
  } catch (err) {
    return new Response('Proxy Error', { status: 500 });
  }
};
