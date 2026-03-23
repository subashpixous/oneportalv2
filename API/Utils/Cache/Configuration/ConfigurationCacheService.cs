using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.Extensions.Configuration;
using Model.DomainModel;
using Model.DomainModel.CardApprpvalModels;
using MySql.Data.MySqlClient;
using System.Data;
using Utils.Cache.Common;

namespace Utils.Cache.Configuration
{
    // Configuration Cache Service [29-12-2025] -  Developed by Elanjsuriyan
    public class ConfigurationCacheService : IConfigurationCacheService
    {
        private readonly ICommonCacheService _cache;
        private readonly IConfiguration _configuration;

        private const string PREFIX = "CONFIG_";

        public ConfigurationCacheService(
            ICommonCacheService cache,
            IConfiguration configuration)
        {
            _cache = cache;
            _configuration = configuration;
        }

        public Dictionary<string, string> Get(string categoryCode)
        {
            var key = PREFIX + categoryCode;

            return _cache.GetOrCreate(
                key,
                () =>
                {
                    Console.WriteLine($"[CACHE MISS] {key} → DB HIT");

                    using var con = new MySqlConnection(
                        _configuration.GetConnectionString("Default"));

                    var data = con.Query<(string Id, string Value)>(@"
                SELECT v.Id, v.Value, v.Code
                FROM two_column_configuration_values v
                INNER JOIN two_column_configuration_category c
                    ON c.Id = v.CategoryId
                WHERE v.IsActive = 1
                  AND c.CategoryCode = @Code",
                        new { Code = categoryCode });

                    return data.ToDictionary(x => x.Id, x => x.Value);
                },
                absoluteExpire: TimeSpan.FromHours(12),
                slidingExpire: TimeSpan.FromHours(6),
                size: 1
            );
        }


        public string GetValue(string categoryCode, string id)
        {
            if (string.IsNullOrEmpty(id)) return null;

            var dict = Get(categoryCode);
            return dict.TryGetValue(id, out var value) ? value : null;
        }

        public ConfigurationModel? GetById(string configurationId)
        {
            var key = $"CONFIG_ID_{configurationId}";

            return _cache.GetOrCreate(
                key,
                () =>
                {
                    Console.WriteLine($"[CACHE MISS] {key} → DB HIT");

                    using var con = new MySqlConnection(
                        _configuration.GetConnectionString("Default"));

                    return con.QueryFirstOrDefault<ConfigurationModel>(@"
                SELECT *
                FROM two_column_configuration_values
                WHERE Id = @Id",
                        new { Id = configurationId });
                },
                absoluteExpire: TimeSpan.FromHours(6),
                slidingExpire: TimeSpan.FromHours(2),
                size: 1
            );
        }

        public List<ConfigurationModel> GetByCategoryId(string categoryId)
        {
            var key = $"CONFIG_CAT_{categoryId}";

            return _cache.GetOrCreate(
                key,
                () =>
                {
                    Console.WriteLine($"[CACHE MISS] {key} → DB HIT");

                    using var con = new MySqlConnection(
                        _configuration.GetConnectionString("Default"));

                    return con.Query<ConfigurationModel>(@"
                SELECT *
                FROM two_column_configuration_values
                WHERE CategoryId = @CategoryId
                  AND IsActive = 1",
                        new { CategoryId = categoryId }).ToList();
                },
                absoluteExpire: TimeSpan.FromHours(12),
                slidingExpire: TimeSpan.FromHours(6),
                size: 2
            );
        }

        public List<ConfigurationModel> GetByCategoryAndScheme(string categoryId, string schemeId)
        {
            var key = $"CONFIG_CAT_{categoryId}_SCHEME_{schemeId}";

            return _cache.GetOrCreate(
                key,
                () =>
                {
                    Console.WriteLine($"[CACHE MISS] {key} → DB HIT");

                    using var con = new MySqlConnection(
                        _configuration.GetConnectionString("Default"));

                    return con.Query<ConfigurationModel>(@"
                SELECT *
                FROM two_column_configuration_values
                WHERE CategoryId = @CategoryId
                  AND SchemeId = @SchemeId
                  AND IsActive = 1",
                        new { CategoryId = categoryId, SchemeId = schemeId }).ToList();
                },
                absoluteExpire: TimeSpan.FromHours(6),
                slidingExpire: TimeSpan.FromHours(3),
                size: 2
            );
        }


