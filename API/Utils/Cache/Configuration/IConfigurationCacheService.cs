using Model.DomainModel;

namespace Utils.Cache.Configuration
{
    // Configuration Cache Service Interface [29-12-2025] -  Developed by Elanjsuriyan
    public interface IConfigurationCacheService
    {
        Dictionary<string, string> Get(string categoryCode);
        string GetValue(string categoryCode, string id);

        ConfigurationModel? GetById(string configurationId);
        List<ConfigurationModel> GetByCategoryId(string categoryId);
        List<ConfigurationModel> GetByCategoryAndScheme(string categoryId, string schemeId);

        List<ConfigurationModel> GetByCategory(string categoryCode,string parentConfigurationId,string schemeId,bool isActive);

        public List<ConfigurationModel> GetSelectList(string categoryCode, string parentConfigurationId, string schemeId, bool isActive);

        public List<ConfigurationModel> GetByStoredProcedure(bool isActive, string configurationId, string categoryId, string parentConfigurationId, string value, string categoryCode, string schemeId, string code, bool showParent);

        void Clear(string categoryCode);
        void ClearPrefix(string categoryCode);
        void ClearAllConfigurationCache();
    }

}
