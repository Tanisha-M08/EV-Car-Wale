(function () {
  'use strict';

  const CACHE_PREFIX = 'evcw_videos_v5_';
  const CACHE_DURATION = 10 * 60 * 1000;

  function getCacheKey(topic) {
    return CACHE_PREFIX + (topic || '__all__');
  }

  function getCached(topic) {
    try {
      var key = getCacheKey(topic);
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (Date.now() - entry.ts < CACHE_DURATION) {
        return entry.data;
      }
      localStorage.removeItem(key);
    } catch (e) {}
    return null;
  }

  function setCache(topic, data) {
    try {
      var key = getCacheKey(topic);
      localStorage.setItem(key, JSON.stringify({ data: data, ts: Date.now() }));
    } catch (e) {}
  }

  async function fetchVideos(topic) {
    var cached = getCached(topic);
    if (cached) return cached;

    var params = {};
    if (topic) params.topic = topic;
    var qs = new URLSearchParams(params).toString();
    var url = '/api/videos' + (qs ? '?' + qs : '');

    var res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load videos');
    var data = await res.json();
    setCache(topic, data);
    return data;
  }

  function formatDate(str) {
    try {
      var d = new Date(str);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return str || 'Aug 2026';
    }
  }

  function openYouTubeWatch(videoId) {
    if (!videoId) return;
    var watchUrl = 'https://www.youtube.com/watch?v=' + videoId;
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
  }

  function renderSkeletons(container, count) {
    container.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var div = document.createElement('div');
      div.className = 'border border-zinc-200 bg-white p-4 flex flex-col gap-3 rounded-xl video-skeleton';
      div.innerHTML =
        '<div class="h-44 bg-zinc-100 rounded-lg animate-pulse"></div>' +
        '<div class="flex flex-col gap-2">' +
          '<div class="h-2.5 bg-zinc-100 rounded w-1/3 animate-pulse"></div>' +
          '<div class="h-3.5 bg-zinc-100 rounded w-3/4 animate-pulse"></div>' +
          '<div class="h-2.5 bg-zinc-100 rounded w-1/2 animate-pulse"></div>' +
        '</div>';
      container.appendChild(div);
    }
  }

  const BRAND_CAR_THUMBS = {
    'tata': 'https://ev-car-wale.s3.ap-south-1.amazonaws.com/car-images/tata/nexon-ev.webp',
    'mg': 'https://ev-car-wale.s3.ap-south-1.amazonaws.com/car-images/mg/comet-ev.webp',
    'byd': 'https://ev-car-wale.s3.ap-south-1.amazonaws.com/car-images/byd/seal.webp',
    'hyundai': 'https://ev-car-wale.s3.ap-south-1.amazonaws.com/car-images/hyundai/ioniq-5.webp',
    'mahindra': 'https://ev-car-wale.s3.ap-south-1.amazonaws.com/car-images/mahindra/xuv400-ev.webp',
    'bmw': 'https://ev-car-wale.s3.ap-south-1.amazonaws.com/car-images/bmw/i4.webp',
    'kia': 'https://ev-car-wale.s3.ap-south-1.amazonaws.com/car-images/kia/ev6.webp'
  };

  function createCardElement(video) {
    var card = document.createElement('div');
    card.className = 'border border-zinc-200 bg-white p-6 flex flex-col gap-4 group cursor-pointer hover:border-black transition-all video-card rounded-2xl shadow-sm hover:shadow-2xl';
    card.setAttribute('data-video-id', video.id || '');

    var thumb = document.createElement('div');
    thumb.className = 'aspect-video w-full bg-zinc-950 relative flex items-center justify-center overflow-hidden rounded-xl border border-zinc-200 group-hover:border-black transition-colors';

    var img = document.createElement('img');
    img.className = 'w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105';
    img.setAttribute('referrerpolicy', 'no-referrer');
    img.setAttribute('crossorigin', 'anonymous');
    
    var thumbUrl = (video.id && video.id.length >= 8) ?
      ('https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg') :
      (video.thumbnail || '');
      
    img.src = thumbUrl;
    img.alt = video.title || 'EV Video';
    img.loading = 'lazy';

    img.onerror = function () {
      var currentSrc = this.src || '';
      if (currentSrc.includes('i.ytimg.com')) {
        this.src = 'https://img.youtube.com/vi/' + video.id + '/mqdefault.jpg';
      } else {
        var titleLower = (video.title || '').toLowerCase();
        var matchedBrand = Object.keys(BRAND_CAR_THUMBS).find(b => titleLower.includes(b));
        this.src = matchedBrand ? BRAND_CAR_THUMBS[matchedBrand] : '/car_outline.jpg';
      }
    };
    thumb.appendChild(img);

    var playBtnWrapper = document.createElement('div');
    playBtnWrapper.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none';
    playBtnWrapper.innerHTML = '<div class="w-14 h-14 rounded-full border border-white/30 bg-black/80 backdrop-blur-md flex items-center justify-center text-white pl-0.5 scale-100 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300 shadow-2xl"><svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>';
    thumb.appendChild(playBtnWrapper);

    var duration = document.createElement('span');
    duration.className = 'absolute bottom-2 right-2 px-2 py-0.5 bg-black/90 text-[9px] font-mono tracking-wider rounded text-white font-bold z-10';
    duration.textContent = video.duration || '12:00';
    thumb.appendChild(duration);

    card.appendChild(thumb);

    var info = document.createElement('div');
    info.className = 'flex flex-col gap-1 text-left font-mono';

    var channel = document.createElement('span');
    channel.className = 'text-[9px] text-zinc-500 uppercase tracking-wider font-semibold truncate';
    channel.textContent = video.channelName || 'YouTube Creator';
    info.appendChild(channel);

    var title = document.createElement('h3');
    title.className = 'text-xs font-bold text-zinc-800 group-hover:text-black transition-colors line-clamp-2 leading-snug';
    title.textContent = video.title || 'EV Review Video';
    info.appendChild(title);

    var date = document.createElement('span');
    date.className = 'text-[8px] text-zinc-400 mt-0.5';
    date.textContent = formatDate(video.published);
    info.appendChild(date);

    card.appendChild(info);

    var link = document.createElement('a');
    link.href = video.url || ('https://www.youtube.com/watch?v=' + video.id);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'mt-auto pt-2 text-[9px] font-mono uppercase tracking-wider text-red-600 group-hover:text-red-700 transition-colors flex items-center gap-1 font-semibold';
    link.innerHTML = 'Watch on YouTube <span class="transition-transform group-hover:translate-x-0.5">→</span>';
    card.appendChild(link);

    card.addEventListener('click', function(e) {
      openYouTubeWatch(video.id);
    });

    return card;
  }

  function renderCards(container, videos, options) {
    container.innerHTML = '';

    if (!videos || videos.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'col-span-full text-center py-16';
      empty.innerHTML = '<p class="text-zinc-400 font-mono text-xs">No videos available for this topic yet. Check back later.</p>';
      container.appendChild(empty);
      return;
    }

    (options.onBeforeRender || function(){})();

    var maxVideos = options.limit || videos.length;
    var displayVideos = videos.slice(0, maxVideos);

    displayVideos.forEach(function (video) {
      var card = createCardElement(video);
      container.appendChild(card);
    });

    (options.onAfterRender || function(){})();
  }

  function loadVideos(containerId, topic, options) {
    options = options || {};
    var container = document.getElementById(containerId);
    if (!container) return;

    renderSkeletons(container, options.skeletonCount || 6);

    fetchVideos(topic || '')
      .then(function (videos) {
        container.className = container.className.replace(/ grid-cols-\d+/g, '') + ' grid grid-cols-1 md:grid-cols-3 gap-6';

        if (options.enablePagination || document.getElementById('load-more-container')) {
          var pageSize = options.pageSize || 12;
          var currentIndex = 0;

          // Render initial batch
          container.innerHTML = '';
          var initialBatch = videos.slice(0, pageSize);
          initialBatch.forEach(function(v) {
            container.appendChild(createCardElement(v));
          });
          currentIndex = pageSize;

          var loadMoreWrapper = document.getElementById('load-more-container');
          var loadMoreBtn = document.getElementById('load-more-videos-btn');

          if (loadMoreWrapper && loadMoreBtn) {
            if (videos.length > currentIndex) {
              loadMoreWrapper.classList.remove('hidden');
            } else {
              loadMoreWrapper.classList.add('hidden');
            }

            // Replace previous listener
            var newBtn = loadMoreBtn.cloneNode(true);
            loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);

            newBtn.addEventListener('click', function() {
              var nextBatch = videos.slice(currentIndex, currentIndex + pageSize);
              nextBatch.forEach(function(v) {
                container.appendChild(createCardElement(v));
              });
              currentIndex += pageSize;

              if (currentIndex >= videos.length) {
                loadMoreWrapper.classList.add('hidden');
              }
            });
          }
        } else {
          renderCards(container, videos, options);
        }
      })
      .catch(function (err) {
        console.error('VideoIntegration error:', err);
        container.className = container.className.replace(/ grid-cols-\d+/g, '') + ' grid grid-cols-1 md:grid-cols-3 gap-6';
        container.innerHTML = '';
        var errDiv = document.createElement('div');
        errDiv.className = 'col-span-full text-center py-16';
        errDiv.innerHTML = '<p class="text-zinc-400 font-mono text-xs">Unable to load videos right now. Please try again later.</p>';
        container.appendChild(errDiv);
      });
  }

  window.VideoIntegration = {
    fetchVideos: fetchVideos,
    loadVideos: loadVideos,
    renderCards: renderCards,
    renderSkeletons: renderSkeletons,
    openYouTubeWatch: openYouTubeWatch
  };
})();