        public List<ConfigurationModel> GetByCategory(
    string categoryCode,
    string parentConfigurationId = "",
    string schemeId = "",
    bool isActive = true)
        {
            var key = $"CONFIG_LIST_{categoryCode}_{parentConfigurationId}_{schemeId}_{isActive}";

            return _cache.GetOrCreate(
                key,
                () =>
                {
                    using var con = new MySqlConnection(
                        _configuration.GetConnectionString("Default"));

                    var sql = @"
                SELECT v.*
                FROM two_column_configuration_values v
                INNER JOIN two_column_configuration_category c
                    ON c.Id = v.CategoryId
                WHERE c.CategoryCode = @CategoryCode
                  AND (@ParentId = '' OR v.ConfigurationId = @ParentId)
                  AND (@SchemeId = '' OR v.SchemeId = @SchemeId)
                  AND (@IsActive = 0 OR v.IsActive = 1)
                ORDER BY v.SortOrder, v.Value";

                    return con.Query<ConfigurationModel>(sql, new
                    {
                        CategoryCode = categoryCode,
                        ParentId = parentConfigurationId ?? "",
                        SchemeId = schemeId ?? "",
                        IsActive = isActive ? 1 : 0
                    }).ToList();
                },
                absoluteExpire: TimeSpan.FromHours(12),
                slidingExpire: TimeSpan.FromHours(6),
                size: 1
            );
        }


        public List<ConfigurationModel> GetSelectList(
    string categoryCode,
    string parentConfigurationId,
    string schemeId,
    bool isActive)
        {
            var key = $"CONFIG_SELECT_{categoryCode}_{parentConfigurationId}_{schemeId}_{isActive}";

            return _cache.GetOrCreate(
                key,
                () =>
                {
                    using var con = new MySqlConnection(
                        _configuration.GetConnectionString("Default"));

                    var sql = @"
                SELECT 
                    CCV.Id,
                    CCV.CategoryId,
                    CCV.ConfigurationId,
                    CCV.Value,
                    CCV.ValueTamil,
                    CCV.Code,
                    CCV.SchemeId,
                    CCV.IsActive
                FROM two_column_configuration_values CCV
                INNER JOIN two_column_configuration_category CCC
                    ON CCC.Id = CCV.CategoryId
                WHERE CCC.CategoryCode = @CategoryCode
                  AND (@ParentId = '' OR CCV.ConfigurationId = @ParentId)
                  AND (@SchemeId = '' OR CCV.SchemeId = @SchemeId)
                  AND CCV.IsActive = @IsActive
                ORDER BY CCV.SortOrder, CCV.Value";

                    return con.Query<ConfigurationModel>(sql, new
                    {
                        CategoryCode = categoryCode,
                        ParentId = parentConfigurationId ?? "",
                        SchemeId = schemeId ?? "",
                        IsActive = isActive ? 1 : 0
                    }).ToList();
                },
                absoluteExpire: TimeSpan.FromHours(12),
                slidingExpire: TimeSpan.FromHours(6),
                size: 1
            );
        }


        public List<ConfigurationModel> GetByStoredProcedure(bool isActive, string configurationId = "",string categoryId = "",string parentConfigurationId = "",string value = "",string categoryCode = "",string schemeId = "",string code = "", bool showParent = false)
        {
            var key = $"CONFIG_SP_" +
                      $"{isActive}_{configurationId}_{categoryId}_{parentConfigurationId}_" +
                      $"{value}_{categoryCode}_{schemeId}_{code}_{showParent}";

            return _cache.GetOrCreate(
                key,
                () =>
                {
                    Console.WriteLine($"[CACHE MISS] {key} → SP HIT");

                    using var con = new MySqlConnection(
                        _configuration.GetConnectionString("Default"));

                    var parameters = new
                    {
                        pId = configurationId?.Trim() ?? "",
                        pIsActive = isActive,
                        pCategoryId = categoryId?.Trim() ?? "",
                        pCategoryCode = categoryCode?.Trim() ?? "",
                        pConfigurationId = parentConfigurationId?.Trim() ?? "",
                        pValue = value?.Trim() ?? "",
                        pCode = code?.Trim() ?? "",
                        pSchemeId = schemeId?.Trim() ?? "",
                        pShowParent = showParent
                    };

                    return SqlMapper.Query<ConfigurationModel>(
                        con,
                        "Two_Column_Configuration_Get",
                        parameters,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 180
                    ).ToList();
                },
                absoluteExpire: TimeSpan.FromHours(6),
                slidingExpire: TimeSpan.FromHours(3),
                size: 3
            );
        }


        public void Clear(string categoryCode)
        {
            _cache.Remove(PREFIX + categoryCode);
        }

        public void ClearPrefix(string categoryCode)
        {
            _cache.ClearByPrefix(PREFIX + categoryCode);
        }

        public void ClearAllConfigurationCache()
        {
            _cache.ClearAll();
        }

    }
}
