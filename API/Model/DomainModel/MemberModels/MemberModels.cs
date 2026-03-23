using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class MemberModels
    {
        public MemberDetailsModel? MemberDetails { get; set; }
        public OrganizationDetailModel? OrganizationDetailModel { get; set; }
        public BankDetailModel? BankDetailModel { get; set; }
        public ApplicationAddressMaster? WorkAddressMasters { get; set; }
        public ApplicationAddressMaster? PermanentAddressMasters { get; set; }
        public ApplicationAddressMaster? TemprorayAddressMasters { get; set; }
        public List<FamilyMemberModel>? FamilyMemberModels { get; set; }
    }

    public class MemberGetModels
    {
        public MemberDetailsModel? MemberDetails { get; set; }
        public OrganizationDetailModel? OrganizationDetail { get; set; }
        public BankDetailModel? BankDetail { get; set; }
        public ApplicationAddressMaster? WorkAddress { get; set; }
        public ApplicationAddressMaster? PermanentAddress { get; set; }
        public ApplicationAddressMaster? TemprorayAddress { get; set; }
        public List<FamilyMemberModel>? FamilyMembers { get; set; }
        public List<MemberDocumentMaster>? MemberDocuments { get; set; }
        public List<MemberDocumentMaster>? MemberNonMandatoryDocuments { get; set; }
        public List<ApplicationAddressMaster>? AllAddressMaster { get; set; }


        // From properties

        public MemberDetailsFormModel? MemberDetailsForm { get; set; }
        public OrganizationDetailFormModel? OrganizationDetailForm { get; set; }
        public FamilyMemberFormModel? FamilyMemberForm { get; set; }
        public BankDetailFormModel? BankDetailForm { get; set; }
        public AddressDetailFormModel? WorkAddressDetailForm { get; set; }
        public AddressDetailFormModel? PermanentAddressDetailForm { get; set; }
        public AddressDetailFormModel? TemporaryAddressDetailForm { get; set; }


    }

    public class MemberSaveAllModels
    {
        public bool IsOfficerSave { get; set; }
        //public bool IsNewMember { get; set; }
        public MemberDetailsSaveModel? MemberDetails { get; set; }
        public OrganizationDetailSaveModel? OrganizationDetail { get; set; }
        public List<FamilyMemberSaveModel>? FamilyMembers { get; set; }
        public BankDetailSaveModel? BankDetail { get; set; }
        public ApplicationAddressMaster? WorkAddress { get; set; }
        public ApplicationAddressMaster? PermanentAddress { get; set; }
        public ApplicationAddressMaster? TemprorayAddress { get; set; }
        public bool IsSubmitted { get; set; }
    }
}
