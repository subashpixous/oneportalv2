using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class OrganizationDetailFormModel
    {
        public List<SelectListItem>? Type_of_Work_SelectList {  get; set; }
        public List<SelectListItem>? Core_Sanitary_Worker_Type_SelectList {  get; set; }
        // Updated By Sivasankar K on 14/01/2026 for Health Worker Type filter
        public List<SelectListItem>? Health_Worker_Type_SelectList { get; set; }
        public List<SelectListItem>? Organization_Type_SelectList {  get; set; }
        public List<SelectListItem>? District_SelectList {  get; set; }
        public List<SelectListItem>? Nature_of_Job_SelectList {  get; set; }
        public List<SelectListItem>? Local_Body_SelectList {  get; set; }
        public List<SelectListItem>? Name_of_Local_Body_SelectList {  get; set; }
        public List<SelectListItem>? Zone_SelectList {  get; set; }
        public List<SelectListItem>? Designation_SelectList {  get; set; }
        public List<SelectListItem>? Municipality_SelectList {  get; set; }
        public List<SelectListItem>? Block_SelectList {  get; set; }
        public List<SelectListItem>? Corporation_SelectList {  get; set; }
        public List<SelectListItem>? Town_Panchayat_SelectList {  get; set; }
        public List<SelectListItem>? Village_Panchayat_SelectList {  get; set; }
        public List<SelectListItem>? MLA_Constituency_SelectList { get; set; }
        public List<SelectListItem>? MP_Constituency_SelectList { get; set; }
        public List<SelectListItem>? Employer_Type_SelectList { get; set; }
        public List<SelectListItem>? Work_Office_SelectList { get; set; }
    }
}
