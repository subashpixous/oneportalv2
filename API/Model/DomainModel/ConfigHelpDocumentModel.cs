using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ConfigHelpDocumentModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string RoleIds { get; set; } = string.Empty;
        public string SchemeIds { get; set; } = string.Empty;
        public string RoleString { get; set; } = string.Empty;
        public string SchemeString { get; set; } = string.Empty;
        public List<string> RoleIdList { get; set; } = null!;
        public List<string> SchemeIdList { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public FileMasterModel? SavedFile { get; set; }
    }
    public class ConfigHelpDocumentSaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public List<string>? RoleIds { get; set; } = null!;
        public List<string>? SchemeIds { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public IFormFile? File { get; set; }
    }

    public class ConfigHelpDocumentFormModel
    {
        public List<SelectListItem> SchemeList { get; set; } = null!;
        public List<SelectListItem> RoleList { get; set; } = null!;
        public List<SelectListItem> TypeList { get; set; } = null!;
        public List<SelectListItem> CategoryList { get; set; } = null!;
    }
}
