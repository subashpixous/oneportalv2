using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;

// Common Cache Service [29-12-2025] -  Developed by Elanjsuriyan
namespace Utils.Cache.Common
{
    public class CommonCacheService : ICommonCacheService
    {
        private readonly IMemoryCache _cache;
        private static readonly ConcurrentDictionary<string, bool> _keys = new();

        public CommonCacheService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public T GetOrCreate<T>(
            string cacheKey,
            Func<T> factory,
            TimeSpan? absoluteExpire = null,
            TimeSpan? slidingExpire = null,
            int? size = null)
        {
            if (_cache.TryGetValue(cacheKey, out T value))
                return value;

            value = factory();

            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = absoluteExpire ?? TimeSpan.FromHours(12),
                SlidingExpiration = slidingExpire ?? TimeSpan.FromHours(6)
            };

            if (size.HasValue)
                options.SetSize(size.Value);

            _cache.Set(cacheKey, value, options);
            _keys.TryAdd(cacheKey, true);

            return value;
        }

        public void Remove(string cacheKey)
        {
            _cache.Remove(cacheKey);
            _keys.TryRemove(cacheKey, out _);
        }

        public void ClearByPrefix(string prefix)
        {
            foreach (var key in _keys.Keys)
            {
                if (key.StartsWith(prefix))
                {
                    Remove(key);
                }
            }
        }

        public void ClearAll()
        {
            foreach (var key in _keys.Keys.ToList())
            {
                _cache.Remove(key);
                _keys.TryRemove(key, out _);
            }
        }
    }
}
