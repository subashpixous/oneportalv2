namespace Utils.Cache.Common
{

    // Common Cache Service Interface [29-12-2025] -  Developed by Elanjsuriyan
    public interface ICommonCacheService
    {
        T GetOrCreate<T>(string cacheKey,Func<T> factory,TimeSpan? absoluteExpire = null,TimeSpan? slidingExpire = null,int? size = null);

        void Remove(string cacheKey);
        void ClearByPrefix(string prefix);

        void ClearAll();
    }
}
