namespace Model.DomainModel
{
    public class ApplicationDocumentConfigurationModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string DocumentGroupId { get; set; } = string.Empty;
        public string DocumentGroupName { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public string DocumentCategory { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
    }

    public class ApplicationDocumentConfigurationSaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string DocumentGroupId { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
    }
}
