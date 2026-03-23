using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationAddressMaster : AuditColumnsModel
    {
        public string UniqueId { get; set; } = string.Empty;
        public string Id {  get; set; } = string.Empty;
        public string MemberId {  get; set; } = string.Empty;
        public string AddressType {  get; set; } = string.Empty;
        public string DoorNo {  get; set; } = string.Empty;
        public string StreetName {  get; set; } = string.Empty;
        public string VilllageTownCity {  get; set; } = string.Empty;
        public string LocalBody {  get; set; } = string.Empty;
        public string NameoflocalBody {  get; set; } = string.Empty;
        public string District {  get; set; } = string.Empty;
        public string Taluk {  get; set; } = string.Empty;
        public string Block {  get; set; } = string.Empty;
        public string Corporation {  get; set; } = string.Empty;
        public string Municipality {  get; set; } = string.Empty;
        public string TownPanchayat {  get; set; } = string.Empty;
        public string Pincode {  get; set; } = string.Empty;
        public bool IsActive {  get; set; }
        public string Area {  get; set; } = string.Empty;
        public bool IsTemp { get; set; }

        public string DistrictString { get; set; } = string.Empty;
        public string TalukString { get; set; } = string.Empty;
        public string BlockString { get; set; } = string.Empty;
        public string CorporationString { get; set; } = string.Empty;
        public string MunicipalityString { get; set; } = string.Empty;
        public string TownPanchayatString { get; set; } = string.Empty;

        public bool IsApprovalPending { get; set; }
        public bool IsAbleToCancelRequest { get; set; }


        public bool IsValid { get; set; }
        public bool IsProcessed { get; set; }
        public int Row { get; set; }
        public string Error { get; set; } = string.Empty;
        public List<string> ErrorList { get; set; } = new List<string>();
    }
}
