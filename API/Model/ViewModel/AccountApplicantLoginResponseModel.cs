using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Model.ViewModel
{
    public class AccountApplicantLoginResponseModel
    {
        public string Id { get; set; } = string.Empty;
        public string MemberId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string? AadhaarNumber { get; set; }
        public string RefreshToken {  get; set; } = string.Empty;
        public string AccessToken {  get; set; } = string.Empty;
        public string? AccessType { get; set; } = string.Empty;
        public List<string>? Privillage {  get; set; }
    }

    public class UserActivityLogModel
    {
        public string ActivityLogId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string RoleId { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string EventDescription { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
