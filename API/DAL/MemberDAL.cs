using AutoMapper.Execution;
using Dapper;
using Microsoft.Extensions.Configuration;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Model.ViewModel.MemberModels;
using MySql.Data.MySqlClient;
using System;
using System.Data;
using System.Reflection;
using System.Threading.Tasks;
using Utils.Cache.Configuration;

namespace DAL
{
    public class MemberDAL
    {
        private readonly IConfiguration _configuration;
        private readonly string connectionId = "Default";
        private readonly IConfigurationCacheService _configCache;
        public MemberDAL(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        //created by surya
        public MemberDetails GetMemberDetailsByRequestId(string requestId)
        {
            string query = @"
SELECT 
    mm.*, mo.District_Id,
    mdam.IsCompleted AS pIsCompleted, 
    mdam.Status AS pStatus
FROM member_data_approval_master mdam
JOIN member_master mm ON mdam.Member_Id = mm.Id
LEFT JOIN member_organization mo on mm.Id=mo.Member_Id
WHERE mdam.Id = @RequestId";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return connection.QueryFirstOrDefault<MemberDetails>(query, new { RequestId = requestId });
        }



        #region Common
        public MemberGetModels Member_Get_All(string MemberId)
        {
            MemberGetModels model = new MemberGetModels();
            dynamic @params = new
            {
                pMemberId = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            var multi = SqlMapper.QueryMultiple(connection, "Application_Member_Get_All", @params, commandType: CommandType.StoredProcedure);

            List<MemberDetailsModel> memberDetailsList = multi.Read<MemberDetailsModel>();
            model.MemberDetails = memberDetailsList?.FirstOrDefault() ?? new MemberDetailsModel();

            List<OrganizationDetailModel> organizationList = multi.Read<OrganizationDetailModel>();
            model.OrganizationDetail = organizationList?.FirstOrDefault() ?? new OrganizationDetailModel();

            model.FamilyMembers = multi.Read<FamilyMemberModel>();

            List<BankDetailModel> bankList = multi.Read<BankDetailModel>();
            model.BankDetail = bankList?.FirstOrDefault() ?? new BankDetailModel();

            model.AllAddressMaster = multi.Read<ApplicationAddressMaster>();

            model.MemberDocuments = multi.Read<MemberDocumentMaster>();
            model.MemberNonMandatoryDocuments = multi.Read<MemberDocumentMaster>();

            return model;
        }


        //modified by Indu on 28-10-2025 for applications(for data checker,RDC,C and others logins dynamically) 
        public List<MemberGridViewModel> MemberGridGet(MemberFilterModel filter, out int TotalCount)
        {
            TotalCount = 0;

            // Removed Configuration Table joins - Elanjsuriyan [29-12-2025]
            //string Query = @"select distinct mm.Id,
                                     string Query = @"select mm.Id,
                                                mm.Member_Id, CONCAT(mm.First_Name, ' ', mm.Last_Name) as 'Name', mm.Phone_Number as 'Phone',
                                                mm.ModifiedBy as 'UpdatedBy', mm.ModifiedByUserName as 'UpdatedByUserName', mm.ModifiedDate as 'UpdatedDate',
                                               -- pad.Value as 'District',
                                                 CASE 
                                                    WHEN mm.IsApproved = 1 THEN 'No' 
                                                    ELSE 'Yes' 
                                                 END AS `IsApprovalPending`,
                                                mm.IsApproved,
                                                 mm.Date_Of_Birth AS MemberBirthday,
                                                mo.Local_Body as LocalBody,
                                                  --  bl.Value AS Block,
                                                  -- vp.Value AS VillagePanchayat,
                                                    mo.Name_of_Local_Body AS NameOfLocalBody,
                                                  --  corporation.Value AS Corporation,
                                                  --  Municipality.Value AS Municipality,
                                                   -- TownPanchayat.Value AS TownPanchayat,
                                                   -- Zone.Value AS Zone,
                                                mdam.Id as 'DataApprovalId',
                                                mdam.Changed_Detail_Record as changedDetailRecord,
                                                mdam.Status,mdam.IsCompleted as IsApprovalCompleted,
                                                -- lastAppRole.RoleName as 'ApprovedByRole',
                                               nextAppRole.RoleName as 'NextApprovalRole',
                                               -- (cd.Value )AS 'CardStatus',
                                               CASE WHEN mcam.IsCompleted = 1 THEN 'Yes' ELSE 'No' END AS 'CardDisbursedStatus',
                                                mm.CollectedByName,
                                                mm.CollectedByPhoneNumber,
                                                mm.CollectedOn,
                                                mo.District_Id        AS DistrictId,
                                                mcam.StatusId         AS CardStatusId,
                                                mo.Block              AS BlockId,
                                                mo.Zone               AS ZoneId,
                                                mo.Organization_Type  AS OrganizationTypeId,
                                                mm.AadhaarVerified,
                                                -- mm.PdsVerified,
                                                -- mfm.PdsVerified AS PdsVerified,
                                                (
                                                  SELECT MAX(PdsVerified)
                                                  FROM member_family_member mf
                                                  WHERE mf.Member_Id = mm.Id
                                                ) AS PdsVerified,
                                                mo.MLA_Constituency AS MLA_ConstituencyId,
                                                mo.MP_Constituency As MP_ConstituencyId,
                                                mo.Employer_Type AS Employer_TypeId,
                                                mo.Work_Office AS Work_OfficeId,
                                                mo.Type_of_Work AS TypeofWorkId
                                                from member_master mm 
                                                left  join member_data_approval_master mdam on mdam.Member_Id = mm.Id 
                                                left join member_organization mo on mo.Member_Id = mm.Id AND ifnull(mo.IsActive,0) = 1 
                                               -- LEFT JOIN member_data_approval_history mdah ON mdah.Member_Detail_Approval_Master_Id = mdam.Id
                                                -- LEFT JOIN ( SELECT h1.* FROM member_data_approval_history h1 INNER JOIN ( SELECT Member_Detail_Approval_Master_Id, MAX(CreatedOn) AS MaxCreatedOn FROM member_data_approval_history GROUP BY Member_Detail_Approval_Master_Id) h2
                                                -- ON h1.Member_Detail_Approval_Master_Id = h2.Member_Detail_Approval_Master_Id AND h1.CreatedOn = h2.MaxCreatedOn) mdah
                                               -- ON mdah.Member_Detail_Approval_Master_Id = mdam.Id
                                                LEFT JOIN (
                                              SELECT
                                                Member_Detail_Approval_Master_Id,
                                                Status,
                                                CreatedOn
                                              FROM (
                                                SELECT
                                                  Member_Detail_Approval_Master_Id,
                                                  Status,
                                                  CreatedOn,
                                                  ROW_NUMBER() OVER (
                                                    PARTITION BY Member_Detail_Approval_Master_Id
                                                    ORDER BY CreatedOn DESC
                                                  ) AS rn
                                                FROM member_data_approval_history
                                              ) ranked
                                              WHERE rn = 1
                                            ) mdah ON mdah.Member_Detail_Approval_Master_Id = mdam.Id
                                                -- left join member_address_master mam on mam.MemberId = mm.Id AND AddressType = 'PERMANENT' AND mam.IsActive = 1 AND mam.IsTemp = 0
                                                 left join two_column_configuration_values pad on  mo.District_Id=pad.Id 
                                                left join member_card_approval_master mcam on mm.Id=mcam.Member_Id AND mcam.IsActive = 1
                                                -- LEFT JOIN (SELECT Member_Id, MAX(PdsVerified) AS PdsVerified FROM member_family_member GROUP BY Member_Id) mfm ON mm.Id = mfm.Member_Id 
                                               -- LEFT JOIN member_family_member mfm ON mfm.Member_Id = mm.Id
                                              --  left join two_column_configuration_values cd on cd.Id=mcam.StatusId
                                               -- left join account_role lastAppRole on lastAppRole.Id = mdam.ApprovedBy
                                                left join account_role nextAppRole on nextAppRole.Id = mdam.Approval_For";

            //                           -- LEFT JOIN two_column_configuration_values lb ON lb.Id=mo.Local_Body
            //                            LEFT JOIN two_column_configuration_values bl ON bl.Id=mo.Block
            //                            LEFT JOIN two_column_configuration_values vp ON vp.Id=mo.Village_Panchayat
            //                            -- LEFT JOIN two_column_configuration_values nlb ON nlb.Id=mo.Name_of_Local_Body
            //                            LEFT JOIN two_column_configuration_values corporation ON corporation.Id=mo.Corporation
            //                            LEFT JOIN two_column_configuration_values Municipality ON Municipality.Id=mo.Municipality
            //                            LEFT JOIN two_column_configuration_values TownPanchayat ON TownPanchayat.Id=mo.Town_Panchayat
            //                            LEFT JOIN two_column_configuration_values Zone ON Zone.Id=mo.Zone
            //";

            string CountQuery = @"select 
                                               -- COUNT(mm.Id)
                                               COUNT(1)
                                               from member_master mm 
                                               -- left  join member_data_approval_master mdam on mdam.Member_Id = mm.Id 
                                                FORCE INDEX (idx_member_grid_filter) STRAIGHT_JOIN member_data_approval_master mdam on mdam.Member_Id = mm.Id
                                                -- left join member_organization mo on mo.Member_Id = mm.Id AND ifnull(mo.IsActive,0) = 1 AND ifnull(mo.IsTemp,0) = 0
                                               -- left join member_address_master mam on mam.MemberId = mm.Id AND AddressType = 'PERMANENT' AND mam.IsActive = 1 AND mam.IsTemp = 0
                                               -- left join two_column_configuration_values pad on  mo.District_Id=pad.Id 
                                              --  left join member_card_approval_master mcam on mm.Id=mcam.Member_Id 
                                              --  left join two_column_configuration_values cd on cd.Id=mcam.StatusId
                                               -- left join account_role lastAppRole on lastAppRole.Id = mdam.ApprovedBy
                                               -- left join account_role nextAppRole on nextAppRole.Id = mdam.Approval_For
                                               ";

            if (filter != null)
            {
                #region Build Query Conditions


                //string Condition = " WHERE mm.IsSubmitted = 1 AND mm.IsTemp = 0 AND ";
                //string Condition = " WHERE (mm.IsTemp = 0 OR mm.IsTemp IS NULL) AND ";
                string Condition = " WHERE IFNULL(mm.IsTemp,0) = 0 AND ";

                if (filter.Where != null)
                {
                    if (filter.Where.IsSubmitted == true)
                    {
                        Condition += " mm.IsSubmitted = 1 AND ";
                    }
                    else if (filter.Where.IsSubmitted == false)
                    {
                        //  Condition += " (mm.IsSubmitted = 0 OR mm.IsSubmitted IS NULL or mm.IsSubmitted=1) AND ";
                    }
                    // Updated By Sivasankar K on 14/01/2026 for Health Worker Type filter
                    List<string> orgProps = new List<string>
                                        {
                                            "Type_of_Work", "Core_Sanitary_Worker_Type","Health_Worker_Type", "Organization_Type", "Nature_of_Job",
                                            "Local_Body", "Name_of_Local_Body", "Zone", "Block",
                                            "Village_Panchayat", "Corporation", "Municipality", "Town_Panchayat", "District_Id"
                                        };
                    PropertyInfo[] whereProperties = typeof(MemberWhereClauseProperties).GetProperties();
                    foreach (var property in whereProperties)
                    {
                        var value = property.GetValue(filter.Where)?.ToString() ?? "";
                        if (!string.IsNullOrWhiteSpace(value))
                        {
                            if (property.Name == "Year")
                            {
                                List<string> Years = value.Split('-')?.ToList() ?? new List<string>();
                                DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
                                DateTime toExclusive = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

                                // Updated For Date Format [27-12-2025] - Elanjsuriyan 
                                //Condition += " DATE(mm.ModifiedDate) >= '" + from.ToString("yyyy-MM-dd") + "' AND DATE(mm.ModifiedDate) <= '" + to.ToString("yyyy-MM-dd") + "' AND ";
                                Condition += $" mm.ModifiedDate >= '{from:yyyy-MM-dd HH:mm:ss}' " + $" AND mm.ModifiedDate < '{toExclusive:yyyy-MM-dd HH:mm:ss}' AND ";
                                // Condition += $" mm.ModifiedDate >= '{from:yyyy-MM-dd}' AND mm.ModifiedDate < '{to.AddDays(1):yyyy-MM-dd}' AND ";
                            }
                            else if (property.Name == "IsActive")
                            {
                                int activeVal = value.Equals("True", StringComparison.OrdinalIgnoreCase) ? 1 : 0;

                                Condition += " mm.IsActive = " + activeVal + " AND ";
                            }
                            // Updated For Date Format [27-12-2025] - Elanjsuriyan 

                            //else if (property.Name == "FromDate")
                            //{
                            //    Condition += " DATE(mm.ModifiedDate) >= '" + filter.Where.FromDate?.ToString("yyyy-MM-dd") + "' AND DATE(mm.ModifiedDate) <= '" + filter.Where.ToDate?.ToString("yyyy-MM-dd") + "' AND ";
                            //}
                            else if (property.Name == "FromDate")
                            {
                                if (filter.Where.FromDate.HasValue && filter.Where.ToDate.HasValue)
                                {
                                    DateTime from = filter.Where.FromDate.Value.Date;
                                    DateTime toExclusive = filter.Where.ToDate.Value.Date.AddDays(1);

                                    Condition += $" mm.ModifiedDate >= '{from:yyyy-MM-dd HH:mm:ss}' " +
                                                 $"AND mm.ModifiedDate < '{toExclusive:yyyy-MM-dd HH:mm:ss}' AND ";
                                }
                            }
                            else if (property.Name == "Changed_Detail_Records" && filter.Where.Changed_Detail_Records?.Count > 0)
                            {
                                string Changed_Detail_RecordsConditions = "";
                                List<string> Changed_Detail_RecordsList = new List<string>();
                                filter.Where.Changed_Detail_Records.ForEach(x =>
                                {
                                    Changed_Detail_RecordsList.Add(" (mdam.Changed_Detail_Record = '" + x + "') ");
                                });
                                Changed_Detail_RecordsConditions = string.Join(" OR ", Changed_Detail_RecordsList);



                                Condition += "(" + Changed_Detail_RecordsConditions + ") AND ";
                            }

                            //                   else if (property.Name == "DistrictIds"
                            //&& filter.Where.DistrictIds?.Count() > 0
                            //&& (filter.Where.user_Role == "ADM" || filter.Where.user_Role == "HQ"))
                            //                   {
                            //                       string districtConditions = "";
                            //                       List<string> distList = new List<string>();
                            //                       filter.Where.DistrictIds.ForEach(x =>
                            //                       {
                            //                           distList.Add(" (mo.District_Id = '" + x + "') ");
                            //                       });
                            //                       districtConditions = string.Join(" OR ", distList);

                            //                       Condition += "( (mo.District_Id = '') or (mo.District_Id is null) OR " + districtConditions + ") AND ";
                            //                   }

                            else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0 && (filter.Where.user_Role == "ADM" || filter.Where.user_Role == "HQ"))
                            {

                                string inClause = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));

                                // For ADM/HQ: include empty / null OR the matching list
                                Condition += $"(mo.District_Id IS NULL OR mo.District_Id = '' OR mo.District_Id IN ({inClause})) AND ";
                            }


                            //else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0 && (filter.Where.user_Role != "ADM" || filter.Where.user_Role != "HQ"))
                            //{
                            //    string districtConditions = "";
                            //    List<string> distList = new List<string>();
                            //    filter.Where.DistrictIds.ForEach(x =>
                            //    {
                            //        distList.Add(" (mo.District_Id = '" + x + "') ");
                            //    });
                            //    districtConditions = string.Join(" OR ", distList);

                            //    Condition += "(" + districtConditions + ") AND ";
                            //}
                            else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0 && (filter.Where.user_Role != "ADM" && filter.Where.user_Role != "HQ"))
                            {
                                string inClause = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));
                                Condition += $"(mo.District_Id IN ({inClause})) AND ";
                            }



                            //else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0)
                            //{
                            //    string inClause = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));

                            //    if (filter.Where.user_Role == "ADM" || filter.Where.user_Role == "HQ")
                            //    {
                            //        // ADM/HQ sees all + unassigned
                            //        Condition += $"(COALESCE(NULLIF(mo.District_Id,''),'0') IN ('0',{inClause})) AND ";
                            //    }
                            //    else
                            //    {
                            //        // Others only see their districts
                            //        Condition += $"(mo.District_Id IN ({inClause})) AND ";
                            //    }
                            //}
                            else if (property.Name == "Approval_application_Status" && filter.Where.Approval_application_Status?.Count() <= 0)
                            {
                                Condition += " mo.temp=0 and ";
                            }
                            else if (property.Name == "cardstatusId" && filter.Where.cardstatusId?.Count() > 0)
                            {
                                string cardstatusIdConditions = "";
                                List<string> distList = new List<string>();
                                filter.Where.cardstatusId.ForEach(x =>
                                {
                                    distList.Add(" (mcam.StatusId = '" + x + "') ");
                                });
                                cardstatusIdConditions = string.Join(" OR ", distList);

                                Condition += "(" + cardstatusIdConditions + ") AND ";
                            }

                            else if (property.Name == "Application_Status" && filter.Where.Application_Status?.Count > 0)
                            {
                                List<string> statusConditions = new List<string>();

                                foreach (var rawStatus in filter.Where.Application_Status)
                                {
                                    var status = rawStatus?.Trim().ToUpper();

                                    if (status == "RETURNED")
                                    {
                                        // LAST history status must be RETURNED
                                        statusConditions.Add(@" (
                                        UPPER(mdah.Status) = 'RETURNED' AND mdah.CreatedOn = (
                                        SELECT MAX(h.CreatedOn) FROM member_data_approval_history h WHERE h.Member_Detail_Approval_Master_Id = mdah.Member_Detail_Approval_Master_Id ))");
                                    }
                                    else
                                    {
                                        // Normal statuses → master table
                                        statusConditions.Add($" (UPPER(mdam.Status) = '{status}') ");
                                    }
                                }

                                string finalCondition = string.Join(" OR ", statusConditions);
                                Condition += $"({finalCondition}) AND ";
                            }
                            else if (property.Name == "Approval_application_Status" && filter.Where.Approval_application_Status == "Approvals")
                            {

                                Condition += " mdam.Approval_For = '" + filter.Where.user_RoleId + "' AND  mdam.IsCompleted=0 AND ";
                            }



                            else if (property.Name == "Local_Body")
                            {

                                Condition += " mo.Local_Body = '" + value + "' AND ";
                            }
                            else if (property.Name == "Local_Bodys" && filter.Where.Local_Bodys?.Count > 0)
                            {
                                string Local_BodysConditions = "";
                                List<string> Local_BodysList = new List<string>();
                                filter.Where.Local_Bodys.ForEach(x =>
                                {
                                    Local_BodysList.Add(" (mo.Local_Body = '" + x + "') ");
                                });
                                Local_BodysConditions = string.Join(" OR ", Local_BodysList);

                                Condition += "(" + Local_BodysConditions + ") AND ";
                            }
                            else if (property.Name == "Name_of_Local_Body")
                            {

                                Condition += " mo.Name_of_Local_Body = '" + value + "' AND ";
                            }

                            else if (property.Name == "Name_of_Local_Bodys" && filter.Where.Name_of_Local_Bodys?.Count > 0)
                            {
                                string Name_of_Local_BodysConditions = "";
                                List<string> Name_of_Local_BodysList = new List<string>();
                                filter.Where.Name_of_Local_Bodys.ForEach(x =>
                                {
                                    Name_of_Local_BodysList.Add(" (mo.Name_of_Local_Body = '" + x + "') ");
                                });
                                Name_of_Local_BodysConditions = string.Join(" OR ", Name_of_Local_BodysList);

                                Condition += "(" + Name_of_Local_BodysConditions + ") AND ";
                            }

                            else if (property.Name == "Zone")
                            {

                                var zones = filter.Where.Zone.ToString()
                                        .Replace("\n", "") // remove newlines
                                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                        .Select(x => $"'{x.Trim()}'");

                                string inClause = string.Join(",", zones);

                                Condition += $"(mo.Zone IN ({inClause})) AND ";
                            }
                            else if (property.Name == "Block")
                            {

                                Condition += " mo.Block = '" + value + "' AND ";
                            }
                            else if (property.Name == "Village_Panchayat")
                            {

                                Condition += " mo.Village_Panchayat = '" + value + "' AND ";
                            }
                            else if (property.Name == "Corporation")
                            {

                                Condition += " mo.Corporation = '" + value + "' AND ";
                            }
                            else if (property.Name == "Municipality")
                            {

                                Condition += " mo.Municipality = '" + value + "' AND ";
                            }
                            else if (property.Name == "Town_Panchayat")
                            {

                                Condition += " mo.Town_Panchayat = '" + value + "' AND ";
                            }

                            else if (orgProps.Contains(property.Name))
                            {
                                Condition += " mo." + property.Name + "= '" + value + "' AND ";
                            }
                            else if (property.Name == "CollectedByPhoneNumber")
                            {
                                Condition += " mm." + property.Name + " like '%" + value + "%' AND ";
                            }
                            else if (property.Name == "CollectedByName")
                            {
                                Condition += " mm." + property.Name + " like '%" + value + "%' AND ";
                            }

                            else if (property.Name == "Mobile" && filter.Where.Mobile?.Count > 0)
                            {

                                string inClause = string.Join(",", filter.Where.Mobile.Select(x => $"'{x}'"));


                                Condition += $"( mm.CollectedByPhoneNumber IN ({inClause})) AND ";

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
                                columnName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                            }
                            else if (string.Equals(item.FieldName, "Phone", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Phone_Number";
                            }
                            else if (string.Equals(item.FieldName, "Member_Id", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Member_Id";
                            }
                            else if (string.Equals(item.FieldName, "CollectedByName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CollectedByName";
                            }
                            else if (string.Equals(item.FieldName, "CollectedByPhoneNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CollectedByPhoneNumber";
                            }
                            else if (string.Equals(item.FieldName, "CollectedOn", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(mm.CollectedOn, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "ModifiedByUserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.ModifiedByUserName";
                            }
                            else if (string.Equals(item.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "pad.Value";
                            }
                            else if (string.Equals(item.FieldName, "CardStatus", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "cd.Value";
                            }
                            else if (string.Equals(item.FieldName, "Application_Status", StringComparison.CurrentCultureIgnoreCase))
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
                                            "mm.Member_Id",
                                            "mm.Phone_Number",
                                            "CONCAT(mm.First_Name, ' ', mm.Last_Name)",
                                            "mm.ModifiedByUserName",
                                            "mdam.Status",
                                            "pad.Value",
                                            //"cd.Value",
                                            "DATE_FORMAT(mm.ModifiedDate, '%d-%m-%Y')", "mm.CollectedByName", "mm.CollectedByPhoneNumber", "DATE_FORMAT(mm.CollectedOn, '%d-%m-%Y')"
                                        };
                    foreach (var column in columnsToSearch)
                    {
                        string currentSearchString = column == "mm.Member_Id" ? memberIdSearchString : originalSearchString;
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

                // Updated [27-12-2025] for dynamic count query joins - Elanjsuriyan
                //CountQuery = CountQuery + Condition;

                if (filter.Where?.DistrictIds?.Count > 0)
                {
                    //CountQuery += " LEFT JOIN member_organization mo ON mo.Member_Id = mm.Id AND IFNULL(mo.IsActive,0)=1 AND IFNULL(mo.IsTemp,0)=0 ";
                    CountQuery += "LEFT JOIN member_organization mo ON mo.Member_Id = mm.Id AND (mo.IsActive = 1 OR mo.IsActive IS NULL) AND (mo.IsTemp = 0 OR mo.IsTemp IS NULL)";
                }

                if (filter.Where?.cardstatusId?.Count > 0)
                {
                    CountQuery += " LEFT JOIN member_card_approval_master mcam ON mm.Id = mcam.Member_Id ";
                }

                if (filter.Where?.Application_Status?.Count > 0)
                {
                    //CountQuery += " LEFT JOIN member_data_approval_master mdam ON mdam.Member_Id = mm.Id ";
                    CountQuery += " LEFT JOIN member_data_approval_history mdah ON mdah.Member_Detail_Approval_Master_Id = mdam.Id ";
                }
                if(filter.Sorting.FieldName=="district" || !string.IsNullOrWhiteSpace(filter.SearchString))
                {
                    CountQuery += "left join two_column_configuration_values pad on  mo.District_Id=pad.Id ";
                }
                if (filter.Sorting.FieldName == "cardStatus")
                {
                    CountQuery += "left join two_column_configuration_values cd on cd.Id=mcam.StatusId ";
                }



                CountQuery += Condition;

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
                            FieldName = "mm.Member_Id";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Phone", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Phone_Number";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedByName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedByName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedByPhoneNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedByPhoneNumber";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedOn", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedOn";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CardStatus", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "cd.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "pad.Value";
                        }
                       
                        else
                        {
                            FieldName = "mm.ModifiedDate";
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
                        Condition += " ORDER BY mm.ModifiedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY mm.ModifiedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return SqlMapper.Query<MemberGridViewModel>(conn, Query, commandTimeout: 180, commandType: CommandType.Text)?.ToList() ?? new List<MemberGridViewModel>();
                }
            }

            return null;
        }


        //    public List<MemberGridViewModel> MemberGridGet(MemberFilterModel filter, out int TotalCount)
        //    {
        //        TotalCount = 0;

        //        var sqlWhere = new List<string>();
        //        var param = new DynamicParameters();

        //        sqlWhere.Add("(mm.IsTemp = 0 OR mm.IsTemp IS NULL)");

        //        #region WHERE CONDITIONS (NO REFLECTION)

        //        if (filter?.Where != null)
        //        {
        //            if (filter.Where.IsSubmitted == true)
        //                sqlWhere.Add("mm.IsSubmitted = 1");

        //            if (filter.Where.FromDate.HasValue && filter.Where.ToDate.HasValue)
        //            {
        //                param.Add("@FromDate", filter.Where.FromDate.Value.Date);
        //                param.Add("@ToDate", filter.Where.ToDate.Value.Date.AddDays(1));
        //                sqlWhere.Add("mm.ModifiedDate >= @FromDate AND mm.ModifiedDate < @ToDate");
        //            }

        //            if (filter.Where.DistrictIds?.Any() == true)
        //            {
        //                param.Add("@DistrictIds", filter.Where.DistrictIds);
        //                sqlWhere.Add(@"EXISTS (
        //            SELECT 1 FROM member_organization mo 
        //            WHERE mo.Member_Id = mm.Id 
        //              AND IFNULL(mo.IsActive,0)=1 
        //              AND IFNULL(mo.IsTemp,0)=0
        //              AND mo.District_Id IN @DistrictIds)");
        //            }

        //            if (filter.Where.cardstatusId?.Any() == true)
        //            {
        //                param.Add("@CardStatusIds", filter.Where.cardstatusId);
        //                sqlWhere.Add(@"EXISTS (
        //            SELECT 1 FROM member_card_approval_master mcam 
        //            WHERE mcam.Member_Id = mm.Id 
        //              AND mcam.StatusId IN @CardStatusIds)");
        //            }

        //            if (!string.IsNullOrEmpty(filter.Where.Zone))
        //            {
        //                var zones = filter.Where.Zone.Split(',', StringSplitOptions.RemoveEmptyEntries);
        //                param.Add("@ZoneIds", zones);

        //                sqlWhere.Add(@"EXISTS (
        //            SELECT 1 FROM member_organization mo 
        //            WHERE mo.Member_Id = mm.Id 
        //              AND mo.Zone IN @ZoneIds)");
        //            }
        //        }

        //        #endregion

        //        #region GLOBAL SEARCH

        //        if (!string.IsNullOrWhiteSpace(filter?.SearchString))
        //        {
        //            param.Add("@Search", "%" + filter.SearchString.Trim() + "%");
        //            sqlWhere.Add(@"(
        //        mm.Member_Id LIKE @Search OR
        //        mm.Phone_Number LIKE @Search OR
        //        CONCAT(mm.First_Name,' ',mm.Last_Name) LIKE @Search OR
        //        mm.ModifiedByUserName LIKE @Search OR
        //        mm.CollectedByName LIKE @Search OR
        //        mm.CollectedByPhoneNumber LIKE @Search
        //    )");
        //        }

        //        #endregion

        //        var whereClause = sqlWhere.Count > 0
        //            ? " WHERE " + string.Join(" AND ", sqlWhere)
        //            : "";

        //        #region COUNT QUERY (FAST)

        //        var countSql = $@"
        //    SELECT COUNT(1)
        //    FROM member_master mm
        //    {whereClause};
        //";

        //        #endregion

        //        #region DATA QUERY (PAGINATION SAFE)

        //        string orderBy = "mm.ModifiedDate DESC";

        //        if (!string.IsNullOrEmpty(filter?.Sorting?.FieldName))
        //        {
        //            orderBy = filter.Sorting.FieldName switch
        //            {
        //                "Member_Id" => "mm.Member_Id",
        //                "Name" => "CONCAT(mm.First_Name,' ',mm.Last_Name)",
        //                "Phone" => "mm.Phone_Number",
        //                "CollectedOn" => "mm.CollectedOn",
        //                _ => "mm.ModifiedDate"
        //            };

        //            orderBy += filter.Sorting.Sort?.Equals("ASC", StringComparison.OrdinalIgnoreCase) == true
        //                ? " ASC"
        //                : " DESC";
        //        }

        //        var dataSql = $@"
        //    SELECT 
        //        mm.Id,
        //        mm.Member_Id,
        //        CONCAT(mm.First_Name,' ',mm.Last_Name) AS Name,
        //        mm.Phone_Number AS Phone,
        //        mm.ModifiedByUserName,
        //        mm.ModifiedDate,
        //        mm.IsApproved,
        //        mm.Date_Of_Birth AS MemberBirthday,
        //        mo.District_Id AS DistrictId,
        //        mo.Block AS BlockId,
        //        mo.Zone AS ZoneId,
        //        mo.Organization_Type AS OrganizationTypeId,
        //        mcam.StatusId AS CardStatusId
        //    FROM member_master mm
        //    LEFT JOIN member_organization mo 
        //        ON mo.Member_Id = mm.Id 
        //       AND IFNULL(mo.IsActive,0)=1 
        //       AND IFNULL(mo.IsTemp,0)=0
        //    LEFT JOIN member_card_approval_master mcam 
        //        ON mcam.Member_Id = mm.Id
        //    {whereClause}
        //    ORDER BY {orderBy}
        //    LIMIT @Take OFFSET @Skip;
        //";

        //        param.Add("@Take", filter?.Take ?? 10);
        //        param.Add("@Skip", filter?.Skip ?? 0);

        //        #endregion

        //        using var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId));

        //        TotalCount = conn.ExecuteScalar<int>(countSql, param);
        //        var result = conn.Query<MemberGridViewModel>(dataSql, param, commandTimeout: 60).ToList();

        //        return result;
        //    }


        public List<MemberGridViewModel> MemberGridGetforLocalBody(MemberFilterModel filter, out int TotalCount)
        {
            TotalCount = 0;

            string Query = @"SELECT 
    mm.Id,
    mcam.ApprovalComment AS 'Remarks',
    mm.Member_Id,
    pad.Value AS District,
    CONCAT(mm.First_Name,' ',mm.Last_Name) AS Name,
    mm.First_Name AS MemberFirstName,
    mm.Last_Name AS MemberLastName,
    mm.Father_Name AS MemberFatherOrHusbandName,
    mm.Date_Of_Birth AS MemberBirthday,
    gender.Value AS Gender,
    religion.Value AS Religion,
    community.Value AS MemberCommunity,
    caste.Value AS Caste,
    Marital_Status.Value AS MemberMaritalStatus,
    mm.Aadhaar_Number AS MemberAadhaarNumber,
    mm.Phone_Number AS Phone,
    mm.Email,
    mm.Ration_Card_Number AS MemberRationCardNumber,
    mm.ProfileUrl AS MemberProfileImage,
     CASE 
                                        WHEN mm.IsApproved = 1 THEN 'No' 
                                        ELSE 'Yes' 
                                     END AS `IsApprovalPending`,
mm.IsApproved,
    mdam.Changed_Detail_Record AS ChangedDetailRecord,
    mdam.Status,
    lastAppRole.RoleName AS ApprovedByRole,
    CASE WHEN ((mdam.Approval_For=(SELECT RoleId FROM approval_flow_master WHERE IFNULL(IsActive,0)=1 AND OrderNumber=1 LIMIT 1)) OR mm.IsApproved=1) 
              AND mm.IsActive=1 THEN 'Yes' ELSE 'No' END AS DMApproved,
    CASE WHEN mm.IsApproved=1 AND mm.IsActive=1 THEN 'Yes' ELSE 'No' END AS HQApproved,
    CASE WHEN mm.IsRejected=1 THEN 'Yes' ELSE 'No' END AS IsRejected,
    cardStatus.Value AS CardStatus,
    mo.Id AS OrganizationId,
    ot.Value AS OrganizationType,
    mo.Organisation_Name AS GovernmentOrganisationName,
    Designation.Value AS GovernmentDesignation,
    Nature_of_Job.Value AS GovernmentNatureOfJob,
    mo.Address AS GovernmentAddress,
    mo.Private_Organisation_Name AS PrivateOrganisationName,
    PrivateDesignation.Value AS PrivateDesignation,
    mo.Private_Address AS PrivateAddress,
    COALESCE(lb.Value,mo.Local_Body) AS LocalBody,
    COALESCE(bl.Value,mo.Block) AS Block,
    COALESCE(vp.Value,mo.Village_Panchayat) AS VillagePanchayat,
    COALESCE(nlb.Value,mo.Name_of_Local_Body) AS NameOfLocalBody,
    COALESCE(corporation.Value,mo.Corporation) AS Corporation,
    COALESCE(Municipality.Value,mo.Municipality) AS Municipality,
    COALESCE(TownPanchayat.Value,mo.Town_Panchayat) AS TownPanchayat,
    COALESCE(Zone.Value,mo.Zone) AS Zone,
    mo.New_Yellow_Card_Number AS NewYellowCardNumber,
    mo.Health_Id AS HealthId,
    CONCAT(mam.DoorNo,', ',mam.StreetName,', ',mam.VilllageTownCity,', ',mam.Taluk,', ',pad.Value,', ',mam.PinCode) AS PermanentAddress,
    CONCAT(mat.DoorNo,', ',mat.StreetName,', ',mat.VilllageTownCity,', ',mat.Taluk,', ',tad.Value,', ',mat.PinCode) AS TemporaryAddress,
    mm.CollectedByName,
    mm.CollectedByPhoneNumber,
    mm.CollectedOn,
    mm.ModifiedBy AS UpdatedBy,
    mm.ModifiedByUserName AS UpdatedByUserName,
    mm.ModifiedDate AS UpdatedDate,
    mm.CreatedBy,
    mm.CreatedByUserName,
    mm.CreatedDate,
    mm.DeletedBy,
    mm.DeletedByUserName,
    mm.DeletedDate,
    mm.IsSubmitted
FROM member_master mm
LEFT JOIN (
    SELECT m1.*
    FROM member_data_approval_master m1
    INNER JOIN (
        SELECT Member_Id, MAX(Id) AS MaxId
        FROM member_data_approval_master
        WHERE IsActive=1
        GROUP BY Member_Id
    ) m2 ON m1.Member_Id = m2.Member_Id AND m1.Id = m2.MaxId
) mdam ON mdam.Member_Id = mm.Id
LEFT JOIN (
    SELECT DISTINCT Member_Id 
    FROM member_data_approval_master 
    WHERE IsCompleted=0 AND IsActive=1
) mdam_pending ON mdam_pending.Member_Id=mm.Id
LEFT JOIN member_organization mo 
       ON mo.Member_Id=mm.Id AND mo.IsActive=1 AND mo.IsTemp=0
LEFT JOIN member_address_master mam 
       ON mam.MemberId=mm.Id AND mam.AddressType='PERMANENT'
LEFT JOIN member_address_master mat 
       ON mat.MemberId=mm.Id AND mat.AddressType='TEMPORARY' AND mat.IsActive=1 AND mat.IsTemp=0
LEFT JOIN two_column_configuration_values pad ON pad.Id=mam.District
LEFT JOIN two_column_configuration_values tad ON tad.Id=mat.District
LEFT JOIN two_column_configuration_values ot ON ot.Id=mo.Organization_Type
LEFT JOIN two_column_configuration_values gender ON gender.Id=mm.Gender
LEFT JOIN two_column_configuration_values religion ON religion.Id=mm.Religion
LEFT JOIN two_column_configuration_values community ON community.Id=mm.Community
LEFT JOIN two_column_configuration_values caste ON caste.Id=mm.Caste
LEFT JOIN two_column_configuration_values Marital_Status ON Marital_Status.Id=mm.Marital_Status
LEFT JOIN two_column_configuration_values Designation ON Designation.Id=mo.Designation
LEFT JOIN two_column_configuration_values PrivateDesignation ON PrivateDesignation.Id=mo.Private_Designation
LEFT JOIN two_column_configuration_values Nature_of_Job ON Nature_of_Job.Id=mo.Nature_of_Job
LEFT JOIN member_card_approval_master mcam ON mcam.Member_Id=mm.Id AND mcam.IsActive=1
LEFT JOIN two_column_configuration_values cardStatus ON cardStatus.Id=mcam.StatusId
LEFT JOIN two_column_configuration_values lb ON lb.Id=mo.Local_Body
LEFT JOIN two_column_configuration_values bl ON bl.Id=mo.Block
LEFT JOIN two_column_configuration_values vp ON vp.Id=mo.Village_Panchayat
LEFT JOIN two_column_configuration_values nlb ON nlb.Id=mo.Name_of_Local_Body
LEFT JOIN two_column_configuration_values corporation ON corporation.Id=mo.Corporation
LEFT JOIN two_column_configuration_values Municipality ON Municipality.Id=mo.Municipality
LEFT JOIN two_column_configuration_values TownPanchayat ON TownPanchayat.Id=mo.Town_Panchayat
LEFT JOIN two_column_configuration_values Zone ON Zone.Id=mo.Zone
LEFT JOIN account_role lastAppRole ON lastAppRole.Id=mdam.ApprovedBy

";



            string CountQuery = @" select count(*) from
member_master mm
LEFT JOIN (
    SELECT m1.*
    FROM member_data_approval_master m1
    INNER JOIN (
        SELECT Member_Id, MAX(Id) AS MaxId
        FROM member_data_approval_master
        WHERE IsActive=1
        GROUP BY Member_Id
    ) m2 ON m1.Member_Id = m2.Member_Id AND m1.Id = m2.MaxId
) mdam ON mdam.Member_Id = mm.Id
LEFT JOIN (
    SELECT DISTINCT Member_Id 
    FROM member_data_approval_master 
    WHERE IsCompleted=0 AND IsActive=1
) mdam_pending ON mdam_pending.Member_Id=mm.Id
LEFT JOIN member_organization mo 
       ON mo.Member_Id=mm.Id AND mo.IsActive=1 AND mo.IsTemp=0
LEFT JOIN member_address_master mam 
       ON mam.MemberId=mm.Id AND mam.AddressType='PERMANENT'
LEFT JOIN member_address_master mat 
       ON mat.MemberId=mm.Id AND mat.AddressType='TEMPORARY' AND mat.IsActive=1 AND mat.IsTemp=0
LEFT JOIN two_column_configuration_values pad ON pad.Id=mam.District
LEFT JOIN two_column_configuration_values tad ON tad.Id=mat.District
LEFT JOIN two_column_configuration_values ot ON ot.Id=mo.Organization_Type
LEFT JOIN two_column_configuration_values gender ON gender.Id=mm.Gender
LEFT JOIN two_column_configuration_values religion ON religion.Id=mm.Religion
LEFT JOIN two_column_configuration_values community ON community.Id=mm.Community
LEFT JOIN two_column_configuration_values caste ON caste.Id=mm.Caste
LEFT JOIN two_column_configuration_values Marital_Status ON Marital_Status.Id=mm.Marital_Status
LEFT JOIN two_column_configuration_values Designation ON Designation.Id=mo.Designation
LEFT JOIN two_column_configuration_values PrivateDesignation ON PrivateDesignation.Id=mo.Private_Designation
LEFT JOIN two_column_configuration_values Nature_of_Job ON Nature_of_Job.Id=mo.Nature_of_Job
LEFT JOIN member_card_approval_master mcam ON mcam.Member_Id=mm.Id AND mcam.IsActive=1
LEFT JOIN two_column_configuration_values cardStatus ON cardStatus.Id=mcam.StatusId
LEFT JOIN two_column_configuration_values lb ON lb.Id=mo.Local_Body
LEFT JOIN two_column_configuration_values bl ON bl.Id=mo.Block
LEFT JOIN two_column_configuration_values vp ON vp.Id=mo.Village_Panchayat
LEFT JOIN two_column_configuration_values nlb ON nlb.Id=mo.Name_of_Local_Body
LEFT JOIN two_column_configuration_values corporation ON corporation.Id=mo.Corporation
LEFT JOIN two_column_configuration_values Municipality ON Municipality.Id=mo.Municipality
LEFT JOIN two_column_configuration_values TownPanchayat ON TownPanchayat.Id=mo.Town_Panchayat
LEFT JOIN two_column_configuration_values Zone ON Zone.Id=mo.Zone
LEFT JOIN account_role lastAppRole ON lastAppRole.Id=mdam.ApprovedBy";



            if (filter != null)
            {
                #region Build Query Conditions

                string Condition = " WHERE (mm.IsTemp = 0 OR mm.IsTemp IS NULL) AND ";



                if (filter.Where != null)
                {

                    List<string> orgProps = new List<string>
  {
  "Type_of_Work", "Core_Sanitary_Worker_Type", "Organization_Type", "Nature_of_Job",
  "Local_Body", "Name_of_Local_Body", "Zone", "Block",
  "Village_Panchayat", "Corporation", "Municipality", "Town_Panchayat", "District_Id"
  };
                    PropertyInfo[] whereProperties = typeof(MemberWhereClauseProperties).GetProperties();
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



                                Condition += " DATE(mm.ModifiedDate) >= '" + from.ToString("yyyy-MM-dd") + "' AND DATE(mm.ModifiedDate) <= '" + to.ToString("yyyy-MM-dd") + "' AND ";
                            }
                            else if (property.Name == "IsActive")
                            {
                                Condition += " mm.IsActive = " + (value == "True" ? "1" : "0") + " AND ";
                            }
                            else if (property.Name == "cardstatusId" && filter.Where.cardstatusId?.Count() > 0)
                            {
                                string cardstatusIdConditions = "";
                                List<string> distList = new List<string>();
                                filter.Where.cardstatusId.ForEach(x =>
                                {
                                    distList.Add(" (mcam.StatusId = '" + x + "') ");
                                });
                                cardstatusIdConditions = string.Join(" OR ", distList);



                                Condition += "(" + cardstatusIdConditions + ") AND ";
                            }

                            else if (property.Name == "FromDate")
                            {
                                if (filter.Where.FromDate.HasValue && filter.Where.ToDate.HasValue)
                                {
                                    Condition += " DATE(mm.ModifiedDate) >= '" + filter.Where.FromDate?.ToString("yyyy-MM-dd") + "' AND DATE(mm.ModifiedDate) <= '" + filter.Where.ToDate?.ToString("yyyy-MM-dd") + "' AND ";
                                }
                            }
                            else if (property.Name == "DistrictIds"
    && filter.Where.DistrictIds?.Count() > 0
    && (filter.Where.user_Role == "LCU"))
                            {

                                string inClause = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));

                                // For ADM/HQ: include empty / null OR the matching list
                                Condition += $"(mo.District_Id IS NULL OR mo.District_Id = '' OR mo.District_Id IN ({inClause})) AND ";
                            }
                            else if (property.Name == "Changed_Detail_Records" && filter.Where.Changed_Detail_Records?.Count > 0)
                            {
                                string Changed_Detail_RecordsConditions = "";
                                List<string> Changed_Detail_RecordsList = new List<string>();
                                filter.Where.Changed_Detail_Records.ForEach(x =>
                                {
                                    Changed_Detail_RecordsList.Add(" (mdam.Changed_Detail_Record = '" + x + "') ");
                                });
                                Changed_Detail_RecordsConditions = string.Join(" OR ", Changed_Detail_RecordsList);



                                Condition += "(" + Changed_Detail_RecordsConditions + ") AND ";
                            }
                            else if (property.Name == "Organization_Types" && filter.Where.Organization_Types?.Count > 0)
                            {
                                string Organization_TypesConditions = "";
                                List<string> OrganiList = new List<string>();
                                filter.Where.Organization_Types.ForEach(x =>
                                {
                                    OrganiList.Add(" (mo.Organization_Type = '" + x + "') ");
                                });
                                Organization_TypesConditions = string.Join(" OR ", OrganiList);



                                Condition += "(" + Organization_TypesConditions + ") AND ";
                            }
                            else if (property.Name == "Type_of_Works" && filter.Where.Type_of_Works?.Count > 0)
                            {
                                string Type_of_WorksConditions = "";
                                List<string> Type_of_WorkList = new List<string>();
                                filter.Where.Type_of_Works.ForEach(x =>
                                {
                                    Type_of_WorkList.Add(" (mo.Type_of_Work = '" + x + "') ");
                                });
                                Type_of_WorksConditions = string.Join(" OR ", Type_of_WorkList);



                                Condition += "(" + Type_of_WorksConditions + ") AND ";
                            }

                            else if (property.Name == "Type_of_Work")
                            {
                                Condition += " mo.Type_of_Work = '" + value + "' AND ";
                            }
                            else if (property.Name == "Core_Sanitary_Worker_Type")
                            {
                                Condition += " mo.Core_Sanitary_Worker_Type = '" + value + "' AND ";
                            }
                            else if (property.Name == "Organization_Type")
                            {
                                Condition += " mo.Organization_Type = '" + value + "' AND ";
                            }
                            else if (property.Name == "Nature_of_Job")
                            {
                                Condition += " mo.Nature_of_Job = '" + value + "' AND ";
                            }
                            else if (property.Name == "Local_Body")
                            {
                                // Condition += " COALESCE(lb.Value, mo.Local_Body) = '" + value + "' AND ";
                                Condition += " mo.Local_Body = '" + value + "' AND ";
                            }
                            else if (property.Name == "Local_Bodys" && filter.Where.Local_Bodys?.Count > 0)
                            {
                                string Local_BodysConditions = "";
                                List<string> Local_BodysList = new List<string>();
                                filter.Where.Local_Bodys.ForEach(x =>
                                {
                                    Local_BodysList.Add(" (mo.Local_Body = '" + x + "') ");
                                });
                                Local_BodysConditions = string.Join(" OR ", Local_BodysList);

                                Condition += "(" + Local_BodysConditions + ") AND ";
                            }
                            else if (property.Name == "Name_of_Local_Body")
                            {
                                //Condition += " COALESCE(nlb.Value, mo.Name_of_Local_Body) = '" + value + "' AND ";
                                Condition += " mo.Name_of_Local_Body = '" + value + "' AND ";
                            }

                            else if (property.Name == "Name_of_Local_Bodys" && filter.Where.Name_of_Local_Bodys?.Count > 0)
                            {
                                string Name_of_Local_BodysConditions = "";
                                List<string> Name_of_Local_BodysList = new List<string>();
                                filter.Where.Name_of_Local_Bodys.ForEach(x =>
                                {
                                    Name_of_Local_BodysList.Add(" (mo.Name_of_Local_Body = '" + x + "') ");
                                });
                                Name_of_Local_BodysConditions = string.Join(" OR ", Name_of_Local_BodysList);

                                Condition += "(" + Name_of_Local_BodysConditions + ") AND ";
                            }

                            else if (property.Name == "Zone")
                            {
                                // Condition += " COALESCE(Zone.Value, mo.Zone) = '" + value + "' AND ";
                                Condition += " mo.Zone = '" + value + "' AND ";
                            }
                            else if (property.Name == "Block")
                            {
                                //  Condition += " COALESCE(bl.Value, mo.Block) = '" + value + "' AND ";
                                Condition += " mo.Block = '" + value + "' AND ";
                            }
                            else if (property.Name == "Village_Panchayat")
                            {
                                // Condition += " COALESCE(vp.Value, mo.Village_Panchayat) = '" + value + "' AND ";
                                Condition += " mo.Village_Panchayat = '" + value + "' AND ";
                            }
                            else if (property.Name == "Corporation")
                            {
                                //Condition += " COALESCE(corporation.Value, mo.Corporation) = '" + value + "' AND ";
                                Condition += " mo.Corporation = '" + value + "' AND ";
                            }
                            else if (property.Name == "Municipality")
                            {
                                //Condition += " COALESCE(Municipality.Value, mo.Municipality) = '" + value + "' AND ";
                                Condition += " mo.Municipality = '" + value + "' AND ";
                            }
                            else if (property.Name == "Town_Panchayat")
                            {
                                //Condition += " COALESCE(TownPanchayat.Value, mo.Town_Panchayat) = '" + value + "' AND ";
                                Condition += " mo.Town_Panchayat = '" + value + "' AND ";
                            }
                            else if (property.Name == "CollectedByPhoneNumber")
                            {
                                Condition += " mm.CollectedByPhoneNumber LIKE '%" + value + "%' AND ";
                            }
                            else if (property.Name == "CollectedByName")
                            {
                                Condition += " mm.CollectedByName LIKE '%" + value + "%' AND ";
                            }
                            else if (property.Name == "Mobile" && filter.Where.Mobile?.Count > 0)
                            {

                                string inClause = string.Join(",", filter.Where.Mobile.Select(x => $"'{x}'"));

                                // For ADM/HQ: include empty / null OR the matching list
                                Condition += $"( mm.CollectedByPhoneNumber IN ({inClause})) AND ";
                                //Condition += " mm.CollectedByPhoneNumber LIKE '%" + value + "%' AND ";
                            }
                            else if (property.Name == "Collected_FromDate")
                            {
                                if (filter.Where.Collected_FromDate.HasValue && filter.Where.Collected_ToDate.HasValue)
                                {
                                    Condition += " DATE(mm.CollectedOn) >= '" + filter.Where.Collected_FromDate?.ToString("yyyy-MM-dd") + "' AND DATE(mm.CollectedOn) <= '" + filter.Where.Collected_ToDate?.ToString("yyyy-MM-dd") + "' AND ";
                                }
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

                            if (string.Equals(item.FieldName, "Id", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Id";
                            }
                            else if (string.Equals(item.FieldName, "Member_Id", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Member_Id";
                            }
                            else if (string.Equals(item.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "pad.Value";
                            }
                            else if (string.Equals(item.FieldName, "CardStatus", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "cd.Value";
                            }
                            else if (string.Equals(item.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                            }
                            else if (string.Equals(item.FieldName, "MemberFirstName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.First_Name";
                            }
                            else if (string.Equals(item.FieldName, "MemberLastName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Last_Name";
                            }
                            else if (string.Equals(item.FieldName, "MemberFatherOrHusbandName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Father_Name";
                            }
                            else if (string.Equals(item.FieldName, "MemberBirthday", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(mm.Date_Of_Birth, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "Gender", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "gender.Value";
                            }
                            else if (string.Equals(item.FieldName, "Religion", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "religion.Value";
                            }
                            else if (string.Equals(item.FieldName, "MemberCommunity", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "community.Value";
                            }
                            else if (string.Equals(item.FieldName, "Caste", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "caste.Value";
                            }
                            else if (string.Equals(item.FieldName, "MemberMaritalStatus", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "Marital_Status.Value";
                            }
                            else if (string.Equals(item.FieldName, "MemberAadhaarNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Aadhaar_Number";
                            }
                            else if (string.Equals(item.FieldName, "Phone", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Phone_Number";
                            }
                            else if (string.Equals(item.FieldName, "Email", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Email";
                            }
                            else if (string.Equals(item.FieldName, "MemberRationCardNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Ration_Card_Number";
                            }
                            else if (string.Equals(item.FieldName, "MemberProfileImage", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.ProfileUrl";
                            }
                            else if (string.Equals(item.FieldName, "ChangedDetailRecord", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mdam.Changed_Detail_Record";
                            }
                            else if (string.Equals(item.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mdam.Status";
                            }
                            else if (string.Equals(item.FieldName, "ApprovedByRole", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "lastAppRole.RoleName";
                            }
                            else if (string.Equals(item.FieldName, "CardStatus", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "cardStatus.Value";
                            }
                            else if (string.Equals(item.FieldName, "OrganizationType", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "ot.Value";
                            }
                            else if (string.Equals(item.FieldName, "GovernmentOrganisationName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.Organisation_Name";
                            }
                            else if (string.Equals(item.FieldName, "GovernmentDesignation", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "Designation.Value";
                            }
                            else if (string.Equals(item.FieldName, "GovernmentNatureOfJob", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "Nature_of_Job.Value";
                            }
                            else if (string.Equals(item.FieldName, "GovernmentAddress", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.Address";
                            }
                            else if (string.Equals(item.FieldName, "PrivateOrganisationName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.Private_Organisation_Name";
                            }
                            else if (string.Equals(item.FieldName, "PrivateDesignation", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "PrivateDesignation.Value";
                            }
                            else if (string.Equals(item.FieldName, "PrivateAddress", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.Private_Address";
                            }
                            else if (string.Equals(item.FieldName, "LocalBody", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(lb.Value, mo.Local_Body)";
                            }
                            else if (string.Equals(item.FieldName, "Block", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(bl.Value, mo.Block)";
                            }
                            else if (string.Equals(item.FieldName, "VillagePanchayat", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(vp.Value, mo.Village_Panchayat)";
                            }
                            else if (string.Equals(item.FieldName, "NameOfLocalBody", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(nlb.Value, mo.Name_of_Local_Body)";
                            }
                            else if (string.Equals(item.FieldName, "Corporation", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(corporation.Value, mo.Corporation)";
                            }
                            else if (string.Equals(item.FieldName, "Municipality", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(Municipality.Value, mo.Municipality)";
                            }
                            else if (string.Equals(item.FieldName, "TownPanchayat", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(TownPanchayat.Value, mo.Town_Panchayat)";
                            }
                            else if (string.Equals(item.FieldName, "Zone", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(Zone.Value, mo.Zone)";
                            }
                            else if (string.Equals(item.FieldName, "NewYellowCardNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.New_Yellow_Card_Number";
                            }
                            else if (string.Equals(item.FieldName, "HealthId", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.Health_Id";
                            }
                            else if (string.Equals(item.FieldName, "PermanentAddress", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(mam.DoorNo, ', ', mam.StreetName, ', ', mam.VilllageTownCity, ', ', mam.Taluk, ', ', pad.Value, ', ', mam.PinCode)";
                            }
                            else if (string.Equals(item.FieldName, "TemporaryAddress", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(mat.DoorNo, ', ', mat.StreetName, ', ', mat.VilllageTownCity, ', ', mat.Taluk, ', ', tad.Value, ', ', mat.PinCode)";
                            }
                            else if (string.Equals(item.FieldName, "CollectedByName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CollectedByName";
                            }
                            else if (string.Equals(item.FieldName, "CollectedByPhoneNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CollectedByPhoneNumber";
                            }
                            else if (string.Equals(item.FieldName, "CollectedOn", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(mm.CollectedOn, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "UpdatedBy", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.ModifiedBy";
                            }
                            else if (string.Equals(item.FieldName, "UpdatedByUserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.ModifiedByUserName";
                            }
                            else if (string.Equals(item.FieldName, "UpdatedDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(mm.ModifiedDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "CreatedBy", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CreatedBy";
                            }
                            else if (string.Equals(item.FieldName, "CreatedByUserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CreatedByUserName";
                            }
                            else if (string.Equals(item.FieldName, "CreatedDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(mm.CreatedDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "DeletedBy", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.DeletedBy";
                            }
                            else if (string.Equals(item.FieldName, "DeletedByUserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.DeletedByUserName";
                            }
                            else if (string.Equals(item.FieldName, "DeletedDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(mm.DeletedDate, '%d-%m-%Y')";
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
                    List<string> columnsToSearch = new List<string>()
{
    // Basic
    "mm.Id",
    "mm.Member_Id",
    "cd.Value",
    "mm.First_Name",
    "mm.Last_Name",
    "mm.Father_Name",
    "DATE_FORMAT(mm.Date_Of_Birth, '%d-%m-%Y')",
    "gender.Value",
    "religion.Value",
    "community.Value",
    "caste.Value",
    "Marital_Status.Value",
    "mm.Aadhaar_Number",
    "mm.Phone_Number",
    "mm.Email",
    "mm.Ration_Card_Number",
    "mm.ProfileUrl",
    "mdam.Changed_Detail_Record",

    // Status
    "mdam.Status",
    "lastAppRole.RoleName",
    "cardStatus.Value",
    "mm.IsRejected",

    // Organization
    "mo.Id",
    "ot.Value",
    "mo.Organisation_Name",
    "Designation.Value",
    "Nature_of_Job.Value",
    "mo.Address",
    "mo.Private_Organisation_Name",
    "PrivateDesignation.Value",
    "mo.Private_Address",
    "COALESCE(lb.Value, mo.Local_Body)",
    "COALESCE(bl.Value, mo.Block)",
    "COALESCE(vp.Value, mo.Village_Panchayat)",
    "COALESCE(nlb.Value, mo.Name_of_Local_Body)",
    "COALESCE(corporation.Value, mo.Corporation)",
    "COALESCE(Municipality.Value, mo.Municipality)",
    "COALESCE(TownPanchayat.Value, mo.Town_Panchayat)",
    "COALESCE(Zone.Value, mo.Zone)",
    "mo.New_Yellow_Card_Number",
    "mo.Health_Id",

    // Address
    "CONCAT(mam.DoorNo, ', ', mam.StreetName, ', ', mam.VilllageTownCity, ', ', mam.Taluk, ', ', pad.Value, ', ', mam.PinCode)",
    "CONCAT(mat.DoorNo, ', ', mat.StreetName, ', ', mat.VilllageTownCity, ', ', mat.Taluk, ', ', tad.Value, ', ', mat.PinCode)",

    // Collected Info
    "mm.CollectedByName",
    "mm.CollectedByPhoneNumber",
    "DATE_FORMAT(mm.CollectedOn, '%d-%m-%Y')",

    // Audit
    "mm.ModifiedBy",
    "mm.ModifiedByUserName",
    "DATE_FORMAT(mm.ModifiedDate, '%d-%m-%Y')",
    "mm.CreatedBy",
    "mm.CreatedByUserName",
    "DATE_FORMAT(mm.CreatedDate, '%d-%m-%Y')",
};

                    foreach (var column in columnsToSearch)
                    {
                        string currentSearchString = column == "mm.Member_Id" ? memberIdSearchString : originalSearchString;
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
                    TotalCount = SqlMapper.ExecuteScalar<int>(conn, CountQuery, commandTimeout: 300, commandType: CommandType.Text);

                    #region Pagination Condition

                    if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter?.Sorting?.FieldName) && !string.IsNullOrWhiteSpace(filter?.Sorting?.Sort))
                    {
                        string FieldName = "";

                        #region Select Field
                        if (string.Equals(filter?.Sorting.FieldName, "Id", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Id";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Member_Id", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Member_Id";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberFirstName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.First_Name";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberLastName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Last_Name";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberFatherOrHusbandName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Father_Name";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberBirthday", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Date_Of_Birth";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Gender", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "gender.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Religion", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "religion.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberCommunity", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "community.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Caste", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "caste.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberMaritalStatus", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "Marital_Status.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberAadhaarNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Aadhaar_Number";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Phone", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Phone_Number";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Email", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Email";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberRationCardNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Ration_Card_Number";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MemberProfileImage", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.ProfileUrl";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ChangedDetailRecord", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mdam.Changed_Detail_Record";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mdam.Status";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ApprovedByRole", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "lastAppRole.RoleName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CardStatus", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "cardStatus.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "OrganizationId", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Id";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "OrganizationType", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "ot.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "GovernmentOrganisationName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Organisation_Name";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "GovernmentDesignation", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "Designation.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "GovernmentNatureOfJob", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "Nature_of_Job.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "GovernmentAddress", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Address";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "PrivateOrganisationName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Private_Organisation_Name";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "PrivateDesignation", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "PrivateDesignation.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "PrivateAddress", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Private_Address";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "LocalBody", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(lb.Value, mo.Local_Body)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Block", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(bl.Value, mo.Block)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "VillagePanchayat", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(vp.Value, mo.Village_Panchayat)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "NameOfLocalBody", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(nlb.Value, mo.Name_of_Local_Body)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Corporation", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(corporation.Value, mo.Corporation)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Municipality", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(Municipality.Value, mo.Municipality)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "TownPanchayat", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(TownPanchayat.Value, mo.Town_Panchayat)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Zone", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(Zone.Value, mo.Zone)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "NewYellowCardNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.New_Yellow_Card_Number";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "HealthId", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Health_Id";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "PermanentAddress", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(mam.DoorNo, ', ', mam.StreetName, ', ', mam.VilllageTownCity, ', ', mam.Taluk, ', ', pad.Value, ', ', mam.PinCode)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "TemporaryAddress", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(mat.DoorNo, ', ', mat.StreetName, ', ', mat.VilllageTownCity, ', ', mat.Taluk, ', ', tad.Value, ', ', mat.PinCode)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CardStatus", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "cd.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedByName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedByName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedByPhoneNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedByPhoneNumber";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedOn", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedOn";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "UpdatedBy", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.ModifiedBy";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "UpdatedByUserName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.ModifiedByUserName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "UpdatedDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.ModifiedDate";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CreatedBy", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CreatedBy";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CreatedByUserName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CreatedByUserName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CreatedDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CreatedDate";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "DeletedBy", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.DeletedBy";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "DeletedByUserName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.DeletedByUserName";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "DeletedDate", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.DeletedDate";
                        }
                        else
                        {
                            // Default Sort
                            FieldName = "mm.ModifiedDate";
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
                        Condition += " ORDER BY mm.ModifiedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY mm.ModifiedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return SqlMapper.Query<MemberGridViewModel>(conn, Query, commandTimeout: 300, commandType: CommandType.Text)?.ToList() ?? new List<MemberGridViewModel>();
                }
            }

            return null;
        }

        #region reports

        //modified by Sivasankar K on 20-12-2025 for viewing datewise approved report
        public List<GCCReportModels> GetGCCReport(
       MemberFilterModel filter,
       out int totalCount)
        {
            totalCount = 0;

            string baseQuery = @"
        FROM member_master mm
        LEFT JOIN member_organization mo 
            ON mo.Member_Id = mm.Id AND mo.IsTemp = 0
        LEFT JOIN two_column_configuration_values tccv 
            ON tccv.Id = mo.Zone AND tccv.IsActive = 1
        LEFT JOIN member_card_approval_master mcam 
            ON mcam.Member_Id = mm.Id AND mcam.IsActive = 1
        WHERE mm.IsTemp = 0
        ";

            DynamicParameters parameters = new DynamicParameters();

            #region Filters

            if (filter.Where.FromDate != null)
            {
                baseQuery += " AND DATE(mm.ModifiedDate) >= @FromDate ";
                parameters.Add("@FromDate", filter.Where.FromDate.Value.Date);
            }

            if (filter.Where.ToDate != null)
            {
                baseQuery += " AND DATE(mm.ModifiedDate) <= @ToDate ";
                parameters.Add("@ToDate", filter.Where.ToDate.Value.Date);
            }

            if (!string.IsNullOrWhiteSpace(filter.Where.Zone))
            {
                baseQuery += " AND FIND_IN_SET(mo.Zone, @ZoneIds) ";
                parameters.Add("@ZoneIds", filter.Where.Zone);
            }

            if (filter.Where.DistrictIds?.Count > 0)
            {
                baseQuery += " AND FIND_IN_SET(mo.District_Id, @DistrictIds) ";
                parameters.Add("@DistrictIds", string.Join(",", filter.Where.DistrictIds));
            }

            if (filter.Where.Organization_Types?.Count > 0)
            {
                baseQuery += " AND FIND_IN_SET(mo.Organization_Type, @OrgTypes) ";
                parameters.Add("@OrgTypes", string.Join(",", filter.Where.Organization_Types));
            }
         
            if (!string.IsNullOrWhiteSpace(filter.Where.ReportFormat)
                && (filter.Where.ReportFormat.Equals("GCC", StringComparison.OrdinalIgnoreCase)
                    || filter.Where.ReportFormat.Equals("CMWS", StringComparison.OrdinalIgnoreCase)))
            {
                baseQuery += " AND mo.Name_of_Local_Body = @Name_of_Local_Body ";
                parameters.Add("@Name_of_Local_Body", filter.Where.ReportFormat);
            }


            if (filter.Where.StatusIds?.Count > 0)
            {
                baseQuery += @"
            AND (
                (FIND_IN_SET('SAVED', @StatusIds) 
                    AND (mm.IsSubmitted = 0 OR mm.IsSubmitted IS NULL))
                OR
                (FIND_IN_SET('SUBMITTED', @StatusIds) 
                    AND mm.IsSubmitted = 1 
                    AND (mm.IsRejected = 0 OR mm.IsRejected IS NULL))
                OR
                (FIND_IN_SET('APPROVED', @StatusIds) 
                    AND mm.IsApproved = 1)
                OR
                (FIND_IN_SET('REJECTED', @StatusIds) 
                    AND mm.IsRejected = 1)
            )";
                parameters.Add("@StatusIds", string.Join(",", filter.Where.StatusIds));
            }

            #endregion

            #region Count Query

            string countQuery = @"
            SELECT COUNT(DISTINCT IFNULL(tccv.Value,'Others'))
        " + baseQuery;

            #endregion

            #region Data Query

            string dataQuery = @"
        SELECT
            'Chennai' AS DistrictName,
            IFNULL(tccv.Value, 'Others') AS ZoneName,
            mo.Zone,

            SUM(CASE WHEN mo.Organization_Type =
                (SELECT Id FROM two_column_configuration_values WHERE Code='PVT')
                THEN 1 ELSE 0 END) AS Private,

            SUM(CASE WHEN mo.Organization_Type =
                (SELECT Id FROM two_column_configuration_values WHERE Code='GOV')
                THEN 1 ELSE 0 END) AS Government,

            SUM(CASE WHEN mo.Organization_Type =
                (SELECT Id FROM two_column_configuration_values WHERE Code='GOV&PVT')
                THEN 1 ELSE 0 END) AS GovernmentandPrivate,

            SUM(CASE WHEN (mm.IsSubmitted = 0 OR mm.IsSubmitted IS NULL)
                     AND mm.IsApproved = 0 AND mm.IsActive = 1
                THEN 1 ELSE 0 END) AS Saved,

            SUM(CASE WHEN mm.IsSubmitted = 1 AND mm.IsActive = 1
                     AND (mm.IsRejected = 0 OR mm.IsRejected IS NULL)
                THEN 1 ELSE 0 END) AS Submitted,

            SUM(CASE WHEN mm.IsRejected = 1 AND mm.IsActive = 1 THEN 1 ELSE 0 END) AS Rejected,

            SUM(CASE WHEN mm.IsApproved = 1 AND mm.IsActive = 1 THEN 1 ELSE 0 END) AS ApprovedCount,

            SUM(CASE WHEN mcam.IsCompleted = 1 AND mcam.IsActive = 1 THEN 1 ELSE 0 END) AS CardIssued,
            SUM(CASE WHEN mcam.IsRejected = 1 AND mcam.IsActive = 1 THEN 1 ELSE 0 END) AS CardRejected,
            SUM(CASE WHEN mcam.IsCompleted = 0 AND mcam.IsRejected = 0 AND mcam.IsActive = 1 THEN 1 ELSE 0 END) AS CardtobeIssued,

            COUNT(mm.Id) AS Total
        " + baseQuery + @"
        GROUP BY tccv.Value
        ORDER BY ZoneName
        LIMIT @Take OFFSET @Skip
        ";

            parameters.Add("@Skip", filter.Skip);
            parameters.Add("@Take", filter.Take);

            #endregion

            //using var conn = new MySqlConnection(
            //    _configuration.GetConnectionString(connectionId));

            //totalCount = conn.ExecuteScalar<int>(countQuery, parameters);

            //return conn.Query<GCCReportModels>(
            //    dataQuery,
            //    parameters,
            //    commandTimeout: 300
            //).ToList();
            using var conn = new MySqlConnection(
    _configuration.GetConnectionString(connectionId));

            totalCount = conn.ExecuteScalar<int>(countQuery, parameters);

            var result = conn.Query<GCCReportModels>(
                dataQuery,
                parameters,
                commandTimeout: 300
            ).ToList();

            // ✅ GRAND TOTAL CALCULATION IN DAL
            if (result.Any())
            {
                var grandTotal = new GCCReportModels
                {
                    ZoneName = "GRAND TOTAL",
                    Zone = string.Empty,

                    Private = result.Sum(x => x.Private),
                    Government = result.Sum(x => x.Government),
                    GovernmentandPrivate = result.Sum(x => x.GovernmentandPrivate),

                    Saved = result.Sum(x => x.Saved),
                    Submitted = result.Sum(x => x.Submitted),
                    Rejected = result.Sum(x => x.Rejected),

                    ApprovedCount = result.Sum(x => x.ApprovedCount),
                    CardIssued = result.Sum(x => x.CardIssued),
                    CardRejected = result.Sum(x => x.CardRejected),
                    CardtobeIssued = result.Sum(x => x.CardtobeIssued),

                    Total = result.Sum(x => x.Total)
                };

                result.Add(grandTotal);
            }

            return result;

        }


        public List<LocalBodyReportModel> GetNameofLocalBodyReport(
            MemberFilterModel filter,
            out int totalCount)
        {
            totalCount = 0;

            string baseQuery = @"
        FROM two_column_configuration_category tccc
        INNER JOIN two_column_configuration_values tccv
            ON tccv.CategoryId = tccc.Id AND tccv.IsActive = 1
        LEFT JOIN member_organization mo
            ON mo.District_Id = tccv.Id AND mo.IsTemp = 0
        LEFT JOIN member_master mm
            ON mm.Id = mo.Member_Id AND mm.IsTemp = 0 AND mm.IsActive = 1
        LEFT JOIN member_card_approval_master mcam
            ON mcam.Member_Id = mm.Id AND mcam.IsActive = 1
        WHERE tccc.CategoryCode = 'DISTRICT'
          AND tccc.IsActive = 1
        ";

            DynamicParameters parameters = new DynamicParameters();

            #region Filters

            if (filter.Where.DistrictIds?.Count > 0)
            {
                baseQuery += @"
            AND FIND_IN_SET(
                tccv.Id,
                REPLACE(@DistrictIds, ' ', '')
            )";
                parameters.Add("@DistrictIds", string.Join(",", filter.Where.DistrictIds));
            }

            if (!string.IsNullOrWhiteSpace(filter.Where.ReportFormat))
            {
                baseQuery += " AND mo.Name_of_Local_Body = @LocalBodyName ";
                parameters.Add("@LocalBodyName", filter.Where.ReportFormat);
            }

            if (filter.Where.FromDate != null)
            {
                baseQuery += " AND DATE(mm.ModifiedDate) >= @FromDate ";
                parameters.Add("@FromDate", filter.Where.FromDate.Value.Date);
            }

            if (filter.Where.ToDate != null)
            {
                baseQuery += " AND DATE(mm.ModifiedDate) <= @ToDate ";
                parameters.Add("@ToDate", filter.Where.ToDate.Value.Date);
            }

            #endregion

            #region Count Query

            string countQuery = @"
        SELECT COUNT(DISTINCT IFNULL(tccv.Value, 'GRAND TOTAL'))
        " + baseQuery;

            #endregion

            #region Data Query

            string dataQuery = @"
        SELECT
            IFNULL(tccv.Value, 'GRAND TOTAL') AS Districts,
            COUNT(DISTINCT mo.Name_of_Local_Body) AS NameofLocalbodyitems,
            COUNT(mm.Id) AS Total,
            SUM(CASE WHEN mm.IsApproved = 1 THEN 1 ELSE 0 END) AS Approved,
            SUM(CASE WHEN mcam.IsCompleted = 1 THEN 1 ELSE 0 END) AS CardIssued,
            SUM(CASE 
                WHEN mcam.IsCompleted = 0 
                     AND mcam.IsRejected = 0 
                THEN 1 ELSE 0 END) AS CardToBeIssued,
            SUM(CASE WHEN mcam.IsRejected = 1 THEN 1 ELSE 0 END) AS CardRejected
        " + baseQuery + @"
        GROUP BY tccv.Value WITH ROLLUP
        ORDER BY 
            CASE WHEN tccv.Value IS NULL THEN 1 ELSE 0 END,
            tccv.Value
        LIMIT @Take OFFSET @Skip
        ";

            parameters.Add("@Skip", filter.Skip);
            parameters.Add("@Take", filter.Take);

            #endregion
          //  Updated by Sivasankar K on 20/12/2025

            //using var conn = new MySqlConnection(
            //    _configuration.GetConnectionString(connectionId));

            //totalCount = conn.ExecuteScalar<int>(countQuery, parameters);

            //return conn.Query<LocalBodyReportModel>(
            //    dataQuery,
            //    parameters,
            //    commandTimeout: 300
            //).ToList();


            using var conn = new MySqlConnection(
                _configuration.GetConnectionString(connectionId));

            totalCount = conn.ExecuteScalar<int>(countQuery, parameters);

            var result = conn.Query<LocalBodyReportModel>(
                dataQuery,
                parameters,
                commandTimeout: 300
            ).ToList();

            
            if (result.Any())
            {
                result.Add(new LocalBodyReportModel
                {
                    Districts = "GRAND TOTAL",
                    NameofLocalbodyitems = result.Sum(x => x.NameofLocalbodyitems),
                    Total = result.Sum(x => x.Total),
                    Approved = result.Sum(x => x.Approved),
                    CardIssued = result.Sum(x => x.CardIssued),
                    CardToBeIssued = result.Sum(x => x.CardToBeIssued),
                    CardRejected = result.Sum(x => x.CardRejected)
                });
            }

            return result;
        
        }
        public List<BlockWiseReportModel> GetBlockWiseReport(
    MemberFilterModel filter,
    out int totalCount)
        {
            totalCount = 0;

            string baseQuery = @"
    FROM two_column_configuration_category tccc
    INNER JOIN two_column_configuration_values tccv
        ON tccv.CategoryId = tccc.Id
        AND tccv.IsActive = 1

    LEFT JOIN member_organization mo
        ON mo.District_Id = tccv.Id
        AND mo.IsTemp = 0
        AND mo.Local_Body = 'RURAL'

    LEFT JOIN member_master mm
        ON mm.Id = mo.Member_Id
        AND mm.IsTemp = 0
        AND mm.IsActive = 1

    LEFT JOIN member_card_approval_master mcam
        ON mcam.Member_Id = mm.Id
        AND mcam.IsActive = 1

    WHERE tccc.CategoryCode = 'DISTRICT'
      AND tccc.IsActive = 1
    ";

            DynamicParameters parameters = new DynamicParameters();

            #region Common Filters

            if (filter.Where.FromDate != null)
            {
                baseQuery += " AND DATE(mm.ModifiedDate) >= @FromDate ";
                parameters.Add("@FromDate", filter.Where.FromDate.Value.Date);
            }

            if (filter.Where.ToDate != null)
            {
                baseQuery += " AND DATE(mm.ModifiedDate) <= @ToDate ";
                parameters.Add("@ToDate", filter.Where.ToDate.Value.Date);
            }

            if (filter.Where.DistrictIds?.Count > 0)
            {
                baseQuery += @"
        AND FIND_IN_SET(
            tccv.Id,
            REPLACE(@DistrictIds, ' ', '')
        )";
                parameters.Add("@DistrictIds", string.Join(",", filter.Where.DistrictIds));
            }

        //    if (filter.Where.StatusIds?.Count > 0)
        //    {
        //        baseQuery += @"
        //AND (
        //    (FIND_IN_SET('APPROVED', @StatusIds) AND mm.IsApproved = 1)
        //    OR
        //    (FIND_IN_SET('REJECTED', @StatusIds) AND mm.IsRejected = 1)
        //)";

        //        parameters.Add("@StatusIds", string.Join(",", filter.Where.StatusIds));
        //    }

            #endregion

            #region Count Query (district count)

            string countQuery = @"
    SELECT COUNT(DISTINCT tccv.Value)
    " + baseQuery;

            #endregion

            #region Data Query

            string dataQuery = @"
    SELECT
        IFNULL(tccv.Value, 'Others') AS NameOfTheDistrict,

        COUNT(DISTINCT mo.Block) AS NoOfBlocks,
        COUNT(mm.Id) AS Total,

        SUM(CASE 
            WHEN mm.IsApproved = 1 AND mm.IsActive = 1 
            THEN 1 ELSE 0 END
        ) AS Approved,

        SUM(CASE 
            WHEN mcam.IsCompleted = 1 AND mcam.IsActive = 1 
            THEN 1 ELSE 0 END
        ) AS CardIssued,

        SUM(CASE 
            WHEN mcam.IsCompleted = 0 
                 AND mcam.IsRejected = 0 
                 AND mcam.IsActive = 1 
            THEN 1 ELSE 0 END
        ) AS CardToBeIssued,

        SUM(CASE 
            WHEN mcam.IsRejected = 1 AND mcam.IsActive = 1 
            THEN 1 ELSE 0 END
        ) AS CardRejected
    " + baseQuery + @"
    GROUP BY tccv.Value
    ORDER BY NameOfTheDistrict
    LIMIT @Take OFFSET @Skip
    ";

            parameters.Add("@Skip", filter.Skip);
            parameters.Add("@Take", filter.Take);

            #endregion

            using var conn = new MySqlConnection(
                _configuration.GetConnectionString(connectionId));

            totalCount = conn.ExecuteScalar<int>(countQuery, parameters);

            var result = conn.Query<BlockWiseReportModel>(
                dataQuery,
                parameters,
                commandTimeout: 300
            ).ToList();

            // ✅ GRAND TOTAL IN DAL
            if (result.Any())
            {
                result.Add(new BlockWiseReportModel
                {
                    NameOfTheDistrict = "GRAND TOTAL",
                    NoOfBlocks = result.Sum(x => x.NoOfBlocks),
                    Total = result.Sum(x => x.Total),
                    Approved = result.Sum(x => x.Approved),
                    CardIssued = result.Sum(x => x.CardIssued),
                    CardToBeIssued = result.Sum(x => x.CardToBeIssued),
                    CardRejected = result.Sum(x => x.CardRejected)
                });
            }

            return result;
        }

            public List<AllLocalBodyReportModel> GetAllLocalBodySummary()
    {
        using var conn = new MySqlConnection(
            _configuration.GetConnectionString(connectionId));

        return conn.Query<AllLocalBodyReportModel>(
            "AllLocalBodySummaryReport",
            commandType: CommandType.StoredProcedure,
            commandTimeout: 300
        ).ToList();
    }
               public List<DepartmentWiseApprovalModel> GetDatewiseApprovedMembers(
    MemberFilterModel filter,
    out int TotalCount)
        {
            TotalCount = 0;

            #region Approved Date Logic

            string approvedDateFilterColumn = "CAST(mdam.ApprovedOn AS DATE)";

            if (filter.Where?.StatusIds?.Count > 0)
            {
                if (filter.Where.StatusIds.Contains("SAVED"))
                    approvedDateFilterColumn = "CAST(mm.CreatedDate AS DATE)";
                else if (filter.Where.StatusIds.Any(x => x.Contains("WAITING")))
                    approvedDateFilterColumn = "CAST(mdam.CreatedDate AS DATE)";
                else if (filter.Where.StatusIds.Any(x => x.Contains("APPROVED")))
                    approvedDateFilterColumn = "CAST(mdam.ApprovedOn AS DATE)";
                else if (filter.Where.StatusIds.Any(x => x.Contains("RETURNED")))
                    approvedDateFilterColumn = "CAST(mdah.CreatedOn AS DATE)";
            }

            #endregion

            #region Base Query

            string Query = @"
SELECT
    twv.Value AS DistrictName,

    SUM(CASE WHEN twc.Code = 'CSW' THEN 1 ELSE 0 END) AS CSW,
    SUM(CASE WHEN twc.Code = 'CW'  THEN 1 ELSE 0 END) AS CW,
    SUM(CASE WHEN twc.Code = 'MW'  THEN 1 ELSE 0 END) AS MW,
    SUM(CASE WHEN twc.Code = 'RP'  THEN 1 ELSE 0 END) AS RP,
    SUM(CASE WHEN (twc.Code IS NULL OR twc.Code = '') THEN 1 ELSE 0 END) AS Others,

    COUNT(*) AS Total_Count

FROM member_master mm
LEFT JOIN member_organization mo 
       ON mm.Id = mo.Member_Id AND mo.IsTemp = 0
LEFT JOIN two_column_configuration_values twc 
       ON twc.Id = mo.Type_of_Work
LEFT JOIN two_column_configuration_values twv 
       ON twv.Id = mo.District_Id
LEFT JOIN member_data_approval_master mdam 
       ON mdam.Member_Id = mm.Id
LEFT JOIN member_data_approval_history mdah 
       ON mdah.Member_Detail_Approval_Master_Id = mdam.Id
";

            string Condition = " WHERE (mm.IsTemp = 0 OR mm.IsTemp IS NULL) AND ";

            #endregion

            #region Existing Filters (UNCHANGED)

            if (filter.Where?.DistrictIds?.Count > 0)
                Condition += $" mo.District_Id IN ({string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.Local_Bodys?.Count > 0)
                Condition += $" mo.Local_Body IN ({string.Join(",", filter.Where.Local_Bodys.Select(x => $"'{x}'"))}) AND ";


            if (filter.Where?.Name_of_Local_Bodys?.Count > 0)
                Condition += $" mo.Name_of_Local_Body IN ({string.Join(",", filter.Where.Name_of_Local_Bodys.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.Organization_Types?.Count > 0)
                Condition += $" mo.Organization_Type IN ({string.Join(",", filter.Where.Organization_Types.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.Type_of_Works?.Count > 0)
                Condition += $" mo.Type_of_Work IN ({string.Join(",", filter.Where.Type_of_Works.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.StatusIds?.Count > 0)
            {
                List<string> statusConditions = new();

                foreach (var status in filter.Where.StatusIds)
                {
                    string dm = filter.Where.DMroleId;
                    string dc = filter.Where.DCroleId;
                    string hq = filter.Where.HQroleId;

                    if (status == "SAVED") statusConditions.Add("(mm.IsSubmitted=0)");
                    if (status == "SUBMITTED") statusConditions.Add("(mm.IsSubmitted=1 AND mdam.Status='WAITING_FOR_APPROVAL')");
                    if (status == "WAITING_FOR_APPROVAL(DM)") statusConditions.Add($"(mdam.Status='IN_PROGRESS' AND mdam.Approval_For='{dm}')");
                    if (status == "WAITING_FOR_APPROVAL(DC)") statusConditions.Add($"(mdam.Approval_For='{dc}')");
                    if (status == "WAITING_FOR_APPROVAL(HQ)") statusConditions.Add($"(mdam.Approval_For='{hq}')");
                    if (status == "DM_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{dm}')");
                    if (status == "DC_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{dc}')");
                    if (status == "HQ_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{hq}')");
                    if (status == "DM_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{dm}')");
                    if (status == "DC_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{dc}')");
                    if (status == "HQ_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{hq}')");
                }

                Condition += $" ({string.Join(" OR ", statusConditions)}) AND ";
            }

            if (filter.Where?.approvaldateRange?.Count == 2)
            {
                var from = DateOnly.FromDateTime(DateTime.Parse(filter.Where.approvaldateRange[0]));
                var to = DateOnly.FromDateTime(DateTime.Parse(filter.Where.approvaldateRange[1]));
                Condition += $" {approvedDateFilterColumn} BETWEEN '{from:yyyy-MM-dd}' AND '{to:yyyy-MM-dd}' AND ";
            }

            #endregion

            #region Column Search (GROUP SAFE)

            if (filter.ColumnSearch?.Count > 0)
            {
                foreach (var item in filter.ColumnSearch)
                {
                    if (!string.IsNullOrWhiteSpace(item.SearchString))
                    {
                        string key = item.FieldName?.Trim().ToLower();
                        string col = key switch
                        {
                            "districtname" => "twv.Value",
                            "csw" => "CAST(SUM(CASE WHEN twc.Code='CSW' THEN 1 ELSE 0 END) AS CHAR)",
                            "cw" => "CAST(SUM(CASE WHEN twc.Code='CW' THEN 1 ELSE 0 END) AS CHAR)",
                            "mw" => "CAST(SUM(CASE WHEN twc.Code='MW' THEN 1 ELSE 0 END) AS CHAR)",
                            "rp" => "CAST(SUM(CASE WHEN twc.Code='RP' THEN 1 ELSE 0 END) AS CHAR)",
                            "others" => "CAST(SUM(CASE WHEN (twc.Code IS NULL OR twc.Code='') THEN 1 ELSE 0 END) AS CHAR)",
                            "total_count" => "CAST(COUNT(*) AS CHAR)",
                            _ => ""
                        };

                        if (!string.IsNullOrEmpty(col))
                            Condition += $" {col} LIKE '%{item.SearchString.Replace("'", "")}%' AND ";
                    }
                }
            }

            #endregion

            #region Global Search

            if (!string.IsNullOrWhiteSpace(filter.SearchString))
            {
                string s = filter.SearchString.Replace("'", "").Trim();
                Condition += $@"
        (
            twv.Value LIKE '%{s}%'
            OR CAST(COUNT(*) AS CHAR) LIKE '%{s}%'
            OR CAST(SUM(CASE WHEN twc.Code='CSW' THEN 1 ELSE 0 END) AS CHAR) LIKE '%{s}%'
            OR CAST(SUM(CASE WHEN twc.Code='CW'  THEN 1 ELSE 0 END) AS CHAR) LIKE '%{s}%'
            OR CAST(SUM(CASE WHEN twc.Code='MW'  THEN 1 ELSE 0 END) AS CHAR) LIKE '%{s}%'
            OR CAST(SUM(CASE WHEN twc.Code='RP'  THEN 1 ELSE 0 END) AS CHAR) LIKE '%{s}%'
        ) AND ";
            }

            #endregion

            if (Condition.EndsWith(" AND "))
                Condition = Condition[..^5];

            Query += Condition;
            Query += " GROUP BY mo.District_Id ";

            string CountQuery = "SELECT COUNT(*) FROM (" + Query + ") X";

            using var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            TotalCount = conn.ExecuteScalar<int>(CountQuery);

            #region Sorting + Pagination

            string orderBy = " ORDER BY DistrictName ASC ";

            if (filter.Sorting != null && !string.IsNullOrWhiteSpace(filter.Sorting.FieldName))
            {
                string key = filter.Sorting.FieldName.Trim().ToLower();
                string sortCol = key switch
                {
                    "districtname" => "DistrictName",
                    "csw" => "CSW",
                    "cw" => "CW",
                    "mw" => "MW",
                    "rp" => "RP",
                    "others" => "Others",
                    "total_count" => "Total_Count",
                    _ => "DistrictName"
                };

                orderBy = $" ORDER BY {sortCol} {filter.Sorting.Sort} ";
            }

            Query += orderBy;

            if (filter.Take > 0)
                Query += $" LIMIT {filter.Take} OFFSET {filter.Skip} ";

            #endregion

            return conn.Query<DepartmentWiseApprovalModel>(Query, commandTimeout: 300).ToList();
        }


        public List<FamilyMemberApprovalModel> FamilyMembersAprovedList(MemberFilterModel filter,out int TotalCount)
        {
            TotalCount = 0;

            #region Approved Date Logic

            string approvedDateFilterColumn = "CAST(mdam.ApprovedOn AS DATE)";

            if (filter.Where?.StatusIds?.Count > 0)
            {
                if (filter.Where.StatusIds.Contains("SAVED"))
                    approvedDateFilterColumn = "CAST(mm.CreatedDate AS DATE)";
                else if (filter.Where.StatusIds.Any(x => x.Contains("WAITING")))
                    approvedDateFilterColumn = "CAST(mdam.CreatedDate AS DATE)";
                else if (filter.Where.StatusIds.Any(x => x.Contains("APPROVED")))
                    approvedDateFilterColumn = "CAST(mdam.ApprovedOn AS DATE)";
                else if (filter.Where.StatusIds.Any(x => x.Contains("RETURNED")))
                    approvedDateFilterColumn = "CAST(mdah.CreatedOn AS DATE)";
            }

            #endregion

            #region Base Query

            string Query = @"
	SELECT
		CONCAT(mm.First_Name, ' ', mm.Last_Name) AS Name,
		mm.Member_Id AS Member_Id,
		mm.CreatedDate AS Mem_CreatedDate,
            CASE 
		WHEN education.Value IS NULL 
		THEN mm.Education
		ELSE education.Value
	END AS  Mem_Education,
		organization.Value AS Organization_Type,
		occupation.Value AS Occupation,
		marital.Value AS MaritalStatus,
		community.Value As Community,
		mo.Local_Body AS LocalBody,
		CASE
    WHEN mo.Local_Body = 'RURAL'  
         AND (mo.Name_of_Local_Body IS NULL
              OR mo.Name_of_Local_Body = '')
    THEN 'BLOCK'
    ELSE mo.Name_of_Local_Body
END AS NameOfLocalBody,

	   CASE
		WHEN mo.Local_Body = 'RURAL'
        AND (mo.Name_of_Local_Body IS NULL
              OR mo.Name_of_Local_Body = '')
		THEN block.Value
		ELSE NULL
	END AS BlockName,

	CASE
		WHEN mo.Local_Body = 'RURAL'
         AND (mo.Name_of_Local_Body IS NULL
              OR mo.Name_of_Local_Body = '')
		THEN mam.VilllageTownCity
		ELSE NULL
	END AS Village,

	CASE
    /* RURAL – BLOCK */
    WHEN mo.Local_Body = 'RURAL'
         AND (mo.Name_of_Local_Body = 'BLOCK'
              OR mo.Name_of_Local_Body IS NULL
              OR mo.Name_of_Local_Body = '')
         AND zone.Value IS NULL
    THEN 'NIL'

    /* GCC or CMWS – ZONE exists (even if Local_Body is RURAL) */
    WHEN mo.Name_of_Local_Body IN ('GCC', 'CMWS')
         AND zone.Value IS NOT NULL
    THEN CONCAT(
            mo.Name_of_Local_Body,
            ', ',
            zone.Value
         )

    /* TOWN PANCHAYAT */
    WHEN mo.Name_of_Local_Body = 'TOWN PANCHAYAT'
         AND town.Value IS NOT NULL
    THEN town.Value

    /* MUNICIPALITY */
    WHEN mo.Name_of_Local_Body = 'MUNICIPALITY'
         AND municipality.Value IS NOT NULL
    THEN municipality.Value

    /* CORPORATION */
    WHEN mo.Name_of_Local_Body = 'CORPORATION'
         AND corporation.Value IS NOT NULL
    THEN corporation.Value

    ELSE NULL
END AS LocalBodyDetails,
		CONCAT(mam.DoorNo, ',', mam.StreetName) AS HomeAddress,
		mo.Address AS WorkAddress,
		mm.Phone_Number AS Phone,
		mm.Ration_Card_Number AS RationCardNumber,
		mm.Aadhaar_Number AS Aadhaar_Number,
        mfm.AadharNumber AS Mem_AadharNumber,
		mfm.Name AS FamilyMemberName,
		district.Value AS DistrictName,
		relation.Value AS RelationType,
		sex.Value AS Gender,
		mfm.Age,
		mfm.Education,
         CASE 
		WHEN course.Value IS NULL 
		THEN mfm.Course
		ELSE course.Value
	END AS Course,
    
		mfm.Standard,
		mfm.Degree_Name,
		mfm.EMIS_No,
	CASE
    WHEN mfm.Degree_Name IS NOT NULL
    THEN mfm.Degree_Name
    WHEN mfm.Standard IS NOT NULL
    THEN mfm.Standard
    ELSE 'NIL'
END AS CurrentEducationStatus,
        	CASE
	WHEN mfm.College_Address IS NOT NULL
    THEN mfm.College_Address
    WHEN mfm.School_Address IS NOT NULL
    THEN mfm.School_Address
    ELSE 'NIL'
END AS Name_Address,
	  CASE 
		WHEN familyOccupation.Value IS NULL 
		THEN mfm.Occupation
		ELSE familyOccupation.Value
	END AS FamilyMemberOccupation,
		disability.Value AS Disability,
		mfm.Year_Of_Completion,
		mfm.CreatedDate AS FamilyMemberCreatedDate,
		mm.CardStatus,cscm.Value AS Scheme, 
	cscm.Id AS SchemeId,
	csm.Value AS Status, 
	cscm.Code AS SchemeCode,
	csm.Code AS StatusCode,
    mo.Organization_Type        AS OrganizationTypeId,
    mam.District                AS DistrictId,
    mfm.Relation                AS RelationTypeId,
    mfm.Sex                     AS GenderId,
    mfm.Occupation              AS FamilyOccupationId,
    mfm.Disability              AS DisabilityId,
    mm.Marital_Status           AS MaritalStatusId,
    mm.Caste                    AS CommunityId,
   mo.Block                    AS BlockId,
   mo.Zone                     AS ZoneId,
   mo.Town_Panchayat           AS TownId,
   mo.Municipality             AS MunicipalityId,
   mo.Corporation              AS CorporationId,
   mfm.Course                  AS CourseId,
   mm.Education                AS EducationId,
  -- am.SchemeId                 AS SchemeId,
   am.StatusId                 AS StatusId

	FROM member_master mm
	LEFT JOIN member_family_member mfm ON mm.Id = mfm.Member_Id
	LEFT JOIN application_details ad ON mfm.Id = ad.FamilyMemberId
	Left Join application_master am on ad.ApplicationId = am.Id
	LEFT JOIN member_organization mo ON mm.Id = mo.Member_Id AND mo.IsTemp = 0
	LEFT JOIN member_address_master mam ON mm.Id = mam.MemberId
	-- LEFT JOIN two_column_configuration_values district ON mam.District = district.Id
	-- LEFT JOIN two_column_configuration_values marital ON mm.Marital_Status = marital.Id
	-- LEFT JOIN two_column_configuration_values relation ON mfm.Relation = relation.Id
	-- LEFT JOIN two_column_configuration_values sex ON mfm.Sex = sex.Id
	-- LEFT JOIN two_column_configuration_values familyOccupation ON mfm.Occupation = familyOccupation.Id
	-- LEFT JOIN two_column_configuration_values disability ON mfm.Disability = disability.Id
	-- LEFT JOIN two_column_configuration_values organization ON mo.Organization_Type = organization.Id
	-- LEFT JOIN two_column_configuration_values occupation ON mo.Type_of_Work = occupation.Id
	-- LEFT JOIN two_column_configuration_values community ON mm.Caste = community.Id
	-- LEFT JOIN two_column_configuration_values block ON mo.block = block.Id
    -- LEFT JOIN two_column_configuration_values zone ON mo.Zone = zone.Id
    -- LEFT JOIN two_column_configuration_values town ON mo.Town_Panchayat = town.Id
    -- LEFT JOIN two_column_configuration_values municipality ON mo.Municipality = municipality.Id
	-- LEFT JOIN two_column_configuration_values corporation ON mo.Corporation = corporation.Id
    -- LEFT JOIN two_column_configuration_values course ON mfm.Course = course.Id
    -- LEFT JOIN two_column_configuration_values education ON mm.Education = education.Id
	LEFT JOIN member_data_approval_master mdam ON mdam.Member_Id = mm.Id
	LEFT JOIN member_data_approval_history mdah ON mdah.Member_Detail_Approval_Master_Id = mdam.Id
	-- LEFT JOIN two_column_configuration_values cscm ON am.SchemeId = cscm.Id
	-- LEFT JOIN two_column_configuration_values csm ON am.StatusId = csm.Id
";

            string CountQuery = @"SELECT COUNT(*) FROM (
" + Query;

            string Condition = " WHERE (mm.IsTemp = 0 OR mm.IsTemp IS NULL) AND ";

            #endregion

            #region Existing Filters (UNCHANGED)

            // District
            if (filter.Where?.DistrictIds?.Count > 0)
                Condition += $" mo.District_Id IN ({string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"))}) AND ";

            // Local Body
            if (filter.Where?.Local_Bodys?.Count > 0)
                Condition += $" mo.Local_Body IN ({string.Join(",", filter.Where.Local_Bodys.Select(x => $"'{x}'"))}) AND ";


            if (filter.Where?.Name_of_Local_Bodys?.Count > 0)
                Condition += $" mo.Name_of_Local_Body IN ({string.Join(",", filter.Where.Name_of_Local_Bodys.Select(x => $"'{x}'"))}) AND ";

            // Organization
            if (filter.Where?.Organization_Types?.Count > 0)
                Condition += $" mo.Organization_Type IN ({string.Join(",", filter.Where.Organization_Types.Select(x => $"'{x}'"))}) AND ";

            // Type of Work
            if (filter.Where?.Type_of_Works?.Count > 0)
                Condition += $" mo.Type_of_Work IN ({string.Join(",", filter.Where.Type_of_Works.Select(x => $"'{x}'"))}) AND ";
            // Aadhaar Number (Exact or Partial match)
            if (!string.IsNullOrWhiteSpace(filter.Where?.Aadhaar_Number))
            {
                string aadhaar = filter.Where.Aadhaar_Number.Replace("'", "").Trim();
                Condition += $" mm.Aadhaar_Number LIKE '%{aadhaar}%' AND ";
            }

            // Phone Number (Exact or Partial match)
            if (!string.IsNullOrWhiteSpace(filter.Where?.Phone_Number))
            {
                string phone = filter.Where.Phone_Number.Replace("'", "").Trim();
                Condition += $" mm.Phone_Number LIKE '%{phone}%' AND ";
            }


            // Status Logic (AS IS)
            if (filter.Where?.StatusIds?.Count > 0)
            {
                List<string> statusConditions = new();

                foreach (var status in filter.Where.StatusIds)
                {
                    string dm = filter.Where.DMroleId;
                    string dc = filter.Where.DCroleId;
                    string hq = filter.Where.HQroleId;

                    if (status == "SAVED") statusConditions.Add("(mm.IsSubmitted=0)");
                    if (status == "SUBMITTED") statusConditions.Add("(mm.IsSubmitted=1 AND mdam.Status='WAITING_FOR_APPROVAL')");
                    if (status == "WAITING_FOR_APPROVAL(DM)") statusConditions.Add($"(mdam.Status='IN_PROGRESS' AND mdam.Approval_For='{dm}')");
                    if (status == "WAITING_FOR_APPROVAL(DC)") statusConditions.Add($"(mdam.Approval_For='{dc}')");
                    if (status == "WAITING_FOR_APPROVAL(HQ)") statusConditions.Add($"(mdam.Approval_For='{hq}')");
                    if (status == "DM_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{dm}')");
                    if (status == "DC_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{dc}')");
                    if (status == "HQ_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{hq}')");
                    if (status == "DM_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{dm}')");
                    if (status == "DC_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{dc}')");
                    if (status == "HQ_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{hq}')");
                }

                Condition += $" ({string.Join(" OR ", statusConditions)}) AND ";
            }

            // Approval Date
            if (filter.Where?.approvaldateRange?.Count == 2)
            {
                var from = DateOnly.FromDateTime(DateTime.Parse(filter.Where.approvaldateRange[0]));
                var to = DateOnly.FromDateTime(DateTime.Parse(filter.Where.approvaldateRange[1]));
                Condition += $" {approvedDateFilterColumn} BETWEEN '{from:yyyy-MM-dd}' AND '{to:yyyy-MM-dd}' AND ";
            }

            #endregion

            #region Column Search (SAME AS FIRST DAL)

            if (filter.ColumnSearch?.Count > 0)
            {
                foreach (var item in filter.ColumnSearch)
                {
                    if (!string.IsNullOrWhiteSpace(item.SearchString) && !string.IsNullOrWhiteSpace(item.FieldName))
                    {
                        string field = item.FieldName.Trim().ToLower();

                        string column = item.FieldName switch
                        {
                            "name" => "CONCAT(mm.First_Name,' ',mm.Last_Name)",
                            "referencermemberid" => "mm.Member_Id",
                            "phone" => "mm.Phone_Number",
                            "aadhaar_number" => "mm.Aadhaar_Number",
                            "cardstatus" => "mm.CardStatus",

                            "organization_type" => "organization.Value",
                            "maritalstatus" => "marital.Value",
                            "localbody" => "mo.Local_Body",
                            "nameoflocalbody" => "mo.Name_of_Local_Body",
                            "districtname" => "district.Value",

                            "familymembername" => "mfm.Name",
                            "relationtype" => "relation.Value",
                            "gender" => "sex.Value",
                            "familymemberoccupation" => "familyOccupation.Value",
                            "disability" => "disability.Value",

                            "education" => "mfm.Education",
                            "course" => "mfm.Course",
                            "standard" => "mfm.Standard",
                            "degree_name" => "mfm.Degree_Name",
                            "emis_no" => "mfm.EMIS_No",
                            "school_address" => "mfm.School_Address",

                            "age" => "CAST(mfm.Age AS CHAR)",
                            "year_of_completion" => "CAST(mfm.Year_Of_Completion AS CHAR)",
                            "familymembercreateddate" => "DATE_FORMAT(mfm.CreatedDate,'%d-%m-%Y')",
                            _ => ""
                        };

                        if (!string.IsNullOrEmpty(column))
                            Condition += $" {column} LIKE '%{item.SearchString.Replace("'", "")}%' AND ";
                    }
                }
            }

            #endregion

            #region Global Search

            if (!string.IsNullOrWhiteSpace(filter.SearchString))
            {
                string s = filter.SearchString.Trim();
                Condition += $@"(
            mm.Member_Id LIKE '%{s}%' OR
            mm.Phone_Number LIKE '%{s}%' OR
            mm.Aadhaar_Number LIKE '%{s}%' OR
            CONCAT(mm.First_Name,' ',mm.Last_Name) LIKE '%{s}%' 
         OR organization.Value LIKE '%{s}%'
        OR marital.Value LIKE '%{s}%'
        OR mo.Local_Body LIKE '%{s}%'
        OR mo.Name_of_Local_Body LIKE '%{s}%'

        OR mfm.Name LIKE '%{s}%'
        OR district.Value LIKE '%{s}%'
        OR relation.Value LIKE '%{s}%'
        OR sex.Value LIKE '%{s}%'

        OR CAST(mfm.Age AS CHAR) LIKE '%{s}%'
        OR mfm.Education LIKE '%{s}%'
        OR mfm.Course LIKE '%{s}%'
        OR mfm.Standard LIKE '%{s}%'
        OR mfm.Degree_Name LIKE '%{s}%'
        OR mfm.EMIS_No LIKE '%{s}%'
        OR mfm.School_Address LIKE '%{s}%'

        OR familyOccupation.Value LIKE '%{s}%'
        OR disability.Value LIKE '%{s}%'

        OR CAST(mfm.Year_Of_Completion AS CHAR) LIKE '%{s}%'
        OR DATE_FORMAT(mfm.CreatedDate,'%d-%m-%Y') LIKE '%{s}%'

        OR mm.CardStatus LIKE '%{s}%'
        ) AND ";
            }

            #endregion

            if (Condition.EndsWith(" AND "))
                Condition = Condition[..^5];

            Query += Condition;
            CountQuery += Condition + ") X";

            using var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            TotalCount = conn.ExecuteScalar<int>(CountQuery);

            #region Sorting + Pagination

            string orderBy = " ORDER BY mfm.CreatedDate DESC ";

            if (filter.Sorting != null && !string.IsNullOrWhiteSpace(filter.Sorting.FieldName))
            {
                string sortKey = filter.Sorting.FieldName.Trim().ToLower();

                string sortField = filter.Sorting.FieldName switch
                {
                    "name" => "mm.First_Name",
                    "referencermemberid" => "mm.Member_Id",
                    "phone" => "mm.Phone_Number",
                    "aadhaar_number" => "mm.Aadhaar_Number",
                    "cardstatus" => "mm.CardStatus",

                    "organization_type" => "organization.Value",
                    "maritalstatus" => "marital.Value",
                    "localbody" => "mo.Local_Body",
                    "nameoflocalbody" => "mo.Name_of_Local_Body",
                    "districtname" => "district.Value",

                    "familymembername" => "mfm.Name",
                    "relationtype" => "relation.Value",
                    "gender" => "sex.Value",
                    "familymemberoccupation" => "familyOccupation.Value",
                    "disability" => "disability.Value",

                    "education" => "mfm.Education",
                    "course" => "mfm.Course",
                    "standard" => "mfm.Standard",
                    "degree_name" => "mfm.Degree_Name",
                    "emis_no" => "mfm.EMIS_No",

                    "age" => "mfm.Age",
                    "year_of_completion" => "mfm.Year_Of_Completion",
                    "familymembercreateddate" => "mfm.CreatedDate",

                    _ => "mfm.CreatedDate"
                };

                orderBy = $" ORDER BY {sortField} {filter.Sorting.Sort} ";
            }

            Query += orderBy;

            if (filter.Take > 0)
                Query += $" LIMIT {filter.Take} OFFSET {filter.Skip} ";

            #endregion

            return conn.Query<FamilyMemberApprovalModel>(Query, commandTimeout: 300).ToList();
        }


        public List<GetDatewiseProgressiveReportModel> GetDatewiseProgressiveReport(
            MemberFilterModel filter,
            out int TotalCount)
        {
            TotalCount = 0;

            #region Base Query

            string Query = @"
SELECT 
    tcv.Value AS DistrictName,

    COUNT(CASE WHEN YEAR(mm.CreatedDate) = YEAR(CURDATE()) - 2 THEN mm.Id END) AS Year_1,
    COUNT(CASE WHEN YEAR(mm.CreatedDate) = YEAR(CURDATE()) - 1 THEN mm.Id END) AS Year_2,
    COUNT(CASE WHEN YEAR(mm.CreatedDate) = YEAR(CURDATE()) THEN mm.Id END) AS Year_3

FROM member_master mm
LEFT JOIN member_organization mo 
       ON mo.Member_Id = mm.Id
LEFT JOIN two_column_configuration_values tcv
       ON tcv.Id = mo.District_Id
LEFT JOIN member_data_approval_master mdam 
       ON mdam.Member_Id = mm.Id
LEFT JOIN member_data_approval_history mdah 
       ON mdah.Member_Detail_Approval_Master_Id = mdam.Id
";

            string Condition = " WHERE mm.CreatedDate IS NOT NULL ";
            Condition += " AND (mm.IsTemp = 0 OR mm.IsTemp IS NULL) ";

            #endregion

            #region Existing Filters (SAME STYLE AS FIRST DAL)

            if (filter.Where?.DistrictIds?.Count > 0)
                Condition += $" AND mo.District_Id IN ({string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.Local_Bodys?.Count > 0)
                Condition += $" mo.Local_Body IN ({string.Join(",", filter.Where.Local_Bodys.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.Name_of_Local_Bodys?.Count > 0)
                Condition += $" mo.Name_of_Local_Body IN ({string.Join(",", filter.Where.Name_of_Local_Bodys.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.Organization_Types?.Count > 0)
                Condition += $" mo.Organization_Type IN ({string.Join(",", filter.Where.Organization_Types.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.Type_of_Works?.Count > 0)
                Condition += $" mo.Type_of_Work IN ({string.Join(",", filter.Where.Type_of_Works.Select(x => $"'{x}'"))}) AND ";

            if (filter.Where?.StatusIds?.Count > 0)
            {
                List<string> statusConditions = new();

                foreach (var status in filter.Where.StatusIds)
                {
                    string dm = filter.Where.DMroleId;
                    string dc = filter.Where.DCroleId;
                    string hq = filter.Where.HQroleId;

                    if (status == "SAVED") statusConditions.Add("(mm.IsSubmitted = 0)");
                    if (status == "SUBMITTED") statusConditions.Add("(mm.IsSubmitted = 1 AND mdam.Status='WAITING_FOR_APPROVAL')");
                    if (status == "DM_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{dm}')");
                    if (status == "DC_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{dc}')");
                    if (status == "HQ_APPROVED") statusConditions.Add($"(mdam.ApprovedBy='{hq}')");
                    if (status == "DM_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{dm}')");
                    if (status == "DC_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{dc}')");
                    if (status == "HQ_RETURNED") statusConditions.Add($"(mdah.Status='Returned' AND mdah.To_Role='{hq}')");
                }

                Condition += $" ({string.Join(" OR ", statusConditions)}) AND ";
            }

            #endregion

            #region Column Search (GROUP SAFE – SAME AS FIRST DAL)

            if (filter.ColumnSearch?.Count > 0)
            {
                foreach (var item in filter.ColumnSearch)
                {
                    if (!string.IsNullOrWhiteSpace(item.SearchString) &&
                        !string.IsNullOrWhiteSpace(item.FieldName))
                    {
                        string key = item.FieldName.Trim().ToLower();
                        string column = key switch
                        {
                            "districtname" => "tcv.Value",
                            "year_1" => "CAST(COUNT(CASE WHEN YEAR(mm.CreatedDate)=YEAR(CURDATE())-2 THEN mm.Id END) AS CHAR)",
                            "year_2" => "CAST(COUNT(CASE WHEN YEAR(mm.CreatedDate)=YEAR(CURDATE())-1 THEN mm.Id END) AS CHAR)",
                            "year_3" => "CAST(COUNT(CASE WHEN YEAR(mm.CreatedDate)=YEAR(CURDATE()) THEN mm.Id END) AS CHAR)",
                            _ => ""
                        };

                        if (!string.IsNullOrEmpty(column))
                            Condition += $" {column} LIKE '%{item.SearchString.Replace("'", "")}%' AND ";
                    }
                }
            }

            #endregion

            #region Global Search (SAME STYLE AS FIRST DAL)

            if (!string.IsNullOrWhiteSpace(filter.SearchString))
            {
                string s = filter.SearchString.Replace("'", "").Trim();

                Condition += $@"
(
    tcv.Value LIKE '%{s}%'
    OR CAST(COUNT(CASE WHEN YEAR(mm.CreatedDate)=YEAR(CURDATE())-2 THEN mm.Id END) AS CHAR) LIKE '%{s}%'
    OR CAST(COUNT(CASE WHEN YEAR(mm.CreatedDate)=YEAR(CURDATE())-1 THEN mm.Id END) AS CHAR) LIKE '%{s}%'
    OR CAST(COUNT(CASE WHEN YEAR(mm.CreatedDate)=YEAR(CURDATE()) THEN mm.Id END) AS CHAR) LIKE '%{s}%'
) AND ";
            }

            #endregion

            #region Finalize Query

            if (Condition.EndsWith(" AND "))
                Condition = Condition[..^5];

            Query += Condition;
            Query += " GROUP BY tcv.Value ";

            #endregion

            #region Count Query

            string CountQuery = $"SELECT COUNT(*) FROM ({Query}) X";

            using var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            TotalCount = conn.ExecuteScalar<int>(CountQuery);

            #endregion

            #region Sorting + Pagination

            string orderBy = " ORDER BY DistrictName ASC ";

            if (filter.Sorting != null && !string.IsNullOrWhiteSpace(filter.Sorting.FieldName))
            {
                string sortCol = filter.Sorting.FieldName.ToLower() switch
                {
                    "districtname" => "DistrictName",
                    "year_1" => "Year_1",
                    "year_2" => "Year_2",
                    "year_3" => "Year_3",
                    _ => "DistrictName"
                };

                orderBy = $" ORDER BY {sortCol} {filter.Sorting.Sort} ";
            }

            Query += orderBy;

            if (filter.Take > 0)
                Query += $" LIMIT {filter.Take} OFFSET {filter.Skip} ";

            #endregion

            return conn.Query<GetDatewiseProgressiveReportModel>(Query, commandTimeout: 300).ToList();
        }

        public List<DatewiseApprovalModel> DatewiseAprovedList(MemberFilterModel filter, out int TotalCount)
        {
            TotalCount = 0;

            string approvedDateCase = "DATE_FORMAT(mdam.ApprovedOn, '%Y-%m-%d')";
            if (filter.Where.StatusIds?.Count > 0)
            {
                // If SAVED is selected
                if (filter.Where.StatusIds.Contains("SAVED"))
                {
                    approvedDateCase = "DATE_FORMAT(mm.CreatedDate, '%Y-%m-%d')";
                }

                // If any APPROVED is selected
                else if (filter.Where.StatusIds.Any(x => x.Contains("WAITING")))
                {
                    approvedDateCase = "DATE_FORMAT(mdam.CreatedDate, '%Y-%m-%d')";
                }
                else if (filter.Where.StatusIds.Any(x => x.Contains("APPROVED")))
                {
                    approvedDateCase = "DATE_FORMAT(mdam.ApprovedOn, '%Y-%m-%d')";
                }

                // If any RETURNED is selected
                else if (filter.Where.StatusIds.Any(x => x.Contains("RETURNED")))
                {
                    approvedDateCase = "DATE_FORMAT(mdah.CreatedOn, '%Y-%m-%d')";
                }
            }

            string Query = @" SELECT distinct mm.Member_Id,mm.Id,
       dt.Value AS District,
       CONCAT(mm.First_Name, ' ', mm.Last_Name) AS Name,
       mm.Phone_Number AS Phone,
       mm.Aadhaar_Number AS memberAadhaarNumber,
       tw.Value AS Type_of_Work,
       ot.Value AS OrganizationType,
       mo.Local_Body AS LocalBody,
       mo.Name_of_Local_Body AS NameOfLocalBody, mm.CollectedByName,mm.CollectedByPhoneNumber,mm.CollectedOn,mdam.Status,
" + approvedDateCase + @" AS ApprovedDate,
       ar.RoleName AS ApprovedBy,
arl.RoleName AS approved_For
FROM member_master mm
LEFT JOIN member_organization mo ON mm.Id = mo.Member_Id and mo.isTemp = 0
LEFT JOIN two_column_configuration_values dt ON dt.Id = mo.District_Id
LEFT JOIN two_column_configuration_values tw ON tw.Id = mo.Type_of_Work
LEFT JOIN two_column_configuration_values ot ON ot.Id = mo.Organization_Type
LEFT JOIN member_data_approval_master mdam ON mdam.Member_Id = mm.Id AND mm.isTemp = 0
LEFT JOIN member_data_approval_history mdah ON mdah.Member_Detail_Approval_Master_Id = mdam.Id
LEFT JOIN account_role ar ON ar.Id = mdam.ApprovedBy
LEFT JOIN account_role arl ON arl.Id = mdam.Approval_For";

            string CountQuery = @" select COUNT(*)
FROM member_master mm
LEFT JOIN member_organization mo ON mm.Id = mo.Member_Id
LEFT JOIN two_column_configuration_values dt ON dt.Id = mo.District_Id
LEFT JOIN two_column_configuration_values tw ON tw.Id = mo.Type_of_Work
LEFT JOIN two_column_configuration_values ot ON ot.Id = mo.Organization_Type
LEFT JOIN member_data_approval_master mdam ON mdam.Member_Id = mm.Id AND mm.isTemp = 0
LEFT JOIN member_data_approval_history mdah ON mdah.Member_Detail_Approval_Master_Id = mdam.Id
LEFT JOIN account_role ar ON ar.Id = mdam.ApprovedBy
LEFT JOIN account_role arl ON arl.Id = mdam.Approval_For";


            if (filter != null)
            {
                #region Build Query Conditions

                string Condition = " WHERE (mm.IsTemp = 0 or mm.IsTemp IS NULL) AND ";
               // string Condition = " WHERE (mm.IsTemp = 0) AND ";

                if (filter.Where != null)
                {
                    //if (filter.Where.IsSubmitted == true)
                    //{
                    //    Condition += " mm.IsSubmitted = 1 AND ";
                    //}
                    //else if (filter.Where.IsSubmitted == false)
                    //{
                    //    //  Condition += " (mm.IsSubmitted = 0 OR mm.IsSubmitted IS NULL or mm.IsSubmitted=1) AND ";
                    //}

                    List<string> orgProps = new List<string>
                            {
                                "Type_of_Work", "Core_Sanitary_Worker_Type", "Organization_Type", 
                                "Local_Body", "Name_of_Local_Body",  "District_Id","memberAadhaarNumber"
                            };
                    PropertyInfo[] whereProperties = typeof(MemberWhereClauseProperties).GetProperties();

                    // Place this OUTSIDE the property loop and BEFORE the foreach(property):
                    string approvedDateFilterColumn = "CAST(mdam.ApprovedOn AS DATE)";

                    if (filter.Where.StatusIds?.Count > 0)
                    {
                        if (filter.Where.StatusIds.Contains("SAVED"))
                        {
                            approvedDateFilterColumn = "CAST(mm.CreatedDate AS DATE)";
                        }
                        else if (filter.Where.StatusIds.Any(x => x.Contains("WAITING")))
                        {
                            approvedDateFilterColumn = "CAST(mdam.CreatedDate AS DATE)";
                        }
                        else if (filter.Where.StatusIds.Any(x => x.Contains("APPROVED")))
                        {
                            approvedDateFilterColumn = "CAST(mdam.ApprovedOn AS DATE)";
                        }
                        else if (filter.Where.StatusIds.Any(x => x.Contains("RETURNED")))
                        {
                            approvedDateFilterColumn = "CAST(mdah.CreatedOn AS DATE)";
                        }
                    }

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

                                Condition += " DATE(mm.ModifiedDate) >= '" + from.ToString("yyyy-MM-dd") + "' AND DATE(mm.ModifiedDate) <= '" + to.ToString("yyyy-MM-dd") + "' AND ";
                              
                            }
                            else if (property.Name == "IsActive")
                            {
                                if (value == "True")
                                {
                                    Condition += " mm." + property.Name + "=" + "1" + " AND ";
                                }
                                else if (value == "False")
                                {
                                    Condition += " mm." + property.Name + "=" + "0" + " AND ";
                                }
                            }
                            else if (property.Name == "FromDate")
                            {
                                Condition += " DATE(mm.ModifiedDate) >= '" + filter.Where.FromDate?.ToString("yyyy-MM-dd") + "' AND DATE(mm.ModifiedDate) <= '" + filter.Where.ToDate?.ToString("yyyy-MM-dd") + "' AND ";
                            }
                           
                            else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0 && (filter.Where.user_Role == "ADM" || filter.Where.user_Role == "HQ"))
                            {

                                string inClause = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));

                                // For ADM/HQ: include empty / null OR the matching list
                                Condition += $"(mo.District_Id IS NULL OR mo.District_Id = '' OR mo.District_Id IN ({inClause})) AND ";
                            }


                            
                            else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0 && (filter.Where.user_Role != "ADM" && filter.Where.user_Role != "HQ"))
                            {
                                string inClause = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));
                                Condition += $"(mo.District_Id IN ({inClause})) AND ";
                            }



                            

                            else if (property.Name == "Local_Body")
                            {

                                Condition += " mo.Local_Body = '" + value + "' AND ";
                            }
                            else if (property.Name == "Local_Bodys" && filter.Where.Local_Bodys?.Count > 0)
                            {
                                string Local_BodysConditions = "";
                                List<string> Local_BodysList = new List<string>();
                                filter.Where.Local_Bodys.ForEach(x =>
                                {
                                    Local_BodysList.Add(" (mo.Local_Body = '" + x + "') ");
                                });
                                Local_BodysConditions = string.Join(" OR ", Local_BodysList);

                                Condition += "(" + Local_BodysConditions + ") AND ";
                            }
                            else if (property.Name == "Name_of_Local_Body")
                            {

                                Condition += " mo.Name_of_Local_Body = '" + value + "' AND ";
                            }

                            else if (property.Name == "Name_of_Local_Bodys" && filter.Where.Name_of_Local_Bodys?.Count > 0)
                            {
                                string Name_of_Local_BodysConditions = "";
                                List<string> Name_of_Local_BodysList = new List<string>();
                                filter.Where.Name_of_Local_Bodys.ForEach(x =>
                                {
                                    Name_of_Local_BodysList.Add(" (mo.Name_of_Local_Body = '" + x + "') ");
                                });
                                Name_of_Local_BodysConditions = string.Join(" OR ", Name_of_Local_BodysList);

                                Condition += "(" + Name_of_Local_BodysConditions + ") AND ";
                            }
                            else if (property.Name == "Zone")
                            {

                                var zones = filter.Where.Zone.ToString()
                                        .Replace("\n", "") // remove newlines
                                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                        .Select(x => $"'{x.Trim()}'");

                                string inClause = string.Join(",", zones);

                                Condition += $"(mo.Zone IN ({inClause})) AND ";
                            }
                            else if (property.Name == "Organization_Types" && filter.Where.Organization_Types?.Count > 0)
                            {
                                string Organization_TypesConditions = "";
                                List<string> OrganiList = new List<string>();
                                filter.Where.Organization_Types.ForEach(x =>
                                {
                                    OrganiList.Add(" (mo.Organization_Type = '" + x + "') ");
                                });
                                Organization_TypesConditions = string.Join(" OR ", OrganiList);



                                Condition += "(" + Organization_TypesConditions + ") AND ";
                            }
                            else if (property.Name == "Type_of_Works" && filter.Where.Type_of_Works?.Count > 0)
                            {
                                string Type_of_WorksConditions = "";
                                List<string> Type_of_WorkList = new List<string>();
                                filter.Where.Type_of_Works.ForEach(x =>
                                {
                                    Type_of_WorkList.Add(" (mo.Type_of_Work = '" + x + "') ");
                                });
                                Type_of_WorksConditions = string.Join(" OR ", Type_of_WorkList);



                                Condition += "(" + Type_of_WorksConditions + ") AND ";
                            }
                            else if (property.Name == "Mobile" && filter.Where.Mobile?.Count > 0)
                            {

                                string inClause = string.Join(",", filter.Where.Mobile.Select(x => $"'{x}'"));


                                Condition += $"( mm.CollectedByPhoneNumber IN ({inClause})) AND ";

                            }
                            //else if (property.Name == "StatusIds" && filter.Where.StatusIds?.Count() > 0)
                            //{
                            //    string statusIdConditions = "";
                            //    List<string> conditionList = new List<string>();
                            //    filter.Where.StatusIds.ForEach(x =>
                            //    {
                            //        conditionList.Add(" (mdam.Status = '" + x + "') ");
                            //    });
                            //    statusIdConditions = string.Join(" OR ", conditionList);

                            //    Condition += "(" + statusIdConditions + ") AND ";
                            //}

                            else if (property.Name == "StatusIds" && filter.Where.StatusIds?.Count() > 0)
                            {
                                List<string> conditionList = new List<string>();

                                foreach (var status in filter.Where.StatusIds)
                                {
                                    string dm = filter.Where.DMroleId;
                                    string dc = filter.Where.DCroleId;
                                    string HQ = filter.Where.HQroleId;


                                    if (status.Equals("SAVED", StringComparison.OrdinalIgnoreCase))
                                    {

                                        conditionList.Add(" (mm.IsSubmitted=0) ");
                                    }


                                    if (status.Equals("SUBMITTED", StringComparison.OrdinalIgnoreCase))
                                    {

                                        conditionList.Add(" (mm.IsSubmitted=1 and mdam.Status = 'WAITING_FOR_APPROVAL') ");
                                    }

                                    if (status.Equals("WAITING_FOR_APPROVAL(DM)", StringComparison.OrdinalIgnoreCase))
                                    {
                                        
                                        conditionList.Add(" (mdam.Status = 'IN_PROGRESS' AND mdam.Approval_For ='" + dm + "') ");
                                    }
                                    if (status.Equals("WAITING_FOR_APPROVAL(HQ)", StringComparison.OrdinalIgnoreCase))
                                    {
                                       
                                        conditionList.Add(" (mdam.Status = 'IN_PROGRESS' AND mdam.Approval_For='" + HQ + "') ");
                                    }
                                    if (status.Equals("WAITING_FOR_APPROVAL(DC)", StringComparison.OrdinalIgnoreCase))
                                    {
                                        
                                        conditionList.Add(" (mdam.Approval_For='" + dc + "') ");
                                    }


                                    if (status.Equals("DM_APPROVED", StringComparison.OrdinalIgnoreCase))
                                    {
                                        
                                        conditionList.Add(" (mdam.Status = 'IN_PROGRESS' AND mdam.ApprovedBy ='" + dm + "') ");
                                    }
                                    if (status.Equals("HQ_APPROVED", StringComparison.OrdinalIgnoreCase))
                                    {
                                        
                                        conditionList.Add(" (mdam.ApprovedBy ='" + HQ + "') ");
                                    }
                                    if (status.Equals("DC_APPROVED", StringComparison.OrdinalIgnoreCase))
                                    {
                                        
                                        conditionList.Add(" (mdam.ApprovedBy ='" + dc + "') ");
                                    }

                                    if (status.Equals("DM_RETURNED", StringComparison.OrdinalIgnoreCase))
                                    {

                                        conditionList.Add(" (mdah.Status ='Returned' and mdah.To_Role= '" + dm + "' AND mdam.Approval_For= '" + dm + "') ");
                                    }
                                    if (status.Equals("DC_RETURNED", StringComparison.OrdinalIgnoreCase))
                                    {

                                        conditionList.Add(" (mdah.Status ='Returned' and mdah.To_Role= '" + dc + "' AND mdam.Approval_For= '" + dc + "') ");
                                    }
                                    if (status.Equals("HQ_RETURNED", StringComparison.OrdinalIgnoreCase))
                                    {

                                        conditionList.Add(" (mdah.Status ='Returned' and mdah.To_Role= '" + HQ + "' AND mdam.Approval_For= '" + HQ + "') ");
                                    }
                                  


                                    //else
                                    //{
                                    //    conditionList.Add($" (mdam.Status = '{status}') ");
                                    //}
                                }

                                Condition += "(" + string.Join(" OR ", conditionList) + ") AND ";
                            }


                            else if (property.Name == "Type_of_Work")
                            {
                                Condition += " mo.Type_of_Work = '" + value + "' AND ";
                            }
                            
                            else if (property.Name == "Organization_Type")
                            {
                                Condition += " mo.Organization_Type = '" + value + "' AND ";
                            }



                            
                         
                                else if (property.Name == "approvaldateRange" && filter.Where.approvaldateRange?.Count() == 2)
                                {
                                    var dates = filter.Where.approvaldateRange;

                                    var fromDate = DateOnly.FromDateTime(DateTime.Parse(dates[0]).ToLocalTime());
                                    var toDate = DateOnly.FromDateTime(DateTime.Parse(dates[1]).ToLocalTime());

                                    Condition += $" {approvedDateFilterColumn} BETWEEN '{fromDate:yyyy-MM-dd}' AND '{toDate:yyyy-MM-dd}' AND ";
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
                                columnName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                            }
                            else if (string.Equals(item.FieldName, "Phone", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Phone_Number";
                            }
                            else if (string.Equals(item.FieldName, "memberAadhaarNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Aadhaar_Number";
                            }
                            else if (string.Equals(item.FieldName, "Member_Id", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Member_Id";
                            }
                           
                            else if (string.Equals(item.FieldName, "Type_of_Works", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.Type_of_Work";
                            }
                           
                            else if (string.Equals(item.FieldName, "OrganizationType", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "ot.Value";
                            }
                           
                            else if (string.Equals(item.FieldName, "localBody", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.Local_Body";
                            }
                            else if (string.Equals(item.FieldName, "nameOfLocalBody", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mo.Name_of_Local_Body";
                            }
                           
                            else if (string.Equals(item.FieldName, "CollectedOn", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CollectedOn";
                            }
                           
                            else if (string.Equals(item.FieldName, "CollectedByPhoneNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CollectedByPhoneNumber";
                            }
                           
                            else if (string.Equals(item.FieldName, "CollectedByName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.CollectedByName";
                            }
                           
                            else if (string.Equals(item.FieldName, "ModifiedByUserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.ModifiedByUserName";
                            }
                           
                            else if (string.Equals(item.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "dt.Value";
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
                                "mm.Member_Id",
                                "mm.Phone_Number",
                                "mm.Aadhaar_Number",
                                "CONCAT(mm.First_Name, ' ', mm.Last_Name)",
                                "mm.ModifiedByUserName",
                                "dt.Value",
                                "ot.Value",
                                 "tw.Value",
                                 "mm.CollectedByName",
                                 "mm.CollectedByPhoneNumber",
                                "DATE_FORMAT(mm.ModifiedDate, '%d-%m-%Y')"
                            };
                    foreach (var column in columnsToSearch)
                    {
                        string currentSearchString = column == "mm.Member_Id" ? memberIdSearchString : originalSearchString;
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
                            FieldName = "mm.Member_Id";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Phone", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Phone_Number";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "memberAadhaarNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Aadhaar_Number";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Type_of_Works", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Type_of_Work";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "OrganizationType", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "ot.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "localBody", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Local_Body";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedOn", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedOn";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedByPhoneNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedByPhoneNumber";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "CollectedByName", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.CollectedByName";
                        }
                       
                        else if (string.Equals(filter?.Sorting.FieldName, "nameOfLocalBody", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mo.Name_of_Local_Body";
                        }
                       
                        
                        else if (string.Equals(filter?.Sorting.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "dt.Value";
                        }
                        else
                        {
                            FieldName = "mm.ModifiedDate";
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
                        Condition += " ORDER BY mm.ModifiedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY mm.ModifiedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return SqlMapper.Query<DatewiseApprovalModel>(conn, Query, commandTimeout: 300, commandType: CommandType.Text)?.ToList() ?? new List<DatewiseApprovalModel>();
                }
            }

            return null;
        }


       

        #endregion reports
        public MemberFormGeneralInfo MemberFormGeneralInfo_Get(string MemberId)
        {
            dynamic @params = new
            {
                pMemberId = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<MemberFormGeneralInfo>(connection, "Member_Form_General_Info", @params, commandType: CommandType.StoredProcedure) ?? new MemberFormGeneralInfo();
        }
        public int GenerateMemberId(string MemberId)
        {
            dynamic @params = new
            {
                pMember_Id = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, "GenerateMemberId", @params, commandType: CommandType.StoredProcedure);
        }
        #endregion Common

        #region Member
        public MemberDetailsFormModel Member_Form_Get(string MemberId)
        {
            MemberDetailsFormModel model = new MemberDetailsFormModel();

            dynamic @params = new
            {
                pMemberId = MemberId ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Application_Member_Form_Get", @params, commandType: CommandType.StoredProcedure);

            model.Religion_SelectList = multi.Read<SelectListItem>();
            model.Community_SelectList = multi.Read<SelectListItem>();
            model.Caste_SelectList = multi.Read<SelectListItem>();
            model.Marital_Status_SelectList = multi.Read<SelectListItem>();
            model.Gender_SelectList = multi.Read<SelectListItem>();
            model.Education_SelectList = multi.Read<SelectListItem>();

            return model;
        }
        public string Application_Detail_Member_SaveUpdate(MemberDetailsSaveModel model, AuditColumnsModel audit, bool IsSubmitted = false, bool IsNewMember = false)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    dynamic @params = new
                    {
                        pId = model.Id,
                        pMember_Id = model.Member_ID,
                        pFirst_Name = model.First_Name,
                        pLast_Name = model.Last_Name,
                        pFather_Name = model.Father_Name,
                        pDate_Of_Birth = model.Date_Of_Birth,
                        pGender = model.Gender,
                        pReligion = model.Religion,
                        pCaste = model.Caste,
                        pCommunity = model.Community,
                        pMarital_Status = model.Marital_Status,
                        pAadhaar_Number = model.Aadhaar_Number,
                        pPhone_Number = model.Phone_Number,
                        pEducation = model.Education,
                        pIsActive = model.IsActive,
                        pIsTemp = model.IsTemp,
                        pSavedBy = audit.SavedBy,
                        pSavedByUserName = audit.SavedByUserName,
                        pSavedDate = audit.SavedDate,
                        pMember_json = model.Member_json,
                        pEmail = model.Email,
                        pRation_Card_Number = model.Ration_Card_Number,
                        pIsPermanentAddressSameAsTemporaryAddress = model.IsPermanentAddressSameAsTemporaryAddress,
                        pIsSubmitted = IsSubmitted,
                        pIsNewMember = IsNewMember,
                        pCollectedByName = model.CollectedByName,
                        pCollectedByPhoneNumber = model.CollectedByPhoneNumber,
                        pCollectedOn = model.CollectedOn,
                        pDmApproved = model.DM_Status_Approval,
                        pHqApproved = model.HQ_Status_Approval,
                        pAadhaarVerified = model.AadhaarVerified
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.ExecuteScalar<string>(connection, "Application_Detail_Member_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return "";
                    }
                    Thread.Sleep(1000);
                }
            }

            return "";
        }

        public string Member_IsSubmitted_Update(MemberDetailsSaveModel model, AuditColumnsModel audit, bool IsSubmitted = false, bool IsNewMember = false)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    dynamic @params = new
                    {
                        pId = model.Id,
                        pIsSubmitted = model.IsSubmit,
                        pCollectedByName = model.CollectedByName,
                        pCollectedByPhoneNumber = model.CollectedByPhoneNumber,
                        pCollectedOn = model.CollectedOn,

                        pSavedBy = audit.SavedBy,
                        pSavedByUserName = audit.SavedByUserName,
                        pSavedDate = audit.SavedDate
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.ExecuteScalar<string>(connection, "Member_IsSubmitted_Update", @params, commandType: CommandType.StoredProcedure);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return "";
                    }
                    Thread.Sleep(1000);
                }
            }

            return "";
        }

        public MemberIdCodeGetModel Application_Detail_Member_Init_SaveUpdate(MemberInitSaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pMember_Id = model.Member_Id,
                pFirst_Name = model.First_Name,
                pLast_Name = model.Last_Name,
                pPhone_Number = model.Phone_Number,
                pPrimaryDistrict = model.PrimaryDistrict,
                pEmail = model.Email,
                pAadhaar_Number = model.Aadhaar_Number,
                pAadhaarVerified = model.AadhaarVerified,
                pAadhaar_Json = model.Aadhaar_Json,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<MemberIdCodeGetModel>(connection, "Application_Detail_Member_Init_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public MemberDetailsModel Application_Member_Get(string Id = "")
        {
            dynamic @params = new
            {
                pId = Id
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<MemberDetailsModel>(connection, "Application_Member_Get", @params, commandType: CommandType.StoredProcedure) ?? new MemberDetailsModel();
        }
        public MemberViewModelExisting Get_Member_All_Saved_Details_By_MemberId(string MemberId)
        {
            MemberViewModelExisting model = new MemberViewModelExisting();
            dynamic @params = new
            {
                pMember_Id = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            var multi = SqlMapper.QueryMultiple(connection, "GetExistingMember", @params,commandTimeout: 300, commandType: CommandType.StoredProcedure);

            List<MemberDetailsViewModelExisting> memberDetailsList = multi.Read<MemberDetailsViewModelExisting>();
            model.MemberDetail = memberDetailsList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new MemberDetailsViewModelExisting();

            List<OrganizationalViewModelExisting> organizationList = multi.Read<OrganizationalViewModelExisting>();
            model.OrganizationalDetail = organizationList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new OrganizationalViewModelExisting();

            List<AddressViewModelExisting> permanentAddressList = multi.Read<AddressViewModelExisting>();
            model.PermanentAddress = permanentAddressList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new AddressViewModelExisting();

            List<AddressViewModelExisting> temprorayAddressList = multi.Read<AddressViewModelExisting>();
            model.TemproraryAddress = temprorayAddressList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new AddressViewModelExisting();

            model.FamilyMembersWithEducation = multi.Read<FamilyMemberEducation>();
            model.FamilyMembersWithEducation = model.FamilyMembersWithEducation?.Where(x => !x.IsTemp)?.ToList() ?? new List<FamilyMemberEducation>();


            // model.FamilyMembersWithEducation_Temp = familyMemberEducation?.ToList() ?? new List<FamilyMemberEducation>();

            List<BankViewModelExisting> bankList = multi.Read<BankViewModelExisting>();
            model.BankDetails = bankList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new BankViewModelExisting();

            model.MemberDocuments = multi.Read<MemberDocumentMasterModelExisting>();
            model.MemberNonMandatoryDocuments = multi.Read<MemberDocumentMasterModelExisting>();

            List<MemberDocumentMasterModelExisting> familyMemberDoc = multi.Read<MemberDocumentMasterModelExisting>();
            List<MemberDocumentMasterModelExisting> familyMemberNonMandDoc = multi.Read<MemberDocumentMasterModelExisting>();

            if (model.FamilyMembersWithEducation != null && model.FamilyMembersWithEducation.Count > 0)
            {
                model.FamilyMembersWithEducation.ForEach(x =>
                {
                    x.MandatoryDocuments = familyMemberDoc?.Where(y => y.Member_Id == x.Id && y.IsTemp == false)?.ToList() ?? new List<MemberDocumentMasterModelExisting>();
                    x.NonMandatoryDocuments = familyMemberNonMandDoc?.Where(y => y.Member_Id == x.Id && y.IsTemp == false)?.ToList() ?? new List<MemberDocumentMasterModelExisting>();
                });
            }

            return model;
        }


        public MemberDiffViewModel Get_Member_All_Saved_Details_Diff_By_MemberId(string MemberId)
        {
            MemberDiffViewModel model = new MemberDiffViewModel();
            dynamic @params = new
            {
                pMember_Id = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            var multi = SqlMapper.QueryMultiple(connection, "GetExistingMember", @params, commandType: CommandType.StoredProcedure);

            List<MemberDetailsViewModelExisting> memberDetailsList = multi.Read<MemberDetailsViewModelExisting>();
            model.MemberDetail = memberDetailsList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new MemberDetailsViewModelExisting();

            if (model.MemberDetail != null && model.MemberDetail.IsNewMember == true)
            {
                model.MemberDetail = new MemberDetailsViewModelExisting();
                model.MemberDetail_Temp = memberDetailsList?.FirstOrDefault() ?? new MemberDetailsViewModelExisting();

                List<OrganizationalViewModelExisting> organizationList = multi.Read<OrganizationalViewModelExisting>();
                model.OrganizationalDetail = new OrganizationalViewModelExisting();
                model.OrganizationalDetail_Temp = organizationList?.FirstOrDefault() ?? new OrganizationalViewModelExisting();

                List<AddressViewModelExisting> permanentAddressList = multi.Read<AddressViewModelExisting>();
                model.PermanentAddress = new AddressViewModelExisting();
                model.PermanentAddress_Temp = permanentAddressList?.FirstOrDefault() ?? new AddressViewModelExisting();

                List<AddressViewModelExisting> temprorayAddressList = multi.Read<AddressViewModelExisting>();
                model.TemproraryAddress = new AddressViewModelExisting();
                model.TemproraryAddress_Temp = temprorayAddressList?.FirstOrDefault() ?? new AddressViewModelExisting();

                List<FamilyMemberEducation> familyMemberEducation = multi.Read<FamilyMemberEducation>();
                model.FamilyMembersWithEducation = new List<FamilyMemberEducation>();
                model.FamilyMembersWithEducation_Temp = familyMemberEducation?.ToList() ?? new List<FamilyMemberEducation>();

                List<BankViewModelExisting> bankList = multi.Read<BankViewModelExisting>();
                model.BankDetails = new BankViewModelExisting();
                model.BankDetails_Temp = bankList?.FirstOrDefault() ?? new BankViewModelExisting();

                List<MemberDocumentMasterModelExisting> memberDocumentMasterModelExisting = multi.Read<MemberDocumentMasterModelExisting>();
                model.MemberDocuments = new List<MemberDocumentMasterModelExisting>();
                model.MemberDocuments_Temp = memberDocumentMasterModelExisting?.ToList() ?? new List<MemberDocumentMasterModelExisting>();

                List<MemberDocumentMasterModelExisting> memberNonMandatoryDocumentMasterModelExisting = multi.Read<MemberDocumentMasterModelExisting>();
                model.MemberNonMandatoryDocuments = new List<MemberDocumentMasterModelExisting>();
                model.MemberNonMandatoryDocuments_Temp = memberNonMandatoryDocumentMasterModelExisting?.ToList() ?? new List<MemberDocumentMasterModelExisting>();
            }
            else
            {
                model.MemberDetail_Temp = memberDetailsList?.Where(x => x.IsTemp)?.FirstOrDefault() ?? new MemberDetailsViewModelExisting();

                List<OrganizationalViewModelExisting> organizationList = multi.Read<OrganizationalViewModelExisting>();
                model.OrganizationalDetail = organizationList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new OrganizationalViewModelExisting();
                if (organizationList?.Exists(x => x.IsTemp) ?? false)
                {
                    model.OrganizationalDetail_Temp = organizationList?.Where(x => x.IsTemp)?.FirstOrDefault() ?? new OrganizationalViewModelExisting();
                }
                else
                {
                    model.OrganizationalDetail_Temp = model.OrganizationalDetail;
                }

                List<AddressViewModelExisting> permanentAddressList = multi.Read<AddressViewModelExisting>();
                model.PermanentAddress = permanentAddressList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new AddressViewModelExisting();
                if (permanentAddressList?.Exists(x => x.IsTemp) ?? false)
                {
                    model.PermanentAddress_Temp = permanentAddressList?.Where(x => x.IsTemp)?.FirstOrDefault() ?? new AddressViewModelExisting();
                }
                else
                {
                    model.PermanentAddress_Temp = model.PermanentAddress;
                }

                List<AddressViewModelExisting> temprorayAddressList = multi.Read<AddressViewModelExisting>();
                model.TemproraryAddress = temprorayAddressList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new AddressViewModelExisting();
                if (temprorayAddressList?.Exists(x => x.IsTemp) ?? false)
                {
                    model.TemproraryAddress_Temp = temprorayAddressList?.Where(x => x.IsTemp)?.FirstOrDefault() ?? new AddressViewModelExisting();
                }
                else
                {
                    model.TemproraryAddress_Temp = model.TemproraryAddress;
                }

                List<FamilyMemberEducation> familyMemberEducation = multi.Read<FamilyMemberEducation>();
                model.FamilyMembersWithEducation = familyMemberEducation?.Where(x => !x.IsTemp)?.ToList() ?? new List<FamilyMemberEducation>();
                if (familyMemberEducation?.Exists(x => x.IsTemp) ?? false)
                {
                    model.FamilyMembersWithEducation_Temp = familyMemberEducation?.Where(x => x.IsTemp)?.ToList() ?? new List<FamilyMemberEducation>();
                }
                else
                {
                    model.FamilyMembersWithEducation_Temp = model.FamilyMembersWithEducation;
                }

                List<BankViewModelExisting> bankList = multi.Read<BankViewModelExisting>();
                model.BankDetails = bankList?.Where(x => !x.IsTemp)?.FirstOrDefault() ?? new BankViewModelExisting();
                if (bankList?.Exists(x => x.IsTemp) ?? false)
                {
                    model.BankDetails_Temp = bankList?.Where(x => x.IsTemp)?.FirstOrDefault() ?? new BankViewModelExisting();
                }
                else
                {
                    model.BankDetails_Temp = model.BankDetails;
                }

                List<MemberDocumentMasterModelExisting> memberDocumentMasterModelExisting = multi.Read<MemberDocumentMasterModelExisting>();
                model.MemberDocuments = memberDocumentMasterModelExisting?.Where(x => !x.IsTemp)?.ToList() ?? new List<MemberDocumentMasterModelExisting>();
                if (memberDocumentMasterModelExisting?.Exists(x => x.IsTemp) ?? false)
                {
                    model.MemberDocuments_Temp = memberDocumentMasterModelExisting?.Where(x => x.IsTemp)?.ToList() ?? new List<MemberDocumentMasterModelExisting>();
                }
                else
                {
                    model.MemberDocuments_Temp = model.MemberDocuments;
                }

                List<MemberDocumentMasterModelExisting> memberNonMandatoryDocumentMasterModelExisting = multi.Read<MemberDocumentMasterModelExisting>();
                model.MemberNonMandatoryDocuments = memberNonMandatoryDocumentMasterModelExisting?.Where(x => !x.IsTemp)?.ToList() ?? new List<MemberDocumentMasterModelExisting>();
                if (memberNonMandatoryDocumentMasterModelExisting?.Exists(x => x.IsTemp) ?? false)
                {
                    model.MemberNonMandatoryDocuments_Temp = memberNonMandatoryDocumentMasterModelExisting?.Where(x => x.IsTemp)?.ToList() ?? new List<MemberDocumentMasterModelExisting>();
                }
                else
                {
                    model.MemberNonMandatoryDocuments_Temp = model.MemberNonMandatoryDocuments;
                }
            }

            return model;
        }
        
        
        
        
        public MemberDetailsViewModelExisting Get_Member_View(string MemberId)
        {
            dynamic @params = new
            {
                pMember_Id = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<MemberDetailsViewModelExisting>(connection, "Get_Member_Detail_View", @params, commandType: CommandType.StoredProcedure) ?? new MemberDetailsViewModelExisting();
        }
        public MemberExistGeneralInfo Application_Get_Member_Id_By_Member_Code(string MemberCode, string PhoneNumber)
        {
            string Query = $"SELECT Id, IsSubmitted, IsNewMember, IsApproved FROM member_master WHERE IFNULL(IsTemp, 0) = 0 AND IFNULL(IsActive,0) = 1 AND (Member_Id = '{MemberCode}' OR Phone_Number = '{PhoneNumber}')";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<MemberExistGeneralInfo>(connection, Query, commandType: CommandType.Text);
        }
        public List<MemberExistGeneralInfo> Application_Get_All_Member_Id_By_Member_Code()
        {
            string Query = $"SELECT Id, Member_Id, Phone_Number, IsSubmitted, IsNewMember, IsApproved FROM member_master WHERE IFNULL(IsTemp, 0) = 0 AND IFNULL(IsActive,0) = 1";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberExistGeneralInfo>(connection, Query, commandType: CommandType.Text).ToList() ?? new List<MemberExistGeneralInfo>();
        }
        public int Update_Member_As_Approved(string MemberId)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    string Query = $"UPDATE member_master SET IsApproved = 1 WHERE Id = '{MemberId}';";
                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.Execute(connection, Query, commandType: CommandType.Text);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return 0;
                    }
                    Thread.Sleep(1000);
                }
            }

            return 0;


        }
        public string LookupMemberInLocal(string SearchString)
        {
            dynamic @params = new
            {
                pSearchString = SearchString
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Member_Lookup_local", @params, commandType: CommandType.StoredProcedure);
        }
        public int UpdateMemberCodeRunningNumber(string MemberId, int AutoGeneratedNumber)
        {
            string Query = $"UPDATE member_master SET AutoGeneratedNumber = {AutoGeneratedNumber} WHERE Id = '{MemberId}';";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, Query, commandType: CommandType.Text);
        }
        public bool IsMobileNumberExist(string MemberId, string MobileNumber)

        {

            string Query = $"SELECT COUNT(1) FROM member_master WHERE Phone_Number = '{MobileNumber}' AND Id != '{MemberId}' AND IsActive =1;";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return SqlMapper.ExecuteScalar<int>(connection, Query, commandType: CommandType.Text) > 0;

        }
        public List<SelectListItem> Application_NameOfTheLocalBody_Select_Get(string MemberId, string DistrictId)
        {
            dynamic @params = new
            {
                pMemberId = MemberId,
                pDistrict = DistrictId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<SelectListItem>(connection, "Application_NameOfTheLocalBody_Select_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<SelectListItem>();
        }
        #endregion Member

        #region Organization
        public OrganizationDetailFormModel Organization_Form_Get(string MemberId)
        {
            OrganizationDetailFormModel model = new OrganizationDetailFormModel();

            dynamic @params = new
            {
                pMemberId = MemberId ?? ""
            };
// Updated By Sivasankar K on 14/01/2026 for Health Worker Type Select List
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Application_Organization_Form_Get", @params, commandType: CommandType.StoredProcedure);

            model.Type_of_Work_SelectList = multi.Read<SelectListItem>();
            model.Core_Sanitary_Worker_Type_SelectList = multi.Read<SelectListItem>();
            model.Health_Worker_Type_SelectList = multi.Read<SelectListItem>();
            model.Organization_Type_SelectList = multi.Read<SelectListItem>();
            model.Nature_of_Job_SelectList = multi.Read<SelectListItem>();
            model.District_SelectList = multi.Read<SelectListItem>();
            model.Local_Body_SelectList = multi.Read<SelectListItem>();
            model.Name_of_Local_Body_SelectList = multi.Read<SelectListItem>();
            model.Zone_SelectList = multi.Read<SelectListItem>();
            model.Designation_SelectList = multi.Read<SelectListItem>();
            model.Municipality_SelectList = multi.Read<SelectListItem>();
            model.Block_SelectList = multi.Read<SelectListItem>();
            model.Corporation_SelectList = multi.Read<SelectListItem>();
            model.Town_Panchayat_SelectList = multi.Read<SelectListItem>();
            model.Village_Panchayat_SelectList = multi.Read<SelectListItem>();
            model.MLA_Constituency_SelectList = multi.Read<SelectListItem>();
            model.MP_Constituency_SelectList = multi.Read<SelectListItem>();
            model.Employer_Type_SelectList = multi.Read<SelectListItem>();
            model.Work_Office_SelectList = multi.Read<SelectListItem>();

            return model;
        }
        public string Application_Detail_Organization_SaveUpdate(OrganizationDetailSaveModel model, AuditColumnsModel audit)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    dynamic @params = new
                    {
                        pId = model.Id,
                        pMember_Id = model.Member_Id,
                        pType_of_Work = model.Type_of_Work,
                        pCore_Sanitary_Worker_Type = model.Core_Sanitary_Worker_Type,
                        pHealth_Worker_Type = model.Health_Worker_Type,
                        pOrganization_Type = model.Organization_Type,
                        pDistrict_Id = model.District_Id,
                        pNature_of_Job = model.Nature_of_Job,
                        pLocal_Body = model.Local_Body,
                        pName_of_Local_Body = model.Name_of_Local_Body,
                        p_Organisation_Name = model.Organisation_Name,
                        p_Designation = model.Designation,
                        p_Address = model.Address,
                        pZone = model.Zone,
                        pPrivate_Organisation_Name = model.Private_Organisation_Name,
                        pPrivate_Designation = model.Private_Designation,
                        pPrivate_Address = model.Private_Address,
                        pBlock = model.Block,
                        pVillage_Panchayat = model.Village_Panchayat,
                        pCorporation = model.Corporation,
                        pMunicipality = model.Municipality,
                        pTown_Panchayat = model.Town_Panchayat,
                        pNew_Yellow_Card_Number = model.New_Yellow_Card_Number,
                        pHealth_Id = model.Health_Id,
                        pMLA_Constituency = model.MLA_Constituency,
                        pMP_Constituency = model.MP_Constituency,
                        pEmployer_Type = model.Employer_Type,
                        pWork_Office = model.Work_Office,
                        pWork_Office_Others = model.Work_Office_Others,
                        pAlready_a_Member_of_CWWB = model.Already_a_Member_of_CWWB,
                        pIsActive = model.IsActive,
                        pIsTemp = model.IsTemp,
                        pIsSubmitted = model.IsSubmitted,
                        pIsNewMember = model.IsNewMember,
                        pSavedBy = audit.SavedBy,
                        pSavedByUserName = audit.SavedByUserName,
                        pSavedDate = audit.SavedDate,
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.ExecuteScalar<string>(connection, "Application_Detail_Organization_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return "";
                    }
                    Thread.Sleep(1000);
                }
            }

            return "";
        }
        public OrganizationDetailModel Member_Organization_Get(string Id = "", string MemberId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<OrganizationDetailModel>(connection, "Member_Organization_Get", @params, commandType: CommandType.StoredProcedure) ?? new OrganizationDetailModel();
        }
        #endregion Organization

        #region Family
        public FamilyMemberFormModel Family_Form_Get(string FamilyMemberId)
        {
            FamilyMemberFormModel model = new FamilyMemberFormModel();

            dynamic @params = new
            {
                pFamilyMemberId = FamilyMemberId ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Application_Family_Member_Form_Get", @params, commandType: CommandType.StoredProcedure);

            model.Family_Member_SelectList = multi.Read<SelectListItem>();
            model.Gender_SelectList = multi.Read<SelectListItem>();
            model.Education_SelectList = multi.Read<SelectListItem>();
            model.Occupation_SelectList = multi.Read<SelectListItem>();
            model.Disability_SelectList = multi.Read<SelectListItem>();
            model.District_SelectList = multi.Read<SelectListItem>();

            model.Education_2_SelectList = new List<SelectListItem>()
            {
                new SelectListItem(){ Value = "SCHOOL", Text = "School" },
                new SelectListItem(){ Value = "COLLEGE", Text = "College" },
                new SelectListItem(){ Value = "NA", Text = "NA" },
            };
            model.Education_Status_SelectList = new List<SelectListItem>()
            {
                new SelectListItem(){ Value = "STUDYING", Text = "Studying" },
                new SelectListItem(){ Value = "COMPLETED", Text = "Completed" },
                new SelectListItem(){ Value = "DISCONTINUED", Text = "Discontinued" },
            };
            model.Education_Year_SelectList = new List<SelectListItem>()
            {
                new SelectListItem(){ Value = "1", Text = "1st Year" },
                new SelectListItem(){ Value = "2", Text = "2nd Year" },
                new SelectListItem(){ Value = "3", Text = "3rd Year" },
                new SelectListItem(){ Value = "4", Text = "4th Year" },
                new SelectListItem(){ Value = "5", Text = "5th Year" },
            };
            model.Education_Standard_SelectList = new List<SelectListItem>()
            {
                new SelectListItem(){ Value = "1", Text = "1st Standard" },
                new SelectListItem(){ Value = "2", Text = "2nd Standard" },
                new SelectListItem(){ Value = "3", Text = "3rd Standard" },
                new SelectListItem(){ Value = "4", Text = "4th Standard" },
                new SelectListItem(){ Value = "5", Text = "5th Standard" },
                new SelectListItem(){ Value = "6", Text = "6th Standard" },
                new SelectListItem(){ Value = "7", Text = "7th Standard" },
                new SelectListItem(){ Value = "8", Text = "8th Standard" },
                new SelectListItem(){ Value = "9", Text = "9th Standard" },
                new SelectListItem(){ Value = "10", Text = "10th Standard" },
                new SelectListItem(){ Value = "11", Text = "11th Standard" },
                new SelectListItem(){ Value = "12", Text = "12th Standard" },
            };

            return model;
        }
        public string Application_Detail_Family_SaveUpdate(FamilyMemberSaveModel model, AuditColumnsModel audit)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    int Age = 0;
                    if (int.TryParse(model.age, out Age) == false)
                    {
                        Age = 0;
                    }

                    dynamic @params = new
                    {
                        pId = model.Id,
                        pMember_Id = model.Member_Id,
                        pf_id = model.f_id,
                        pname = model.name,
                        pphone_number = model.phone_number,
                        prelation = model.relation,
                        psex = model.sex,
                        page = Age,
                        peducation = model.education,
                        pStandard = model.Standard,
                        pSchool_Status = model.School_Status,
                        pEMIS_No = model.EMIS_No,
                        pSchool_Name = model.School_Name,
                        pSchool_District = model.School_District,
                        pSchool_Address = model.School_Address,
                        pCourse = model.Course,
                        pDegree_Name = model.Degree_Name,
                        pCollege_Status = model.College_Status,
                        pUMIS_No = model.UMIS_No,
                        pYear = model.Year,
                        pYear_Of_Completion = model.Year_Of_Completion,
                        pCollege_Name = model.College_Name,
                        pCollege_District = model.College_District,
                        pCollege_Address = model.College_Address,
                        poccupation = model.occupation,
                        pdisability = model.disability,
                        pDiscontinuedYear = model.DiscontinuedYear,
                        pAadharNumber = model.AadharNumber,
                        pPdsVerified = model.PdsVerified,
                        pEMISVerified = model.EMISVerified,
                        pUMISVerified = model.UMISVerified,
                        pdate_of_birth = model.date_of_birth,
                        pIsActive = model.IsActive,
                        pIsTemp = model.IsTemp,
                        pSavedBy = audit.SavedBy,
                        pSavedByUserName = audit.SavedByUserName,
                        pSavedDate = audit.SavedDate
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.ExecuteScalar<string>(connection, "Application_Detail_Family_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return "";
                    }
                    Thread.Sleep(1000);
                }
            }

            return "";


        }
        public List<FamilyMemberModel> Member_Family_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            var @params = new
            {
                pId = Id,
                pMemberId = MemberId,
                pIsTemp = IsTemp
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            try
            {
                var result = SqlMapper.Query<FamilyMemberModel>(connection, "Member_family_Get", @params, commandType: CommandType.StoredProcedure);
                return result?.ToList() ?? new List<FamilyMemberModel>();
            }
            catch (Exception ex)
            {
                // Log the exception as needed
                return new List<FamilyMemberModel>();
            }
        }

        public FamilyMemberModel Member_Get_By_Id(string memberId)
        {
            using IDbConnection connection =
                new MySqlConnection(_configuration.GetConnectionString(connectionId));

            string query = @"
        SELECT
            Id,
            First_Name,
            Gender,
            TIMESTAMPDIFF(YEAR, STR_TO_DATE(Date_Of_Birth,'%Y-%m-%d'), CURDATE()) AS age
        FROM member_master
        WHERE Id = @memberId
        AND IsActive = 1
        LIMIT 1";

            var result = connection.QueryFirstOrDefault(query, new { memberId });

            if (result == null)
                return null;

            return new FamilyMemberModel
            {
                Id = result.Id,
                name = result.First_Name,
                relation = "SELF",
                relationString = "SELF",
                sex = result.Gender,
                age = result.age?.ToString() ?? "0",
                IsActive = true
            };
        }
        public string Member_New_Family_Member_Save(string MemberId, string MemberName, AuditColumnsModel model)
        {
            string Id = Guid.NewGuid().ToString();

            string query = @"
            INSERT INTO member_family_member (Id, Member_Id, Name, IsActive, IsTemp, CreatedBy, CreatedByUserName, CreatedDate)
            VALUES (@Id, @MemberId, @MemberName, 1, 0, @SavedBy, @SavedByUserName, @SavedDate);
            SELECT @Id;";

            var parameters = new
            {
                Id,
                MemberId,
                MemberName,
                SavedBy = model.SavedBy,
                SavedByUserName = model.SavedByUserName,
                SavedDate = model.SavedDate
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return connection.QuerySingle<string>(query, parameters);
        }
        public int Family_Member_Delete_By_MemberId(string MemberId)
        {
            string Query = $"UPDATE member_family_member SET IsActive = 0 WHERE Member_Id = '{MemberId}'";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, Query, commandType: CommandType.Text);
        }
        public int Family_Member_Has_Application(string FamilyMemberId)
        {
            string query = @"select COUNT(1) from application_details ad
                            inner join application_master am on am.Id = ad.ApplicationId 
                            where IFNULL(ad.FamilyMemberId,'') != '' AND IFNULL(ad.FamilyMemberId,'') = '" + FamilyMemberId + "'";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<int>(connection, query, commandType: CommandType.Text);
        }

        #endregion Family

        #region Bank
        public BankDetailFormModel Bank_Form_Get(string MemberId)
        {
            BankDetailFormModel model = new BankDetailFormModel();

            dynamic @params = new
            {
                pMemberId = MemberId ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Application_Member_Bank_Form_Get", @params, commandType: CommandType.StoredProcedure);

            model.Bank_SelectList = multi.Read<SelectListItem>();
            model.Branch_SelectList = multi.Read<SelectListItem>();

            return model;
        }
        public string Application_Member_Bank_SaveUpdate(BankDetailSaveModel model, AuditColumnsModel audit)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    dynamic @params = new
                    {
                        pId = model.Id,
                        pMember_Id = model.Member_Id,
                        pAccount_Holder_Name = model.Account_Holder_Name,
                        pAccount_Number = model.Account_Number,
                        pIFSC_Code = model.IFSC_Code,
                        pBank_Name = model.Bank_Name,
                        pBank_Id = model.Bank_Id,
                        pBranch = model.Branch,
                        pBranch_Id = model.Branch_Id,
                        pIsTemp = model.IsTemp,
                        pIsActive = model.IsActive,
                        pSavedBy = audit.SavedBy,
                        pSavedByUserName = audit.SavedByUserName,
                        pSavedDate = audit.SavedDate
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.ExecuteScalar<string>(connection, "Application_Member_Bank_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return "";
                    }
                    Thread.Sleep(1000);
                }
            }

            return "";
        }
        public BankDetailModel Member_Bank_Get(string Id = "", string MemberId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<BankDetailModel>(connection, "Member_Bank_Get", @params, commandType: CommandType.StoredProcedure) ?? new BankDetailModel();
        }
        #endregion Bank

        #region Application_Member_Bank
        public string Application_Detail_Bank_SaveUpdate(ApplicationBankDetailSaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pApplication_Id = model.Application_Id,
                pAccount_Holder_Name = model.Account_Holder_Name,
                pAccount_Number = model.Account_Number,
                pIFSC_Code = model.IFSC_Code,
                pBank_Name = model.Bank_Name,
                pBank_Id = model.Bank_Id,
                pBranch = model.Branch,
                pBranch_Id = model.Branch_Id,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Detail_Bank_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public ApplicationBankModel Application_Member_Bank_Get(string Id = "", string Application_Id = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pApplication_Id = Application_Id
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<ApplicationBankModel>(connection, "Application_Member_Bank_Get", @params, commandType: CommandType.StoredProcedure) ?? new ApplicationBankModel();
        }
        #endregion Application_Member_Bank

        #region Address
        public AddressDetailFormModel Address_Form_Get(string MemberId, string AddressType)
        {
            AddressDetailFormModel model = new AddressDetailFormModel();

            dynamic @params = new
            {
                pMemberId = MemberId ?? "",
                pAddressType = AddressType ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Application_Address_Form_Get", @params, commandType: CommandType.StoredProcedure);

            model.District_SelectList = multi.Read<SelectListItem>();
            model.Taluk_SelectList = multi.Read<SelectListItem>();
            model.Pincode_SelectList = multi.Read<SelectListItem>();

            return model;
        }
        public string Member_Address_Master_SaveUpdate(ApplicationAddressMaster model, AuditColumnsModel audit)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    dynamic @params = new
                    {
                        pId = model.Id,
                        pMember_Id = model.MemberId,
                        pAddressType = model.AddressType,
                        pDoorNo = model.DoorNo,
                        pStreetName = model.StreetName,
                        pVilllageTownCity = model.VilllageTownCity,
                        pLocalBody = model.LocalBody,
                        pNameoflocalBody = model.NameoflocalBody,
                        pDistrict = model.District,
                        pTaluk = model.Taluk,
                        pBlock = model.Block,
                        pCorporation = model.Corporation,
                        pMunicipality = model.Municipality,
                        pTownPanchayat = model.TownPanchayat,
                        pPincode = model.Pincode,
                        pIsActive = model.IsActive,
                        pIsTemp = model.IsTemp,
                        pArea = model.Area,
                        pModifiedby = audit.ModifiedBy,
                        pModifiedByUserName = audit.ModifiedByUserName,
                        pModifiedDate = audit.ModifiedDate,
                        pSavedBy = audit.SavedBy,
                        pSavedByUserName = audit.SavedByUserName,
                        pSavedDate = audit.SavedDate,
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.ExecuteScalar<string>(connection, "Member_Address_Master_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return "";
                    }
                    Thread.Sleep(1000);
                }
            }

            return "";


        }
        public List<ApplicationAddressMaster> Member_Address_Master_Get(string Id = "", string MemberId = "", string AddressType = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId,
                pAddressType = AddressType,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationAddressMaster>(connection, "Member_Address_Master_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationAddressMaster>();
        }
        // Santhosh
        #endregion Address

        #region Member Document
        public string Member_Document_SaveUpdate(MemberDocumentSaveMaster model, AuditColumnsModel audit)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(model.Id))
                    {
                        model.Id = Guid.NewGuid().ToString();
                    }

                    dynamic @params = new
                    {
                        pId = model.Id,
                        pMember_Id = model.Member_Id,
                        pDocumentCategoryId = model.DocumentCategoryId,
                        pAcceptedDocumentTypeId = model.AcceptedDocumentTypeId,
                        pOriginalFileName = model.OriginalFileName,
                        pSavedFileName = model.SavedFileName,
                        pIsTemp = model.IsTemp,
                        pIsActive = true,
                        pSavedBy = audit.SavedBy,
                        pSavedByUserName = audit.SavedByUserName,
                        pSavedDate = audit.SavedDate
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.ExecuteScalar<string>(connection, "Member_Document_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return "";
                    }
                    Thread.Sleep(1000);
                }
            }

            return "";

        }
        public List<MemberDocumentMaster> Member_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId,
                pIsTemp = IsTemp
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberDocumentMaster>(connection, "Member_Document_Get", @params, commandType: CommandType.StoredProcedure) ?? new MemberDocumentMaster();
        }
        public List<MemberDocumentMaster> Member_NonMandatory_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId,
                pIsTemp = IsTemp
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberDocumentMaster>(connection, "Member_NonMandatory_Document_Get", @params, commandType: CommandType.StoredProcedure) ?? new MemberDocumentMaster();
        }
        public List<MemberDocumentMaster> Family_Member_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId,
                pIsTemp = IsTemp
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberDocumentMaster>(connection, "Family_Member_Mandatory_Document_Get", @params, commandType: CommandType.StoredProcedure) ?? new MemberDocumentMaster();
        }
        public List<MemberDocumentMaster> Family_Member_NonMandatory_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId,
                pIsTemp = IsTemp
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberDocumentMaster>(connection, "Family_Member_NonMandatory_Document_Get", @params, commandType: CommandType.StoredProcedure) ?? new MemberDocumentMaster();
        }
        public List<MemberDocumentMaster> Member_Document_Get_By_Id(string Id = "", string MemberId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberDocumentMaster>(connection, "Member_Document_Get_By_Id", @params, commandType: CommandType.StoredProcedure) ?? new MemberDocumentMaster();
        }
        public IEnumerable<(string OriginalFileName, string SavedFileName)> Member_Document_Get_By_DocCategoryAndMember(string DocumentCategoryId, string MemberId)
        {
            string Query = @"SELECT OriginalFileName, SavedFileName FROM member_documents_master WHERE DocumentCategoryId = '{DocumentCategoryId}' AND Member_Id = '{MemberId}'";
            Query = Query.Replace("{DocumentCategoryId}", DocumentCategoryId).Replace("{MemberId}", MemberId);
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<(string OriginalFileName, string SavedFileName)>(connection, Query, commandType: CommandType.Text);
        }
        public string Member_Document_Delete(string Id, bool IsTemp, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = Id,
                pIsTemp = IsTemp,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Member_Document_Delete", @params, commandType: CommandType.StoredProcedure);
        }
        public bool Member_Document_Delete_From_Application(string MemberId, string DocumentCategoryId, string ApplicationId = "")
        {
            string Query = $"UPDATE member_documents_master SET OriginalFileName = '', SavedFileName = '' WHERE DocumentCategoryId = '{DocumentCategoryId}' AND Member_Id = '{MemberId}';";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            SqlMapper.Execute(connection, Query, commandType: CommandType.Text);

            if (!string.IsNullOrEmpty(ApplicationId))
            {
                string Query2 = $"UPDATE application_document_verification SET IsVerified = 0 WHERE DocumentCategoryId = '{DocumentCategoryId}' AND ApplicantId = '{MemberId}' AND ApplicationId = '{ApplicationId}';";
                using IDbConnection connection2 = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                SqlMapper.Execute(connection2, Query2, commandType: CommandType.Text);
            }

            return true;
        }
        #endregion Member Document

        #region Member Save

        public TwoColumnConfigValues Get_ConfigValue_Ids(Datum model)
        {
            var @params = new
            {
                pMember_Gender = model.member_details?.Gender ?? string.Empty,
                pMember_Religion = "Other",
                pMember_Community = model.member_details?.Community ?? string.Empty,
                pMember_MaritalStatus = model.member_details?.Marital_Status ?? string.Empty,
                pMember_Education = model.member_details?.Education ?? string.Empty,
                pOrganization_Type_of_Work = model.organization_info?.Type_of_Work ?? string.Empty,
                pOrganization_Core_Sanitary_Worker_Type = model.organization_info?.Core_Sanitary_Worker_Type ?? string.Empty,
                pOrganization_Organization_Type = model.organization_info?.Organization_Type ?? string.Empty,
                pOrganization_Nature_of_Job = model.organization_info?.Nature_of_Job ?? string.Empty,
                pOrganization_Local_Body = model.organization_info?.Local_Body ?? string.Empty,
                pOrganization_Name_of_Local_Body = model.organization_info?.Name_of_Local_Body ?? string.Empty,
                pOrganization_Block = model.organization_info?.Block ?? string.Empty,
                pOrganization_Village_Panchayat = model.organization_info?.Village_Panchayat ?? string.Empty,
                pOrganization_Corporation = model.organization_info?.Corporation ?? string.Empty,
                pOrganization_Zone = model.organization_info?.Zone ?? string.Empty,
                pOrganization_Municipality = model.organization_info?.Municipality ?? string.Empty,
                pOrganization_Town_Panchayat = model.organization_info?.Town_Panchayat ?? string.Empty,
                pOrganization_District = model.organization_info?.District?.name ?? string.Empty,
                pPermanentAddress_Taluk = model.permanent_address?.Taluk ?? string.Empty,
                pPermanentAddress_District = model.permanent_address?.District?.name ?? string.Empty,
                pTemprorayAddress_Taluk = model.temporary_address?.Taluk ?? string.Empty,
                pTemprorayAddress_District = model.temporary_address?.District?.name ?? string.Empty,
                pWorkAddress_Office_Street = model.work_address?.Office_Street ?? string.Empty,
                pWorkAddress_Office_Village_Area_City = model.work_address?.Office_Village_Area_City ?? string.Empty,
                pWorkAddress_Office_Taluk = model.work_address?.Office_Taluk ?? string.Empty,
                pWorkAddress_Office_District = model.work_address?.Office_District?.name ?? string.Empty,
                pBank_Name = model.bank_details?.Bank_Name ?? string.Empty,
                pBranch = model.bank_details?.Branch ?? string.Empty
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            TwoColumnConfigValues twoColumnConfigValues = SqlMapper.QuerySingleOrDefault<TwoColumnConfigValues>(connection, "spGetConfigValueIds_Full", @params, commandType: CommandType.StoredProcedure);
            return twoColumnConfigValues;
        }

        public TwoColumnConfigValuesForFamily Get_ConfigValue_Ids_For_Family(FamilyMember familyMember)
        {
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var familymemberTwoColumnParams = new
            {
                prelation = familyMember.relation ?? string.Empty,
                psex = familyMember.sex ?? string.Empty,
                peducation = familyMember.education ?? string.Empty,
                pdisability = familyMember.disability ?? string.Empty,
            };
            TwoColumnConfigValuesForFamily familymemberConfigIds = SqlMapper.QuerySingleOrDefault<TwoColumnConfigValuesForFamily>(connection, "spGetConfigValueIds_Full_Family", familymemberTwoColumnParams, commandType: CommandType.StoredProcedure);
            return familymemberConfigIds;
        }
        #endregion

        #region Member_Detail_Approval_Master_And_History
        public string Member_Detail_Approval_Master_SaveUpdate(MemberDataApprovalMaster model, AuditColumnsModel audit)
        {
            int retryCount = 3;

            while (retryCount > 0)
            {
                try
                {
                    dynamic @params = new
                    {
                        pId = model.Id,
                        pMember_Id = model.Member_Id,
                        pChanged_Detail_Record = model.Changed_Detail_Record,
                        pChanged_Date = model.Changed_Date.ToDateTime(TimeOnly.MinValue),
                        pChanged_Time = model.Changed_Time.ToTimeSpan(),
                        pStatus = model.Status,
                        pIsCompleted = model.IsCompleted,
                        pIsActive = model.IsActive,
                        pSavedBy = audit.SavedBy,
                        pSavedByUserName = audit.SavedByUserName,
                        pSavedDate = audit.SavedDate,
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return SqlMapper.ExecuteScalar<string>(connection, "Member_Data_Approval_Master_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
                }
                catch (MySqlException ex) when (ex.Message.Contains("Deadlock"))
                {
                    if (retryCount == 0)
                    {
                        return "";
                    }
                    Thread.Sleep(1000);
                }
            }

            return "";



        }

        public string Member_Data_Approval_History_SaveUpdate(MemberDataApprovalHistory model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pMember_Detail_Approval_Master_Id = model.Member_Detail_Approval_Master_Id,
                pFrom_Role = model.From_Role,
                pTo_Role = model.To_Role,
                pCreatedOn = audit.SavedDate,
                pApprovedBy = audit.SavedBy,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Member_Data_Approval_History_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        public List<MemberDataApprovalMaster> Member_Data_Approval_Master_Get(string Id = "", string MemberId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pMemberId = MemberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberDataApprovalMaster>(connection, "Member_Data_Approval_Master_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<MemberDataApprovalMaster>();
        }

        public List<MemberDataApprovalHistoryView> Member_Data_Approval_History_Get(string Id = "", string RequestId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pMember_Detail_Approval_Master_Id = RequestId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MemberDataApprovalHistoryView>(connection, "Member_Data_Approval_History_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<MemberDataApprovalHistoryView>();
        }

        #endregion Member_Detail_Approval_Master_And_History

        #region Dashoboard
        public DashboardItemModels MemberDashboardCountGet(string District, string Mobile, string LocalBody, string NameOfLocalBody, string Block, string Corporation, string Municipality, string TownPanchayat, string VillagePanchayat, string Zone)
        {
            DashboardItemModels model = new();

            dynamic @params = new
            {
                pDistrictId = District,
                PMobile = Mobile,
                pLocal = LocalBody,
                pNameOfLocal = NameOfLocalBody,
                pBlock = Block,
                pCorporation = Corporation,
                pMunicipality = Municipality,
                pTownPanchayat = TownPanchayat,
                pVillagePanchayat = VillagePanchayat,
                pZone = Zone
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            //var multi = SqlMapper.QueryMultiple(connection, "Dashboard_MemberCount_Optimizeds", @params, commandType: CommandType.StoredProcedure);
            var multi = SqlMapper.QueryMultiple(connection, "Dashboard_MemberCount", @params, commandType: CommandType.StoredProcedure);

            model.Roles = multi.Read<TwoColumnValues>();
            model.CardApprovalStatus = multi.Read<TwoColumnValues>();
            model.OrganizationTypes = multi.Read<TwoColumnValues>();
            model.LocalBody = multi.Read<TwoColumnValues>();
            model.NameofLocalBody = multi.Read<TwoColumnValues>();
            model.CardApprovalCount = multi.Read<DashboardCountModel>();
            model.MemberApprovalCount = multi.Read<DashboardCountModel>();

            return model;
        }
        #endregion

        #region PartialChangeRequest
        public void PartialChangeRequest_Cancel(AuditColumnsModel audit, string Member_Id, string Changed_Detail_Record)
        {
            string updateQuery = @"
            UPDATE member_data_approval_master 
            SET IsActive = 0,
                Status = '@Status',
                ModifiedBy = '@ModifiedBy',
                ModifiedByUserName = '@ModifiedByUserName',
                ModifiedDate = '@ModifiedDate'
            WHERE Member_Id = '@Member_Id' AND Changed_Detail_Record = '@Changed_Detail_Record' AND IsActive = 1";

            updateQuery = updateQuery.Replace("@Member_Id", Member_Id)
                                     .Replace("@Changed_Detail_Record", Changed_Detail_Record)
                                     .Replace("@ModifiedBy", audit.SavedBy)
                                     .Replace("@Status", MemberDetailApprovalStatus.CANCELLED)
                                     .Replace("@ModifiedByUserName", audit.SavedByUserName)
                                     .Replace("@ModifiedDate", audit.SavedDate.ToString("yyyy-MM-dd"));

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            SqlMapper.Execute(connection, updateQuery, commandType: CommandType.Text);
        }
        #endregion PartialChangeRequest

        #region Member Id Card
        public MemberIdCardInfoModel Get_Member_Id_Card(string MemberId)
        {
            dynamic @params = new
            {
                pMemberId = MemberId
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Member_Id_Card_Detail_Get", @params, commandType: CommandType.StoredProcedure);

            MemberIdCardInfoModel model = multi.ReadFirstOrDefault<MemberIdCardInfoModel>() ?? new MemberIdCardInfoModel();

            if (model != null)
            {
                model.FamilyMember = multi.Read<FamilyMemberNameModel>();
            }

            return model;
        }
        #endregion Member Id Card

        #region Family Member Import

        // Created for Family Member Import - Elanjsuriyan
        public ImportResultModel ProcessFamilyMemberBulkImport(string batchId)
        {
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return connection.QueryFirst<ImportResultModel>(
                "sp_process_family_import_complete", new { p_BatchId = batchId },
                commandType: CommandType.StoredProcedure
            );
        }

        public void InsertFamilymemberTempBulk(List<FamilyMemberImportModel> list)
        {
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            connection.Open();

            using var transaction = connection.BeginTransaction();

            foreach (var item in list)
            {
                connection.Execute(@"
                INSERT INTO member_family_import_temp
                (MemberAadhar, ApprovedMemberId,
                 FamilyMember_Aadhar, FamilyMemberName,
                 FamilyMemberRelation, FamilyMemberGender, FamilyMemberAge, FamilyMemberEducation,
                 FamilyMemberCourse, Standard_Or_Degreename, EmisOrUmisNo,
                 SchoolOrCollegeDistrict, SchoolOrCollegeName,
                 SchoolOrCollegeAddress, CurrentStatus,
                 YearOfCompletion, Disability,
                 CreatedBy, CreatedByUserName, CreatedDate, BatchId)
                VALUES
                (@MemberAadhar, @ApprovedMemberId,
                 @FamilyMember_Aadhar, @FamilyMemberName,
                 @FamilyMemberRelation, @FamilyMemberGender, @FamilyMemberAge, @FamilyMemberEducation,
                 @FamilyMemberCourse, @Standard_Or_Degreename, @EmisOrUmisNo,
                 @SchoolOrCollegeDistrict, @SchoolOrCollegeName,
                 @SchoolOrCollegeAddress, @CurrentStatus,
                 @YearOfCompletion, @Disability,
                 @CreatedBy, @CreatedByUserName, @CreatedDate, @BatchId)
            ", item, transaction);
            }

            transaction.Commit();
        }

        public List<FamilyMemberImportModel> GetImportErrors(string batchId)
        {
            using IDbConnection connection =
                new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return connection.Query<FamilyMemberImportModel>(
                @"SELECT *
          FROM member_family_import_temp
          WHERE BatchId = @batchId
          AND ErrorMessage IS NOT NULL",
                new { batchId }).ToList();
        }

        public void DeleteTempByBatch(string batchId)
        {
            using IDbConnection connection =
                new MySqlConnection(_configuration.GetConnectionString(connectionId));

            connection.Execute(
                "DELETE FROM member_family_import_temp WHERE BatchId = @batchId",
                new { batchId });
        }


        #endregion Family Member Import
    }
}
