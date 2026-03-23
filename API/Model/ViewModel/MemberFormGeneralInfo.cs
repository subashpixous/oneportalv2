using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class MemberFormGeneralInfo
    {
        public bool IsSubmitted {  get; set; }
        public bool IsWaitingForApproval {  get; set; }
        public bool IsNewMember {  get; set; }
        public bool IsRejected {  get; set; }
        public string Reason {  get; set; } = string.Empty;
        public string Comment {  get; set; } = string.Empty;
        public string Profile_Picture { get; set; }
    }

    public class MemberExistGeneralInfo
    {
        public string Id { get; set; } = string.Empty;
        public bool IsSubmitted { get; set; }
        public bool IsNewMember { get; set; }
        public bool IsApproved { get; set; }
        public string Member_Id { get; set; } = string.Empty;
        public string Phone_Number { get; set; } = string.Empty;
    }
}
