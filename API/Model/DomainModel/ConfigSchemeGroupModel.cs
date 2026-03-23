using Microsoft.AspNetCore.Http;

namespace Model.DomainModel
{
    public class ConfigSchemeGroupModel
    {
        public string Id { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public string? GroupNameTamil { get; set; }
        public string GroupImage { get; set; } = string.Empty;
        public string SchemeIds { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string>? SchemeIdsList { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
    }

    public class ConfigSchemeGroupSaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public string? GroupNameTamil { get; set; }
        public string GroupImage { get; set; } = string.Empty;
        public string SchemeIds { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> SchemeIdsList { get; set; }
        public bool IsActive { get; set; }
    }
}
