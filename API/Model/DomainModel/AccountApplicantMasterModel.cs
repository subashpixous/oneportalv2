using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class AccountApplicantMasterModel
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class MobileRoleModel
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string UserNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; } 
        public string RoleId { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string RoleCode { get; set; } = string.Empty;
        public List<string> Privileges { get; set; } = new List<string>();
    }

}
