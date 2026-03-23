namespace Model.DomainModel
{
    public class ConfigApprovalDocCategoryModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string DocCategoryId { get; set; } = string.Empty;
        public string DocCategory { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
    }

    public class ConfigApprovalDocCategorySaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string DocCategoryId { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
    }
}
