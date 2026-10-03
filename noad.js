// YouTube 播放器开播前会先收到一张“单子”，里面写着第几秒插广告。这里把那几行删掉。
(() => {
  const ADS = ['adPlacements', 'playerAds', 'adSlots', 'adBreakHeartbeatParams'];
  const clean = (o) => {
    if (o && typeof o === 'object') {
      for (const k of ADS) delete o[k];
      if (o.playerResponse) clean(o.playerResponse);
    }
    return o;
  };

  // 1. 第一次打开页面：单子直接写在网页里
  let first;
  Object.defineProperty(window, 'ytInitialPlayerResponse', {
    configurable: true,
    get: () => first,
    set: (v) => { first = clean(v); },
  });

  // 2. 站内切换视频：单子走网络请求回来
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await origFetch.apply(this, args);
    const url = args[0] instanceof Request ? args[0].url : String(args[0]);
    if (!url.includes('/youtubei/v1/player')) return res;
    try {
      const data = clean(await res.clone().json());
      return new Response(JSON.stringify(data), { status: res.status, statusText: res.statusText, headers: res.headers });
    } catch {
      // 接口异常时保留原响应，避免影响正常播放。
      return res;
    }
  };
})();
