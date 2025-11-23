import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event, {
      mapRequestToAsset: req => {
        // 如果是根路径，返回 index.html
        if (req.url.endsWith('/')) {
          return new Request(`${req.url}index.html`, req);
        }
        return mapRequestToAsset(req);
      }
    });
  } catch (e) {
    // 如果找不到文件，返回 index.html（支持SPA）
    if (e.statusCode === 404) {
      return getAssetFromKV(event, {
        mapRequestToAsset: () => new Request(`${new URL(event.request.url).origin}/index.html`, event.request)
      });
    }
    return new Response('Error: ' + e.message, { status: 500 });
  }
}