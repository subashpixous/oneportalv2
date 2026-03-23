using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.LogModel
{
    public class UserActivityLogModel
    {
        public string ActivityLogId { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string RoleId { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string ModuleName { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string EventDescription { get; set; } = string.Empty;
        public int EventStatus { get; set; } = 0;
        public int FailureCount { get; set; } = 0;
        public int SuccessCount { get; set; } = 0;
    }

}
