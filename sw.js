// self: 表示 Service Worker 作用域, 也是全局变量
// caches: 表示缓存
// skipWaiting: 表示强制当前处在 waiting 状态的脚本进入 activate 状态
// clients: 表示 Service Worker 接管的页面

console.log('[sw.js] Script loaded!')

// 定义需要缓存的路径, 以及需要缓存的静态文件的列表, 这个列表也可以通过 Webpack 插件生成。
const cacheStorageKey = 'minimal-pwa-10'
const cacheList = [
  '/',
  "index.html",
  "main.css",
  "favicon.svg",
  "sw-lifecycle.svg"
]

self.addEventListener('install', (e) => {
  console.log('[sw.js] Cache event!')
  e.waitUntil(
    caches.open(cacheStorageKey)
      .then((cache) => {
        console.log('[sw.js] Adding to Cache:', cacheList)
        // 抓取资源写入缓存
        return cache.addAll(cacheList)
      })
      .then(() => {
        console.log('[sw.js] Skip waiting!')
        // self.skipWaiting方法是为了在页面更新的过程当中, 新的 Service Worker 脚本能立即激活和生效。
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', (e) => {
  console.log('[sw.js] Activate event')
  e.waitUntil(
    Promise.all(
      caches.keys()
        .then(cacheNames => {
          return cacheNames.map(name => {
            if (name !== cacheStorageKey) {
              return caches.delete(name)
            }
          })
        })
    )
      .then(() => {
        console.log('[sw.js] Clients claims.')
        // self.clients.claim方法在新安装的 Service Worker 取得页面的控制权, 这样之后打开页面都会使用版本更新的缓存。旧的 Service Worker 脚本不再控制着页面之后会被停止。
        return self.clients.claim()
      })
  )
})

// 捕获 fetch 事件, 可以编写代码决定如何响应资源的请求
self.addEventListener('fetch', async (e) => {
  console.log('[sw.js] Fetch event:', e.request.url)
  const { request } = e;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    e.respondWith(cacheData(request));
  } else {
    // e.respondWith(fetch(request))
    e.respondWith(networkFirst(request));
  }

})

async function cacheData(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}

async function networkFirst(request) {
  const cacheStorageKey = 'api-data';
  const cache = await caches.open(cacheStorageKey);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return await cache.match(request);
  }
}
