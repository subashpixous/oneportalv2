using DAL.Helpers;
using Dapper;
using Microsoft.Extensions.Configuration;
using Model.DomainModel;
using Model.DomainModel.CardApprpvalModels;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using Org.BouncyCastle.Tls;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Utils.Interface;

namespace DAL
{
    public class UserDAL
    {
        private readonly IMySqlHelper _mySqlHelper;
        private readonly IConfiguration _configuration;
        private readonly IMySqlDapperHelper _mySqlDapperHelper;
        private readonly DapperContext _dapperContext;

        private readonly string connectionId = "Default";
        public UserDAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IConfiguration configuration)
        {
            _mySqlHelper = mySqlHelper;
            _configuration = configuration;
            _mySqlDapperHelper = mySqlDapperHelper;
            _dapperContext = new DapperContext(_configuration.GetConnectionString(connectionId));
        }
        public UserBankBranchForFilterModel Application_Get_Bank_Branch_Filter_Value(string UserId)
        {
            dynamic @params = new
            {
                pUserId = UserId
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirst<UserBankBranchForFilterModel>(connection, "Application_Get_Bank_Branch_Filter_Value", @params, commandType: CommandType.StoredProcedure) ?? new ConfigurationBranchDropdownModel();
        }
        public List<MemberDataApprovalGridModel> MemberDataApprovalGridGet(MemberDataApprovalGridFilterModel filter, out int TotalCount)
        {
            TotalCount = 0;
            
            // Removed configuration left joins - Elanjsuriyan [29-12-2025]
                string Query = @"SELECT
                                        mdam.Id,
                                        mm.Member_Id AS Member_Id_Text,
                                        mdam.Member_Id,
                                        mdam.Status,
                                        mdam.Changed_Detail_Record,
                                        DATE_FORMAT(mdam.Changed_Date, '%d-%m-%Y') AS Changed_Date,
                                        TIME_FORMAT(mdam.Changed_Time, '%h:%i %p') AS Changed_Time,
                                        CONCAT(mm.First_Name, ' ', mm.Last_Name) AS Name,
                                        mm.Phone_Number AS Phone,
                                       -- pad.Value AS District,
                                        mdam.ModifiedBy AS UpdatedBy,
                                        mdam.ModifiedByUserName AS UpdatedByUserName,
                                        DATE_FORMAT(mdam.ModifiedDate, '%Y-%m-%d %H:%i:%s') AS UpdatedDate,
                                        -- mdam.ModifiedDate AS UpdatedDate,
                                        lastAppRole.RoleName AS ApprovedByRole,
                                        nextAppRole.RoleName AS NextApprovalRole,
                                        hist.Status AS LastApprovalStatus,
                                        hist.Comment AS LastApprovalComment,
                                        hist.Reason AS LastApprovalReason,
                                        mm.CardStatus AS CardStatus,
                                        mo.District_Id AS DistrictId
                                    FROM member_data_approval_master mdam
                                    INNER JOIN member_master mm
                                            ON mm.Id = mdam.Member_Id
                                    LEFT JOIN account_role lastAppRole
                                            ON lastAppRole.Id = mdam.ApprovedBy
                                    LEFT JOIN account_role nextAppRole
                                            ON nextAppRole.Id = mdam.Approval_For
                                   -- LEFT JOIN member_address_master mam
                                   --        ON mam.MemberId = mm.Id
                                   --       AND mam.AddressType = 'PERMANENT'
                                   --       AND mam.IsActive = 1
                                   --       AND mam.IsTemp = 0

                                    LEFT JOIN member_organization mo
                                            ON mm.Id = mo.Member_Id
                                   -- INNER JOIN two_column_configuration_values pad
                                    --        ON pad.Id = mo.District_Id
--                                    LEFT JOIN (
--    SELECT h.Member_Detail_Approval_Master_Id,
--           h.Status,
--           h.Comment,
--           h.Reason
--    FROM (
--        SELECT Member_Detail_Approval_Master_Id,
--               Status,
--               Comment,
--               Reason,
--               ROW_NUMBER() OVER (
--                   PARTITION BY Member_Detail_Approval_Master_Id
--                   ORDER BY CreatedOn DESC
--               ) AS rn
--        FROM member_data_approval_history
--    ) h
--    WHERE h.rn = 1
-- ) hist
-- ON hist.Member_Detail_Approval_Master_Id = mdam.Id
LEFT JOIN LATERAL (
    SELECT Status, Comment, Reason
    FROM member_data_approval_history h
    WHERE h.Member_Detail_Approval_Master_Id = mdam.Id
    ORDER BY h.CreatedOn DESC
    LIMIT 1
) hist ON TRUE
";

                string CountQuery = @"select count(1)
                            from member_data_approval_master mdam
                            inner join member_master mm on mm.Id = mdam.Member_Id
                            left join account_role lastAppRole on lastAppRole.Id = mdam.ApprovedBy
                            left join account_role nextAppRole on nextAppRole.Id = mdam.Approval_For
                           -- left join member_address_master mam on mam.MemberId = mm.Id AND AddressType = 'PERMANENT' AND mam.IsActive = 1 AND mam.IsTemp = 0

                            left join member_organization mo on mm.Id=mo.Member_Id
                           -- inner join two_column_configuration_values pad on pad.Id = mo.District_Id
";

                if (filter != null)
                {
                    #region Build Query Conditions

                    string Condition = " WHERE ";

                    if (filter.Where != null)
                    {
                        PropertyInfo[] whereProperties = typeof(MemberDataApprovalGridWhereClauseProperties).GetProperties();
                        foreach (var property in whereProperties)
                        {
                            var value = property.GetValue(filter.Where)?.ToString() ?? "";
                            if (!string.IsNullOrWhiteSpace(value))
                            {
                            bool hasHQDeleted = filter.Where.StatusIds?.Any(s => s == "HQ_DELETED") == true;

                            if (property.Name == "Year")
                                {
                                    List<string> Years = value.Split('-')?.ToList() ?? new List<string>();
                                    DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
                                    DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

                                    Condition += " DATE(mdam.ModifiedDate) >= '" + from.ToString("yyyy-MM-dd") + "' AND DATE(mdam.ModifiedDate) <= '" + to.ToString("yyyy-MM-dd") + "' AND ";
                                }
                                else if (property.Name == "IsActive")
                                {
                                    if (value == "True")
                                    {
                                        Condition += " mdam.IsActive=" + "1" + " AND ";
                                    }
                                    else if (value == "False")
                                    {
                                        Condition += " mdam.IsActive=" + "0" + " AND ";
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
                                        Condition += $" mo.District_Id IN ({districts}) AND ";
                                    }
                                }
                                else if (property.Name == "MemberDataChangeRequestTypes" && filter.Where.MemberDataChangeRequestTypes?.Count() > 0)
                                {
                                    string memberDataChangeRequestType = "";
                                    List<string> conditionList = new List<string>();
                                    filter.Where.MemberDataChangeRequestTypes.ForEach(x =>
                                    {
                                        conditionList.Add(" (mdam.Changed_Detail_Record = '" + x + "') ");
                                    });
                                    memberDataChangeRequestType = string.Join(" OR ", conditionList);

                                    Condition += "(" + memberDataChangeRequestType + ") AND ";
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
                                else if (property.Name == "RoleId" && !string.IsNullOrWhiteSpace(filter.Where.RoleId) && !hasHQDeleted)
                                {
                                    Condition += "mdam.Approval_For = '" + filter.Where.RoleId + "' AND ";
                                }
                                else if (property.Name == "MemberId" && !string.IsNullOrWhiteSpace(filter.Where.MemberId))
                                {
                                    Condition += "mdam.Member_Id = '" + filter.Where.MemberId + "' AND ";
                                }
                            else if (property.Name == "MemberIsActive" && !filter.Where.GetAll && filter.Where.MemberIsActive.HasValue)
                            {
                                Condition += " mm.IsActive = " + (filter.Where.MemberIsActive.Value ? "1" : "0") + " AND ";
                            }
                            else if (property.Name == "IsCompleted" && !filter.Where.GetAll)
                                {
                                    Condition += " mdam.IsCompleted = " + (filter.Where.IsCompleted ? "1" : "0") + " AND ";
                                }
                            else if (property.Name == "IsDeleted" && !filter.Where.GetAll && filter.Where.IsDeleted.HasValue)
                            {
                                Condition += " mm.IsDeleted = " + (filter.Where.IsDeleted.Value ? "1" : "0") + " AND ";
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
                                else if (string.Equals(item.FieldName, "ApprovedByRole", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    columnName = "lastAppRole.RoleName";
                                }
                                else if (string.Equals(item.FieldName, "NextApprovalRole", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    columnName = "nextAppRole.RoleName";
                                }
                                else if (string.Equals(item.FieldName, "Member_Id_Text", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    columnName = "mm.Member_Id";
                                }
                                else if (string.Equals(item.FieldName, "Changed_Detail_Record", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    columnName = "mdam.Changed_Detail_Record";
                                }
                                else if (string.Equals(item.FieldName, "ModifiedByUserName", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    columnName = "mdam.ModifiedByUserName";
                                }
                                //else if (string.Equals(item.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                                //{
                                //    columnName = "pad.Value";
                                //}
                                else if (string.Equals(item.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    columnName = "mdam.Status";
                                }
                                else if (string.Equals(item.FieldName, "Changed_Date", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    columnName = "DATE_FORMAT(mdam.Changed_Date, '%d-%m-%Y')";
                                }
                                else if (string.Equals(item.FieldName, "Changed_Time", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    columnName = "TIME_FORMAT(mdam.Changed_Time, '%h:%i %p')";
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
                        "mdam.ModifiedByUserName","mdam.Changed_Detail_Record",
                        //"pad.Value",
                        "mdam.Status",
                        "DATE_FORMAT(mdam.Changed_Date, '%d-%m-%Y')",
                        "TIME_FORMAT(mdam.Changed_Time, '%h:%i %p')",
                        "nextAppRole.RoleName", "lastAppRole.RoleName"
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
                            if (string.Equals(filter?.Sorting.FieldName, "member_Id_Text", StringComparison.CurrentCultureIgnoreCase))
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
                            else if (string.Equals(filter?.Sorting.FieldName, "ApprovedByRole", StringComparison.CurrentCultureIgnoreCase))
                            {
                                FieldName = "lastAppRole.RoleName";
                            }
                            else if (string.Equals(filter?.Sorting.FieldName, "NextApprovalRole", StringComparison.CurrentCultureIgnoreCase))
                            {
                                FieldName = "nextAppRole.RoleName";
                            }
                            else if (string.Equals(filter?.Sorting.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                            {
                                FieldName = "mdam.Status";
                            }
                            //else if (string.Equals(filter?.Sorting.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                            //{
                            //    FieldName = "pad.Value";
                            //}
                            else if (string.Equals(filter?.Sorting.FieldName, "Changed_Date", StringComparison.CurrentCultureIgnoreCase))
                            {
                                FieldName = "mdam.Changed_Date";
                            }
                            else if (string.Equals(filter?.Sorting.FieldName, "Changed_Time", StringComparison.CurrentCultureIgnoreCase))
                            {
                                FieldName = "mdam.Changed_Time";
                            }
                            else
                            {
                                FieldName = "mdam.ModifiedDate";
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
                            Condition += " ORDER BY mdam.ModifiedDate ";
                        }
                        else
                        {
                            Condition += " ORDER BY mdam.ModifiedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                        }

                        #endregion Pagination Condition

                        Query += Condition;

                        return SqlMapper.Query<MemberDataApprovalGridModel>(conn, Query, commandType: CommandType.Text)?.ToList() ?? new List<MemberDataApprovalGridModel>();
                    }
                }

                return null;
        }
        public string MemberDataApproval(MemberDataApprovalFromSubmitModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pRequestId = model.RequestId,
                pSelectedRoleId = model.SelectedRoleId,
                pCurrentRoleId = model.CurrentRoleId,
                pReason = model.Reason,
                pComment = model.Comment,
                pStatus = model.Status,
                pStatus2 = model.Status2,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Member_Data_Approval", @params, commandType: CommandType.StoredProcedure);
        }

        #region Member Card Change Approval
        public List<Member_Card_Approval_Master_Grid_Model> MemberCardApprovalGridGet(MemberCardApprovalGridFilterModel filter, out int TotalCount)
        {
            TotalCount = 0;

            //            string Query = @"SELECT
            //    mcam.Id,
            //    mm.Member_Id AS memberCode,
            //    mcam.Member_Id,
            //    mcam.StatusId,
            //    mcam.LastActionStatus,
            //    mcam.IsActive,
            //    mcam.IsCompleted,
            //    mcam.IsPrinted,
            //    mcam.IsRejected,
            //    mcam.CreatedBy,
            //    mcam.CreatedByUserName,
            //    mcam.CreatedDate,
            //    mcam.Modifiedby,
            //    mcam.ModifiedByUserName,
            //    mcam.ModifiedDate,
            //    mcam.Deletedby,
            //    mcam.DeletedByUserName,
            //    mcam.DeletedDate,
            //    sts.Value AS Status,
            //    CONCAT(mm.First_Name, ' ', mm.Last_Name) AS Name,
            //    mm.Father_Name AS FatherName,
            //   DATE_FORMAT(mm.Date_Of_Birth, '%Y-%m-%d %H:%i:%s') AS DOB,
            //  --  mm.Date_Of_Birth AS DOB,
            //    mm.Phone_Number AS PhoneNumber,
            //    dist.Value AS District,
            //    CONCAT(
            //        mam.DoorNo, ', ',
            //        mam.StreetName, ', ',
            //        mam.VilllageTownCity, ', ',
            //        tcct.Value, ', ',
            //        dist.Value, ', ',
            //        mam.Pincode
            //    ) AS Address,
            // -- COALESCE(tccl.Value, mo.Local_Body) AS 'LocalBody',
            //--  tcco.Value AS 'OrganizationType',
            //--  tccz.Value AS 'Zone',
            //    mcam.ApprovalComment AS 'ApprovalComment',
            //    mcam.Reason AS 'Reason',
            //    CASE WHEN mcam.IsCompleted = 1 THEN 'Yes' ELSE 'No' END AS 'CardDisbursedStatus',
            //mcam.StatusId           AS StatusId,
            //mo.District_Id          AS DistrictId,
            //mo.Local_Body           AS LocalBodyCode,
            //mo.Organization_Type    AS OrganizationTypeId,
            //mo.Zone                 AS ZoneId
            //FROM member_card_approval_master mcam
            //-- INNER JOIN two_column_configuration_values sts ON sts.Id = mcam.StatusId
            //INNER JOIN member_master mm ON mm.Id = mcam.Member_Id
            //INNER JOIN member_address_master ma
            //    ON ma.MemberId = mcam.Member_Id
            //   AND ma.AddressType = 'PERMANENT'
            //   AND IFNULL(ma.IsActive, 0) = 1
            //   AND IFNULL(ma.IsTemp, 0) = 0
            //LEFT JOIN member_organization mo ON mo.Member_Id = mm.Id
            //-- INNER JOIN two_column_configuration_values dist ON dist.Id = mo.District_Id
            //LEFT JOIN member_address_master mam
            //    ON mam.MemberId = mm.Id
            //   AND mam.AddressType = 'PERMANENT'
            //-- LEFT JOIN two_column_configuration_values tccz ON mo.Zone = tccz.Id
            //-- LEFT JOIN two_column_configuration_values tcct ON mam.Taluk = tcct.Id
            //-- LEFT JOIN two_column_configuration_values tccl ON mo.Local_Body = tccl.Id
            //-- LEFT JOIN two_column_configuration_values tcco ON mo.Organization_Type = tcco.Id";

            string Query = @"SELECT
    mcam.Id,
    mm.Member_Id AS memberCode,
    mcam.Member_Id,
    mcam.StatusId,
    mcam.LastActionStatus,
    mcam.IsActive,
    mcam.IsCompleted,
    mcam.IsPrinted,
    mcam.IsRejected,
    mcam.CreatedBy,
    mcam.CreatedByUserName,
    mcam.CreatedDate,
    mcam.Modifiedby,
    mcam.ModifiedByUserName,
    mcam.ModifiedDate,
    mcam.Deletedby,
    mcam.DeletedByUserName,
    mcam.DeletedDate,

    CONCAT(mm.First_Name, ' ', mm.Last_Name) AS Name,
    mm.Father_Name AS FatherName,
    DATE_FORMAT(mm.Date_Of_Birth, '%Y-%m-%d %H:%i:%s') AS DOB,
    mm.Phone_Number AS PhoneNumber,

    CONCAT(
        mam.DoorNo, ', ',
        mam.StreetName, ', ',
        mam.VilllageTownCity, ', ',
        mam.Taluk, ', ',
        mo.District_Id, ', ',
        mam.Pincode
    ) AS Address,

    mcam.ApprovalComment AS ApprovalComment,
    mcam.Reason AS Reason,
    CASE WHEN mcam.IsCompleted = 1 THEN 'Yes' ELSE 'No' END AS CardDisbursedStatus,

    -- IDs ONLY (for config cache mapping)
    mcam.StatusId            AS StatusId,
   -- mo.District_Id           AS DistrictId,
  --  mo.Local_Body            AS LocalBodyCode,
 --   mo.Organization_Type     AS OrganizationTypeId,
 --   mo.Zone                  AS ZoneId,
 --   mam.Taluk                AS TalukId
IFNULL(mo.District_Id,'')           AS DistrictId,
IFNULL(mo.Local_Body,'')            AS LocalBodyCode,
IFNULL(mo.Organization_Type,'')     AS OrganizationTypeId,
IFNULL(mo.Zone,'')                  AS ZoneId,
IFNULL(mam.Taluk,'')                AS TalukId

FROM member_card_approval_master mcam
INNER JOIN member_master mm ON mm.Id = mcam.Member_Id
INNER JOIN member_address_master ma
    ON ma.MemberId = mcam.Member_Id
   AND ma.AddressType = 'PERMANENT'
   AND IFNULL(ma.IsActive, 0) = 1
   AND IFNULL(ma.IsTemp, 0) = 0
LEFT JOIN member_organization mo ON mo.Member_Id = mm.Id
LEFT JOIN member_address_master mam
    ON mam.MemberId = mm.Id
   AND mam.AddressType = 'PERMANENT'";

            string CountQuery = @"select count(1)
                         from member_card_approval_master mcam
                      -- inner join two_column_configuration_values sts on sts.Id = mcam.StatusId
                         inner join member_master mm on mm.Id = mcam.Member_Id
                         inner join member_address_master ma on ma.MemberId = mcam.Member_Id and ma.AddressType = 'PERMANENT' and ifnull(ma.IsActive,0) = 1 and ifnull(ma.IsTemp,0) = 0
                         LEFT JOIN member_organization mo ON mo.Member_Id = mm.Id
                     --  inner join two_column_configuration_values dist on dist.Id = mo.District_Id
                         LEFT JOIN member_address_master mam ON mam.MemberId = mm.Id and mam.AddressType='PERMANENT'
                    --   LEFT JOIN two_column_configuration_values tccz ON mo.Zone = tccz.Id
                     --  LEFT JOIN two_column_configuration_values tcct ON mam.Taluk = tcct.Id
                    --   LEFT JOIN two_column_configuration_values tccl ON mo.Local_Body = tccl.Id
                    --   LEFT JOIN two_column_configuration_values tcco ON mo.Organization_Type = tcco.Id ";

            if (filter != null)
            {
                #region Build Query Conditions

                string Condition = " WHERE mcam.IsActive=1 AND IFNULL(mcam.IsRejected, 0) = 0 AND ";

                if (filter.Where != null)
                {
                    PropertyInfo[] whereProperties = typeof(MemberCardApprovalGridWhereClauseProperties).GetProperties();
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

                                Condition += " DATE(mcam.ModifiedDate) >= '" + from.ToString("yyyy-MM-dd") + "' AND DATE(mcam.ModifiedDate) <= '" + to.ToString("yyyy-MM-dd") + "' AND ";
                            }
                            else if (property.Name == "IsActive")
                            {
                                if (value == "True")
                                {
                                    Condition += " mcam.IsActive=" + "1" + " AND ";
                                }
                                else if (value == "False")
                                {
                                    Condition += " mcam.IsActive=" + "0" + " AND ";
                                }
                            }
                            else if (property.Name == "IsCompleted")
                            {
                                if (value == "True")
                                {
                                    Condition += " mcam.IsCompleted = 1 AND ";
                                }
                                else if (value == "False")
                                {
                                    Condition += " mcam.IsCompleted = 0 AND ";
                                }
                            }
                            //else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0)
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
                            else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0)
                            {
                                // Build IN clause instead of multiple ORs
                                string inClause = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));
                                Condition += $"(mo.District_Id IN ({inClause})) AND ";
                            }

                            //else if (property.Name == "StatusIds" && filter.Where.StatusIds?.Count() > 0)
                            //{
                            //    string statusIdConditions = "";
                            //    List<string> conditionList = new List<string>();
                            //    filter.Where.StatusIds.ForEach(x =>
                            //    {
                            //        conditionList.Add(" (mcam.StatusId = '" + x + "') ");
                            //    });
                            //    statusIdConditions = string.Join(" OR ", conditionList);

                            //    Condition += "(" + statusIdConditions + ") AND ";
                            //}
                            else if (property.Name == "StatusIds" && filter.Where.StatusIds?.Count() > 0)
                            {
                                // Build IN clause instead of multiple ORs
                                string inClause = string.Join(",", filter.Where.StatusIds.Select(x => $"'{x}'"));
                                Condition += $"(mcam.StatusId IN ({inClause})) AND ";
                            }
                            else if (property.Name == "MemberId" && !string.IsNullOrWhiteSpace(filter.Where.MemberId))
                            {
                                Condition += "mcam.Member_Id = '" + filter.Where.MemberId + "' AND ";
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
                            if (item.FieldName == "memberCode")
                            {
                                item.SearchString = item.SearchString.Replace(" ", "");
                            }


                            #region Field Name Select
                            if (string.Equals(item.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                            }
                            if (string.Equals(item.FieldName, "OrganizationType", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "tcco.Value";
                            }
                            else if (string.Equals(item.FieldName, "PhoneNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mm.Phone_Number";
                            }
                            else if (string.Equals(item.FieldName, "ModifiedByUserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.ModifiedByUserName";
                            }
                            else if (string.Equals(item.FieldName, "ModifiedDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(mcam.ModifiedDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "dist.Value";
                            }
                            else if (string.Equals(item.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "sts.Value";
                            }
                            else if (string.Equals(item.FieldName, "ApprovalComment", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.ApprovalComment";
                            }
                            else if (string.Equals(item.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.Reason";
                            }
                            if (string.Equals(item.FieldName, "Zone", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "tccz.Value";
                            }
                            if (string.Equals(item.FieldName, "LocalBody", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "COALESCE(tccl.Value, mo.Local_Body)";
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
                     "mcam.ModifiedByUserName",
                     "dist.Value",
                     "sts.Value",
                     "tcco.Value",
                     "COALESCE(tccl.Value, mo.Local_Body)",
                     "tccz.Value",
                     "DATE_FORMAT(mcam.ModifiedDate, '%d-%m-%Y')", "mcam.ApprovalComment", "mcam.Reason"
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
                        if (string.Equals(filter?.Sorting.FieldName, "MemberCode", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Member_Id";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "OrganizationType", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "tcco.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "PhoneNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Phone_Number";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "sts.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "dist.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "LastActionStatus", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.LastActionStatus";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "IsCompleted", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.IsCompleted";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "IsPrinted", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.IsPrinted";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "IsActive", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.IsActive";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ApprovalComment", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.ApprovalComment";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.Reason";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "LocalBody", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "COALESCE(tccl.Value, mo.Local_Body)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Zone", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "tccz.Value";
                        }
                        else
                        {
                            FieldName = "mcam.ModifiedDate";
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
                        Condition += " ORDER BY mcam.ModifiedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY mcam.ModifiedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return SqlMapper.Query<Member_Card_Approval_Master_Grid_Model>(conn, Query, commandTimeout: 180, commandType: CommandType.Text)?.ToList() ?? new List<Member_Card_Approval_Master_Grid_Model>();
                }
            }

            return null;
        }

        public Member_Card_Approval_Master_From Member_Card_Approval_Master_From(string Id, string Member_Id)
        {
            dynamic @params = new
            {
                pId = Id,
                pMember_Id = Member_Id
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            {
                return SqlMapper.QueryFirst<Member_Card_Approval_Master_From>(connection, "Member_Card_Approval_Master_From_Get", @params, commandType: CommandType.StoredProcedure) ?? new Member_Card_Approval_Master_From();
            }
        }
        public string MemberCardApproval(Member_Card_Approval_Master_From model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pMasterId = model.Member_Id,
                pFromStatusId = model.FromStatusId,
                pToStatusId = model.ToStatusId,
                pStatusCode = model.SelectedStatus,
                pApprovalComment = model.ApprovalComment,
                pReason = model.Reason,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using (var connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                connection.Open();
                return SqlMapper.ExecuteScalar<string>(connection, "Member_Card_Approval_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
            }
        }

        //public string MemberCardBulkApproval(Member_Card_Approval_Master_From model, AuditColumnsModel audit)
        //{
        //    dynamic @params = new
        //    {
        //        //pId = string.Join(',', model.Id),
        //        pMasterId = string.Join(',', model.Member_Id),
        //        pFromStatusId = model.FromStatusId,
        //        pToStatusId = model.ToStatusId,
        //        pStatusCode = model.SelectedStatus,
        //        pApprovalComment = model.ApprovalComment,
        //        pReason = model.Reason,
        //        pSavedBy = audit.SavedBy,
        //        pSavedByUserName = audit.SavedByUserName,
        //        pSavedDate = audit.SavedDate,
        //    };

        //    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
        //    return SqlMapper.ExecuteScalar<string>(connection, "Member_Card_Bulk_Approval_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        //}

        // Elanjsuriyan - 09092025
        public Member_Card_Approval_Master_From Member_Card_Approval_Master_Bulk_From(string Ids, string Member_Id)
        {
            dynamic @params = new
            {
                pIds = Ids,
                pMember_Ids = Member_Id
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirst<Member_Card_Approval_Master_From>(connection, "Member_Card_Approval_Master_Bulk_From_Get", @params, commandType: CommandType.StoredProcedure) ?? new Member_Card_Approval_Master_From();
        }
        public List<MemberIdMessageViewModel> MemberCardBulkApproval(Member_Card_Approval_Master_From model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pMasterId = string.Join(',', model.Member_Id),
                pFromStatusId = model.FromStatusId,
                pToStatusId = model.ToStatusId,
                pStatusCode = model.SelectedStatus,
                pApprovalComment = model.ApprovalComment,
                pReason = model.Reason,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            //  return SqlMapper.Query<MemberIdMessageViewModel>(connection, "Member_Card_Bulk_Approval_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
            //}
            return SqlMapper.Query<MemberIdMessageViewModel>(connection, "Member_Card_Bulk_Approval_SaveUpdate", @params, commandType: CommandType.StoredProcedure, commandTimeout: 180);
        }

        public List<Member_Card_Approval_History_Master_Model> MemberCardApprovalHistoryGet(MemberCardApprovalHistoryFilterModel filter, out int TotalCount)
        {
            TotalCount = 0;

            string Query = @"select
                          mcam.Id, mm.Id as 'Member_Id',
                          mm.Member_Id as 'memberCode',
                          dist.Value as 'District',
                          concat(mm.First_Name, ' ', mm.Last_Name) as 'Name',
                          fsts.Value as 'FromStatus',
                          COALESCE(tsts.Value,ar.RoleName) as 'ToStatus',
                          mcam.Status,
                          mcam.Outcome,
                          mcam.IsRejected,
                          mcam.IsCompleted,
                          mcam.FailedReasons,
                          mcam.ApprovalComment,
                          mcam.Reason,
                          mcam.CreatedBy,
                          mcam.CreatedByUserName,
                          mcam.CreatedDate
                          from member_card_approval_overall_log mcam
                          left join two_column_configuration_values fsts on fsts.Id = mcam.FromStatusId
                          left join two_column_configuration_values tsts on tsts.Id = mcam.ToStatusId
                          inner join member_master mm on mm.Id = mcam.Member_Id
                          LEFT JOIN member_organization mo ON mo.Member_Id = mm.Id
                            LEFT JOIN account_role ar ON ar.Id = mcam.ToStatusId
                         -- LEFT JOIN member_address_master mam ON mam.MemberId = mm.Id and mam.AddressType='PERMANENT'
                          left join two_column_configuration_values dist on dist.Id = mo.District_Id";

            string CountQuery = @"select count(1)
                          from member_card_approval_overall_log mcam
                          left join two_column_configuration_values fsts on fsts.Id = mcam.FromStatusId
                          left join two_column_configuration_values tsts on tsts.Id = mcam.ToStatusId
                          inner join member_master mm on mm.Id = mcam.Member_Id
                          LEFT JOIN member_organization mo ON mo.Member_Id = mm.Id
LEFT JOIN account_role ar ON ar.Id = mcam.ToStatusId
                         -- LEFT JOIN member_address_master mam ON mam.MemberId = mm.Id and mam.AddressType='PERMANENT'
                          left join two_column_configuration_values dist on dist.Id = mo.District_Id";

            if (filter != null)
            {
                #region Build Query Conditions

                string Condition = " WHERE ";

                if (filter.Where != null)
                {
                    //PropertyInfo[] whereProperties = typeof(MemberCardApprovalHistoryFilterModel).GetProperties();
                    PropertyInfo[] whereProperties = filter.Where.GetType().GetProperties();
                    foreach (var property in whereProperties)
                    {
                        var value = property.GetValue(filter.Where)?.ToString() ?? "";
                        if (!string.IsNullOrWhiteSpace(value))
                        {
                            //if (property.Name == "Year")
                            //{
                            //  List<string> Years = value.Split('-')?.ToList() ?? new List<string>();
                            //  DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
                            //  DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

                            //  Condition += " DATE(mcam.CreatedDate) >= '" + from.ToString("yyyy-MM-dd") + "' AND DATE(mcam.CreatedDate) <= '" + to.ToString("yyyy-MM-dd") + "' AND ";
                            //}
                            if (property.Name == "FromDate")
                            {
                                if (DateTime.TryParse(value, out DateTime fromDate))
                                {
                                    Condition += $" DATE(mcam.CreatedDate) >= '{fromDate:yyyy-MM-dd}' AND ";
                                }
                            }

                            if (property.Name == "ToDate")
                            {
                                if (DateTime.TryParse(value, out DateTime toDate))
                                {
                                    Condition += $" DATE(mcam.CreatedDate) <= '{toDate:yyyy-MM-dd}' AND ";
                                }
                            }


                            //else if (property.Name == "IsActive")
                            //{
                            //  if (value == "True")
                            //  {
                            //    Condition += " mcam.IsActive=" + "1" + " AND ";
                            //  }
                            //  else if (value == "False")
                            //  {
                            //    Condition += " mcam.IsActive=" + "0" + " AND ";
                            //  }
                            //}
                            else if (property.Name == "DistrictIds" && filter.Where.DistrictIds?.Count() > 0)
                            {
                                string districtConditions = "";
                                List<string> distList = new List<string>();
                                filter.Where.DistrictIds.ForEach(x =>
                                {
                                    distList.Add(" (mo.District_Id = '" + x + "') ");
                                });
                                districtConditions = string.Join(" OR ", distList);

                                Condition += "(" + districtConditions + ") AND ";
                            }
                            else if (property.Name == "FromStatusId" && filter.Where.StatusIds?.Count() > 0)
                            {
                                string statusIdConditions = "";
                                List<string> conditionList = new List<string>();
                                filter.Where.StatusIds.ForEach(x =>
                                {
                                    conditionList.Add(" (mcam.FromStatusId = '" + x + "') ");
                                });
                                statusIdConditions = string.Join(" OR ", conditionList);

                                Condition += "(" + statusIdConditions + ") AND ";
                            }
                            else if (property.Name == "ToStatusId" && filter.Where.StatusIds?.Count() > 0)
                            {
                                string statusIdConditions = "";
                                List<string> conditionList = new List<string>();
                                filter.Where.StatusIds.ForEach(x =>
                                {
                                    conditionList.Add(" (mcam.ToStatusId = '" + x + "') ");
                                });
                                statusIdConditions = string.Join(" OR ", conditionList);

                                Condition += "(" + statusIdConditions + ") AND ";
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
                            if (item.FieldName == "memberCode")
                            {
                                item.SearchString = item.SearchString.Replace(" ", "");
                            }


                            #region Field Name Select
                            if (string.Equals(item.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                            }
                            else if (string.Equals(item.FieldName, "CreatedByUserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.CreatedByUserName";
                            }
                            else if (string.Equals(item.FieldName, "CreatedDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "DATE_FORMAT(mcam.CreatedDate, '%d-%m-%Y')";
                            }
                            else if (string.Equals(item.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "dist.Value";
                            }
                            else if (string.Equals(item.FieldName, "FromStatus", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "fsts.Value";
                            }
                            else if (string.Equals(item.FieldName, "ToStatus", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "tsts.Value";
                            }
                            else if (string.Equals(item.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.Status";
                            }
                            else if (string.Equals(item.FieldName, "Outcome", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.Outcome";
                            }

                            else if (string.Equals(item.FieldName, "ApprovalComment", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.ApprovalComment";
                            }
                            else if (string.Equals(item.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.Reason";
                            }
                            else if (string.Equals(item.FieldName, "FailedReasons", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.FailedReasons";
                            }
                            else if (string.Equals(item.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "mcam.Reason";
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
                      "CONCAT(mm.First_Name, ' ', mm.Last_Name)",
                      "mcam.CreatedByUserName",
                      "dist.Value",
                      "fsts.Value",
                      "tsts.Value",
                      "mcam.Outcome",
                      "mcam.Status",
                      "mcam.FailedReasons",
                      "DATE_FORMAT(mcam.CreatedDate, '%d-%m-%Y')", "mcam.ApprovalComment", "mcam.Reason"
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
                        if (string.Equals(filter?.Sorting.FieldName, "MemberCode", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mm.Member_Id";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "CONCAT(mm.First_Name, ' ', mm.Last_Name)";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "FromStatus", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "fsts.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ToStatus", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "tsts.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "dist.Value";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Status", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.Status";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "IsCompleted", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.IsCompleted";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "IsPrinted", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.IsPrinted";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "IsActive", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.IsActive";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "ApprovalComment", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.ApprovalComment";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "FailedReasons", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.FailedReasons";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "Reason", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "mcam.Reason";
                        }
                        else
                        {
                            FieldName = "mcam.CreatedDate";
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
                        Condition += " ORDER BY mcam.CreatedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY mcam.CreatedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return SqlMapper.Query<Member_Card_Approval_History_Master_Model>(conn, Query, commandType: CommandType.Text)?.ToList() ?? new List<Member_Card_Approval_History_Master_Model>();
                }
            }

            return null;
        }




        public string GetApprovalRoleId( string Role)
        {
            dynamic @params = new
            {
                pRole = Role
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "GetApprovalroleId", @params, commandType: CommandType.StoredProcedure);
        }

        public string GetRoleId(string Role)
        {
            dynamic @params = new
            {
                pRole = Role
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "GetRoleId", @params, commandType: CommandType.StoredProcedure);
        }
        public List<string> MemberDataBulkApproval(MemberDataBulkApprovalFromSubmitModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pRequestIds = string.Join(',', model.RequestId),
                pSelectedRoleId = model.SelectedRoleId,
                pCurrentRoleId = model.CurrentRoleId,
                pReason = model.Reason,
                pComment = model.Comment,
                pStatus = model.Status,
                pStatus2 = model.Status2,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<string>(connection,"Member_Data_Bulk_Approval", @params, commandType: CommandType.StoredProcedure, commandTimeout: 300);
        }

        public List<Member_Card_Approval_Master_History> Member_Card_Approval_Master_History_Get(string Id)
        {
            dynamic @params = new
            {
                pId = Id
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<Member_Card_Approval_Master_History>(connection, "Member_Card_Approval_Master_History_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<Member_Card_Approval_Master_History>();
        }

        #endregion Member Card Change Approval


        #region DuplicatesGet
        public List<DuplicateMemberGridModel> DuplicateMemberGridGet(DuplicateMemberFilterModel filter, out int totalCount)
        {
            totalCount = 0;

            string baseQuery = @"
         SELECT 
        m.Id,
        m.Member_Id,
        CONCAT_WS(' ', m.First_Name, m.Last_Name) AS FullName,
        m.ModifiedDate AS ModifiedDate,
        m.Phone_Number AS PhoneNumber,
        m.Aadhaar_Number AS AadhaarNumber,
        dist.Value AS District,
        tcco.Value AS OrganizationType
    FROM member_master m
    INNER JOIN member_organization mo ON mo.Member_Id = m.Id
    INNER JOIN two_column_configuration_values dist ON dist.Id = mo.District_Id
    LEFT JOIN two_column_configuration_values tcco ON mo.Organization_Type = tcco.Id
    WHERE m.IsApproved != 1
      AND m.IsActive = 1
      AND (m.Aadhaar_Number, m.Phone_Number) IN (
          SELECT Aadhaar_Number, Phone_Number
          FROM member_master
          WHERE IsApproved != 1 AND IsActive = 1
          GROUP BY Aadhaar_Number, Phone_Number
          HAVING COUNT(*) > 1
      )";

            using (var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                conn.Open();

                // Count query without pagination
                string countQuery = "SELECT COUNT(1) FROM (" + baseQuery + ") AS t";
                totalCount = conn.ExecuteScalar<int>(countQuery);

                // Apply filters for all columns except DOB
                string filterCondition = "";

                if (filter?.Where != null)
                {
                    if (!string.IsNullOrWhiteSpace(filter.Where.MemberId))
                        filterCondition += $" AND m.Member_Id LIKE '%{filter.Where.MemberId}%' ";
                    if (!string.IsNullOrWhiteSpace(filter.Where.PhoneNumber))
                        filterCondition += $" AND m.Phone_Number LIKE '%{filter.Where.PhoneNumber}%' ";
                    if (!string.IsNullOrWhiteSpace(filter.Where.AadhaarNumber))
                        filterCondition += $" AND m.Aadhaar_Number LIKE '%{filter.Where.AadhaarNumber}%' ";
                    if (!string.IsNullOrWhiteSpace(filter.Where.DistrictIds?.FirstOrDefault()))
                    {
                        string inClause = string.Join(",", filter.Where.DistrictIds.Select(x => $"'{x}'"));
                        filterCondition += $" AND mo.District_Id IN ({inClause}) ";
                    }
                    if (!string.IsNullOrWhiteSpace(filter.Where.OrganizationType))
                        filterCondition += $" AND tcco.Value LIKE '%{filter.Where.OrganizationType}%' ";
                    if (!string.IsNullOrWhiteSpace(filter.Where.FullName))
                        filterCondition += $" AND CONCAT_WS(' ', m.First_Name, m.Last_Name) LIKE '%{filter.Where.FullName}%' ";
                }

                // Global search
                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string search = filter.SearchString.Trim();
                    filterCondition += $" AND (m.Member_Id LIKE '%{search}%' OR CONCAT_WS(' ', m.First_Name, m.Last_Name) LIKE '%{search}%' OR m.Phone_Number LIKE '%{search}%' OR m.Aadhaar_Number LIKE '%{search}%' OR dist.Value LIKE '%{search}%' OR tcco.Value LIKE '%{search}%') ";
                }

                // Sorting
                string orderBy = " ORDER BY m.Id ";
                if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter.Sorting.FieldName))
                {
                    string field = filter.Sorting.FieldName.ToLower();
                    string dir = string.IsNullOrWhiteSpace(filter.Sorting.Sort) ? "ASC" : filter.Sorting.Sort;

                    field = field switch
                    {
                        "membercode" => "m.Member_Id",
                        "fullname" => "FullName",
                        "phonenumber" => "m.Phone_Number",
                        "aadhaarnumber" => "m.Aadhaar_Number",
                        "district" => "dist.Value",
                        "organizationtype" => "tcco.Value",
                        _ => "m.Id"
                    };

                    orderBy = $" ORDER BY {field} {dir} ";
                }

                // Pagination
                string limitOffset = filter.Take > 0 ? $" LIMIT {filter.Take} OFFSET {filter.skip}" : "";

                string finalQuery = baseQuery + filterCondition + orderBy + limitOffset;

                return conn.Query<DuplicateMemberGridModel>(finalQuery).ToList();
            }
        }


        #endregion DuplicatesGet

        public bool RemoveDuplicateMembers(RemoveDuplicateMembersModel model)
        {
            if (model?.MemberIds == null || !model.MemberIds.Any())
                return false;




            // Convert list of IDs to comma-separated string
            string memberIds = string.Join(",", model.MemberIds);
            //string memberIds = string.Join(",", model.MemberIds.Select(x => $"'{x}'"));

            // Strongly-typed anonymous object for Dapper
            var parameters = new { pMemberIds = memberIds };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            connection.Open();

            try
            {
                connection.Execute(
                    "RemoveDuplicateMembers",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return true; // procedure ran, dont care about affected rows
            }
            catch
            {
                return false;
            }
        }


    }
}
