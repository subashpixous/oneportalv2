using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ConfigurationViewModel
    {
        public string Id { get; set; } = null!;
        public string CategoryId { get; set; } = null!;
        public string ConfigurationId { get; set; } = null!;
        public string Value { get; set; } = null!;
        public string? ValueTamil { get; set; } = null!;
        public string? Code { get; set; } = string.Empty;
        public bool CanDelete { get; set; }
        public bool IsActive { get; set; }
        public string? SchemeId { get; set; } = string.Empty;

        public string LastUpdatedBy { get; set; } = string.Empty;
        public string LastUpdatedUserName { get; set; } = string.Empty;
        public DateTime? LastUpdatedDate { get; set; }
    }

    public class ConfigurationSaveViewModel
    {
        public string Id { get; set; } = null!;
        public string CategoryId { get; set; } = null!;
        public string ConfigurationId { get; set; } = null!;
        public string Value { get; set; } = null!;
        public string? ValueTamil { get; set; } = null!;
        public string? Code { get; set; } = string.Empty;
        public bool CanDelete { get; set; }
        public bool IsActive { get; set; }
        public string? SchemeId { get; set; } = string.Empty;
    }

    public class ConfigCategoryViewModel
    {
        public string Id { get; set; } = null!;
        public string ParentId { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string CategoryCode { get; set; } = null!;
        public string CategoryType { get; set; } = null!;
        public bool IsActive { get; set; }
        public bool IsEditable { get; set; }
        public bool IsDependent { get; set; }
        public bool HasCode { get; set; }
        public bool IsGeneralCategory { get; set; }
    }
}
