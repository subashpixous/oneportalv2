using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationPrivilegeMaster : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string RoleId { get; set; } = string.Empty;

        public bool CanCreate { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanView { get; set; }
        public bool CanDelete { get; set; }
        public bool CanApprove { get; set; }
        public bool CanGetMail { get; set; }
        public bool CanGetSMS { get; set; }
        public bool CanReturn { get; set; }
        public bool UcView { get; set; }
        public bool UcUpload { get; set; }
        public bool Form3View { get; set; }
        public bool Form3Upload { get; set; }

        public string? Status { get; set; }
        public string? StatusCode { get; set; }
        public string? Scheme { get; set; }
        public string? Role { get; set; }
        public int Order { get; set; }
    }
}
