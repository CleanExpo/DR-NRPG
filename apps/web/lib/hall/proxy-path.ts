const entries = new Set(['index.html', 'coastal-expo.html']);
const prefixes = ['tools/coastal/', 'tools/purchases/', 'models/', 'logos/', 'media/', 'runtime/'];
export function hallAssetPath(parts: string[] | undefined): string | null {
  const list = parts?.length ? parts : ['index.html'];
  if (list.some(part => !/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(part) || part.includes('..'))) return null;
  const path = list.join('/');
  if (entries.has(path) || path === 'tools/drying.html') return '/' + path;
  if (prefixes.some(prefix => path.startsWith(prefix)) && /\.(?:mjs|js|css|png|jpg|jpeg|webp|svg|gif|ico|glb|gltf|bin|json|exr|hdr|mp4|webm|woff|woff2|ttf)$/i.test(path)) return '/' + path;
  return null;
}
/** Streaming UTF-8 rewrite keeps legacy absolute Hall links inside the authenticated portal. */
export function portalHtml(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder(); const encoder = new TextEncoder(); let pending = '';
  return body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      pending += decoder.decode(chunk, { stream: true });
      // Hold enough unprocessed input to catch a token split across network chunks.
      let boundary = Math.max(0, pending.length - 32);
      const token = pending.lastIndexOf('/trade-hall/', boundary);
      if (token >= 0 && token + 12 > boundary) boundary = token;
      controller.enqueue(encoder.encode(pending.slice(0, boundary).replace(/\/trade-hall\//g, '/hall/view/')));
      pending = pending.slice(boundary);
    },
    flush(controller) { controller.enqueue(encoder.encode((pending + decoder.decode()).replace(/\/trade-hall\//g, '/hall/view/'))); },
  }));
}
