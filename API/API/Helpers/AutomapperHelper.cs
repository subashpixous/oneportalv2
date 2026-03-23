using AutoMapper;
using Model.DomainModel;
using Model.ViewModel;
using Model.ViewModel.MemberModels;
using Newtonsoft.Json;

namespace API.Helpers
{
    public class AutomapperHelper : Profile
    {
        public AutomapperHelper()
        {
            // Account / Login

            CreateMap<LoginModel, LoginViewModel>();
            CreateMap<LoginViewModel, LoginModel>();

            CreateMap<AccountUserModel, AccountUserViewModel>()
                .ForMember(d => d.LastUpdatedUserName, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.ModifiedByUserName) ? s.CreatedByUserName : s.ModifiedByUserName))
                .ForMember(d => d.LastUpdatedBy, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.ModifiedBy) ? s.CreatedBy : s.ModifiedBy))
                .ForMember(d => d.LastUpdatedDate, o => o.MapFrom(s => s.ModifiedDate ?? s.CreatedDate));
            CreateMap<AccountUserViewModel, AccountUserModel>();

            CreateMap<AccountUserModel, UserSaveModel>();
            CreateMap<UserSaveModel, AccountUserModel>();

            // TCC

            CreateMap<ConfigurationModel, ConfigurationViewModel>()
                .ForMember(d => d.LastUpdatedUserName, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.ModifiedByUserName) ? s.CreatedByUserName : s.ModifiedByUserName))
                .ForMember(d => d.LastUpdatedBy, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.ModifiedBy) ? s.CreatedBy : s.ModifiedBy))
                .ForMember(d => d.LastUpdatedDate, o => o.MapFrom(s => s.ModifiedDate ?? s.CreatedDate));
            CreateMap<ConfigurationViewModel, ConfigurationModel>();

            CreateMap<ConfigCategoryModel, ConfigCategoryViewModel>();
            CreateMap<ConfigCategoryViewModel, ConfigCategoryModel>();

            CreateMap<ConfigurationModel, ConfigurationSaveViewModel>();
            CreateMap<ConfigurationSaveViewModel, ConfigurationModel>();

            // Role

            CreateMap<AccountRoleModel, AccountRoleViewModel>()
                .ForMember(d => d.LastUpdatedUserName, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.ModifiedByUserName) ? s.CreatedByUserName : s.ModifiedByUserName))
                .ForMember(d => d.LastUpdatedBy, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.ModifiedBy) ? s.CreatedBy : s.ModifiedBy))
                .ForMember(d => d.LastUpdatedDate, o => o.MapFrom(s => s.ModifiedDate ?? s.CreatedDate));
            CreateMap<AccountRoleViewModel, AccountRoleModel>();

            CreateMap<AccountRolePrivilegeModel, AccountRolePrivilegeViewModel>();
            CreateMap<AccountRolePrivilegeViewModel, AccountRolePrivilegeModel>();

            CreateMap<AccountPrivilegeModel, AccountPrivilegeViewModel>();
            CreateMap<AccountPrivilegeViewModel, AccountPrivilegeModel>();

            // Role Privilege

            CreateMap<AccountPrivilegeSaveModel, AccountPrivilegeSaveViewModel>();
            CreateMap<AccountPrivilegeSaveViewModel, AccountPrivilegeSaveModel>();

            // Approval Flow

            CreateMap<ApprovalFlowMaster, ApprovalFlowViewMaster>()
                .ForMember(d => d.LastUpdatedUserName, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.ModifiedByUserName) ? s.CreatedByUserName : s.ModifiedByUserName))
                .ForMember(d => d.LastUpdatedBy, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.ModifiedBy) ? s.CreatedBy : s.ModifiedBy))
                .ForMember(d => d.LastUpdatedDate, o => o.MapFrom(s => s.ModifiedDate ?? s.CreatedDate));
            CreateMap<ApprovalFlowViewMaster, ApprovalFlowMaster>();

            CreateMap<ApplicationDocumentMasterModel, ApplicationDocumentMasterSaveModel>();
            CreateMap<ApplicationDocumentMasterSaveModel, ApplicationDocumentMasterModel>();

            CreateMap<ApplicationDocumentModel, ApplicationDocumentMasterModel>();
            CreateMap<ApplicationDocumentMasterModel, ApplicationDocumentModel>();

            CreateMap<ApplicantQualificationMasterModel, ApplicantQualificationMasterViewModel>();
            CreateMap<ApplicantQualificationMasterViewModel, ApplicantQualificationMasterModel>();

            CreateMap<ApprovalModel, ApprovalViewModel>();
            CreateMap<ApprovalViewModel, ApprovalModel>();

            CreateMap<ApplicationDocumentConfigurationModel, ApplicationDocumentConfigurationSaveModel>();
            CreateMap<ApplicationDocumentConfigurationSaveModel, ApplicationDocumentConfigurationModel>();

            CreateMap<ApplicationPrivilegeMaster, ApplicationUCForm3PrivilegeModel>();
            CreateMap<ApplicationUCForm3PrivilegeModel, ApplicationPrivilegeMaster>();

            //Main
            CreateMap<Datum, MemberViewModelExisting>()
           .ForMember(d => d.OrganizationalDetail, o => o.MapFrom(src => src.organization_info))
           .ForMember(d => d.MemberDetail, o => o.MapFrom(src => src.member_details))
           .ForMember(d => d.PermanentAddress, o => o.MapFrom(src => src.permanent_address))
           .ForMember(d => d.TemproraryAddress, o => o.MapFrom(src => src.temporary_address))
           .ForMember(d => d.BankDetails, o => o.MapFrom(src => src.bank_details))
           .ForMember(d => d.FamilyMembers, o => o.MapFrom(src => src.family_members)).ReverseMap();

                 //Inside
                 CreateMap<OrganizationInfo, OrganizationalViewModelExisting>()
                .ForMember(dest => dest.TypeOfWork, opt => opt.MapFrom(src => src.Type_of_Work))
                .ForMember(dest => dest.TypeOfCoreSanitoryWorker, opt => opt.MapFrom(src => src.Core_Sanitary_Worker_Type))
                .ForMember(dest => dest.OrganizationType, opt => opt.MapFrom(src => src.Organization_Type))
                .ForMember(dest => dest.NatureOfJob, opt => opt.MapFrom(src => src.Nature_of_Job))
                .ForMember(dest => dest.DistritName, opt => opt.MapFrom(src => src.District != null ? src.District.name : string.Empty))
                .ForMember(dest => dest.LocalBody, opt => opt.MapFrom(src => src.Local_Body))
                .ForMember(dest => dest.VillagePanchayat, opt => opt.MapFrom(src => src.Village_Panchayat))
                .ForMember(dest => dest.Block, opt => opt.MapFrom(src => src.Block))
                .ForMember(dest => dest.NameoftheLocalBody, opt => opt.MapFrom(src => src.Name_of_Local_Body))
                .ForMember(dest => dest.Corporation, opt => opt.MapFrom(src => src.Corporation))
                .ForMember(dest => dest.Municipality, opt => opt.MapFrom(src => src.Municipality))
                .ForMember(dest => dest.TownPanchayat, opt => opt.MapFrom(src => src.Town_Panchayat))
                .ForMember(dest => dest.Zone, opt => opt.MapFrom(src => src.Zone)).ReverseMap();

                CreateMap<MemberDetails, MemberDetailsViewModelExisting>()
                .ForMember(dest => dest.ProfileImageName, opt => opt.MapFrom(src => src.Profile_Picture))
                .ForMember(dest => dest.Community, opt => opt.MapFrom(src => src.Community))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.First_Name))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Last_Name))
                .ForMember(dest => dest.FathersName, opt => opt.MapFrom(src => src.Father_Name))
                .ForMember(dest => dest.MaritalStatus, opt => opt.MapFrom(src => src.Marital_Status))
                .ForMember(dest => dest.Education, opt => opt.MapFrom(src => src.Education))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone_Number))
                .ForMember(dest => dest.RationCard, opt => opt.MapFrom(src => string.Empty))
                .ForMember(dest => dest.AadharNumber, opt => opt.MapFrom(src => src.Aadhaar_Number))
                .ForMember(dest => dest.DOB, opt => opt.MapFrom(src => src.Date_Of_Birth))
                .ForMember(dest => dest.YellowCardNumber, opt => opt.MapFrom(src => string.Empty))
                .ForMember(dest => dest.WorkOrganisationName, opt => opt.MapFrom(src => string.Empty))
                .ForMember(dest => dest.WorkDesignation, opt => opt.MapFrom(src => string.Empty))
                .ForMember(dest => dest.WorkAddress, opt => opt.MapFrom(src => string.Empty))
                .ForMember(dest => dest.IsAlreadyMember, opt => opt.MapFrom(src => true)).ReverseMap();
                
                 CreateMap<PermanentAddress, AddressViewModelExisting>()
                .ForMember(dest => dest.DoorNo, opt => opt.MapFrom(src => string.Empty))
                .ForMember(dest => dest.StreetName, opt => opt.MapFrom(src => src.Street))
                .ForMember(dest => dest.VillageorCity, opt => opt.MapFrom(src => src.City_Village))
                .ForMember(dest => dest.District, opt => opt.MapFrom(src => src.District != null ? src.District.name : string.Empty))
                .ForMember(dest => dest.Pincode, opt => opt.MapFrom(src => src.Pincode)).ReverseMap();

                CreateMap<TemporaryAddress, AddressViewModelExisting>()
                .ForMember(dest => dest.StreetName, opt => opt.MapFrom(src => src.Street))
                .ForMember(dest => dest.VillageorCity, opt => opt.MapFrom(src => src.City_Village))
                .ForMember(dest => dest.TalukName, opt => opt.MapFrom(src => src.Taluk))
                .ForMember(dest => dest.District, opt => opt.MapFrom(src => src.District != null ? src.District.name : string.Empty))
                .ForMember(dest => dest.Pincode, opt => opt.MapFrom(src => src.Pincode)).ReverseMap();

                CreateMap<BankDetails, BankViewModelExisting>()
                .ForMember(dest => dest.AccountHolderName, opt => opt.MapFrom(src => src.Account_Holder_Name))
                .ForMember(dest => dest.AccountNumber, opt => opt.MapFrom(src => src.Account_Number))
                .ForMember(dest => dest.IFSC, opt => opt.MapFrom(src => src.IFSC_Code))
                .ForMember(dest => dest.BankName, opt => opt.MapFrom(src => src.Bank_Name))
                .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch)).ReverseMap();

                CreateMap<FamilyMember, FamilyMemberViewModelExisting>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.name))
                .ForMember(dest => dest.RelationShip, opt => opt.MapFrom(src => src.relation))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.sex))
                .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.age))
                .ForMember(dest => dest.Education, opt => opt.MapFrom(src => src.education))
                .ForMember(dest => dest.Occupation, opt => opt.MapFrom(src => src.occupation))
                .ForMember(dest => dest.DifferentlyAbled, opt => opt.MapFrom(src => src.disability))
                .ForMember(dest => dest.School, opt => opt.MapFrom(src => new EduDetailSchoolViewModelExisting
                {
                    Standard = src.Standard,
                    EducationalStatus = src.School_Status,
                    EMISNo = src.EMIS_No,
                    CompletedYear = src.Year_Of_Completion,
                    DiscontinuedYear = string.Empty, 
                    NameandAddressofSchool = src.School_Address
                }))
                .ForMember(dest => dest.College, opt => opt.MapFrom(src => new EduDetailCollegeViewModelExisting
                {
                    Course = src.Course,
                    DegreName = src.Degree_Name,
                    EducationalStatus = src.College_Status,
                    EducationalYear = src.Year,
                    CompletedYear = src.Year_Of_Completion,
                    DiscontinuedYear = string.Empty,
                    NameandAddressofCollege = src.College_Address
                })).ReverseMap();

        }
    }
}
