using Model.ViewModel;

namespace Model.DomainModel
{
    public class SchemeConfigDropdownModel
    {
        public List<SelectListItem>? IsSelfOrFamilyMember { get; set; }
        public List<SelectListItem>? IsAlreadyAvailed { get; set; }
        public List<SelectListItem>? FamilyMemberCategorys { get; set; }
        public List<SelectListItem>? Genders { get; set; }
        public List<SelectListItem>? Community { get; set; }
        public List<SelectListItem>? Religions { get; set; }
        public List<SelectListItem>? Castes { get; set; }
        public List<SelectListItem>? Districts { get; set; }
        public List<SelectListItem>? StatusList { get; set; }

        public List<SelectListItem>? MemberEducationList { get; set; }
        public List<SelectListItem>? FamilyMemberEducationList { get; set; }
        public List<SelectListItem>? MaritalStatusList { get; set; }
        public List<SelectListItem>? OrganizationTypeList { get; set; }

        public List<ConfigSelectListByParentIdListModel>? CommunityGrouped { get; set; }
        public List<ConfigSelectListByParentIdListModel>? CastesGrouped { get; set; }
    }
}
