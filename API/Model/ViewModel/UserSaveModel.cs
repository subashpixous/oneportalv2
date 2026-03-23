using Model.CustomeAttributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class UserSaveModel
    {
        public string UserId { get; set; } = null!;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Telephone { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string RoleId { get; set; } = string.Empty;
        public string UserGroup { get; set; } = string.Empty;
        public DateTime? DOB { get; set; }
        public string GenderId { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public bool IsSuperAdmin { get; set; }

        public List<string>? DistrictIdss { get; set; } = null!;
        public List<string>? LocalBodyIdss { get; set; } = null!;
        public List<string>? NameOfLocalBodyIdss { get; set; } = null!;
        public List<string>? BlockIdss { get; set; } = null!;
        public List<string>? CorporationIdss { get; set; } = null!;
        public List<string>? MunicipalityIdss { get; set; } = null!;
        public List<string>? Town_PanchayatIdss { get; set; } = null!;
        public List<string>? Village_PanchayatIdss { get; set; } = null!;
        public List<string>? ZoneIdss { get; set; } = null!;

        public List<string>? SchemesIdss { get; set; } = null!;
        public List<string>? BankIdss { get; set; } = null!;
        public List<string>? BranchIdss { get; set; } = null!;
        public List<string>? CardPrintStatusIdss { get; set; }
    }
}
