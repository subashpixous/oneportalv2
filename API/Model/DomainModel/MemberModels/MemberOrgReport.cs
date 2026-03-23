using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class MemberOrgReport
    {
        public int Id { get; set; }
        public string Gender { get; set; }
        public string Religion { get; set; }
        public string Community { get; set; }
        public string Caste { get; set; }
        public string Marital_Status { get; set; }
        public string Education { get; set; }
        public string Type_of_Work { get; set; }
        public string Core_Sanitary_Worker_Type { get; set; }
        public string Organization_Type { get; set; }
        public string District_Id { get; set; }
        public string Nature_of_Job { get; set; }
        public string Local_Body { get; set; }
        public string Name_of_Local_Body { get; set; }
        public string Zone { get; set; }
        public string Block { get; set; }
        public string Village_Panchayat { get; set; }
        public string Corporation { get; set; }
        public string Municipality { get; set; }
        public string Town_Panchayat { get; set; }
        public int Total { get; set; }
    }

}
