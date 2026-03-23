using DAL.Helpers;
using Dapper;
using Google.Protobuf.WellKnownTypes;
using Microsoft.Extensions.Configuration;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Model.ViewModel.Report;
using MySql.Data.MySqlClient;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Xml.Linq;
using Utils.Interface;

namespace DAL
{
    public class ReportDAL
    {
        private readonly IMySqlHelper _mySqlHelper;
        private readonly IConfiguration _configuration;
        private readonly IMySqlDapperHelper _mySqlDapperHelper;
        private readonly DapperContext _dapperContext;

        private readonly string connectionId = "Default";
        public ReportDAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IConfiguration configuration)
        {
            _mySqlHelper = mySqlHelper;
            _configuration = configuration;
            _mySqlDapperHelper = mySqlDapperHelper;
            _dapperContext = new DapperContext(_configuration.GetConnectionString(connectionId));
        }

        #region Member
        public List<MemberExportAllDetails> GetAllMember(MemberInfoFilterModel filter)
        {
            string Query = @"Select 

                            -- Member
                            mm.Id,mm.Member_Id,mm.First_Name,mm.Last_Name,mm.Father_Name,mm.Date_Of_Birth,mm.Email,mm.Ration_Card_Number,
                            mm.Aadhaar_Number,mm.Phone_Number,
                            (CASE WHEN IFNULL(gender.ValueTamil,'')!='' THEN CONCAT(gender.Value,' / ', gender.ValueTamil) ELSE gender.Value END) AS 'GenderString',
                            (CASE WHEN IFNULL(religion.ValueTamil,'')!='' THEN CONCAT(religion.Value,' / ', religion.ValueTamil) ELSE religion.Value END) AS 'ReligionString',
                            (CASE WHEN IFNULL(community.ValueTamil,'')!='' THEN CONCAT(community.Value,' / ', community.ValueTamil) ELSE community.Value END) AS 'CommunityString',
                            (CASE WHEN IFNULL(caste.ValueTamil,'')!='' THEN CONCAT(caste.Value,' / ', caste.ValueTamil) ELSE caste.Value END) AS 'CasteString',
                            (CASE WHEN IFNULL(maritalStatus.ValueTamil,'')!='' THEN CONCAT(maritalStatus.Value,' / ', maritalStatus.ValueTamil) ELSE maritalStatus.Value END) AS 'MaritalStatusString',
                            (CASE WHEN IFNULL(education.ValueTamil,'')!='' THEN CONCAT(education.Value,' / ', education.ValueTamil) ELSE education.Value END) AS 'EducationString',
                            mm.CollectedByName, mm.CollectedByPhoneNumber, mm.CollectedOn,

                            -- Org
                            (CASE WHEN IFNULL(tow.ValueTamil,'')!='' THEN CONCAT(tow.Value,' / ', tow.ValueTamil) ELSE tow.Value END) AS 'Type_of_WorkString',
                            (CASE WHEN IFNULL(cswt.ValueTamil,'')!='' THEN CONCAT(cswt.Value,' / ', cswt.ValueTamil) ELSE cswt.Value END) AS 'Core_Sanitary_Worker_TypeString',
                            (CASE WHEN IFNULL(ot.ValueTamil,'')!='' THEN CONCAT(ot.Value,' / ', ot.ValueTamil) ELSE ot.Value END) AS 'Organization_TypeString',
                            (CASE WHEN IFNULL(dist.ValueTamil,'')!='' THEN CONCAT(dist.Value,' / ', dist.ValueTamil) ELSE dist.Value END) AS 'DistrictString',
                            (CASE WHEN IFNULL(noj.ValueTamil,'')!='' THEN CONCAT(noj.Value,' / ', noj.ValueTamil) ELSE noj.Value END) AS 'Nature_of_JobString',
                            (CASE WHEN IFNULL(nlb.ValueTamil,'')!='' THEN CONCAT(nlb.Value,' / ', nlb.ValueTamil) ELSE nlb.Value END) AS 'Name_of_Local_BodyString',
                            (CASE WHEN IFNULL(zone.ValueTamil,'')!='' THEN CONCAT(zone.Value,' / ', zone.ValueTamil) ELSE zone.Value END) AS 'ZoneString',
                            mo.Organisation_Name,
                            (CASE WHEN IFNULL(desig.ValueTamil,'')!='' THEN CONCAT(desig.Value,' / ', desig.ValueTamil) ELSE desig.Value END) AS 'DesignationString',
                            mo.Address,
                            (CASE WHEN IFNULL(blk.ValueTamil,'')!='' THEN CONCAT(blk.Value,' / ', blk.ValueTamil) ELSE blk.Value END) AS 'BlockString',
                            (CASE WHEN IFNULL(vp.ValueTamil,'')!='' THEN CONCAT(vp.Value,' / ', vp.ValueTamil) ELSE vp.Value END) AS 'Village_PanchayatString',
                            (CASE WHEN IFNULL(corp.ValueTamil,'')!='' THEN CONCAT(corp.Value,' / ', corp.ValueTamil) ELSE corp.Value END) AS 'CorporationString',
                            (CASE WHEN IFNULL(muni.ValueTamil,'')!='' THEN CONCAT(muni.Value,' / ', muni.ValueTamil) ELSE muni.Value END) AS 'MunicipalityString',
                            (CASE WHEN IFNULL(tp.ValueTamil,'')!='' THEN CONCAT(tp.Value,' / ', tp.ValueTamil) ELSE tp.Value END) AS 'Town_PanchayatString',
                            mo.New_Yellow_Card_Number,
                            mo.Health_Id,mo.Already_a_Member_of_CWWB,

                            -- Bank
                            mbd.Account_Holder_Name,mbd.Account_Number,mbd.IFSC_Code,mbd.Bank_Name,mbd.Branch,

                            -- Permanent Address 
                            pam.DoorNo as 'Permanent_DoorNo', 
                            pam.StreetName as 'Permanent_StreetName', 
                            pam.VilllageTownCity as 'Permanent_VilllageTownCity',
                            pam.LocalBody as 'Permanent_LocalBody',
                            pam.NameoflocalBody as 'Permanent_NameoflocalBody',
                            pam.Pincode as 'Permanent_Pincode', 
                            pam.Area as 'Permanent_Area',
                            p_district.Value as 'Permanent_DistrictString',
                            p_taluk.Value as 'Permanent_TalukString',
                            p_block.Value as 'Permanent_BlockString',
                            p_corporation.Value as 'Permanent_CorporationString',
                            p_municipality.Value as 'Permanent_MunicipalityString',
                            p_townPanchayat.Value as 'Permanent_TownPanchayatString',

                            -- Temporary Address
                            tam.DoorNo as 'Temporary_DoorNo', 
                            tam.StreetName as 'Temporary_StreetName', 
                            tam.VilllageTownCity as 'Temporary_VilllageTownCity',
                            tam.LocalBody as 'Temporary_LocalBody',
                            tam.NameoflocalBody as 'Temporary_NameoflocalBody',
                            tam.Pincode as 'Temporary_Pincode', 
                            tam.Area as 'Temporary_Area',
                            t_district.Value as 'Temporary_DistrictString',
                            t_taluk.Value as 'Temporary_TalukString',
                            t_block.Value as 'Temporary_BlockString',
                            t_corporation.Value as 'Temporary_CorporationString',
                            t_municipality.Value as 'Temporary_MunicipalityString',
                            t_townPanchayat.Value as 'Temporary_TownPanchayatString'

                            -- Member
                            from member_master mm
                            LEFT JOIN two_column_configuration_values gender ON gender.Id = mm.Gender
                            LEFT JOIN two_column_configuration_values religion ON religion.Id = mm.Religion
                            LEFT JOIN two_column_configuration_values community ON community.Id = mm.Community
                            LEFT JOIN two_column_configuration_values caste ON caste.Id = mm.Caste
                            LEFT JOIN two_column_configuration_values maritalStatus ON maritalStatus.Id = mm.Marital_Status
                            LEFT JOIN two_column_configuration_values education ON education.Id = mm.Education

                            -- Org
                            INNER JOIN member_organization mo ON mo.Member_Id = mm.Id AND IFNULL(mo.IsActive,0) = 1 AND IFNULL(mo.IsTemp,0) = 0
                            LEFT JOIN two_column_configuration_values tow ON tow.Id = mo.Type_of_Work
                            LEFT JOIN two_column_configuration_values cswt ON cswt.Id = mo.Core_Sanitary_Worker_Type
                            LEFT JOIN two_column_configuration_values ot ON ot.Id = mo.Organization_Type
                            LEFT JOIN two_column_configuration_values dist ON dist.Id = mo.District_Id
                            LEFT JOIN two_column_configuration_values noj ON noj.Id = mo.Nature_of_Job
                            LEFT JOIN two_column_configuration_values nlb ON nlb.Id = mo.Name_of_Local_Body
                            LEFT JOIN two_column_configuration_values zone ON zone.Id = mo.Zone
                            LEFT JOIN two_column_configuration_values desig ON desig.Id = mo.Designation
                            LEFT JOIN two_column_configuration_values blk ON blk.Id = mo.Block
                            LEFT JOIN two_column_configuration_values vp ON vp.Id = mo.Village_Panchayat
                            LEFT JOIN two_column_configuration_values corp ON corp.Id = mo.Corporation
                            LEFT JOIN two_column_configuration_values muni ON muni.Id = mo.Municipality
                            LEFT JOIN two_column_configuration_values tp ON tp.Id = mo.Town_Panchayat

                            -- Bank
                            INNER JOIN member_bank_detail mbd ON mbd.Member_Id = mm.Id AND IFNULL(mbd.IsActive,0) = 1 AND IFNULL(mbd.IsTemp,0) = 0

                            -- Permanent
                            INNER JOIN member_address_master pam ON pam.MemberId = mm.Id AND pam.AddressType = 'PERMANENT' AND IFNULL(pam.IsActive,0) = 1 AND IFNULL(pam.IsTemp,0) = 0
                            LEFT JOIN two_column_configuration_values p_district ON p_district.Id = pam.District
                            LEFT JOIN two_column_configuration_values p_taluk ON p_taluk.Id = pam.Taluk
                            LEFT JOIN two_column_configuration_values p_block ON p_block.Id = pam.Block
                            LEFT JOIN two_column_configuration_values p_corporation ON p_corporation.Id = pam.Corporation
                            LEFT JOIN two_column_configuration_values p_municipality ON p_municipality.Id = pam.Municipality
                            LEFT JOIN two_column_configuration_values p_townPanchayat ON p_townPanchayat.Id = pam.TownPanchayat

                            -- Temporary
                            INNER JOIN member_address_master tam ON tam.MemberId = mm.Id AND tam.AddressType = 'TEMPORARY' AND IFNULL(tam.IsActive,0) = 1 AND IFNULL(tam.IsTemp,0) = 0
                            LEFT JOIN two_column_configuration_values t_district ON t_district.Id = tam.District
                            LEFT JOIN two_column_configuration_values t_taluk ON t_taluk.Id = tam.Taluk
                            LEFT JOIN two_column_configuration_values t_block ON t_block.Id = tam.Block
                            LEFT JOIN two_column_configuration_values t_corporation ON t_corporation.Id = tam.Corporation
                            LEFT JOIN two_column_configuration_values t_municipality ON t_municipality.Id = tam.Municipality
                            LEFT JOIN two_column_configuration_values t_townPanchayat ON t_townPanchayat.Id = tam.TownPanchayat ";

            if (filter != null)
            {
                string Condition = " WHERE mm.IsSubmitted = 1 AND IFNULL(mm.IsActive,0) = 1 AND IFNULL(mm.IsTemp,0) = 0 AND ";
                if (!string.IsNullOrWhiteSpace(filter.Year))
                {
                    List<string> Years = filter.Year.Split('-')?.ToList() ?? new List<string>();
                    DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
                    DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);
                    Condition += " DATE(mm.ModifiedDate) >= '" + from.ToString("yyyy-MM-dd") + "' AND DATE(mm.ModifiedDate) <= '" + to.ToString("yyyy-MM-dd") + "' AND ";
                }
                if (filter.DistrictIds?.Count > 0)
                {
                    string districtConditions = "";
                    List<string> distList = new List<string>();
                    filter.DistrictIds.ForEach(x =>
                    {
                        distList.Add(" (pam.District = '" + x + "') ");
                    });
                    districtConditions = string.Join(" OR ", distList);

                    Condition += "(" + districtConditions + ") AND ";
                }

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                Query = Query + Condition;
            }

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberExportAllDetails>(connection, Query, commandType: CommandType.Text)?.ToList() ?? new List<MemberExportAllDetails>();
        }
        #endregion Member

        public List<ApplicationInfoReportModel> ApplicationInfo(ApplicationInfoFilterModel filter, out int TotalCount, int ExpiryDays = 7)
        {
            TotalCount = 0;

            StringBuilder sqlBuilder = new StringBuilder();

            string Query = @"SELECT 
                            ad.ApplicationId,
                            (case when ifnull(am.ApplicationNumber,'')='' then  am.TemporaryNumber else am.ApplicationNumber end) AS ApplicationNumber,
                            scheme.Value as 'Scheme',
                            status1.Value as 'Status',
                            district.Value as 'ProjectDistrict',
                            ad.FirstName, 
                            ad.LastName, 
                            ad.`Rank`, 
                            servedin.Value as 'ServedInString',
                            DATE_FORMAT(ad.Dob, '%d-%m-%Y') as 'Dobb',
                            TIMESTAMPDIFF(YEAR, ad.Dob, CURDATE()) AS Age, 
                            DATE_FORMAT(ad.DateOfEnrollment, '%d-%m-%Y') as DateOfEnrollment,
                            DATE_FORMAT(ad.DateOfDischarge, '%d-%m-%Y') as DateOfDischarge, 
                            ad.TotalYearsinService, 
                            sex.Value as 'Gender',
                            religion.Value as 'Religion',
                            community.Value as 'Community',
                            maritalStatus.Value as 'MaritalStatus',
                            ad.FathersName, 
                            ad.Mobile,
                            aam.DoorNo,
                            district.Value as 'District',
                            taluk.Value as 'Taluk',
                            aam.VilllageTownCity as 'Village',
                            aam.Area,
                            aam.Pincode,
                            aam.StreetName,
                            ad.AadharNo,
                            ad.Email,
                            activityLane.Value as 'ActivityLane',
                            ventureCategory.Value as 'VentureCategory',
                            ad.ProjectOutlayCost,
                            ad.LandCost,
                            ad.BuildingCost,
                            ad.EquipmentCost,
                            ad.WorkingCost,
                            ad.PreopertaiveExpense,
                            ad.OtherExpense,
                            ad.TotalCost,
                            ad.SubsidyCost,
                            ad.BeneficiaryCost,
                            ad.IFSC,
                            bank.Value as 'Bank',
                            branch.Value as 'Branch',
                            ad.Address,
                            ad.AccountNumber,
                            ad.Modifiedby,ad.ModifiedByUserName,ad.ModifiedDate,

                            ad.DeclarationAccepted,
                            ad.ServiceNumber,
                            ad.TypeOfTraining,
                            ad.ActivityLaneOther,
                            ad.EmployeementType,
                            _rank.Value as 'Rank_String',

                            ad.EmployementOthers, 
                            ad.IsNativeTamilNadu, 
                            ad.IsReEmployed,
                            
                            ad.IsFirstEntrepreneur,
                            ad.DependentName,
                            ad.DependentDob,
                            am.IsSubmitted,

                            ad.IsSelf


                            FROM application_details ad
                            INNER JOIN application_master am ON am.Id = ad.ApplicationId
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId
                            INNER JOIN application_address_master aam ON aam.ApplicationId = ad.ApplicationId AND aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values district ON district.Id = aam.District
                            LEFT JOIN two_column_configuration_values taluk ON taluk.Id = aam.Taluk
                            LEFT JOIN two_column_configuration_values sex ON sex.Id = ad.Sex
                            LEFT JOIN two_column_configuration_values community ON community.Id = ad.Community
                            LEFT JOIN two_column_configuration_values religion ON religion.Id = ad.Religion
                            LEFT JOIN two_column_configuration_values maritalStatus ON maritalStatus.Id = ad.MaritalStatus
                            LEFT JOIN two_column_configuration_values servedin ON servedin.Id = ad.ServedIn
                            LEFT JOIN two_column_configuration_values activityLane ON activityLane.Id = ad.ActivityLane
                            LEFT JOIN two_column_configuration_values ventureCategory ON ventureCategory.Id = ad.VentureCategory
                            LEFT JOIN two_column_configuration_values _rank ON _rank.Id = ad.Rank
                            LEFT JOIN two_column_configuration_values bank ON bank.Id = ad.Bank
                            LEFT JOIN two_column_configuration_values branch ON branch.Id = ad.Branch ";

            string CountQuery = @"select count(1) FROM application_details ad
                            INNER JOIN application_master am ON am.Id = ad.ApplicationId
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId
                            INNER JOIN application_address_master aam ON aam.ApplicationId = ad.ApplicationId AND aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values district ON district.Id = aam.District
                            LEFT JOIN two_column_configuration_values taluk ON taluk.Id = aam.Taluk
                            LEFT JOIN two_column_configuration_values sex ON sex.Id = ad.Sex
                            LEFT JOIN two_column_configuration_values community ON community.Id = ad.Community
                            LEFT JOIN two_column_configuration_values religion ON religion.Id = ad.Religion
                            LEFT JOIN two_column_configuration_values maritalStatus ON maritalStatus.Id = ad.MaritalStatus
                            LEFT JOIN two_column_configuration_values servedin ON servedin.Id = ad.ServedIn
                            LEFT JOIN two_column_configuration_values activityLane ON activityLane.Id = ad.ActivityLane
                            LEFT JOIN two_column_configuration_values ventureCategory ON ventureCategory.Id = ad.VentureCategory
                            LEFT JOIN two_column_configuration_values bank ON bank.Id = ad.Bank
                            LEFT JOIN two_column_configuration_values branch ON branch.Id = ad.Branch ";

            if (filter != null)
            {
                #region Build Query Conditions

                sqlBuilder.Append(" WHERE ");


                // Bank/Branch=================================================================
                string bankIds_str = "";
                if (filter?.BankIds?.Count > 0)
                {
                    bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    bankIds_str = " (1=1) ";
                }

                string branchIds_str = "";
                if (filter?.BranchIds?.Count > 0)
                {
                    branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    branchIds_str = " (1=1) ";
                }

                sqlBuilder.Append(" ( <BANKREPLACE> OR <BRACNCHREPLACE> ) AND ");

                sqlBuilder = sqlBuilder.Replace("<BANKREPLACE>", bankIds_str);
                sqlBuilder = sqlBuilder.Replace("<BRACNCHREPLACE>", branchIds_str);
                // Bank/Branch=================================================================


                if (filter?.SchemeIds?.Count > 0)
                {
                    string schemeIds_str = "";
                    filter.SchemeIds.ForEach(x =>
                    {
                        schemeIds_str += "'" + x + "',";
                    });
                    schemeIds_str = schemeIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(schemeIds_str))
                    {
                        sqlBuilder.Append(" am.SchemeId IN (" + schemeIds_str + ") AND ");
                    }
                }

                if (filter?.DistrictIds?.Count > 0)
                {
                    string districtIds_str = "";
                    filter.DistrictIds.ForEach(x =>
                    {
                        districtIds_str += "'" + x + "',";
                    });
                    districtIds_str = districtIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(districtIds_str))
                    {
                        sqlBuilder.Append(" aam.District IN (" + districtIds_str + ") AND ");
                    }
                }

                if (filter?.StatusIds?.Count > 0)
                {
                    string statusIds_str = "";
                    filter.StatusIds.ForEach(x =>
                    {
                        statusIds_str += "'" + x + "',";
                    });
                    statusIds_str = statusIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(statusIds_str))
                    {
                        sqlBuilder.Append(" am.StatusId IN (" + statusIds_str + ") AND ");
                    }
                }

                if (ExpiryDays > 0)
                {
                    sqlBuilder.Append(" ((case when status1.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND ");
                    sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
                }
                if (filter != null && filter.FromYear > 0 && filter.ToYear > 0)
                {

                    DateTime from = new DateTime(filter.FromYear, 4, 1, 0, 0, 0);
                    DateTime to = new DateTime(filter.ToYear, 3, 31, 23, 59, 59);

                    TimeZoneInfo istZones = TimeZoneInfo.Local;
                    from = TimeZoneInfo.ConvertTime(from, istZones);
                    to = TimeZoneInfo.ConvertTime(to, istZones);

                    sqlBuilder.Append(" DATE(am.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s') AND ");
                    sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
                    sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
                }

                if (filter?.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in filter.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = "";

                            #region Field Name Select
                            if (string.Equals(item.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(um.FirstName, ' ', um.LastName)";
                            }
                            else if (string.Equals(item.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lm.Reason";
                            }
                            else if (string.Equals(item.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(lm.ToDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(lm.FromDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lt.Value";
                            }
                            else if (string.Equals(item.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "sm.StatusName";
                            }

                            #endregion Field Name Select

                            if (!string.IsNullOrWhiteSpace(columnName))
                            {
                                sqlBuilder.Append(" " + columnName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ");
                            }
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string searchCondition = " (";
                    List<string> columnsToSearch = new List<string>() {
                        "am.ApplicationNumber", "am.TemporaryNumber", "scheme.Value", "status1.Value", "district.Value", "ad.FirstName", "ad.LastName", "ad.Rank", "servedin.Value",
                        "DATE_FORMAT(ad.Dob, '%d-%m-%Y')", "TIMESTAMPDIFF(YEAR, ad.Dob, CURDATE())", "DATE_FORMAT(ad.DateOfEnrollment, '%d-%m-%Y')", "DATE_FORMAT(ad.DateOfDischarge, '%d-%m-%Y')",
                        "ad.TotalYearsinService", "sex.Value", "religion.Value", "community.Value", "maritalStatus.Value", "ad.FathersName", "ad.Mobile", "aam.DoorNo", "taluk.Value", "aam.VilllageTownCity",
                        "aam.Area", "aam.Pincode", "ad.AadharNo", "ad.Email", "activityLane.Value", "ventureCategory.Value", "ad.IFSC", "bank.Value", "branch.Value", "ad.Address", "ad.AccountNumber"
                    };
                    foreach (var column in columnsToSearch)
                    {
                        if (!string.IsNullOrEmpty(column))
                        {
                            searchCondition += column + " LIKE " + "'%" + filter.SearchString.Trim() + "%' OR ";
                        }
                    }
                    searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    searchCondition += ") AND ";

                    sqlBuilder.Append(searchCondition);
                }

                string Condition = sqlBuilder.ToString();

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                #endregion Build Query Conditions

                CountQuery = CountQuery + Condition;

                using (var conn = _dapperContext.CreateConnection())
                {
                    TotalCount = conn.ExecuteScalar<int>(CountQuery, commandType: CommandType.Text);

                    #region Pagination Condition

                    if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter?.Sorting?.FieldName) && !string.IsNullOrWhiteSpace(filter?.Sorting?.Sort))
                    {
                        string FieldName = "";

                        #region Select Field
                        if (string.Equals(filter?.Sorting.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(um.FirstName, ' ', um.LastName)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lt.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "sm.StatusName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.Reason";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.ToDate";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.FromDate";
                        }
                        else
                        {
                            FieldName = "am.CreatedDate";
                        }
                        #endregion Select Field

                        if (filter?.Skip == 0 && filter?.Take == 0)
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " ";
                        }
                        else
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " LIMIT  " + filter?.Take + "  OFFSET " + filter?.Skip;
                        }
                    }
                    else if (filter?.Skip == 0 && filter?.Take == 0)
                    {
                        Condition += " ORDER BY am.CreatedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY am.CreatedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return conn.Query<ApplicationInfoReportModel>(Query, commandType: CommandType.Text)?.ToList() ?? new List<ApplicationInfoReportModel>();
                }
            }

            return null;
        }
        public List<ApplicationDocumentReportModel> ApplicationDocument(ApplicationInfoFilterModel filter, out int TotalCount, int ExpiryDays = 7)
        {
            TotalCount = 0;

            StringBuilder sqlBuilder = new StringBuilder();

            string Query = @"select 
                            (CASE WHEN IFNULL(am.ApplicationNumber,'')='' THEN  am.TemporaryNumber ELSE am.ApplicationNumber END) AS ApplicationNumber,
                            scheme.Value as 'Scheme',
                            status1.Value as 'Status',
                            doc.ModifiedDate as 'SubmittedDate',
                            docConfig.DocumentGroupName as 'DocumentType',
                            docCategory.Value as 'DocumentCategory',
                            docType.Value as 'AcceptedDocument',
                            (CASE WHEN IFNULL(docConfig.IsRequired,0) = 1 THEN 'Yes' ELSE 'No' END) as 'DocumentMandatory',
                            doc.OriginalFileName,
                            doc.SavedFileName
                            from application_document_master doc
                            INNER JOIN scheme_document_configuration docConfig ON docConfig.Id = doc.DocumentConfigId
                            INNER JOIN two_column_configuration_values docCategory ON docCategory.Id = docConfig.DocumentCategoryId
                            INNER JOIN application_master am ON am.Id = doc.ApplicationId
                            INNER JOIN application_details ad ON ad.ApplicationId = am.Id
                            INNER JOIN application_address_master aam ON aam.ApplicationId = am.Id AND aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId
                            LEFT JOIN two_column_configuration_values docType ON docType.Id = doc.AcceptedDocumentTypeId ";

            string CountQuery = @"select count(1) from application_document_master doc
                            INNER JOIN scheme_document_configuration docConfig ON docConfig.Id = doc.DocumentConfigId
                            INNER JOIN two_column_configuration_values docCategory ON docCategory.Id = docConfig.DocumentCategoryId
                            INNER JOIN application_master am ON am.Id = doc.ApplicationId
                            INNER JOIN application_details ad ON ad.ApplicationId = am.Id
                            INNER JOIN application_address_master aam ON aam.ApplicationId = am.Id AND aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId
                            LEFT JOIN two_column_configuration_values docType ON docType.Id = doc.AcceptedDocumentTypeId ";

            if (filter != null)
            {
                #region Build Query Conditions

                sqlBuilder.Append(" WHERE IFNULL(doc.SavedFileName,'') != '' AND ");

                // Bank/Branch=================================================================
                string bankIds_str = "";
                if (filter?.BankIds?.Count > 0)
                {
                    bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    bankIds_str = " (1=1) ";
                }

                string branchIds_str = "";
                if (filter?.BranchIds?.Count > 0)
                {
                    branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    branchIds_str = " (1=1) ";
                }

                sqlBuilder.Append(" ( <BANKREPLACE> OR <BRACNCHREPLACE> ) AND ");

                sqlBuilder = sqlBuilder.Replace("<BANKREPLACE>", bankIds_str);
                sqlBuilder = sqlBuilder.Replace("<BRACNCHREPLACE>", branchIds_str);
                // Bank/Branch=================================================================

                if (filter?.SchemeIds?.Count > 0)
                {
                    string schemeIds_str = "";
                    filter.SchemeIds.ForEach(x =>
                    {
                        schemeIds_str += "'" + x + "',";
                    });
                    schemeIds_str = schemeIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(schemeIds_str))
                    {
                        sqlBuilder.Append(" am.SchemeId IN (" + schemeIds_str + ") AND ");
                    }
                }

                if (filter?.DistrictIds?.Count > 0)
                {
                    string districtIds_str = "";
                    filter.DistrictIds.ForEach(x =>
                    {
                        districtIds_str += "'" + x + "',";
                    });
                    districtIds_str = districtIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(districtIds_str))
                    {
                        sqlBuilder.Append(" aam.District IN (" + districtIds_str + ") AND ");
                    }
                }

                if (filter?.StatusIds?.Count > 0)
                {
                    string statusIds_str = "";
                    filter.StatusIds.ForEach(x =>
                    {
                        statusIds_str += "'" + x + "',";
                    });
                    statusIds_str = statusIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(statusIds_str))
                    {
                        sqlBuilder.Append(" am.StatusId IN (" + statusIds_str + ") AND ");
                    }
                }

                if (ExpiryDays > 0)
                {
                    sqlBuilder.Append(" ((case when status1.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND ");
                    sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
                }
                if (filter != null && filter.FromYear > 0 && filter.ToYear > 0)
                {
                    DateTime from = new DateTime(filter.FromYear, 4, 1, 0, 0, 0);
                    DateTime to = new DateTime(filter.ToYear, 3, 31, 23, 59, 59);

                    TimeZoneInfo istZones = TimeZoneInfo.Local;
                    from = TimeZoneInfo.ConvertTime(from, istZones);
                    to = TimeZoneInfo.ConvertTime(to, istZones);

                    sqlBuilder.Append(" DATE(am.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s') AND ");
                    sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
                    sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
                }

                if (filter?.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in filter.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = "";

                            #region Field Name Select
                            if (string.Equals(item.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(um.FirstName, ' ', um.LastName)";
                            }
                            else if (string.Equals(item.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lm.Reason";
                            }
                            else if (string.Equals(item.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(lm.ToDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(lm.FromDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lt.Value";
                            }
                            else if (string.Equals(item.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "sm.StatusName";
                            }

                            #endregion Field Name Select

                            if (!string.IsNullOrWhiteSpace(columnName))
                            {
                                sqlBuilder.Append(" " + columnName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ");
                            }
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string searchCondition = " (";
                    List<string> columnsToSearch = new List<string>() {
                        "am.TemporaryNumber", "am.ApplicationNumber", "scheme.Value", "status1.Value",
                        "DATE_FORMAT(doc.ModifiedDate, '%d-%m-%Y')", "docConfig.DocumentGroupName", "docCategory.Value", "docType.Value", "(CASE WHEN IFNULL(docConfig.IsRequired,0) = 1 THEN 'Yes' ELSE 'No' END)",
                        "doc.OriginalFileName"
                    };
                    foreach (var column in columnsToSearch)
                    {
                        if (!string.IsNullOrEmpty(column))
                        {
                            searchCondition += column + " LIKE " + "'%" + filter.SearchString.Trim() + "%' OR ";
                        }
                    }
                    searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    searchCondition += ") AND ";

                    sqlBuilder.Append(searchCondition);
                }

                string Condition = sqlBuilder.ToString();

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                #endregion Build Query Conditions

                CountQuery = CountQuery + Condition;

                using (var conn = _dapperContext.CreateConnection())
                {
                    TotalCount = conn.ExecuteScalar<int>(CountQuery, commandType: CommandType.Text);

                    #region Pagination Condition

                    if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter?.Sorting?.FieldName) && !string.IsNullOrWhiteSpace(filter?.Sorting?.Sort))
                    {
                        string FieldName = "";

                        #region Select Field
                        if (string.Equals(filter?.Sorting.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(um.FirstName, ' ', um.LastName)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lt.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "sm.StatusName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.Reason";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.ToDate";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.FromDate";
                        }
                        else
                        {
                            FieldName = "am.CreatedDate";
                        }
                        #endregion Select Field

                        if (filter?.Skip == 0 && filter?.Take == 0)
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " ";
                        }
                        else
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " LIMIT  " + filter?.Take + "  OFFSET " + filter?.Skip;
                        }
                    }
                    else if (filter?.Skip == 0 && filter?.Take == 0)
                    {
                        Condition += " ORDER BY am.CreatedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY am.CreatedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return conn.Query<ApplicationDocumentReportModel>(Query, commandType: CommandType.Text)?.ToList() ?? new List<ApplicationDocumentReportModel>();
                }
            }

            return null;
        }
        public List<ApplicationStatusReportModel> ApplicationStatus(ApplicationInfoFilterModel filter, out int TotalCount, int ExpiryDays = 7)
        {
            TotalCount = 0;

            StringBuilder sqlBuilder = new StringBuilder();

            string Query = @"SELECT 
                            (case when ifnull(am.ApplicationNumber,'')='' then  am.TemporaryNumber else am.ApplicationNumber end) AS ApplicationNumber,
                            scheme.Value as 'Scheme',
                            status1.Value as 'Status',
                            district.Value as 'ProjectDistrict',
                            am.SubmittedDate,
                            AC1.Status as 'ActionStatus',
                            (CASE WHEN IFNULL(AC1.FromStatus,'') != '' THEN AC1.FromStatus ELSE AC2.FromStatus END) as 'FromStatus',
                            (CASE WHEN IFNULL(AC1.ToStatus,'') != '' THEN AC1.ToStatus ELSE AC2.ToStatus END) as 'ToStatus',
                            (CASE WHEN IFNULL(AC1.LastApprovedDate,'') != '' THEN AC1.LastApprovedDate ELSE AC2.LastApprovedDate END) as 'UpdatedDate',
                            (CASE WHEN IFNULL(AC1.LastApprovedByName,'') != '' THEN AC1.LastApprovedByName ELSE AC2.LastApprovedByName END) as 'UpdatedBy',
                            (CASE WHEN IFNULL(AC1.LastApprovedByRole,'') != '' THEN AC1.LastApprovedByRole ELSE AC2.LastApprovedByRole END) as 'UpdatedByRole',
                            AC1.Reason,
                            AC1.Comment
                            FROM application_details ad
                            INNER JOIN application_master am ON am.Id = ad.ApplicationId
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId
                            INNER JOIN application_address_master aam ON aam.ApplicationId = ad.ApplicationId AND aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values district ON district.Id = aam.District
                            LEFT JOIN (
                                 SELECT 
                                 cc.ApplicationId, 
                                 fromstatus.Value as 'FromStatus',
                                 tostatus.Value as 'ToStatus',
                                 cc.Reason as 'Reason',
                                 cc.Status,
                                 cc.ApprovalComment as 'Comment',
                                 MAX(cc.CreatedDate) as 'LastApprovedDate', 
                                 cc.CreatedBy as 'LastApprovedBy', 
                                 (CONCAT(ccu.FirstName , ' ', ccu.LastName)) as 'LastApprovedByName',
                                 lar.RoleName as 'LastApprovedByRole'
                                 FROM Application_approval_comments cc
                                 inner join account_user ccu on ccu.UserId = cc.CreatedBy
                                 inner join account_role lar on lar.Id = ccu.RoleId 
                                 inner join two_column_configuration_values fromstatus on fromstatus.Id = cc.StatusIdFrom 
	                             inner join two_column_configuration_values tostatus on tostatus.Id = cc.StatusIdTo 
                                 GROUP BY cc.ApplicationId 
                             ) AS AC1 ON AC1.ApplicationId = am.Id 
                             LEFT JOIN (
                                 SELECT 
                                 cc.ApplicationId, 
                                 fromstatus.Value as 'FromStatus',
                                 tostatus.Value as 'ToStatus',
                                 MAX(cc.CreatedDate) as 'LastApprovedDate', 
                                 cc.CreatedBy as 'LastApprovedBy', 
                                 (CONCAT(ccu.FirstName , ' ', ccu.LastName)) as 'LastApprovedByName',
                                 lar.RoleName as 'LastApprovedByRole'
                                 FROM application_status_history_master cc
                                 inner join account_user ccu on ccu.UserId = cc.CreatedBy
                                 inner join account_role lar on lar.Id = ccu.RoleId 
                                 inner join two_column_configuration_values fromstatus on fromstatus.Id = cc.FromStatusId 
	                             inner join two_column_configuration_values tostatus on tostatus.Id = cc.ToStatusId
                                 GROUP BY cc.ApplicationId 
                             ) AS AC2 ON AC2.ApplicationId = am.Id  ";

            string CountQuery = @"select count(1) FROM application_details ad
                                INNER JOIN application_master am ON am.Id = ad.ApplicationId
                                INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                                INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId
                                INNER JOIN application_address_master aam ON aam.ApplicationId = ad.ApplicationId AND aam.AddressType = 'PROJECT'
                                INNER JOIN two_column_configuration_values district ON district.Id = aam.District
                                LEFT JOIN (
                                     SELECT 
                                     cc.ApplicationId, 
                                     fromstatus.Value as 'FromStatus',
                                     tostatus.Value as 'ToStatus',
                                     cc.Reason as 'Reason',
                                     cc.Status,
                                     cc.ApprovalComment as 'Comment',
                                     MAX(cc.CreatedDate) as 'LastApprovedDate', 
                                     cc.CreatedBy as 'LastApprovedBy', 
                                     (CONCAT(ccu.FirstName , ' ', ccu.LastName)) as 'LastApprovedByName',
                                     lar.RoleName as 'LastApprovedByRole'
                                     FROM Application_approval_comments cc
                                     inner join account_user ccu on ccu.UserId = cc.CreatedBy
                                     inner join account_role lar on lar.Id = ccu.RoleId 
                                     inner join two_column_configuration_values fromstatus on fromstatus.Id = cc.StatusIdFrom 
	                                 inner join two_column_configuration_values tostatus on tostatus.Id = cc.StatusIdTo 
                                     GROUP BY cc.ApplicationId 
                                 ) AS AC1 ON AC1.ApplicationId = am.Id 
                                 LEFT JOIN (
                                     SELECT 
                                     cc.ApplicationId, 
                                     fromstatus.Value as 'FromStatus',
                                     tostatus.Value as 'ToStatus',
                                     MAX(cc.CreatedDate) as 'LastApprovedDate', 
                                     cc.CreatedBy as 'LastApprovedBy', 
                                     (CONCAT(ccu.FirstName , ' ', ccu.LastName)) as 'LastApprovedByName',
                                     lar.RoleName as 'LastApprovedByRole'
                                     FROM application_status_history_master cc
                                     inner join account_user ccu on ccu.UserId = cc.CreatedBy
                                     inner join account_role lar on lar.Id = ccu.RoleId 
                                     inner join two_column_configuration_values fromstatus on fromstatus.Id = cc.FromStatusId 
	                                 inner join two_column_configuration_values tostatus on tostatus.Id = cc.ToStatusId
                                     GROUP BY cc.ApplicationId 
                                 ) AS AC2 ON AC2.ApplicationId = am.Id ";

            if (filter != null)
            {
                #region Build Query Conditions

                sqlBuilder.Append(" WHERE ");


                // Bank/Branch=================================================================
                string bankIds_str = "";
                if (filter?.BankIds?.Count > 0)
                {
                    bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    bankIds_str = " (1=1) ";
                }

                string branchIds_str = "";
                if (filter?.BranchIds?.Count > 0)
                {
                    branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    branchIds_str = " (1=1) ";
                }

                sqlBuilder.Append(" ( <BANKREPLACE> OR <BRACNCHREPLACE> ) AND ");

                sqlBuilder = sqlBuilder.Replace("<BANKREPLACE>", bankIds_str);
                sqlBuilder = sqlBuilder.Replace("<BRACNCHREPLACE>", branchIds_str);
                // Bank/Branch=================================================================


                if (filter?.SchemeIds?.Count > 0)
                {
                    string schemeIds_str = "";
                    filter.SchemeIds.ForEach(x =>
                    {
                        schemeIds_str += "'" + x + "',";
                    });
                    schemeIds_str = schemeIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(schemeIds_str))
                    {
                        sqlBuilder.Append(" am.SchemeId IN (" + schemeIds_str + ") AND ");
                    }
                }

                if (filter?.DistrictIds?.Count > 0)
                {
                    string districtIds_str = "";
                    filter.DistrictIds.ForEach(x =>
                    {
                        districtIds_str += "'" + x + "',";
                    });
                    districtIds_str = districtIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(districtIds_str))
                    {
                        sqlBuilder.Append(" aam.District IN (" + districtIds_str + ") AND ");
                    }
                }

                if (filter?.StatusIds?.Count > 0)
                {
                    string statusIds_str = "";
                    filter.StatusIds.ForEach(x =>
                    {
                        statusIds_str += "'" + x + "',";
                    });
                    statusIds_str = statusIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(statusIds_str))
                    {
                        sqlBuilder.Append(" am.StatusId IN (" + statusIds_str + ") AND ");
                    }
                }

                if (ExpiryDays > 0)
                {
                    sqlBuilder.Append(" ((case when status1.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND ");
                    sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
                }
                if (filter != null && filter.FromYear > 0 && filter.ToYear > 0)
                {
                    DateTime from = new DateTime(filter.FromYear, 4, 1, 0, 0, 0);
                    DateTime to = new DateTime(filter.ToYear, 3, 31, 23, 59, 59);

                    TimeZoneInfo istZones = TimeZoneInfo.Local;
                    from = TimeZoneInfo.ConvertTime(from, istZones);
                    to = TimeZoneInfo.ConvertTime(to, istZones);

                    sqlBuilder.Append(" DATE(am.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s') AND ");
                    sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
                    sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
                }

                if (filter?.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in filter.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = "";

                            #region Field Name Select
                            //if (string.Equals(item.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                            //{
                            //    columnName = "CONCAT(um.FirstName, ' ', um.LastName)";
                            //}
                            //else if (string.Equals(item.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                            //{
                            //    columnName = "lm.Reason";
                            //}
                            //else if (string.Equals(item.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                            //{
                            //    columnName = "DATE_FORMAT(lm.ToDate, '%d-%m-%Y')";
                            //}
                            //else if (string.Equals(item.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                            //{
                            //    columnName = "DATE_FORMAT(lm.FromDate, '%d-%m-%Y')";
                            //}
                            //else if (string.Equals(item.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                            //{
                            //    columnName = "lt.Value";
                            //}
                            //else if (string.Equals(item.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                            //{
                            //    columnName = "sm.StatusName";
                            //}

                            #endregion Field Name Select

                            if (!string.IsNullOrWhiteSpace(columnName))
                            {
                                sqlBuilder.Append(" " + columnName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ");
                            }
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string searchCondition = " (";
                    List<string> columnsToSearch = new List<string>() {
                        "am.ApplicationNumber", "am.TemporaryNumber", "scheme.Value", "status1.Value", "district.Value", "AC1.Status",
                        "(CASE WHEN IFNULL(AC1.FromStatus,'') != '' THEN AC1.FromStatus ELSE AC2.FromStatus END)",
                        "(CASE WHEN IFNULL(AC1.ToStatus,'') != '' THEN AC1.ToStatus ELSE AC2.ToStatus END)",
                        "DATE_FORMAT( (CASE WHEN IFNULL(AC1.LastApprovedDate,'') != '' THEN AC1.LastApprovedDate ELSE AC2.LastApprovedDate END) , '%d-%m-%Y')",
                        "(CASE WHEN IFNULL(AC1.LastApprovedByName,'') != '' THEN AC1.LastApprovedByName ELSE AC2.LastApprovedByName END)",
                        "(CASE WHEN IFNULL(AC1.LastApprovedByRole,'') != '' THEN AC1.LastApprovedByRole ELSE AC2.LastApprovedByRole END)",
                        "AC1.Reason", "AC1.Comment"
                    };
                    foreach (var column in columnsToSearch)
                    {
                        if (!string.IsNullOrEmpty(column))
                        {
                            searchCondition += column + " LIKE " + "'%" + filter.SearchString.Trim() + "%' OR ";
                        }
                    }
                    searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    searchCondition += ") AND ";

                    sqlBuilder.Append(searchCondition);
                }

                string Condition = sqlBuilder.ToString();

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                #endregion Build Query Conditions

                CountQuery = CountQuery + Condition;

                using (var conn = _dapperContext.CreateConnection())
                {
                    TotalCount = conn.ExecuteScalar<int>(CountQuery, commandType: CommandType.Text);

                    #region Pagination Condition

                    if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter?.Sorting?.FieldName) && !string.IsNullOrWhiteSpace(filter?.Sorting?.Sort))
                    {
                        string FieldName = "";

                        #region Select Field
                        if (string.Equals(filter?.Sorting.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(um.FirstName, ' ', um.LastName)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lt.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "sm.StatusName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.Reason";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.ToDate";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.FromDate";
                        }
                        else
                        {
                            FieldName = "am.CreatedDate";
                        }
                        #endregion Select Field

                        if (filter?.Skip == 0 && filter?.Take == 0)
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " ";
                        }
                        else
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " LIMIT  " + filter?.Take + "  OFFSET " + filter?.Skip;
                        }
                    }
                    else if (filter?.Skip == 0 && filter?.Take == 0)
                    {
                        Condition += " ORDER BY am.CreatedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY am.CreatedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return conn.Query<ApplicationStatusReportModel>(Query, commandType: CommandType.Text)?.ToList() ?? new List<ApplicationStatusReportModel>();
                }
            }

            return null;
        }
        public List<ApplicationForm3ReportModel> ApplicationForm3(ApplicationInfoFilterModel filter, out int TotalCount, int ExpiryDays = 7)
        {
            TotalCount = 0;

            StringBuilder sqlBuilder = new StringBuilder();

            string Query = @"select 
                            (CASE WHEN IFNULL(am.ApplicationNumber,'')='' THEN  am.TemporaryNumber ELSE am.ApplicationNumber END) AS ApplicationNumber,
                            scheme.Value as 'Scheme',
                            status1.Value as 'Status',
                            f3.NameAndAddress,
                            f3.NameOfTrade,
                            f3.RefNumber,
                            f3.Subsidy,
                            f3.PromotorContribution,
                            f3.BankLoan,
                            f3.TotalUtilCost
                            from application_form_3 f3
                            inner join application_master am on am.Id = f3.ApplicationId
                            inner join application_details ad on ad.ApplicationId = am.Id
                            inner join application_address_master aam on aam.ApplicationId = am.Id and aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId ";

            string CountQuery = @"select count(1) from application_form_3 f3
                            inner join application_master am on am.Id = f3.ApplicationId
                            inner join application_details ad on ad.ApplicationId = am.Id
                            inner join application_address_master aam on aam.ApplicationId = am.Id and aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId ";

            if (filter != null)
            {
                #region Build Query Conditions

                sqlBuilder.Append(" WHERE ");

                // Bank/Branch=================================================================
                string bankIds_str = "";
                if (filter?.BankIds?.Count > 0)
                {
                    bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    bankIds_str = " (1=1) ";
                }

                string branchIds_str = "";
                if (filter?.BranchIds?.Count > 0)
                {
                    branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    branchIds_str = " (1=1) ";
                }

                sqlBuilder.Append(" ( <BANKREPLACE> OR <BRACNCHREPLACE> ) AND ");

                sqlBuilder = sqlBuilder.Replace("<BANKREPLACE>", bankIds_str);
                sqlBuilder = sqlBuilder.Replace("<BRACNCHREPLACE>", branchIds_str);
                // Bank/Branch=================================================================


                if (filter?.SchemeIds?.Count > 0)
                {
                    string schemeIds_str = "";
                    filter.SchemeIds.ForEach(x =>
                    {
                        schemeIds_str += "'" + x + "',";
                    });
                    schemeIds_str = schemeIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(schemeIds_str))
                    {
                        sqlBuilder.Append(" am.SchemeId IN (" + schemeIds_str + ") AND ");
                    }
                }

                if (filter?.DistrictIds?.Count > 0)
                {
                    string districtIds_str = "";
                    filter.DistrictIds.ForEach(x =>
                    {
                        districtIds_str += "'" + x + "',";
                    });
                    districtIds_str = districtIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(districtIds_str))
                    {
                        sqlBuilder.Append(" aam.District IN (" + districtIds_str + ") AND ");
                    }
                }

                if (filter?.StatusIds?.Count > 0)
                {
                    string statusIds_str = "";
                    filter.StatusIds.ForEach(x =>
                    {
                        statusIds_str += "'" + x + "',";
                    });
                    statusIds_str = statusIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(statusIds_str))
                    {
                        sqlBuilder.Append(" am.StatusId IN (" + statusIds_str + ") AND ");
                    }
                }

                if (ExpiryDays > 0)
                {
                    sqlBuilder.Append(" ((case when status1.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND ");
                    sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
                }
                if (filter != null && filter.FromYear > 0 && filter.ToYear > 0)
                {
                    DateTime from = new DateTime(filter.FromYear, 4, 1, 0, 0, 0);
                    DateTime to = new DateTime(filter.ToYear, 3, 31, 23, 59, 59);

                    TimeZoneInfo istZones = TimeZoneInfo.Local;
                    from = TimeZoneInfo.ConvertTime(from, istZones);
                    to = TimeZoneInfo.ConvertTime(to, istZones);

                    sqlBuilder.Append(" DATE(am.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s') AND ");
                    sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
                    sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
                }

                if (filter?.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in filter.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = "";

                            #region Field Name Select
                            if (string.Equals(item.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(um.FirstName, ' ', um.LastName)";
                            }
                            else if (string.Equals(item.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lm.Reason";
                            }
                            else if (string.Equals(item.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(lm.ToDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(lm.FromDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lt.Value";
                            }
                            else if (string.Equals(item.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "sm.StatusName";
                            }

                            #endregion Field Name Select

                            if (!string.IsNullOrWhiteSpace(columnName))
                            {
                                sqlBuilder.Append(" " + columnName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ");
                            }
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string searchCondition = " (";
                    List<string> columnsToSearch = new List<string>() {
                        "am.TemporaryNumber", "am.ApplicationNumber", "scheme.Value", "status1.Value",
                        "f3.NameAndAddress", "f3.NameOfTrade", "f3.RefNumber",
                        "f3.Subsidy", "f3.PromotorContribution",
                        "f3.BankLoan", "f3.TotalUtilCost"
                    };
                    foreach (var column in columnsToSearch)
                    {
                        if (!string.IsNullOrEmpty(column))
                        {
                            searchCondition += column + " LIKE " + "'%" + filter.SearchString.Trim() + "%' OR ";
                        }
                    }
                    searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    searchCondition += ") AND ";

                    sqlBuilder.Append(searchCondition);
                }

                string Condition = sqlBuilder.ToString();

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                #endregion Build Query Conditions

                CountQuery = CountQuery + Condition;

                using (var conn = _dapperContext.CreateConnection())
                {
                    TotalCount = conn.ExecuteScalar<int>(CountQuery, commandType: CommandType.Text);

                    #region Pagination Condition

                    if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter?.Sorting?.FieldName) && !string.IsNullOrWhiteSpace(filter?.Sorting?.Sort))
                    {
                        string FieldName = "";

                        #region Select Field
                        if (string.Equals(filter?.Sorting.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(um.FirstName, ' ', um.LastName)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lt.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "sm.StatusName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.Reason";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.ToDate";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.FromDate";
                        }
                        else
                        {
                            FieldName = "am.CreatedDate";
                        }
                        #endregion Select Field

                        if (filter?.Skip == 0 && filter?.Take == 0)
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " ";
                        }
                        else
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " LIMIT  " + filter?.Take + "  OFFSET " + filter?.Skip;
                        }
                    }
                    else if (filter?.Skip == 0 && filter?.Take == 0)
                    {
                        Condition += " ORDER BY am.CreatedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY am.CreatedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return conn.Query<ApplicationForm3ReportModel>(Query, commandType: CommandType.Text)?.ToList() ?? new List<ApplicationForm3ReportModel>();
                }
            }

            return null;
        }

        //public List<GCCReportModel> GCCReport()
        //{
        //    dynamic @params = new
        //    { 
        //    };

        //    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
        //    return SqlMapper.Query<GCCReportModel>(connection, "GCCReport", @params, commandType: CommandType.StoredProcedure)?? new List<GCCReportModel>();
        //}
        public List<GCCReportModel> GCCReport()
        {
            var parameters = new
            {
                pName_of_Local_Body = "GCC" 
            };

            using IDbConnection connection =
                new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return connection.Query<GCCReportModel>(
                "GCCReport",
                parameters,
                commandType: CommandType.StoredProcedure
            ).ToList();
        }


        public List<ReportModel> DistrictWiseCountReport(string DistrictId, string Organization_Type = "")
        {
            dynamic @params = new
            {
                 pDistrictId = DistrictId,
                 pOrganization_Type = Organization_Type
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ReportModel>(connection, "DistrictWiseCountReport", @params, commandType: CommandType.StoredProcedure) ?? new List<ReportModel>();
        }
        public List<CardReportModel> DistrictWiseCardReport(string DistrictId, string Organization_Type = "")
        {
            dynamic @params = new
            {
                pDistrictId = DistrictId,
                pOrganization_Type = Organization_Type
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<CardReportModel>(connection, "DistrictWiseCardReport", @params, commandType: CommandType.StoredProcedure) ?? new List<ReportModel>();
        }

        public List<CoreSanitaryWorkersReportModel> CoreSanitaryWorkersReport(string DistrictId = "")
        {
            dynamic @params = new
            {
                pDistrictId = DistrictId,
               
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<CoreSanitaryWorkersReportModel>(connection, "CoreSanitaryWorkersReport", @params, commandType: CommandType.StoredProcedure) ?? new List<CoreSanitaryWorkersReportModel>();
        }
        public List<ByBlockModel> ByBlock(string DistrictId = "", string Block = "")
        {
            dynamic @params = new
            {
                pDistrict = DistrictId,
                pBlock = Block,

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ByBlockModel>(connection, "ByBlockReport", @params, commandType: CommandType.StoredProcedure) ?? new List<ByBlockModel>();
        }
        public List<ByVillagePanchayatModel> ByVillagePanchayatReport(string DistrictId = "", string Block = "",string VillagePanchayat = "")
        {
            dynamic @params = new
            {
                pDistrict = DistrictId,
                pBlock = Block,
                pVillagePanchayat= VillagePanchayat
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ByVillagePanchayatModel>(connection, "ByVillagePanchayatReport", @params, commandType: CommandType.StoredProcedure) ?? new List<ByVillagePanchayatModel>();
        }
        public List<ByCorporationModel> ByCorporationReport(string DistrictId = "",string pByCorporation = "")
        {
            dynamic @params = new
            {
                pDistrict = DistrictId,
                pCorporation= pByCorporation
             
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ByCorporationModel>(connection, "ByCorporation", @params, commandType: CommandType.StoredProcedure) ?? new List<ByCorporationModel>();
        }
        public List<ByTownPanchayatModel> ByTownPanchayatReport(string DistrictId = "",string TownPanchayat = "")
        {
            dynamic @params = new
            {
                pDistrict = DistrictId,
                pTownPanchayat = TownPanchayat

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ByTownPanchayatModel>(connection, "ByTownPanchayat", @params, commandType: CommandType.StoredProcedure) ?? new List<ByTownPanchayatModel>();
        }

        public List<CardCollectionModel> CardCollection(string DistrictId = "")
        {
            dynamic @params = new
            {
                pDistrict = DistrictId,
                

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<CardCollectionModel>(connection, "datacollectionreport", @params, commandType: CommandType.StoredProcedure) ?? new List<CardCollectionModel>();
        }

        public List<ByMunicipalityModel> ByMunicipalityReport(string DistrictId = "", string Municipality = "")
        {
            dynamic @params = new
            {
                pDistrict = DistrictId,
                pMunicipality = Municipality

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ByMunicipalityModel>(connection, "ByMunicipality", @params, commandType: CommandType.StoredProcedure) ?? new List<ByMunicipalityModel>();
        }
        public List<MemberdetailedReportModel> MemberdetailedReport(string DistrictId = "", string Municipality = "", string TownPanchayat = "", 
            string pByCorporation = "", string VillagePanchayat = "", string Block = "",string Local_Body="" ,string Organization_Type = "",string CardIssued=""
            ,string Core_Sanitary_Worker_Type="",string Zone="",string Status="",
            string CardtobeIssued="",string CardRejected="", string CollectedByName = "", string CollectedByPhoneNumber = ""

            )
        {
            dynamic @params = new
            {
                pDistrict = DistrictId,
                pMunicipality = Municipality,
                pTownPanchayat = TownPanchayat,
                pCorporation = pByCorporation,
                pBlock = Block,
                pVillagePanchayat = VillagePanchayat,
                pLocal_Body= Local_Body,
                pOrganization_Type= Organization_Type,
                pCore_Sanitary_Worker_Type= Core_Sanitary_Worker_Type,
                pZone= Zone,
                pStatus= Status,
                pCardIssued = CardIssued,
                pCardtobeIssued = CardtobeIssued,
                pCardRejected = CardRejected,
                pCollectedByName = CollectedByName,
                pCollectedByPhoneNumber = CollectedByPhoneNumber,

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberdetailedReportModel>(connection, "MemberdetailedReport", @params, commandType: CommandType.StoredProcedure) ?? new List<MemberdetailedReportModel>();
        }

        public  List<PrintModuleReportModel>  PrintModuleReport(string Status="")
        {
            dynamic @params = new
            {
                pStatus= Status

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            //return SqlMapper.Query<PrintModuleReportModel>(connection, "PrintModuleReport_Optimize", @params, commandType: CommandType.StoredProcedure) ?? new List<PrintModuleReportModel>();
            return SqlMapper.Query<PrintModuleReportModel>(connection, "PrintModuleReport", @params, commandType: CommandType.StoredProcedure) ?? new List<PrintModuleReportModel>();
        }


        #region reports
        //Indu -Member reports-23-03-2926- Created a seperate table called member_master_report 
        public List<MemberReportModel> MemberReport(MemberReportFilterModel filter, out int TotalCount)
        {
            TotalCount = 0;


            string Query = @"SELECT 
                                        mmr.Member_IdString,CONCAT (mmr.First_Name, ' ',mmr.Last_Name) AS Member_Name,mmr.Type_of_Work_String,
                                        mmr.Phone_Number,mmr.Aadhaar_Number,mmr.Organization_Type_String,mdam.Status,
                                        mmr.District_Id_String,mmr.Local_Body,mmr.Name_of_Local_Body
                                        from member_master_report mmr
                                        left  join member_data_approval_master mdam on mdam.Member_Id = mmr.Member_Id";

            string CountQuery = @"select count(*)
                                  from member_master_report mmr
                                  left  join member_data_approval_master mdam on mdam.Member_Id = mmr.Member_Id";

            if (filter != null)
            {
                #region Build Query Conditions

                string Condition = " WHERE ";

                if (filter.Where != null)
                {
                    PropertyInfo[] whereProperties = typeof(MemberReportWhereClauseProperties).GetProperties();
                    foreach (var property in whereProperties)
                    {
                        var value = property.GetValue(filter.Where)?.ToString() ?? "";
                        if (!string.IsNullOrWhiteSpace(value))
                        {


                            if (property.Name == "Year")
                            {
                                List<string> Years = value.Split('-')?.ToList() ?? new List<string>();
                                DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
                                DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

                                Condition += " DATE(mmr.CreatedDate) >= '" + from.ToString("yyyy-MM-dd") + "' AND DATE(mmr.CreatedDate) <= '" + to.ToString("yyyy-MM-dd") + "' AND ";
                            }
                            else if (property.Name == "IsActive")
                            {
                                if (value == "True")
                                {
                                    Condition += " mmr.IsActive=" + "1" + " AND ";
                                }
                                else if (value == "False")
                                {
                                    Condition += " mmr.IsActive=" + "0" + " AND ";
                                }
                            }
                            else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0)
                            {
                                string districtConditions = "";
                                List<string> distList = new List<string>();
                                //filter.Where.DistrictIds.ForEach(x =>
                                //{
                                //    distList.Add(" (mo.District_Id = '" + x + "') ");
                                //});
                                //districtConditions = string.Join(" OR ", distList);

                                //Condition += "(" + districtConditions + ") AND ";

                                if (filter.Where.DistrictIds?.Count() > 0)
                                {
                                    string districts = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));
                                    Condition += $" mmr.District_Id IN ({districts}) AND ";
                                }
                            }
                            else if (property.Name == "Type_of_Work" && filter.Where.Type_of_Work?.Count() > 0)
                            {
                                
                                
                                if (filter.Where.Type_of_Work?.Count() > 0)
                                {
                                    string list = string.Join(",", filter.Where.Type_of_Work.Select(x => $"'{x}'"));
                                    Condition += $" mmr.Type_of_Work IN ({list}) AND ";
                                }
                            }
                            else if (property.Name == "OrganizationType" && filter.Where.OrganizationType?.Count() > 0)
                            {
                                
                                
                                if (filter.Where.OrganizationType?.Count() > 0)
                                {
                                    string list = string.Join(",", filter.Where.OrganizationType.Select(x => $"'{x}'"));
                                    Condition += $" mmr.Organization_Type IN ({list}) AND ";
                                }
                            }
                            else if (property.Name == "LocalBody" && filter.Where.LocalBody?.Count() > 0)
                            {
                                
                                
                                if (filter.Where.LocalBody?.Count() > 0)
                                {
                                    string list = string.Join(",", filter.Where.LocalBody.Select(x => $"'{x}'"));
                                    Condition += $" mmr.Local_Body IN ({list}) AND ";
                                }
                            }
                            else if (property.Name == "NameOfLocalBody" && filter.Where.NameOfLocalBody?.Count() > 0)
                            {
                                
                                
                                if (filter.Where.NameOfLocalBody?.Count() > 0)
                                {
                                    string list = string.Join(",", filter.Where.NameOfLocalBody.Select(x => $"'{x}'"));
                                    Condition += $" mmr.Name_of_Local_Body IN ({list}) AND ";
                                }
                            }
                            

                            else if (property.Name == "StatusIds" && filter.Where.StatusIds?.Count() > 0)
                            {
                                string statusIdConditions = "";
                                List<string> conditionList = new List<string>();
                                filter.Where.StatusIds.ForEach(x =>
                                {
                                    conditionList.Add(" (mdam.Status = '" + x + "') ");
                                });
                                statusIdConditions = string.Join(" OR ", conditionList);

                                Condition += "(" + statusIdConditions + ") AND ";
                            }

                            else if (property.Name == "MemberId" && !string.IsNullOrWhiteSpace(filter.Where.MemberId))
                            {
                                Condition += "mmr.Member_IdString = '" + filter.Where.MemberId + "' AND ";
                            }



                        }
                    }
                }

                if (filter.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in filter.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = "";
                            if (item.FieldName == "member_Id")
                            {
                                item.SearchString = item.SearchString.Replace(" ", "");
                            }

                            #region Field Name Select
                            if (string.Equals(item.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(mmr.First_Name, ' ', mmr.Last_Name)";
                            }
                            else if (string.Equals(item.FieldName, "Phone", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mmr.Phone_Number";
                            }

                            else if (string.Equals(item.FieldName, "Member_IdString", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mmr.Member_IdString";
                            }

                            else if (string.Equals(item.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mdam.Status";
                            }


                            #endregion Field Name Select

                            if (!string.IsNullOrWhiteSpace(columnName))
                            {
                                Condition += " " + columnName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ";
                            }
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string searchCondition = " (";
                    string originalSearchString = filter.SearchString.Trim();
                    string memberIdSearchString = originalSearchString.Replace(" ", "");
                    List<string> columnsToSearch = new List<string>() {
                        "mmr.Member_IdString",
                        "mmr.Phone_Number",
                        "CONCAT(mmr.First_Name, ' ', mmr.Last_Name)",
                        "mdam.Status",
                      
                    };
                    foreach (var column in columnsToSearch)
                    {
                        string currentSearchString = column == "mmr.Member_IdString" ? memberIdSearchString : originalSearchString;
                        if (!string.IsNullOrEmpty(column))
                        {
                            searchCondition += column + " LIKE " + "'%" + currentSearchString + "%' OR ";
                        }
                    }
                    searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    searchCondition += ") AND ";

                    Condition += searchCondition;
                }

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                #endregion Build Query Conditions

                CountQuery = CountQuery + Condition;

                using (var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
                {
                    TotalCount = SqlMapper.ExecuteScalar<int>(conn, CountQuery, commandType: CommandType.Text);

                    #region Pagination Condition

                    if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter?.Sorting?.FieldName) && !string.IsNullOrWhiteSpace(filter?.Sorting?.Sort))
                    {
                        string FieldName = "";

                        #region Select Field
                        if (string.Equals(filter?.Sorting.FieldName, "Member_Id", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mmr.Member_Id";
                        }
                        if (string.Equals(filter?.Sorting.FieldName, "Member_IdString", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mmr.Member_IdString";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(mmr.First_Name, ' ', mmr.Last_Name)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Phone", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mmr.Phone_Number";
                        }

                        else if (string.Equals(filter?.Sorting.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mdam.Status";
                        }

                        else
                        {
                            FieldName = "mmr.ModifiedDate";
                        }
                        #endregion Select Field

                        if (filter?.Skip == 0 && filter?.Take == 0)
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " ";
                        }
                        else
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " LIMIT  " + filter?.Take + "  OFFSET " + filter?.Skip;
                        }
                    }
                    else if (filter?.Skip == 0 && filter?.Take == 0)
                    {
                        Condition += " ORDER BY mmr.ModifiedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY mmr.ModifiedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return SqlMapper.Query<MemberReportModel>(conn, Query, commandType: CommandType.Text)?.ToList() ?? new List<MemberReportModel>();
                }
            }

            return null;
        }


        public MemberReportResponseModel Member_Report_Chart(MemberReportFilterModel filter)
        {
            MemberReportResponseModel model = new MemberReportResponseModel();

            dynamic @params = new
            {
               
                    p_TypeOfWork = filter.Where.Type_of_Work != null && filter.Where.Type_of_Work.Count > 0
        ? string.Join(",", filter.Where.Type_of_Work)
        : null,

                    p_OrganizationType = filter.Where.OrganizationType != null && filter.Where.OrganizationType.Count > 0
        ? string.Join(",", filter.Where.OrganizationType)
        : null,

                    p_DistrictId = filter.Where.DistrictIds,

                    p_LocalBody = filter.Where.LocalBody != null && filter.Where.LocalBody.Count > 0
        ? string.Join(",", filter.Where.LocalBody)
        : null,

                    p_LocalBodyName = filter.Where.NameOfLocalBody != null && filter.Where.NameOfLocalBody.Count > 0
        ? string.Join(",", filter.Where.NameOfLocalBody)
        : null,

                    p_LocalBodyType = filter.Where.LocalBodyType != null && filter.Where.LocalBodyType.Count > 0
        ? string.Join(",", filter.Where.LocalBodyType)
        : null,

                    p_Municipality = filter.Where.Municipality != null && filter.Where.Municipality.Count > 0
        ? string.Join(",", filter.Where.Municipality)
        : null,

                    p_Block = filter.Where.Block != null && filter.Where.Block.Count > 0
        ? string.Join(",", filter.Where.Block)
        : null,

                    p_Status = string.IsNullOrWhiteSpace(filter.Where.Status)
        ? null
        : filter.Where.Status,

                    p_FromDate = filter.Where.FromDate,
                    p_ToDate = filter.Where.ToDate
                
        };

            using IDbConnection connection =
                new MySqlConnection(_configuration.GetConnectionString(connectionId));

            var multi = SqlMapper.QueryMultiple(
                connection,
                "Member_Report",
                @params,
                commandType: CommandType.StoredProcedure
            );

        
            model.WorkTypeReport = multi.Read<WorkTypeReportModel>();
            model.LocalBodyCounts = multi.Read<LocalBodyCountModel>();
            model.LocalBodyTypeReport = multi.Read<LocalBodyTypeReportModel>();


            return model;
        }

        #endregion reports
        public int UpdateAsCardDisbursed(MemberDataApprovalFromSubmitModel model, AuditColumnsModel auditColumnsModel)
        {
            int totalRowsAffected = 0;

           
                dynamic @params = new
                {
                    pIds = model.RequestId, // Pass ONE ID at a time
                    pComments = model.Comment,
                    pSavedBy = auditColumnsModel.SavedBy,
                    pSavedByUserName = auditColumnsModel.SavedByUserName,
                    pSavedDate = auditColumnsModel.SavedDate
                };

                using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                
                totalRowsAffected += SqlMapper.Execute(connection, "ReturnCardtoDistrict", @params, commandType: CommandType.StoredProcedure);
            

            return totalRowsAffected;
        }

        public List<PrintModuleReportModel> GetId(string Id)
        {
            dynamic @params = new
            {
                pId = Id
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<PrintModuleReportModel>(connection, "GetId", @params, commandType: CommandType.StoredProcedure)?? new List<PrintModuleReportModel>();
        }
        public  string UpdatePrintStatus()
        {
            dynamic @params = new
            {
               

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<string>(connection, "UpdatePrintStatus", @params, commandType: CommandType.StoredProcedure);
        }

        public int DeleteRecordsByIds(List<string> ids,string comments)
        {
            dynamic @params = new
            {


            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<string>(connection, "UpdatePrintStatus", @params, commandType: CommandType.StoredProcedure);
        }

        public List<MemberApplySchemeCountModel> MemberApplySchemeCount(string DistrictId = "", string SchemeId = "")
        {
            dynamic @params = new
            {
                pDistrictId = DistrictId,
                pSchemeId = SchemeId

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberApplySchemeCountModel>(connection, "Member_Apply_Scheme_Count_Report", @params, commandType: CommandType.StoredProcedure) ?? new List<MemberApplySchemeCountModel>();
        }

        public List<SchemeGCCReportModel> SchemeGCCReport(string ZoneId = "", string SchemeId = "")
        {
            dynamic @params = new
            {
                pZoneId = ZoneId,
                pSchemeId = SchemeId

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<SchemeGCCReportModel>(connection, "Member_Apply_Scheme_Count_By_Zone", @params, commandType: CommandType.StoredProcedure) ?? new List<SchemeGCCReportModel>();
        }

        public List<SchemeCostReportModel> SchemeCostReport(string DistrictId = "", string SchemeId = "", string CategoryId = "", string CommunityId = "")
        {
            //dynamic @params = new
            //{
            //  pDistrictId = DistrictId,
            //  pSchemeId = SchemeId,
            //  pCategoryId = CategoryId,
            //  pCommunityId = CommunityId,

            //};
            dynamic @params = new
            {
                pDistrictId = string.IsNullOrEmpty(DistrictId) ? null : DistrictId,
                pSchemeId = string.IsNullOrEmpty(SchemeId) ? null : SchemeId,
                //pCategoryId = string.IsNullOrEmpty(CategoryId) ? null : CategoryId,
                //pCommunityId = string.IsNullOrEmpty(CommunityId) ? null : CommunityId
            };


            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<SchemeCostReportModel>(connection, "Scheme_Total_Cost_Report", @params, commandType: CommandType.StoredProcedure) ?? new List<SchemeCostReportModel>();
        }
        public List<ApplicationUCReportModel> ApplicationUC(ApplicationInfoFilterModel filter, out int TotalCount, int ExpiryDays = 7)
        {
            TotalCount = 0;

            StringBuilder sqlBuilder = new StringBuilder();

            string Query = @"select 
                            (CASE WHEN IFNULL(am.ApplicationNumber,'')='' THEN  am.TemporaryNumber ELSE am.ApplicationNumber END) AS ApplicationNumber,
                            scheme.Value as 'Scheme',
                            status1.Value as 'Status',
                            uc.NameAndAddress,
                            uc.NameOfTrade,
                            uc.NodalNumber,
                            uc.Subsidy,
                            uc.PromotorContribution,
                            uc.BankLoan,
                            uc.TotalAmountReleased,
                            uc.DateOfLoanSanction,
                            uc.DateOfDisbursement,
                            uc.DateOfAssetCreated,
                            uc.DateOfAssetVerified,
                            uc.LoanAccountNumber
                            from application_utilisation_certificate uc
                            inner join application_master am on am.Id = uc.ApplicationId
                            inner join application_details ad on ad.ApplicationId = am.Id
                            inner join application_address_master aam on aam.ApplicationId = am.Id and aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId ";

            string CountQuery = @"select count(1) from application_utilisation_certificate uc
                            inner join application_master am on am.Id = uc.ApplicationId
                            inner join application_details ad on ad.ApplicationId = am.Id
                            inner join application_address_master aam on aam.ApplicationId = am.Id and aam.AddressType = 'PROJECT'
                            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId ";

            if (filter != null)
            {
                #region Build Query Conditions

                sqlBuilder.Append(" WHERE ");

                // Bank/Branch=================================================================
                string bankIds_str = "";
                if (filter?.BankIds?.Count > 0)
                {
                    bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    bankIds_str = " (1=1) ";
                }

                string branchIds_str = "";
                if (filter?.BranchIds?.Count > 0)
                {
                    branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
                }
                else
                {
                    branchIds_str = " (1=1) ";
                }

                sqlBuilder.Append(" ( <BANKREPLACE> OR <BRACNCHREPLACE> ) AND ");

                sqlBuilder = sqlBuilder.Replace("<BANKREPLACE>", bankIds_str);
                sqlBuilder = sqlBuilder.Replace("<BRACNCHREPLACE>", branchIds_str);
                // Bank/Branch=================================================================


                if (filter?.SchemeIds?.Count > 0)
                {
                    string schemeIds_str = "";
                    filter.SchemeIds.ForEach(x =>
                    {
                        schemeIds_str += "'" + x + "',";
                    });
                    schemeIds_str = schemeIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(schemeIds_str))
                    {
                        sqlBuilder.Append(" am.SchemeId IN (" + schemeIds_str + ") AND ");
                    }
                }

                if (filter?.DistrictIds?.Count > 0)
                {
                    string districtIds_str = "";
                    filter.DistrictIds.ForEach(x =>
                    {
                        districtIds_str += "'" + x + "',";
                    });
                    districtIds_str = districtIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(districtIds_str))
                    {
                        sqlBuilder.Append(" aam.District IN (" + districtIds_str + ") AND ");
                    }
                }

                if (filter?.StatusIds?.Count > 0)
                {
                    string statusIds_str = "";
                    filter.StatusIds.ForEach(x =>
                    {
                        statusIds_str += "'" + x + "',";
                    });
                    statusIds_str = statusIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(statusIds_str))
                    {
                        sqlBuilder.Append(" am.StatusId IN (" + statusIds_str + ") AND ");
                    }
                }

                if (ExpiryDays > 0)
                {
                    sqlBuilder.Append(" ((case when status1.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND ");
                    sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
                }
                if (filter != null && filter.FromYear > 0 && filter.ToYear > 0)
                {
                    DateTime from = new DateTime(filter.FromYear, 4, 1, 0, 0, 0);
                    DateTime to = new DateTime(filter.ToYear, 3, 31, 23, 59, 59);

                    TimeZoneInfo istZones = TimeZoneInfo.Local;
                    from = TimeZoneInfo.ConvertTime(from, istZones);
                    to = TimeZoneInfo.ConvertTime(to, istZones);

                    sqlBuilder.Append(" DATE(am.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s') AND ");
                    sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
                    sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
                }

                if (filter?.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in filter.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = "";

                            #region Field Name Select
                            if (string.Equals(item.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(um.FirstName, ' ', um.LastName)";
                            }
                            else if (string.Equals(item.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lm.Reason";
                            }
                            else if (string.Equals(item.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(lm.ToDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(lm.FromDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lt.Value";
                            }
                            else if (string.Equals(item.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "sm.StatusName";
                            }

                            #endregion Field Name Select

                            if (!string.IsNullOrWhiteSpace(columnName))
                            {
                                sqlBuilder.Append(" " + columnName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ");
                            }
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string searchCondition = " (";
                    List<string> columnsToSearch = new List<string>() {
                        "am.TemporaryNumber", "am.ApplicationNumber", "scheme.Value", "status1.Value",
                        "uc.NameAndAddress", "uc.NameOfTrade", "uc.NodalNumber",
                        "uc.Subsidy", "uc.PromotorContribution",
                        "uc.BankLoan", "uc.TotalAmountReleased",
                        "uc.DateOfLoanSanction", "uc.DateOfDisbursement",
                        "uc.DateOfAssetCreated", "uc.DateOfAssetVerified", "uc.LoanAccountNumber"
                    };
                    foreach (var column in columnsToSearch)
                    {
                        if (!string.IsNullOrEmpty(column))
                        {
                            searchCondition += column + " LIKE " + "'%" + filter.SearchString.Trim() + "%' OR ";
                        }
                    }
                    searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    searchCondition += ") AND ";

                    sqlBuilder.Append(searchCondition);
                }

                string Condition = sqlBuilder.ToString();

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                #endregion Build Query Conditions

                CountQuery = CountQuery + Condition;

                using (var conn = _dapperContext.CreateConnection())
                {
                    TotalCount = conn.ExecuteScalar<int>(CountQuery, commandType: CommandType.Text);

                    #region Pagination Condition

                    if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter?.Sorting?.FieldName) && !string.IsNullOrWhiteSpace(filter?.Sorting?.Sort))
                    {
                        string FieldName = "";

                        #region Select Field
                        if (string.Equals(filter?.Sorting.FieldName, "UserName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(um.FirstName, ' ', um.LastName)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "LeaveType", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lt.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "StatusName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "sm.StatusName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.Reason";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ToDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.ToDate";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "FromDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lm.FromDate";
                        }
                        else
                        {
                            FieldName = "am.CreatedDate";
                        }
                        #endregion Select Field

                        if (filter?.Skip == 0 && filter?.Take == 0)
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " ";
                        }
                        else
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " LIMIT  " + filter?.Take + "  OFFSET " + filter?.Skip;
                        }
                    }
                    else if (filter?.Skip == 0 && filter?.Take == 0)
                    {
                        Condition += " ORDER BY am.CreatedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY am.CreatedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return conn.Query<ApplicationUCReportModel>(Query, commandType: CommandType.Text)?.ToList() ?? new List<ApplicationUCReportModel>();
                }
            }

            return null;
        }
        // Demographic And Benificiary Insights
        public DemographicAndBenificiaryInsightsModel DemographicAndBenificiaryInsights(ReportFilterModel filter, int ExpiryDays = 7)
        {
            var querys = Generate_DemographicAndBenificiaryInsights_Query(filter, ExpiryDays);

            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                DemographicAndBenificiaryInsightsModel model = new DemographicAndBenificiaryInsightsModel();

                model.Self = SqlMapper.ExecuteScalar<int>(connection, querys.self, commandType: CommandType.Text);
                model.Dependent = SqlMapper.Query<DependentModel>(connection, querys.dependent, commandType: CommandType.Text).ToList();
                model.SchemeServedIn = SqlMapper.Query<ServedInModel>(connection, querys.servedIn, commandType: CommandType.Text).ToList();
                model.MaritalStatus = SqlMapper.Query<MaritalStatusModel>(connection, querys.maritalStatus, commandType: CommandType.Text).ToList();
                model.AgeAndGender = SqlMapper.Query<AgeAndGenderModel>(connection, querys.ageAndGender, commandType: CommandType.Text).ToList();

                return model;
            }
        }
        private (string self, string dependent, string servedIn, string maritalStatus, string ageAndGender) Generate_DemographicAndBenificiaryInsights_Query(ReportFilterModel filter, int ExpiryDays)
        {
            int startYear = filter.FromYear;
            int endYear = filter.ToYear;

            string districtConditions = "";
            if (filter.DistrictIds != null && filter.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (aam.District = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=1";
            }

            string schemeIdConditions = "";
            if (filter.SchemeIds != null && filter.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (mt.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=1";
            }

            string statusCodeConditions = "";
            if (filter.StatusIds != null && filter.StatusIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.StatusIds.ForEach(x =>
                {
                    distList.Add(" (mt.StatusId = '" + x + "') ");
                });

                statusCodeConditions = string.Join(" OR ", distList);
            }
            else
            {
                statusCodeConditions = "1=1";
            }

            // Bank/Branch=================================================================
            string bankIds_str = "";
            if (filter?.BankIds?.Count > 0)
            {
                bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                bankIds_str = " (1=1) ";
            }

            string branchIds_str = "";
            if (filter?.BranchIds?.Count > 0)
            {
                branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                branchIds_str = " (1=1) ";
            }

            string bb_Condition = " ( <BANKREPLACE> OR <BRACNCHREPLACE> ) ";

            bb_Condition = bb_Condition.Replace("<BANKREPLACE>", bankIds_str);
            bb_Condition = bb_Condition.Replace("<BRACNCHREPLACE>", branchIds_str);
            // Bank/Branch=================================================================

            StringBuilder sqlBuilder = new StringBuilder();


            #region Self

            sqlBuilder.AppendLine(@"SELECT COUNT(1) FROM application_master mt
                                    INNER JOIN application_details ad ON ad.ApplicationId = mt.Id
                                    INNER JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'
                                    INNER JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId
                                    INNER JOIN two_column_configuration_values sm ON sm.Id = mt.SchemeId
                                    WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) AND 
                                   ");


            DateTime from = new DateTime(filter.FromYear, 4, 1, 0, 0, 0);
            DateTime to = new DateTime(filter.ToYear, 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            sqlBuilder.Append(" DATE(mt.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s') AND IFNULL(ad.IsSelf,0) = 1; ");

            sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string selfCountQuery = sqlBuilder.ToString();

            #endregion

            #region Dependent

            sqlBuilder.Clear();

            sqlBuilder.AppendLine(@"SELECT 
                                    dps.Value as 'Name', 
                                    COALESCE(COUNT(ad.Id), 0) as 'Count' 
                                    FROM two_column_configuration_values dps
                                    LEFT JOIN application_details ad ON dps.Id = ad.DependentId
                                    LEFT JOIN application_master mt ON mt.Id = ad.ApplicationId AND DATE(mt.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s')
                                    LEFT JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'
                                    LEFT JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId
                                    LEFT JOIN two_column_configuration_values sm ON sm.Id = mt.SchemeId
                                    WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) AND 
                                    dps.CategoryId IN(SELECT Id FROM two_column_configuration_category WHERE CategoryCode='DEPENDENTS')
                                    GROUP BY dps.Id ORDER BY dps.Value;");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string dependentCountQuery = sqlBuilder.ToString();

            #endregion

            #region Served-In

            sqlBuilder.Clear();
            sqlBuilder.AppendLine(@"SELECT 
                                    dps.Value as 'Name', 
                                    COALESCE(COUNT(ad.Id), 0) as 'Count' 
                                    FROM two_column_configuration_values dps
                                    LEFT JOIN application_details ad ON dps.Id = ad.ServedIn
                                    LEFT JOIN application_master mt ON mt.Id = ad.ApplicationId AND DATE(mt.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s')
                                    LEFT JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'
                                    LEFT JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId
                                    LEFT JOIN two_column_configuration_values sm ON sm.Id = mt.SchemeId
                                    WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) AND 
                                    dps.CategoryId IN(SELECT Id FROM two_column_configuration_category WHERE CategoryCode='SERVICES')
                                    GROUP BY dps.Id ORDER BY dps.Value;");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string servedIn = sqlBuilder.ToString();

            #endregion

            #region Marital Status

            sqlBuilder.Clear();
            sqlBuilder.AppendLine(@"SELECT 
                                    dps.Value as 'Name', 
                                    COALESCE(COUNT(ad.Id), 0) as 'Count' 
                                    FROM two_column_configuration_values dps
                                    LEFT JOIN application_details ad ON dps.Id = ad.MaritalStatus
                                    LEFT JOIN application_master mt ON mt.Id = ad.ApplicationId AND DATE(mt.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s')
                                    LEFT JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'
                                    LEFT JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId
                                    LEFT JOIN two_column_configuration_values sm ON sm.Id = mt.SchemeId
                                    WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) AND  
                                    dps.CategoryId IN(SELECT Id FROM two_column_configuration_category WHERE CategoryCode='MARITALSTATUS')
                                    GROUP BY dps.Id ORDER BY dps.Value;");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string maritalStatus = sqlBuilder.ToString();

            #endregion

            #region Age And Gender

            sqlBuilder.Clear();
            sqlBuilder.AppendLine(@"SELECT 
                                    dps.Value as 'Name', 
                                    COALESCE(COUNT(ad.Id), 0) as 'Count' 
                                    FROM two_column_configuration_values dps
                                    LEFT JOIN application_details ad ON dps.Id = ad.Sex
                                    LEFT JOIN application_master mt ON mt.Id = ad.ApplicationId AND DATE(mt.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s')
                                    LEFT JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'
                                    LEFT JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId
                                    LEFT JOIN two_column_configuration_values sm ON sm.Id = mt.SchemeId
                                    WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) AND 
                                    dps.CategoryId IN(SELECT Id FROM two_column_configuration_category WHERE CategoryCode='GENDER')
                                    GROUP BY dps.Id ORDER BY dps.Value;");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string ageAndGender = sqlBuilder.ToString();

            #endregion

            return (selfCountQuery, dependentCountQuery, servedIn, maritalStatus, ageAndGender);
        }

        // Financial Year Analysis
        public List<FinancialYearAnalysisModel> FinancialYearAnalysis(ReportFilterModel filter, int ExpiryDays = 7)
        {
            var query = Generate_FinancialYearAnalysis_Query(filter, ExpiryDays);

            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                List<FinancialYearAnalysisModel> finalRes = new List<FinancialYearAnalysisModel>();

                List<FinancialYearAnalysisReadModel> list_model = SqlMapper.Query<FinancialYearAnalysisReadModel>(connection, query, commandType: CommandType.Text).ToList();

                if (list_model != null && list_model.Count > 0)
                {
                    finalRes = list_model.GroupBy(g => g.SchemeName).Select(group => new FinancialYearAnalysisModel() { SchemeName = group.Key, Data = group.ToList() }).ToList();
                }

                return finalRes;
            }
        }
        private string Generate_FinancialYearAnalysis_Query(ReportFilterModel filter, int ExpiryDays)
        {
            int startYear = filter.FromYear;
            int endYear = filter.ToYear;

            string districtConditions = "";
            if (filter.DistrictIds != null && filter.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (aam.District = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=1";
            }

            string schemeIdConditions = "";
            if (filter.SchemeIds != null && filter.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (mt.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=1";
            }

            string statusCodeConditions = "";
            if (filter.StatusIds != null && filter.StatusIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.StatusIds.ForEach(x =>
                {
                    distList.Add(" (mt.StatusId = '" + x + "') ");
                });

                statusCodeConditions = string.Join(" OR ", distList);
            }
            else
            {
                statusCodeConditions = "1=1";
            }

            // Bank/Branch=================================================================
            string bankIds_str = "";
            if (filter?.BankIds?.Count > 0)
            {
                bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                bankIds_str = " (1=1) ";
            }

            string branchIds_str = "";
            if (filter?.BranchIds?.Count > 0)
            {
                branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                branchIds_str = " (1=1) ";
            }

            string bb_Condition = " ( <BANKREPLACE> OR <BRACNCHREPLACE> ) ";

            bb_Condition = bb_Condition.Replace("<BANKREPLACE>", bankIds_str);
            bb_Condition = bb_Condition.Replace("<BRACNCHREPLACE>", branchIds_str);
            // Bank/Branch=================================================================

            StringBuilder sqlBuilder = new StringBuilder();

            // Count

            sqlBuilder.AppendLine("SELECT");
            sqlBuilder.AppendLine("    sm.Value AS SchemeName,");
            sqlBuilder.AppendLine("    YEAR(years.FYStart) AS FromYear,");
            sqlBuilder.AppendLine("    YEAR(years.FYEnd) AS ToYear,");
            sqlBuilder.AppendLine("    COALESCE(COUNT(mt.Id), 0) AS RecordCount,");
            sqlBuilder.AppendLine("    COALESCE(SUM(ad.TotalCost), 0) AS TotalCost");
            sqlBuilder.AppendLine("FROM (");

            for (int year = startYear; year <= endYear; year++)
            {
                if (year > startYear)
                {
                    sqlBuilder.AppendLine("UNION ALL");
                }

                sqlBuilder.AppendLine($"SELECT STR_TO_DATE('{year}-04-01', '%Y-%m-%d') AS FYStart, " + $"STR_TO_DATE('{year + 1}-03-31', '%Y-%m-%d') AS FYEnd");
            }
            sqlBuilder.AppendLine(") years");

            sqlBuilder.AppendLine("CROSS JOIN (");
            sqlBuilder.AppendLine("    SELECT DISTINCT SchemeId FROM application_master");
            sqlBuilder.AppendLine(") scheme");

            sqlBuilder.AppendLine("LEFT JOIN application_master mt ON mt.SchemeId = scheme.SchemeId AND DATE(mt.CreatedDate) BETWEEN years.FYStart AND years.FYEnd");
            sqlBuilder.AppendLine("LEFT JOIN application_details ad ON ad.ApplicationId = mt.Id");
            sqlBuilder.AppendLine("LEFT JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'");
            sqlBuilder.AppendLine("LEFT JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId");
            sqlBuilder.AppendLine("LEFT JOIN two_column_configuration_values sm ON sm.Id = scheme.SchemeId");
            sqlBuilder.AppendLine("WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) ");
            sqlBuilder.AppendLine("GROUP BY scheme.SchemeId, years.FYStart");
            sqlBuilder.AppendLine("ORDER BY scheme.SchemeId, years.FYStart;");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            return sqlBuilder.ToString();
        }


        // Comparidion of Scheme Subsidy Vs Project Amount
        public List<ProjectSubsidyCostModel> ComparisionSchemeSubsidyAmount(ReportFilterModel filter, int ExpiryDays = 7)
        {
            var query = Generate_ComparisionSchemeSubsidyAmount_Query(filter, ExpiryDays);

            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                List<ProjectSubsidyCostModel> model = new List<ProjectSubsidyCostModel>();

                model = SqlMapper.Query<ProjectSubsidyCostModel>(connection, query, commandType: CommandType.Text).ToList();

                return model;
            }
        }
        private string Generate_ComparisionSchemeSubsidyAmount_Query(ReportFilterModel filter, int ExpiryDays)
        {
            int startYear = filter.FromYear;
            int endYear = filter.ToYear;

            string districtConditions = "";
            if (filter.DistrictIds != null && filter.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (aam.District = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=1";
            }

            string schemeIdConditions = "";
            if (filter.SchemeIds != null && filter.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (mt.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=1";
            }

            string statusCodeConditions = "";
            if (filter.StatusIds != null && filter.StatusIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.StatusIds.ForEach(x =>
                {
                    distList.Add(" (mt.StatusId = '" + x + "') ");
                });

                statusCodeConditions = string.Join(" OR ", distList);
            }
            else
            {
                statusCodeConditions = "1=1";
            }


            // Bank/Branch=================================================================
            string bankIds_str = "";
            if (filter?.BankIds?.Count > 0)
            {
                bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                bankIds_str = " (1=1) ";
            }

            string branchIds_str = "";
            if (filter?.BranchIds?.Count > 0)
            {
                branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                branchIds_str = " (1=1) ";
            }

            string bb_Condition = " ( <BANKREPLACE> OR <BRACNCHREPLACE> ) ";

            bb_Condition = bb_Condition.Replace("<BANKREPLACE>", bankIds_str);
            bb_Condition = bb_Condition.Replace("<BRACNCHREPLACE>", branchIds_str);
            // Bank/Branch=================================================================


            StringBuilder sqlBuilder = new StringBuilder();

            // Count

            sqlBuilder.AppendLine("SELECT YEAR(years.FYStart) AS FromYear, YEAR(years.FYEnd) AS ToYear, COALESCE(SUM(ad.TotalCost), 0) AS ProjectCost, COALESCE(SUM(ad.SubsidyCost), 0) AS SubsidyCost");
            sqlBuilder.AppendLine("FROM (");

            for (int year = startYear; year <= endYear; year++)
            {
                if (year > startYear)
                {
                    sqlBuilder.AppendLine("UNION ALL");
                }

                sqlBuilder.AppendLine($"SELECT STR_TO_DATE('{year}-04-01', '%Y-%m-%d') AS FYStart, " + $"STR_TO_DATE('{year + 1}-03-31', '%Y-%m-%d') AS FYEnd");
            }

            sqlBuilder.AppendLine(") years");

            sqlBuilder.AppendLine("LEFT JOIN application_master mt ON DATE(mt.CreatedDate) BETWEEN years.FYStart AND years.FYEnd");
            sqlBuilder.AppendLine("LEFT JOIN application_details ad ON ad.ApplicationId = mt.Id");
            sqlBuilder.AppendLine("LEFT JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'");
            sqlBuilder.AppendLine("LEFT JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId");
            sqlBuilder.AppendLine("WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) ");
            sqlBuilder.AppendLine("GROUP BY years.FYStart;");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            return sqlBuilder.ToString();
        }


        // District Distribution
        public DistrictWiseCountCost DistrictDistribution(ReportFilterModel filter, int ExpiryDays = 7)
        {
            var query = Generate_DistrictDistribution_Query(filter, ExpiryDays);

            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                DistrictWiseCountCost model = new DistrictWiseCountCost();

                model.Count = SqlMapper.Query<DistrictWiseCount>(connection, query.count, commandType: CommandType.Text).ToList();
                model.Cost = SqlMapper.Query<DistrictWiseCost>(connection, query.cost, commandType: CommandType.Text).ToList();

                return model;
            }
        }
        private (string count, string cost) Generate_DistrictDistribution_Query(ReportFilterModel filter, int ExpiryDays)
        {
            int startYear = filter.FromYear;
            int endYear = filter.ToYear;

            string districtConditions = "";
            if (filter.DistrictIds != null && filter.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (aam.District = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=1";
            }

            string schemeIdConditions = "";
            if (filter.SchemeIds != null && filter.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (am.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=1";
            }

            string statusCodeConditions = "";
            if (filter.StatusIds != null && filter.StatusIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.StatusIds.ForEach(x =>
                {
                    distList.Add(" (am.StatusId = '" + x + "') ");
                });

                statusCodeConditions = string.Join(" OR ", distList);
            }
            else
            {
                statusCodeConditions = "1=1";
            }

            // Bank/Branch=================================================================
            string bankIds_str = "";
            if (filter?.BankIds?.Count > 0)
            {
                bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                bankIds_str = " (1=1) ";
            }

            string branchIds_str = "";
            if (filter?.BranchIds?.Count > 0)
            {
                branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                branchIds_str = " (1=1) ";
            }

            string bb_Condition = " ( <BANKREPLACE> OR <BRACNCHREPLACE> ) ";

            bb_Condition = bb_Condition.Replace("<BANKREPLACE>", bankIds_str);
            bb_Condition = bb_Condition.Replace("<BRACNCHREPLACE>", branchIds_str);
            // Bank/Branch=================================================================

            StringBuilder sqlBuilder = new StringBuilder();

            // Count

            sqlBuilder.AppendLine(@"select dn.Value as 'DistrictName', count(am.Id) as 'Count' from application_master am
                                    inner join application_details ad on ad.ApplicationId = am.Id
                                    inner join application_address_master aam on aam.ApplicationId = am.Id and aam.AddressType = 'PROJECT'
                                    inner join two_column_configuration_values dn on dn.Id = aam.District 
                                    inner join two_column_configuration_values csm ON csm.Id = am.StatusId");
            sqlBuilder.AppendLine("where ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0)  AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) ");
            sqlBuilder.AppendLine("group by aam.District order by dn.Value asc");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string countQuery = sqlBuilder.ToString();

            // Cost

            sqlBuilder.Clear();

            sqlBuilder.AppendLine(@"select dn.Value as 'DistrictName', sum(ad.TotalCost) as 'Cost' from application_master am
                                    inner join application_details ad on ad.ApplicationId = am.Id
                                    inner join application_address_master aam on aam.ApplicationId = am.Id and aam.AddressType = 'PROJECT'
                                    inner join two_column_configuration_values dn on dn.Id = aam.District 
                                    inner join two_column_configuration_values csm ON csm.Id = am.StatusId");
            sqlBuilder.AppendLine("where ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0)  AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) ");
            sqlBuilder.AppendLine("group by aam.District order by dn.Value asc");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string costQuery = sqlBuilder.ToString();

            return (countQuery, costQuery);
        }


        // Scheme Performance
        public CountModel SchemePerformance(ReportFilterModel filter, int ExpiryDays = 7)
        {
            var query = Generate_SchemePerformance_Query(filter, ExpiryDays);

            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                CountModel model = new CountModel();

                model.Count = SqlMapper.Query<SchemeCountModel>(connection, query.count, commandType: CommandType.Text).ToList();
                model.Cost = SqlMapper.Query<SchemeCostModel>(connection, query.cost, commandType: CommandType.Text).ToList();

                return model;
            }
        }
        private (string count, string cost) Generate_SchemePerformance_Query(ReportFilterModel filter, int ExpiryDays)
        {
            int startYear = filter.FromYear;
            int endYear = filter.ToYear;

            string districtConditions = "";
            if (filter.DistrictIds != null && filter.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (aam.District = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=1";
            }

            string schemeIdConditions = "";
            if (filter.SchemeIds != null && filter.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (mt.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=1";
            }

            string statusCodeConditions = "";
            if (filter.StatusIds != null && filter.StatusIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.StatusIds.ForEach(x =>
                {
                    distList.Add(" (mt.StatusId = '" + x + "') ");
                });

                statusCodeConditions = string.Join(" OR ", distList);
            }
            else
            {
                statusCodeConditions = "1=1";
            }


            // Bank/Branch=================================================================
            string bankIds_str = "";
            if (filter?.BankIds?.Count > 0)
            {
                bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                bankIds_str = " (1=1) ";
            }

            string branchIds_str = "";
            if (filter?.BranchIds?.Count > 0)
            {
                branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                branchIds_str = " (1=1) ";
            }

            string bb_Condition = " ( <BANKREPLACE> OR <BRACNCHREPLACE> ) ";

            bb_Condition = bb_Condition.Replace("<BANKREPLACE>", bankIds_str);
            bb_Condition = bb_Condition.Replace("<BRACNCHREPLACE>", branchIds_str);
            // Bank/Branch=================================================================


            StringBuilder sqlBuilder = new StringBuilder();

            // Count

            sqlBuilder.AppendLine("SELECT YEAR(years.FYStart) AS FromYear, YEAR(years.FYEnd) AS ToYear, COUNT(mt.Id) AS Actual");
            sqlBuilder.AppendLine("FROM (");

            for (int year = startYear; year <= endYear; year++)
            {
                if (year > startYear)
                {
                    sqlBuilder.AppendLine("UNION ALL");
                }

                sqlBuilder.AppendLine($"SELECT STR_TO_DATE('{year}-04-01', '%Y-%m-%d') AS FYStart, " + $"STR_TO_DATE('{year + 1}-03-31', '%Y-%m-%d') AS FYEnd");
            }

            sqlBuilder.AppendLine(") years");

            sqlBuilder.AppendLine("LEFT JOIN application_master mt ON DATE(mt.CreatedDate) BETWEEN years.FYStart AND years.FYEnd");
            sqlBuilder.AppendLine("LEFT JOIN application_details ad ON ad.ApplicationId = mt.Id");
            sqlBuilder.AppendLine("LEFT JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'");
            sqlBuilder.AppendLine("LEFT JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId");
            sqlBuilder.AppendLine("WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) ");
            sqlBuilder.AppendLine("GROUP BY years.FYStart;");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string countQuery = sqlBuilder.ToString();


            // Cost

            sqlBuilder.Clear();
            sqlBuilder.AppendLine("SELECT YEAR(years.FYStart) AS FromYear, YEAR(years.FYEnd) AS ToYear, COALESCE(SUM(ad.TotalCost), 0) AS Actual");
            sqlBuilder.AppendLine("FROM (");

            for (int year = startYear; year <= endYear; year++)
            {
                if (year > startYear)
                {
                    sqlBuilder.AppendLine("UNION ALL");
                }

                sqlBuilder.AppendLine($"SELECT STR_TO_DATE('{year}-04-01', '%Y-%m-%d') AS FYStart, " + $"STR_TO_DATE('{year + 1}-03-31', '%Y-%m-%d') AS FYEnd");
            }

            sqlBuilder.AppendLine(") years");

            sqlBuilder.AppendLine("LEFT JOIN application_master mt ON DATE(mt.CreatedDate) BETWEEN years.FYStart AND years.FYEnd");
            sqlBuilder.AppendLine("LEFT JOIN application_details ad ON ad.ApplicationId = mt.Id");
            sqlBuilder.AppendLine("LEFT JOIN application_address_master aam ON aam.ApplicationId = mt.Id AND aam.AddressType = 'PROJECT'");
            sqlBuilder.AppendLine("LEFT JOIN two_column_configuration_values csm ON csm.Id = mt.StatusId");
            sqlBuilder.AppendLine("WHERE ((case when csm.Code='SAVED' and DATEDIFF(CURDATE(), mt.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0) AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<STATUSCODES>) AND (<BANKBRANCH>) ");
            sqlBuilder.AppendLine("GROUP BY years.FYStart;");

            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODES>", statusCodeConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string costQuery = sqlBuilder.ToString();

            return (countQuery, costQuery);
        }


        public List<ApplicationStatusCount> ApplicationStatusWiseReport(string StatusCode, ReportFilterModel filter, int ExpiryDays)
        {
            string query = ApplicationStatusWiseReport_Query(StatusCode, filter, ExpiryDays);
            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                return SqlMapper.Query<ApplicationStatusCount>(connection, query, commandType: CommandType.Text)?.ToList() ?? new List<ApplicationStatusCount>();
            }
        }
        private string ApplicationStatusWiseReport_Query(string StatusCode, ReportFilterModel filter, int ExpiryDays)
        {
            int startYear = filter.FromYear;
            int endYear = filter.ToYear;

            string districtConditions = "";
            if (filter.DistrictIds != null && filter.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (aam.District = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=1";
            }

            string schemeIdConditions = "";
            if (filter.SchemeIds != null && filter.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (am.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=1";
            }

            // Bank/Branch=================================================================
            string bankIds_str = "";
            if (filter?.BankIds?.Count > 0)
            {
                bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                bankIds_str = " (1=1) ";
            }

            string branchIds_str = "";
            if (filter?.BranchIds?.Count > 0)
            {
                branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                branchIds_str = " (1=1) ";
            }

            string bb_Condition = " ( <BANKREPLACE> OR <BRACNCHREPLACE> ) ";

            bb_Condition = bb_Condition.Replace("<BANKREPLACE>", bankIds_str);
            bb_Condition = bb_Condition.Replace("<BRACNCHREPLACE>", branchIds_str);
            // Bank/Branch=================================================================


            DateTime from = new DateTime(filter.FromYear, 4, 1, 0, 0, 0);
            DateTime to = new DateTime(filter.ToYear, 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            StringBuilder sqlBuilder = new StringBuilder();

            sqlBuilder.AppendLine(@"select scheme.Value as 'Scheme', aps.Value as 'Status', aps.Id as 'StatusId', dist.Value as 'District', dist.Id as 'DistrictId', count(*) as 'Count' 
                                    from application_master am
                                    inner join application_details ad ON ad.ApplicationId = am.Id
	                                inner join application_address_master aam on aam.ApplicationId = am.Id and aam.AddressType = 'PROJECT'
	                                inner join two_column_configuration_values dist on dist.Id = aam.District
	                                inner join two_column_configuration_values aps on aps.Id = am.StatusId
                                    inner join two_column_configuration_values scheme on scheme.Id = am.SchemeId ");
            sqlBuilder.AppendLine(@"where aps.Code = '<STATUSCODE>' AND 
                                    (DATE(am.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s')) AND
                                    ((case when aps.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0)  AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<BANKBRANCH>) ");
            sqlBuilder.AppendLine("group by dist.Id order by dist.Value asc ");

            sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<STATUSCODE>", StatusCode);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string Query = sqlBuilder.ToString();

            return Query;
        }

        public List<ApplicationStatusCount> ApplicationTotalCountReport(ReportFilterModel filter, int ExpiryDays)
        {
            string query = ApplicationTotalCountReport_Query(filter, ExpiryDays);
            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                return SqlMapper.Query<ApplicationStatusCount>(connection, query, commandType: CommandType.Text)?.ToList() ?? new List<ApplicationStatusCount>();
            }
        }
        private string ApplicationTotalCountReport_Query(ReportFilterModel filter, int ExpiryDays)
        {
            int startYear = filter.FromYear;
            int endYear = filter.ToYear;

            string districtConditions = "";
            if (filter.DistrictIds != null && filter.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (aam.District = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=1";
            }

            string schemeIdConditions = "";
            if (filter.SchemeIds != null && filter.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                filter.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (am.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=1";
            }

            // Bank/Branch=================================================================
            string bankIds_str = "";
            if (filter?.BankIds?.Count > 0)
            {
                bankIds_str = " ad.Bank IN(" + string.Join(",", filter.BankIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                bankIds_str = " (1=1) ";
            }

            string branchIds_str = "";
            if (filter?.BranchIds?.Count > 0)
            {
                branchIds_str = " ad.Branch IN(" + string.Join(",", filter.BranchIds.Select(x => "'" + x + "'").ToList()) + ") ";
            }
            else
            {
                branchIds_str = " (1=1) ";
            }

            string bb_Condition = " ( <BANKREPLACE> OR <BRACNCHREPLACE> ) ";

            bb_Condition = bb_Condition.Replace("<BANKREPLACE>", bankIds_str);
            bb_Condition = bb_Condition.Replace("<BRACNCHREPLACE>", branchIds_str);
            // Bank/Branch=================================================================

            DateTime from = new DateTime(filter.FromYear, 4, 1, 0, 0, 0);
            DateTime to = new DateTime(filter.ToYear, 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            StringBuilder sqlBuilder = new StringBuilder();

            sqlBuilder.AppendLine(@"select scheme.Value as 'Scheme', aps.Value as 'Status', aps.Id as 'StatusId', dist.Value as 'District', dist.Id as 'DistrictId', count(*) as 'Count' 
                                    from application_master am
                                    inner join application_details ad ON ad.ApplicationId = am.Id
	                                inner join application_address_master aam on aam.ApplicationId = am.Id and aam.AddressType = 'PROJECT'
	                                inner join two_column_configuration_values dist on dist.Id = aam.District
	                                inner join two_column_configuration_values aps on aps.Id = am.StatusId
                                    inner join two_column_configuration_values scheme on scheme.Id = am.SchemeId ");
            sqlBuilder.AppendLine(@"where (DATE(am.CreatedDate) BETWEEN STR_TO_DATE('<FROMYEAR>', '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE('<TOYEAR>', '%Y-%m-%d %H:%i:%s')) AND
                                    ((case when aps.Code='SAVED' and DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPDAYS> then 1 else 0 end) = 0)  AND (<DISTRICTIDS>) AND (<SCHEMEIDS>) AND (<BANKBRANCH>) ");
            sqlBuilder.AppendLine(@"group by dist.Id order by dist.Value asc ");

            sqlBuilder.Replace("<FROMYEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<TOYEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
            sqlBuilder.Replace("<DISTRICTIDS>", districtConditions);
            sqlBuilder.Replace("<SCHEMEIDS>", schemeIdConditions);
            sqlBuilder.Replace("<EXPDAYS>", ExpiryDays.ToString());
            sqlBuilder.Replace("<BANKBRANCH>", bb_Condition);

            string Query = sqlBuilder.ToString();

            return Query;
        }

        public async Task<List<MemberOrgReport>> GetMemberOrgReportAsync()
        {
            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                var mem = await SqlMapper.QueryAsync<MemberOrgReport>(connection, "sp_Get_Member_Org_Report", commandType: CommandType.StoredProcedure);
                return mem.ToList() ?? new List<MemberOrgReport>();
            }
        }

        // Main entry: Get hierarchical tree as nested nodes
        public async Task<List<Node>> GetHierarchyTreeAsync(List<HierarchyField> hierarchy)
        {
            if (hierarchy == null || !hierarchy.Any())
                throw new ArgumentException("Hierarchy must contain at least one field.");

            var hierarchyFields = hierarchy.Select(h => h.Field).ToArray();

            // Generate SQL parts
            string selectClause = GenerateSelectClause(hierarchyFields);
            string groupClause = GenerateGroupClause(hierarchyFields);

            string sql = $@"
            SELECT {selectClause}, COUNT(*) AS Total
            FROM member_master mm
            INNER JOIN member_organization mo ON mo.Member_Id = mm.Id 
            WHERE IFNULL(mo.IsActive, 0) = 1 AND IFNULL(mo.IsTemp, 0) = 0 AND IFNULL(mm.IsActive, 0) = 1 AND IFNULL(mm.IsTemp, 0) = 0
            GROUP BY {groupClause}";

            var flatRows = await ExecuteQueryAsync(sql, hierarchyFields);

            var tree = BuildTree(flatRows, hierarchyFields);

            return tree;
        }

        // Generate SELECT clause
        private string GenerateSelectClause(string[] hierarchyFields)
        {
            List<string> memMaster = new List<string> { "Gender", "Religion", "Community", "Caste", "Marital_Status", "Education" };
            List<string> mmorg = new List<string> { "Type_of_Work", "Core_Sanitary_Worker_Type", "Organization_Type", "Nature_of_Job", "District_Id", "Local_Body" };

            var mmfild = hierarchyFields.Where(f => memMaster.Contains(f)).Select(c => $"mm.{c} AS {c}");
            var mofild = hierarchyFields.Where(f => mmorg.Contains(f)).Select(c => $"mo.{c} AS {c}");

            var allFields = mmfild.Concat(mofild);
            return string.Join(", ", allFields);
        }
        // Generate SELECT clause
        private string GenerateGroupClause(string[] hierarchyFields)
        {
            List<string> memMaster = new List<string> { "Gender", "Religion", "Community", "Caste", "Marital_Status", "Education" };
            List<string> mmorg = new List<string> { "Type_of_Work", "Core_Sanitary_Worker_Type", "Organization_Type", "Nature_of_Job", "District_Id", "Local_Body" };

            var mmfild = hierarchyFields.Where(f => memMaster.Contains(f)).Select(c => $"mm.{c}");
            var mofild = hierarchyFields.Where(f => mmorg.Contains(f)).Select(c => $"mo.{c}");

            var allFields = mmfild.Concat(mofild);
            return string.Join(", ", allFields);
        }

        private async Task<List<Dictionary<string, object>>> ExecuteQueryAsync(string sql, string[] hierarchyFields)
        {
            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                // Query using your strongly typed model
                var queryResult = await SqlMapper.QueryAsync<MemberOrgReport>(connection, sql, commandType: CommandType.Text);

                var results = new List<Dictionary<string, object>>();

                foreach (var row in queryResult)
                {
                    var dict = new Dictionary<string, object>();

                    foreach (var field in hierarchyFields)
                    {
                        // Use reflection to get value by property name
                        var property = typeof(MemberOrgReport).GetProperty(field);
                        if (property != null)
                        {
                            var value = property.GetValue(row);
                            dict[field] = value ?? null;
                        }
                    }

                    // Add Total count
                    dict["Total"] = row.Total;

                    results.Add(dict);
                }

                return results;
            }
        }



        // Build tree from flat rows
        private List<Node> BuildTree(List<Dictionary<string, object>> flatRows, string[] hierarchyFields)
        {
            var rootNodes = new List<Node>();

            // Dictionary of current level nodes to enable fast lookup
            var lookupLevels = new List<Dictionary<string, Node>>();

            for (int level = 0; level < hierarchyFields.Length; level++)
            {
                lookupLevels.Add(new Dictionary<string, Node>());
            }

            foreach (var row in flatRows)
            {
                Node parent = null;
                for (int level = 0; level < hierarchyFields.Length; level++)
                {
                    string key = row[hierarchyFields[level]]?.ToString() ?? null;
                    if (key == null)
                    {
                        // rollup row; stop descending further
                        break;
                    }

                    var currentLevelDict = lookupLevels[level];

                    if (!currentLevelDict.TryGetValue(key, out Node node))
                    {
                        node = new Node { Id = key };
                        currentLevelDict[key] = node;

                        if (parent == null)
                        {
                            // Top level node
                            rootNodes.Add(node);
                        }
                        else
                        {
                            parent.Children.Add(node);
                        }
                    }

                    // Update count for this node: use max of counts (rollups may repeat multiple times)
                    int count = Convert.ToInt32(row["Total"]);
                    node.Count = count;

                    parent = node;
                }
            }

            return rootNodes;
        }

        public List<MemberGridModel> GetMemberListByCollector(MemberFilterModelForAnimator filter, string userId, out int totalCount)
        {
            totalCount = 0;

            using (var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                conn.Open();

                // Step 1️⃣: Get logged-in user's mapping
                var user = conn.QueryFirstOrDefault<dynamic>(@"
            SELECT DistrictIds, BlockIds, CorporationIds, MunicipalityIds, 
                   TownPanchayatIds, VillagePanchayatIds, ZoneIds 
            FROM account_user 
            WHERE UserId = @UserId", new { UserId = userId });

                if (user == null)
                    return new List<MemberGridModel>();

                // Step 2️⃣: Build dynamic area filter without FIND_IN_SET
                var areaConditions = new List<string>();

                // Helper method to convert comma-separated string to SQL IN list
                string ToInClause(string ids)
                {
                    if (string.IsNullOrWhiteSpace(ids)) return string.Empty;
                    var list = ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                  .Select(x => $"'{x.Trim()}'");
                    return string.Join(",", list);
                }

                if (!string.IsNullOrWhiteSpace((string)user.DistrictIds))
                {
                    string districtIn = ToInClause((string)user.DistrictIds);
                    if (!string.IsNullOrEmpty(districtIn))
                        areaConditions.Add($"a.DistrictIds IN ({districtIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.BlockIds))
                {
                    string blockIn = ToInClause((string)user.BlockIds);
                    if (!string.IsNullOrEmpty(blockIn))
                        areaConditions.Add($"a.BlockIds IN ({blockIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.CorporationIds))
                {
                    string corpIn = ToInClause((string)user.CorporationIds);
                    if (!string.IsNullOrEmpty(corpIn))
                        areaConditions.Add($"a.CorporationIds IN ({corpIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.MunicipalityIds))
                {
                    string muniIn = ToInClause((string)user.MunicipalityIds);
                    if (!string.IsNullOrEmpty(muniIn))
                        areaConditions.Add($"a.MunicipalityIds IN ({muniIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.TownPanchayatIds))
                {
                    string townIn = ToInClause((string)user.TownPanchayatIds);
                    if (!string.IsNullOrEmpty(townIn))
                        areaConditions.Add($"a.TownPanchayatIds IN ({townIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.VillagePanchayatIds))
                {
                    string villageIn = ToInClause((string)user.VillagePanchayatIds);
                    if (!string.IsNullOrEmpty(villageIn))
                        areaConditions.Add($"a.VillagePanchayatIds IN ({villageIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.ZoneIds))
                {
                    string zoneIn = ToInClause((string)user.ZoneIds);
                    if (!string.IsNullOrEmpty(zoneIn))
                        areaConditions.Add($"a.ZoneIds IN ({zoneIn})");
                }

                string dynamicCondition = areaConditions.Count > 0
                    ? " AND (" + string.Join(" AND ", areaConditions) + ")"
                    : "";

                // Step 3️⃣: Base query
                string baseQuery = $@"
            SELECT DISTINCT 
                mm.Id,
                mm.Member_Id,
                CONCAT(mm.First_Name, ' ', mm.Last_Name) AS Name,
                mm.Phone_Number AS Phone,
                pad.Value AS District,
                mm.CollectedByName,
                mm.CollectedByPhoneNumber,
                CASE WHEN mm.IsApproved = 1 THEN 'No' ELSE 'Yes' END AS IsApproved,
                mdam.Status,
                nextAppRole.RoleName AS NextApprovalRole,
                cd.Value AS CardStatus,
                CASE WHEN mcam.IsCompleted = 1 THEN 'Yes' ELSE 'No' END AS CardDisbursedStatus,
                CASE 
                    WHEN mm.CollectedOn REGEXP '^[0-9]{{2}}-[0-9]{{2}}-[0-9]{{4}}' 
                        THEN STR_TO_DATE(mm.CollectedOn, '%d-%m-%Y %h:%i %p')
                    WHEN mm.CollectedOn REGEXP '^[0-9]{{4}}-[0-9]{{2}}-[0-9]{{2}}' 
                        THEN STR_TO_DATE(mm.CollectedOn, '%Y-%m-%d')
                    ELSE NULL
                END AS CollectedOn
            FROM member_master mm
            LEFT JOIN member_data_approval_master mdam ON mdam.Member_Id = mm.Id
            LEFT JOIN member_organization mo ON mo.Member_Id = mm.Id 
                AND IFNULL(mo.IsActive, 0) = 1 
                AND IFNULL(mo.IsTemp, 0) = 0
            LEFT JOIN two_column_configuration_values pad ON mo.District_Id = pad.Id
            LEFT JOIN member_card_approval_master mcam ON mm.Id = mcam.Member_Id 
            LEFT JOIN two_column_configuration_values cd ON cd.Id = mcam.StatusId
            LEFT JOIN account_role nextAppRole ON nextAppRole.Id = mdam.Approval_For
            WHERE mm.CollectedByPhoneNumber IN (
                SELECT DISTINCT TRIM(a.Mobile)
                FROM account_user a
                JOIN account_user u ON u.UserId = @UserId
                JOIN account_role r ON r.Id = a.RoleId
                WHERE r.RoleCode IN ('DO', 'DC')
                  AND TRIM(COALESCE(a.Mobile, '')) <> ''
                  {dynamicCondition}
            )";

                // Step 4️⃣: Filtering
                string filterCondition = "";
                if (filter?.Where != null)
                {
                    if (!string.IsNullOrWhiteSpace(filter.Where.MemberId))
                        filterCondition += $" AND mm.Member_Id LIKE '%{filter.Where.MemberId}%' ";
                    if (!string.IsNullOrWhiteSpace(filter.Where.Phone))
                        filterCondition += $" AND mm.Phone_Number LIKE '%{filter.Where.Phone}%' ";
                    if (!string.IsNullOrWhiteSpace(filter.Where.Name))
                        filterCondition += $" AND CONCAT(mm.First_Name, ' ', mm.Last_Name) LIKE '%{filter.Where.Name}%' ";
                    if (!string.IsNullOrWhiteSpace(filter.Where.District))
                        filterCondition += $" AND mo.District_Id = '{filter.Where.District}' ";

                }

                // Step 5️⃣: Global search
                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string search = filter.SearchString.Trim();
                    filterCondition += $@" AND (
        mm.Member_Id LIKE '%{search}%'
        OR CONCAT(mm.First_Name, ' ', mm.Last_Name) LIKE '%{search}%'
        OR mm.Phone_Number LIKE '%{search}%'
        OR pad.Value LIKE '%{search}%'
        OR mdam.Status LIKE '%{search}%'
        OR cd.Value LIKE '%{search}%'
        OR (CASE WHEN mcam.IsCompleted = 1 THEN 'Yes' ELSE 'No' END) LIKE '%{search}%'
        OR mm.CollectedByName LIKE '%{search}%'
        OR mm.CollectedByPhoneNumber LIKE '%{search}%'
        OR DATE_FORMAT(mm.CollectedOn, '%d-%m-%Y') LIKE '%{search}%'
    )";
                }


                // Step 6️⃣: Count + Pagination
                string countQuery = "SELECT COUNT(1) FROM (" + baseQuery + filterCondition + ") AS countTable";
                totalCount = conn.ExecuteScalar<int>(countQuery, new { UserId = userId });

                string orderBy = " ORDER BY mm.ModifiedDate DESC ";
                if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter.Sorting.FieldName))
                {
                    string field = filter.Sorting.FieldName.ToLower();
                    string dir = string.IsNullOrWhiteSpace(filter.Sorting.Sort) ? "ASC" : filter.Sorting.Sort;
                    field = field switch
                    {
                        "memberid" => "mm.Member_Id",
                        "name" => "Name",
                        "phone" => "mm.Phone_Number",
                        "district" => "pad.Value",
                        _ => "mm.ModifiedDate"
                    };
                    orderBy = $" ORDER BY {field} {dir}";
                }

                string limitOffset = filter.Take > 0 ? $" LIMIT {filter.Take} OFFSET {filter.skip}" : "";
                string finalQuery = baseQuery + filterCondition + orderBy + limitOffset;

                return conn.Query<MemberGridModel>(finalQuery, new { UserId = userId }).ToList();
            }
        }
        // [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries
        public List<ApplicationGridModel> GetApplicationListByCollector(ApplicationFilterModelForAnimator filter, string userId, out int totalCount)
        {
            totalCount = 0;

            using (var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                conn.Open();

                // 1️⃣ Get logged-in user's mapping
                var user = conn.QueryFirstOrDefault<dynamic>(@"
            SELECT DistrictIds, BlockIds, CorporationIds, MunicipalityIds, 
                   TownPanchayatIds, VillagePanchayatIds, ZoneIds 
            FROM account_user 
            WHERE UserId = @UserId", new { UserId = userId });

                if (user == null)
                    return new List<ApplicationGridModel>();

                // 2️⃣ Build dynamic filters (no FIND_IN_SET)
                var areaConditions = new List<string>();

                string ToInClause(string ids)
                {
                    if (string.IsNullOrWhiteSpace(ids)) return string.Empty;
                    var list = ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                  .Select(x => $"'{x.Trim()}'");
                    return string.Join(",", list);
                }

                if (!string.IsNullOrWhiteSpace((string)user.DistrictIds))
                {
                    string districtIn = ToInClause((string)user.DistrictIds);
                    if (!string.IsNullOrEmpty(districtIn))
                        areaConditions.Add($"a.DistrictIds IN ({districtIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.BlockIds))
                {
                    string blockIn = ToInClause((string)user.BlockIds);
                    if (!string.IsNullOrEmpty(blockIn))
                        areaConditions.Add($"a.BlockIds IN ({blockIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.CorporationIds))
                {
                    string corpIn = ToInClause((string)user.CorporationIds);
                    if (!string.IsNullOrEmpty(corpIn))
                        areaConditions.Add($"a.CorporationIds IN ({corpIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.MunicipalityIds))
                {
                    string muniIn = ToInClause((string)user.MunicipalityIds);
                    if (!string.IsNullOrEmpty(muniIn))
                        areaConditions.Add($"a.MunicipalityIds IN ({muniIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.TownPanchayatIds))
                {
                    string townIn = ToInClause((string)user.TownPanchayatIds);
                    if (!string.IsNullOrEmpty(townIn))
                        areaConditions.Add($"a.TownPanchayatIds IN ({townIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.VillagePanchayatIds))
                {
                    string villageIn = ToInClause((string)user.VillagePanchayatIds);
                    if (!string.IsNullOrEmpty(villageIn))
                        areaConditions.Add($"a.VillagePanchayatIds IN ({villageIn})");
                }

                if (!string.IsNullOrWhiteSpace((string)user.ZoneIds))
                {
                    string zoneIn = ToInClause((string)user.ZoneIds);
                    if (!string.IsNullOrEmpty(zoneIn))
                        areaConditions.Add($"a.ZoneIds IN ({zoneIn})");
                }

                string dynamicCondition = areaConditions.Count > 0
                    ? " AND (" + string.Join(" AND ", areaConditions) + ")"
                    : "";

                // 3️⃣ Base query
                string baseQuery = $@"
            SELECT 
                am.SchemeId,
                am.StatusId,
                am.TemporaryNumber,
                am.ApplicationNumber,
                am.MemberName,
                am.ApplicantName,
                am.mobile,
                ad.Id AS DetailId,
                ad.ApplicationId,
                am.CollectedByPhoneNumber AS CollectedByPhoneNumber,
                aam.District AS DistrictId,
                dist.Value AS DistrictName,
                ad.MemberId AS MemberId,
                status1.Value AS Status,
                status1.Code AS StatusCode,
                scheme.Value AS Scheme,
                am.CreatedBy,
                am.CreatedByUserName,
                am.CreatedDate,
                am.Modifiedby,
                am.ModifiedByUserName,
                am.ModifiedDate,
                am.Deletedby,
                am.DeletedByUserName,
                am.DeletedDate,
                am.BulkApprovedby,
                am.BulkApprovedByUserName,
                am.BulkApprovedDate,
                am.SubmittedDate,
                CASE
                    WHEN status1.Code = 'SAVED' 
                         AND DATEDIFF(CURDATE(), am.ModifiedDate) > 30 THEN 1 
                    ELSE 0 
                END AS IsExpired
            FROM application_details ad
            INNER JOIN application_master am ON am.Id = ad.ApplicationId
            INNER JOIN two_column_configuration_values status1 ON status1.Id = am.StatusId
            INNER JOIN two_column_configuration_values scheme ON scheme.Id = am.SchemeId
            LEFT JOIN member_address_master aam ON aam.MemberId = ad.MemberId AND AddressType = 'PERMANENT'
INNER JOIN two_column_configuration_values dist 
    ON dist.Id = aam.District  
            WHERE am.CollectedByPhoneNumber IN (
                SELECT DISTINCT TRIM(a.Mobile)
                FROM account_user a
                JOIN account_user u ON u.UserId = @UserId
                JOIN account_role r ON r.Id = a.RoleId
                WHERE r.RoleCode IN ('DO', 'DC')
                AND TRIM(COALESCE(a.Mobile, '')) <> ''
                {dynamicCondition}
            )";

                // 4️⃣ Filtering (optional search fields)
                //string filterCondition = "";
                //if (filter?.Where != null)
                //{
                //    if (!string.IsNullOrWhiteSpace(filter.Where.ApplicationNumber))
                //        filterCondition += $" AND am.ApplicationNumber LIKE '%{filter.Where.ApplicationNumber}%'";
                //    if (!string.IsNullOrWhiteSpace(filter.Where.Status))
                //        filterCondition += $" AND status1.Value LIKE '%{filter.Where.Status}%'";
                //    if (!string.IsNullOrWhiteSpace(filter.Where.Scheme))
                //        filterCondition += $" AND scheme.Value LIKE '%{filter.Where.Scheme}%'";
                //    if (!string.IsNullOrWhiteSpace(filter.Where.District))
                //        filterCondition += $" AND aam.District = '{filter.Where.District}'";
                //}
                // 4️⃣ Filtering (optional search fields)
                string filterCondition = "";
                if (filter?.Where != null)
                {
                    if (!string.IsNullOrWhiteSpace(filter.Where.ApplicationNumber))
                        filterCondition += $" AND am.ApplicationNumber LIKE '%{filter.Where.ApplicationNumber}%'";

                    // Filter by StatusId instead of Value
                    if (!string.IsNullOrWhiteSpace(filter.Where.Status))
                        filterCondition += $" AND am.StatusId = '{filter.Where.Status}'";

                    // Filter by SchemeId instead of Value
                    if (!string.IsNullOrWhiteSpace(filter.Where.Scheme))
                        filterCondition += $" AND am.SchemeId = '{filter.Where.Scheme}'";

                    // District filter (if applicable, based on ID)
                    if (!string.IsNullOrWhiteSpace(filter.Where.District))
                        filterCondition += $" AND aam.District = '{filter.Where.District}'";
                }

                // 5️⃣ Global search
                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string search = filter.SearchString.Trim();
                    filterCondition += $@" AND (
        am.TemporaryNumber LIKE '%{search}%'
        OR scheme.Value LIKE '%{search}%'
        OR status1.Value LIKE '%{search}%'
        OR dist.Value LIKE '%{search}%'
        OR am.CreatedByUserName LIKE '%{search}%'
        OR am.Mobile LIKE '%{search}%'
        OR DATE_FORMAT(am.CreatedDate, '%d-%m-%Y') LIKE '%{search}%'
    )";
                }


                // 6️⃣ Count + pagination
                string countQuery = "SELECT COUNT(1) FROM (" + baseQuery + filterCondition + ") AS countTable";
                totalCount = conn.ExecuteScalar<int>(countQuery, new { UserId = userId });

                string orderBy = " ORDER BY am.ModifiedDate DESC ";
                if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter.Sorting.FieldName))
                {
                    string field = filter.Sorting.FieldName.ToLower();
                    string dir = string.IsNullOrWhiteSpace(filter.Sorting.Sort) ? "ASC" : filter.Sorting.Sort;
                    field = field switch
                    {
                        "applicationnumber" => "am.ApplicationNumber",
                        "status" => "status1.Value",
                        "scheme" => "scheme.Value",
                        _ => "am.ModifiedDate"
                    };
                    orderBy = $" ORDER BY {field} {dir}";
                }

                string limitOffset = filter.Take > 0 ? $" LIMIT {filter.Take} OFFSET {filter.skip}" : "";
                string finalQuery = baseQuery + filterCondition + orderBy + limitOffset;

                return conn.Query<ApplicationGridModel>(finalQuery, new { UserId = userId }).ToList();
            }
        }
    }
}
