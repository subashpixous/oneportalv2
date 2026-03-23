using AutoMapper.Execution;
using DAL.Helpers;
using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using Google.Protobuf.WellKnownTypes;
using Microsoft.Extensions.Configuration;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Model.ViewModel.MemberModels;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using OtpNet;
using System.Data;
using System.Globalization;
using System.Reflection;
using Utils.Interface;
using static Model.DomainModel.DashboardResponseCountModel;

namespace DAL
{
    public class SchemeDAL
    {
        private readonly IMySqlHelper _mySqlHelper;
        private readonly IConfiguration _configuration;
        private readonly IMySqlDapperHelper _mySqlDapperHelper;
        private readonly DapperContext _dapperContext;

        private readonly string connectionId = "Default";
        public SchemeDAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IConfiguration configuration)
        {
            _mySqlHelper = mySqlHelper;
            _configuration = configuration;
            _mySqlDapperHelper = mySqlDapperHelper;
            _dapperContext = new DapperContext(_configuration.GetConnectionString(connectionId));
        }
        //created by surya
        /*        public ApplicationDetailsForSMS Application_Get_Details_For_SMS(string applicationId)
                {
                    string query = @"
                SELECT 
                    a.Id AS Application_Id,
                    m.First_Name,
                    m.Last_Name,
                    m.Phone_Number AS Mobile_Number,
                    sc.Value AS Scheme_Name_English,
                    sc.ValueTamil AS Scheme_Name_Tamil
                FROM application_master a
                INNER JOIN application_details ad 
                    ON ad.ApplicationId = a.Id
                INNER JOIN member_master m 
                    ON m.Id = ad.MemberId
                INNER JOIN two_column_configuration_values sc 
                    ON sc.Id = a.SchemeId
                WHERE a.Id = @ApplicationId";

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    return connection.QueryFirstOrDefault<ApplicationDetailsForSMS>(query, new { ApplicationId = applicationId });
                }*/
        public ApplicationDetailsForSMS Application_Get_Details_For_SMS(string applicationId)
        {
            string query = @"
    SELECT 
        a.Id AS Application_Id,
        m.First_Name,
        m.Last_Name,
        m.Email,
       
        m.Phone_Number AS Mobile_Number,
        sc.Value AS Scheme_Name_English,
        sc.ValueTamil AS Scheme_Name_Tamil,
        acd.Amount AS Amount
    FROM application_master a
    INNER JOIN application_details ad 
        ON ad.ApplicationId = a.Id
    INNER JOIN member_master m 
        ON m.Id = ad.MemberId
    INNER JOIN two_column_configuration_values sc 
        ON sc.Id = a.SchemeId
    INNER JOIN application_cost_details acd
        ON acd.ApplicationId = a.Id
    WHERE a.Id = @ApplicationId
    LIMIT 1"; // Assuming one amount per application

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return connection.QueryFirstOrDefault<ApplicationDetailsForSMS>(query, new { ApplicationId = applicationId });
        }

        //modified by Indu on 25-10-2025 for storing collected by details for scheme
        public string Application_Master_Save(ApplicationMasterSaveModel model, AuditColumnsModel audit)
        {
            if (string.IsNullOrWhiteSpace(model.Id))
            {
                model.Id = Guid.NewGuid().ToString();
            }

            dynamic @params = new
            {
                pId = model.Id,
                pSchemeId = model.SchemeId,
                pFromStatusId = model.FromStatusId,
                pToStatusId = model.ToStatusId,
                pMemberId = model.MemberId,
                pFamilyMemberId = (model.SelectedMember?.IsFamilyMember ?? false) ? model.SelectedMember.Id : "",
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
                pMemberName = model.MemberName,
                pApplicantName = model.ApplicantName,
                pMobile = model.Mobile,
                pAadharNumber = model.AadharNumber,
                pDistrict = model.District,
                pCollectedByName = model.CollectedByName,
                pCollectedByPhoneNumber = model.CollectedByPhoneNumber,
                pCollectedOn=model.CollectedOn

            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            // Returns application detail table Id
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Master_Save", @params, commandType: CommandType.StoredProcedure);
        }
        public IEnumerable<(string SchemeId, string SchemeSubCategoryId, string SchemeSubCategory, decimal Amount)> GetSelectedSubCategoryAndAmount(string ApplicationId)
        {
            string Query = @"SELECT am.SchemeId, acd.SchemeSubCategoryId, ssc.Value as 'SchemeSubCategory', acd.Amount FROM application_cost_details acd
                             INNER JOIN two_column_configuration_values ssc ON ssc.Id = acd.SchemeSubCategoryId
                             INNER JOIN application_master am ON am.Id = acd.ApplicationId
                             WHERE acd.ApplicationId = '"+ ApplicationId + "'";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<(string SchemeId, string SchemeSubCategoryId, string SchemeSubCategory, decimal Amount)>(connection, Query, commandType: CommandType.Text);
        }
        public ApplicationCostDetails Application_Get_Cost_Details(SelectedSchemeSubCategoryGetPayload model, string SubCategoryId)
        {
            dynamic @params = new
            {
                pApplicationId = model.ApplicationId,
                pSchemeId = model.SchemeId,
                pSubCategoryId = SubCategoryId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<ApplicationCostDetails>(connection, "Application_Get_scheme_sub_category_cost", @params, commandType: CommandType.StoredProcedure);
        }
        public void Application_Save_Cost_Details(ApplicationCostDetails model, AuditColumnsModel audit)
        {
            if (model.IsSelected)
            {
                dynamic @params = new
                {
                    pApplicationId = model.ApplicationId,
                    pSubCategoryId = model.SubCategoryId,
                    pAmount = model.Amount,
                    pSavedBy = audit.SavedBy,
                    pSavedByUserName = audit.SavedByUserName,
                    pSavedDate = audit.SavedDate,
                };
                using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                SqlMapper.Execute(connection, "Application_Save_scheme_sub_category_cost", @params, commandType: CommandType.StoredProcedure);
            }
            else
            {
                string Query = $"DELETE FROM application_cost_details WHERE ApplicationId='{model.ApplicationId}' AND SchemeSubCategoryId='{model.SubCategoryId}';";
                using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                SqlMapper.Execute(connection, Query, commandType: CommandType.Text);
            }
        }
        public string Application_Scheme_Additional_Information_Update(SchemeAdditionalInformation model)
        {
            dynamic @params = new
            {
                pApplicationId = model.ApplicationId,
                pPlaceOfAccident = model.PlaceOfAccident,
                pRelationshipToTheAccident = model.RelationshipToTheAccident,
                pMedicalInsurancePlanRegistrationNumber = model.MedicalInsurancePlanRegistrationNumber
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return SqlMapper.ExecuteScalar<string>(connection, "Application_Scheme_Additional_Information_Update", @params, commandType: CommandType.StoredProcedure);
        }
        public SchemeAdditionalInformation Application_Scheme_Additional_Information_Get(string pApplicationId)
        {
            string Query = "SELECT ApplicationId,PlaceOfAccident,RelationshipToTheAccident,MedicalInsurancePlanRegistrationNumber FROM application_details WHERE ApplicationId='" + pApplicationId + "'";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<SchemeAdditionalInformation>(connection, Query.ToLower(), commandType: CommandType.Text) ?? new SchemeAdditionalInformation();
        }
        
        public bool Application_IsSingleCategorySelect(string SchemeId)
        {
            string Query = "SELECT IFNULL(IsSingleCategorySelect, 0) FROM config_scheme WHERE SchemeId = '"+ SchemeId + "'";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<bool>(connection, Query, commandType: CommandType.Text);
        }


        public List<ApplicationDetailViewModel> Application_Detail_Get(string Id = "", string ApplicationId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pApplicationId = ApplicationId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationDetailViewModel>(connection, "Application_Detail_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationDetailViewModel>();
        }
        public string Application_Qualification_SaveUpdate(ApplicantQualificationMasterModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pApplicationId = model.ApplicationId,

                pEducationalQualificationId = model.EducationalQualificationId,
                pCourseDetails = model.CourseDetails,
                pInstitution = model.Institution,
                pYearOfPassing = model.YearOfPassing,
                pIsActive = true,

                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Qualification_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<ApplicantQualificationMasterModel> Application_Qualification_Get(string Id = "", string ApplicationId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pApplicationId = ApplicationId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicantQualificationMasterModel>(connection, "Application_Qualification_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicantQualificationMasterModel>();
        }
        public List<ApplicationStatusHistoryModel> Application_Status_History_Get(string Id = "", string ApplicationId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pApplicationId = ApplicationId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationStatusHistoryModel>(connection, "Application_Status_History_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicantQualificationMasterModel>();
        }
        
        // User & Applicant Grid
        public List<ApplicationGridViewModel> Application_GetList(string Id = "", string ApplicationId = "", 
            string Mobile = "", string Email = "", bool IsApplicant = false, int ExpiryDays = 7, string MemberId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pApplicationId = ApplicationId,
                pMobile = Mobile,
                pEmail = Email,
                pMemberId = MemberId,
                pIsApplicant = IsApplicant,
                pExpiryDays = ExpiryDays,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationGridViewModel>(connection, "Application_Get_Grid_List", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationGridViewModel>();
        }
        public List<ApplicationMainGridModel> Application_MainGrid_Get_List(ApplicationGridParameterModel model, int expireInDays, out int TotalCount)
        {
            TotalCount = Application_MainGrid_Get_Record_Count(model, expireInDays);

            if (model.Take == 0)
            {
                model.Take = 10;
            }

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            string Query = @"SELECT 
                        am.Id AS ApplicationId, 
                        (case when ifnull(am.ApplicationNumber,'')='' then  am.TemporaryNumber else am.ApplicationNumber end) AS ApplicationNumber, 
                        cscm.Value AS Scheme, 
                        cscm.Id AS SchemeId,
                        csm.Value AS Status, 
	                    cscm.Code AS SchemeCode,
                        csm.Code AS StatusCode,
                        am.ModifiedDate AS Date,
                        aam.District AS DistrictId,
                        (CASE WHEN csm.Code='SAVED' AND DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPIREDDAYS> THEN 1 ELSE 0 END) AS 'IsExpired',
                        (CASE WHEN ifnull(am.BulkApprovedBy,'')!= '' THEN am.BulkApprovedBy ELSE AC.CreatedBy END) AS 'BulkApprovedBy',
                        (CASE WHEN ifnull(am.BulkApprovedDate,'')!= '' THEN am.BulkApprovedDate ELSE AC.CreatedDate END) AS 'BulkApprovedDate',
                        am.IsBulkApproval,
                        (CASE WHEN ifnull(am.BulkApprovedBy,'')!='' THEN (CONCAT(udd.FirstName ,' ', udd.LastName)) ELSE AC.LastApprovedByName END) as BulkApprovedByUserName,
                        am.SubmittedDate,
                        AC.LastAction,
                        AC.Observation,
                        am.CollectedByName,am.CollectedByPhoneNumber,am.CollectedOn,

                        am.ApplicantName AS BeneficiaryName,

                        ddm.Value AS DistrictName,
                        (CASE WHEN IFNULL(fmm.Id, '') != '' THEN fmm.name ELSE CONCAT(mmm.First_Name, ' ', mmm.Last_Name) END) AS FirstName, 
                        (CASE WHEN IFNULL(fmm.Id, '') != '' THEN '' ELSE mmm.Last_Name END) AS LastName

                        FROM application_master am 
                        INNER JOIN application_details ad ON ad.ApplicationId = am.Id
                        INNER JOIN member_master mmm ON mmm.Id = ad.MemberId
                        LEFT JOIN member_family_member fmm ON fmm.Id = ad.FamilyMemberId AND fmm.IsTemp = 1
                        INNER JOIN two_column_configuration_values cscm ON cscm.Id = am.SchemeId
                        INNER JOIN two_column_configuration_values csm ON csm.Id = am.StatusId
                        INNER JOIN application_privileages up ON up.StatusId = am.StatusId AND up.SchemeId = am.SchemeId AND up.CanView = 1 AND up.RoleId = '<ROLE_ID_REPLACE>'
                        INNER JOIN member_address_master aam ON aam.MemberId = ad.MemberId AND aam.AddressType = 'PERMANENT' AND aam.IsTemp = 0
                        LEFT JOIN member_organization mo on mmm.Id=mo.Member_Id
                        LEFT JOIN two_column_configuration_values ddm ON ddm.Id = mo.District_Id
                        
                        LEFT JOIN account_user udd ON udd.UserId = am.BulkApprovedby
                       -- LEFT JOIN (
		               --     SELECT cc.CreatedDate, cc.CreatedBy, cc.ApplicationId, CONCAT(ccu.FirstName, ' ', ccu.LastName) AS LastApprovedByName, cc.Status AS LastAction,
                       --     (CASE WHEN (cc.Status = 'REJECTED' OR cc.Status = 'RETURNED') THEN cc.Reason ELSE '' END) as 'Observation'
                       --     FROM application_approval_comments cc
                       --     INNER JOIN account_user ccu ON ccu.UserId = cc.CreatedBy
                       --     WHERE cc.CreatedDate = (
                       --             SELECT MAX(sub.CreatedDate)
                       --             FROM application_approval_comments sub
                       --             WHERE sub.ApplicationId = cc.ApplicationId
                       --         )
	                   -- ) AS AC ON AC.ApplicationId = am.Id 
                       LEFT JOIN (
    SELECT 
        cc.CreatedDate, 
        cc.CreatedBy, 
        cc.ApplicationId, 
        CONCAT(ccu.FirstName, ' ', ccu.LastName) AS LastApprovedByName, 
        cc.Status AS LastAction,
        CASE WHEN cc.Status IN ('REJECTED', 'RETURNED') THEN cc.Reason ELSE '' END as Observation
    FROM (
        SELECT 
            cc.*,
            ROW_NUMBER() OVER (PARTITION BY cc.ApplicationId ORDER BY cc.CreatedDate DESC) as rn
        FROM application_approval_comments cc
    ) cc
    INNER JOIN account_user ccu ON ccu.UserId = cc.CreatedBy
    WHERE cc.rn = 1
) AS AC ON AC.ApplicationId = am.Id
                        WHERE

                        am.IsActive = <ISACTIVE> AND
                        (<DISTRICTIDS>) AND
	                    (<SCHEMEIDS>) AND
	                    (<STATUSCODES>) AND
                        (<COLUMNSEARCH>) AND
                        (<MOBILE>) AND (<CollectedByName>) and am.CreatedDate > '<FROM_YEAR>' AND am.CreatedDate < '<TO_YEAR>'
                        AND ((CASE WHEN csm.Code='SAVED' AND DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPIREDDAYS> THEN 1 ELSE 0 END) = <ISEXPIRED>) AND
                        CASE WHEN '<SEARCH_STRING>'!='' THEN 
                            am.ApplicationNumber LIKE '%<SEARCH_STRING>%' OR 
                            am.TemporaryNumber LIKE '%<SEARCH_STRING>%' OR 	
                            cscm.Value LIKE '%<SEARCH_STRING>%' OR 
                            csm.Value LIKE '%<SEARCH_STRING>%' OR 
                            (CASE WHEN IFNULL(fmm.Id, '') != '' THEN fmm.name ELSE CONCAT(mmm.First_Name, ' ', mmm.Last_Name) END) LIKE '%<SEARCH_STRING>%' OR 
                            (CASE WHEN IFNULL(fmm.Id, '') != '' THEN '' ELSE mmm.Last_Name END) LIKE '%<SEARCH_STRING>%' OR 
                            AC.Observation LIKE '%<SEARCH_STRING>%' OR 
                            cscm.Value LIKE '%<SEARCH_STRING>%' OR 
                            ddm.Value LIKE '%<SEARCH_STRING>%' 
                        ELSE 1=1 END    
                        <ORDER_DIRECTION> 
	                    LIMIT <SKIP> , <TAKE> ";

            // Handle IsActive condition
            if (model.ShowInactiveOnly)
            {
                Query = Query.Replace("<ISACTIVE>", "0"); // Show only inactive (trashed) apps
            }
            else
            {
                Query = Query.Replace("<ISACTIVE>", "1"); // Show only active apps (default)
            }

            string columnSearchConditions = "";
            if (model.ColumnSearch != null && model.ColumnSearch.Count > 0)
            {
                List<string> distList = new List<string>();
                model.ColumnSearch.ForEach(x =>
                {
                    if (x.FieldName == "districtName")
                    {
                        distList.Add(" (ddm.Value LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "firstName")
                    {
                        distList.Add(" (CONCAT(ad.FirstName,' ',ad.LastName) LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "observation")
                    {
                        distList.Add(" (AC.Observation LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "status")
                    {
                        distList.Add(" (csm.Value LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "scheme")
                    {
                        distList.Add(" (cscm.Value LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "applicationNumber")
                    {
                        distList.Add(" ((case when ifnull(am.ApplicationNumber,'')='' then  am.TemporaryNumber else am.ApplicationNumber end) LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "bulkApprovedByUserName")
                    {
                        distList.Add(" ((CASE WHEN ifnull(am.BulkApprovedBy,'')!='' THEN (CONCAT(udd.FirstName ,' ', udd.LastName)) ELSE AC.LastApprovedByName END) LIKE '%" + x.SearchString + "%') ");
                    }
                    
                });

                columnSearchConditions = string.Join(" AND ", distList);
            }
            else
            {
                columnSearchConditions = "";
            }

            string districtConditions = "";
            if (model.DistrictIds != null && model.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                model.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (mo.District_Id = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=0";
            }

            string schemeIdConditions = "";
            if (model.SchemeIds != null && model.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                model.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (am.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=0";
            }

            string statusCodeConditions = "";
            if (model.StatusCodes != null && model.StatusCodes.Count > 0)
            {
                // Updated Code For Get Returned Status Applications - Elanjsuriyan
                List<string> distList = new List<string>();
                List<string> conditions = new List<string>();

                bool hasReturned = model.StatusCodes.Any(x => x.StartsWith("RETURNED", StringComparison.OrdinalIgnoreCase));
                if (hasReturned)
                {
                    conditions.Add(" (AC.LastAction = 'RETURNED') ");
                }

                //model.StatusCodes.ForEach(x =>
                //{
                //    distList.Add(" (csm.Code = '" + x + "') ");
                //});

                //statusCodeConditions = string.Join(" OR ", distList);

                var normalStatuses = model.StatusCodes.Where(x => !x.StartsWith("RETURNED", StringComparison.OrdinalIgnoreCase)).ToList();

                if (normalStatuses.Count > 0)
                {
                    foreach (var x in normalStatuses)
                    {
                        conditions.Add(" (csm.Code = '" + x + "') ");
                    }
                }

                statusCodeConditions = string.Join(" OR ", conditions);
            }
            else
            {
                statusCodeConditions = "1=0";
            }

            string mobileConditions = "";
            if (model.Mobile != null && model.Mobile.Count > 0)
            {
                List<string> distList = new List<string>();
                model.Mobile.ForEach(x =>
                {
                    distList.Add(" (am.CollectedByPhoneNumber = '" + x + "') ");
                });

                mobileConditions = string.Join(" OR ", distList);
            }
            else
            {
                mobileConditions = "1=1";
            }
            string collectedbyconditions = "";

            if (!string.IsNullOrWhiteSpace(model.CollectedByName))
            {
                collectedbyconditions = $" (am.CollectedByName LIKE '%{model.CollectedByName}%') ";
            }
            else
            {
                collectedbyconditions = "1=1"; // no filter
            }
        

            TimeZoneInfo istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            TimeZoneInfo istZones = TimeZoneInfo.Local;
            DateTime from = TimeZoneInfo.ConvertTime(model.From, istZones);
            DateTime to = TimeZoneInfo.ConvertTime(model.To, istZones);

            Query = Query.Replace("<ROLE_ID_REPLACE>", model.RoleId);
            Query = Query.Replace("<DISTRICTIDS>", districtConditions);
            Query = Query.Replace("<SCHEMEIDS>", schemeIdConditions);
            Query = Query.Replace("<STATUSCODES>", statusCodeConditions);
            Query = Query.Replace("<MOBILE>", mobileConditions);
            Query = Query.Replace("<CollectedByName>", collectedbyconditions);
            Query = Query.Replace("<FROM_YEAR>", from.ToString("yyyy-MM-dd HH:mm:ss"));
            Query = Query.Replace("<TO_YEAR>", to.ToString("yyyy-MM-dd HH:mm:ss"));
            Query = Query.Replace("<SEARCH_STRING>", model.SearchString);
            Query = Query.Replace("<ORDER_DIRECTION> ", model.OrderDirection);
            Query = Query.Replace("<SKIP>", model.Skip.ToString());
            Query = Query.Replace("<TAKE>", model.Take.ToString());
            Query = Query.Replace("<EXPIREDDAYS>", expireInDays.ToString());
            
            if (!string.IsNullOrEmpty(columnSearchConditions))
            {
                Query = Query.Replace("<COLUMNSEARCH>", columnSearchConditions);
            }
            else
            {
                Query = Query.Replace("(<COLUMNSEARCH>) AND", "");
            }
            

            if (model.IsExpired)
            {
                Query = Query.Replace("<ISEXPIRED>", "1");
            }
            else  
            {
                Query = Query.Replace("<ISEXPIRED>", "0");
            }


            return SqlMapper.Query<ApplicationMainGridModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<ApplicationMainGridModel>();
        }
        public int Application_MainGrid_Get_Record_Count(ApplicationGridParameterModel model, int expireInDays)
        {
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            string Query = @"SELECT 
                        
                        COUNT(1)
    
                        FROM application_master am 
                        INNER JOIN application_details ad ON ad.ApplicationId = am.Id
                        INNER JOIN member_master mmm ON mmm.Id = ad.MemberId
                        LEFT JOIN member_family_member fmm ON fmm.Id = ad.FamilyMemberId AND fmm.IsTemp = 0
                        INNER JOIN two_column_configuration_values cscm ON cscm.Id = am.SchemeId
                        INNER JOIN two_column_configuration_values csm ON csm.Id = am.StatusId
                        INNER JOIN application_privileages up ON up.StatusId = am.StatusId AND up.SchemeId = am.SchemeId AND up.CanView = 1 AND up.RoleId = '<ROLE_ID_REPLACE>'
                        INNER JOIN member_address_master aam ON aam.MemberId = ad.MemberId AND aam.AddressType = 'PERMANENT' AND aam.IsTemp = 0
                        LEFT JOIN member_organization mo on mmm.Id=mo.Member_Id
                        LEFT JOIN two_column_configuration_values ddm ON ddm.Id = aam.District
                        LEFT JOIN account_user udd ON udd.UserId = am.BulkApprovedby
                       -- LEFT JOIN (
		               --   SELECT cc.CreatedDate, cc.CreatedBy, cc.ApplicationId, CONCAT(ccu.FirstName, ' ', ccu.LastName) AS LastApprovedByName, cc.Status AS LastAction,
                      --    (CASE WHEN (cc.Status = 'REJECTED' OR cc.Status = 'RETURNED') THEN cc.Reason ELSE '' END) as 'Observation'
                       --    FROM application_approval_comments cc
                       --     INNER JOIN account_user ccu ON ccu.UserId = cc.CreatedBy
                       --     WHERE cc.CreatedDate = (
                       --             SELECT MAX(sub.CreatedDate)
                       --             FROM application_approval_comments sub
                       --             WHERE sub.ApplicationId = cc.ApplicationId
                      --          )
	                 --   ) AS AC ON AC.ApplicationId = am.Id 
                      LEFT JOIN (
  SELECT 
     cc.CreatedDate, 
     cc.CreatedBy, 
     cc.ApplicationId, 
     CONCAT(ccu.FirstName, ' ', ccu.LastName) AS LastApprovedByName, 
     cc.Status AS LastAction,
     CASE WHEN cc.Status IN ('REJECTED', 'RETURNED') THEN cc.Reason ELSE '' END as Observation
   FROM (
        SELECT cc.*,
           ROW_NUMBER() OVER (PARTITION BY cc.ApplicationId ORDER BY cc.CreatedDate DESC) as rn
       FROM application_approval_comments cc
    ) cc
   INNER JOIN account_user ccu ON ccu.UserId = cc.CreatedBy
    WHERE cc.rn = 1
 ) AS AC ON AC.ApplicationId = am.Id
                        WHERE 
    
                        (<DISTRICTIDS>) AND
	                    (<SCHEMEIDS>) AND
	                    (<STATUSCODES>) AND
                        (<COLUMNSEARCH>) AND
   (<MOBILE>) AND (<CollectedByName>) AND
                        am.CreatedDate > '<FROM_YEAR>' AND am.CreatedDate < '<TO_YEAR>'
                        AND ((CASE WHEN csm.Code='SAVED' AND DATEDIFF(CURDATE(), am.ModifiedDate) > <EXPIREDDAYS> THEN 1 ELSE 0 END) = <ISEXPIRED>) AND
                        CASE WHEN '<SEARCH_STRING>'!='' then 
                            am.ApplicationNumber LIKE '%<SEARCH_STRING>%' OR 
                            am.TemporaryNumber LIKE '%<SEARCH_STRING>%' OR 	
                            cscm.Value LIKE '%<SEARCH_STRING>%' OR 
                            csm.Value LIKE '%<SEARCH_STRING>%' OR 
                            (CASE WHEN IFNULL(fmm.Id, '') != '' THEN fmm.name ELSE CONCAT(mmm.First_Name, ' ', mmm.Last_Name) END) LIKE '%<SEARCH_STRING>%' OR 
                            (CASE WHEN IFNULL(fmm.Id, '') != '' THEN '' ELSE mmm.Last_Name END) LIKE '%<SEARCH_STRING>%' OR 
                            cscm.Value LIKE '%<SEARCH_STRING>%' OR
                            ddm.Value LIKE '%<SEARCH_STRING>%' 
                        else 1=1 end ";

            string columnSearchConditions = "";
            if (model.ColumnSearch != null && model.ColumnSearch.Count > 0)
            {
                List<string> distList = new List<string>();
                model.ColumnSearch.ForEach(x =>
                {
                    if (x.FieldName == "districtName")
                    {
                        distList.Add(" (ddm.Value LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "firstName")
                    {
                        distList.Add(" (CONCAT(ad.FirstName,' ',ad.LastName) LIKE '%" + x + "%') ");
                    }
                    else if (x.FieldName == "observation")
                    {
                        distList.Add(" (AC.Observation LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "status")
                    {
                        distList.Add(" (csm.Value LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "scheme")
                    {
                        distList.Add(" (cscm.Value LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "applicationNumber")
                    {
                        distList.Add(" ((case when ifnull(am.ApplicationNumber,'')='' then  am.TemporaryNumber else am.ApplicationNumber end) LIKE '%" + x.SearchString + "%') ");
                    }
                    else if (x.FieldName == "bulkApprovedByUserName")
                    {
                        distList.Add(" ((CASE WHEN ifnull(am.BulkApprovedBy,'')!='' THEN (CONCAT(udd.FirstName ,' ', udd.LastName)) ELSE AC.LastApprovedByName END) LIKE '%" + x.SearchString + "%') ");
                    }

                });

                columnSearchConditions = string.Join(" AND ", distList);
            }
            else
            {
                columnSearchConditions = "";
            }

            string districtConditions = "";
            if (model.DistrictIds != null && model.DistrictIds.Count > 0)
            {
                List<string> distList = new List<string>();
                model.DistrictIds.ForEach(x =>
                {
                    distList.Add(" (mo.District_Id = '" + x + "') ");
                });

                districtConditions = string.Join(" OR ", distList);
            }
            else
            {
                districtConditions = "1=0";
            }

            string schemeIdConditions = "";
            if (model.SchemeIds != null && model.SchemeIds.Count > 0)
            {
                List<string> distList = new List<string>();
                model.SchemeIds.ForEach(x =>
                {
                    distList.Add(" (am.SchemeId = '" + x + "') ");
                });

                schemeIdConditions = string.Join(" OR ", distList);
            }
            else
            {
                schemeIdConditions = "1=0";
            }

            //string statusCodeConditions = "";
            //if (model.StatusCodes != null && model.StatusCodes.Count > 0)
            //{
            //    List<string> distList = new List<string>();
            //    model.StatusCodes.ForEach(x =>
            //    {
            //        distList.Add(" (csm.Code = '" + x + "') ");
            //    });

            //    statusCodeConditions = string.Join(" OR ", distList);
            //}
            //else
            //{
            //    statusCodeConditions = "1=0";
            //}

            string statusCodeConditions = "";
            if (model.StatusCodes != null && model.StatusCodes.Count > 0)
            {
                // Updated Code For Get Returned Status Applications - Elanjsuriyan
                List<string> distList = new List<string>();
                List<string> conditions = new List<string>();

                bool hasReturned = model.StatusCodes.Any(x => x.StartsWith("RETURNED", StringComparison.OrdinalIgnoreCase));
                if (hasReturned)
                {
                    conditions.Add(" (AC.LastAction = 'RETURNED') ");
                }

                //model.StatusCodes.ForEach(x =>
                //{
                //    distList.Add(" (csm.Code = '" + x + "') ");
                //});

                //statusCodeConditions = string.Join(" OR ", distList);

                var normalStatuses = model.StatusCodes.Where(x => !x.StartsWith("RETURNED", StringComparison.OrdinalIgnoreCase)).ToList();

                if (normalStatuses.Count > 0)
                {
                    foreach (var x in normalStatuses)
                    {
                        conditions.Add(" (csm.Code = '" + x + "') ");
                    }
                }

                statusCodeConditions = string.Join(" OR ", conditions);
            }
            else
            {
                statusCodeConditions = "1=0";
            }
            string mobileConditions = "";
            if (model.Mobile != null && model.Mobile.Count > 0)
            {
                List<string> distList = new List<string>();
                model.Mobile.ForEach(x =>
                {
                    distList.Add(" (am.CollectedByPhoneNumber = '" + x + "') ");
                });

                mobileConditions = string.Join(" OR ", distList);
            }
            else
            {
                mobileConditions = "1=1";
            }
            string collectedbyconditions = "";

            if (!string.IsNullOrWhiteSpace(model.CollectedByName))
            {
                collectedbyconditions = $" (am.CollectedByName LIKE '%{model.CollectedByName}%') ";
            }
            else
            {
                collectedbyconditions = "1=1"; // no filter
            }
            Query = Query.Replace("<ROLE_ID_REPLACE>", model.RoleId);
            Query = Query.Replace("<DISTRICTIDS>", districtConditions);
            Query = Query.Replace("<SCHEMEIDS>", schemeIdConditions);
            Query = Query.Replace("<STATUSCODES>", statusCodeConditions);
            Query = Query.Replace("<MOBILE>", mobileConditions);
            Query = Query.Replace("<CollectedByName>", collectedbyconditions);
            Query = Query.Replace("<FROM_YEAR>", model.From.ToString("yyyy/MM/dd"));
            Query = Query.Replace("<TO_YEAR>", model.To.ToString("yyyy/MM/dd"));
            Query = Query.Replace("<SEARCH_STRING>", model.SearchString);
            Query = Query.Replace("<ORDER_DIRECTION> ", model.OrderDirection);
            Query = Query.Replace("<SKIP>", model.Skip.ToString());
            Query = Query.Replace("<TAKE>", model.Take.ToString());
            Query = Query.Replace("<EXPIREDDAYS>", expireInDays.ToString());

            if (!string.IsNullOrEmpty(columnSearchConditions))
            {
                Query = Query.Replace("<COLUMNSEARCH>", columnSearchConditions);
            }
            else
            {
                Query = Query.Replace("(<COLUMNSEARCH>) AND", "");
            }

            if (model.IsExpired)
            {
                Query = Query.Replace("<ISEXPIRED>", "1");
            }
            else
            {
                Query = Query.Replace("<ISEXPIRED>", "0");
            }
            


            return SqlMapper.ExecuteScalar<int>(connection, Query.ToLower(), commandType: CommandType.Text);
        }

        // Document
        public List<ApplicationDocumentMasterModel> Application_Document_Get(string Id = "", string ApplicationId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pApplicationId = ApplicationId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationDocumentMasterModel>(connection, "Application_Document_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicantQualificationMasterModel>();
        }
        public List<ApplicationDocumentMasterModel> Application_Document_Get_From_Member_Doc_Table(string MemberId, string SchemeId, string ApplicationId)
        {
            dynamic @params = new
            {
                pMemberId = MemberId,
                pSchemeId = SchemeId,
                pApplicationId = ApplicationId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationDocumentMasterModel>(connection, "Application_Document_Get_From_Member_Doc_Table", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicantQualificationMasterModel>();
        }
        public string Application_Document_SaveUpdate(ApplicationDocumentMasterModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pApplicationId = model.ApplicationId,
                pDocumentConfigId = model.DocumentConfigId,
                pOriginalFileName = model.OriginalFileName,
                pSavedFileName = model.SavedFileName,
                pAcceptedDocumentTypeId = model.AcceptedDocumentTypeId,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Document_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public string Application_Document_Delete(string Id, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = Id,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Document_Delete", @params, commandType: CommandType.StoredProcedure);
        }
        public int Application_Document_Verification_SaveUpdate(ApplicationDocumentVerificationMasterModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pApplicationId = model.ApplicationId,
                pApplicantId = model.ApplicantId,
                pDocumentCategoryId = model.DocumentCategoryId,
                pIsVerified = model.IsVerified,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, "Application_Document_Verification_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        // Approval
        public (string ApprovalId, string StatusValue) Application_approval_comments_Save(ApprovalModel model, AuditColumnsModel audit, bool IsBulkApproval = false)
        {
            dynamic @params = new
            {
                pId = model.Id,

                pApplicationId = model.ApplicationId,
                pSchemeId = model.SchemeId,
                pStatus = model.Status,
                pApprovalComment = model.ApprovalComment,
                pStatusIdFrom = model.StatusIdFrom,
                pStatusIdTo = model.StatusIdTo,
                pReason = model.Reason,

                pOriginalFileName = model.OriginalFileName,
                pSavedFileName = model.SavedFileName,

                pAssertVerificationDate = model.AssertVerificationDate,
                pAssertVerificationVenue = model.AssertVerificationVenue,
                pAssertVerificationDeclaration = model.AssertVerificationDeclaration,

                pVerifiedby = model.Verifiedby,

                pIsBulkApproval = IsBulkApproval,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            // Stored procedure now returns pId, StatusValue, etc.
            var result = SqlMapper.QueryFirstOrDefault<dynamic>(connection, "Application_approval_comments_Save", @params, commandType: CommandType.StoredProcedure);

            if (result != null)
            {
                return (ApprovalId: result.ApplicationApprovalId, StatusValue: result.StatusValue);
            }

            return (ApprovalId: null, StatusValue: null);
        }
        public string Application_bulk_approval_comments_Save(BulkApprovalModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pApplicationIds = string.Join(',', model.ApplicationIds),
                pSchemeId = model.SchemeId,
                pStatus = model.Status,
                pApprovalComment = model.ApprovalComment,
                pStatusIdFrom = model.StatusIdFrom,
                pStatusIdTo = model.StatusIdTo,
                pReason = model.Reason,

                pOriginalFileName = model.OriginalFileName,
                pSavedFileName = model.SavedFileName,

                pIsBulkApproval = true,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_approval_bulk_comments_Save", @params, commandType: CommandType.StoredProcedure);
        }
        public List<ApprovalViewModel> Application_approval_comments_Get(string Id = "", string ApplicationId = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pApplicationId = ApplicationId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApprovalViewModel>(connection, "Application_approval_comments_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApprovalViewModel>();
        }
        public List<ApproveStatusItemModel> ApplicationApprovalStatusList(string ApplicationId)
        {
            dynamic @params = new
            {
                pApplicationId = ApplicationId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApproveStatusItemModel>(connection, "Account_Approval_Get_Status_Ids", @params, commandType: CommandType.StoredProcedure) ?? new List<ApproveStatusItemModel>();
        }
        public List<ApproveStatusItemModel> ApplicationBulkApprovalStatusList(string StatusId, string SchemeId)
        {
            dynamic @params = new
            {
                pStatusId = StatusId,
                pSchemeId = SchemeId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApproveStatusItemModel>(connection, "Account_Approval_Bulk_Get_Status_Ids", @params, commandType: CommandType.StoredProcedure) ?? new List<ApproveStatusItemModel>();
        }

        // Dashboard
        public List<RecordCountNew> ApplicationStatusCountList(List<string> SchemeId, List<string> DistrictId, List<string> StatusCode, string Year, string roleId, string userId, int expireInDays)
        {
            List<string> Years = Year.Split('-').ToList();
            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            List<RecordCountNew> model = new List<RecordCountNew>();

            dynamic @params = new
            {
                p_SchemeId = string.Join(",", SchemeId),
                p_StatusCode = string.Join(",", StatusCode),
                p_DistrictId = string.Join(",", DistrictId),
                p_From_Year = from,
                p_To_Year = to,
                pExpireInDays = expireInDays,
                pUserId = userId,
                pRoleId = roleId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<RecordCountNew>(connection, "Application_Get_Count", @params, commandType: CommandType.StoredProcedure) ?? new List<RecordCountNew>();
        }
        public List<RecordCountNew> ApplicationStatusCountForAllList(List<string> SchemeId, List<string> DistrictId, List<string> StatusCode, string Year, string roleId, string userId, int expireInDays)
        {
            List<string> Years = Year.Split('-').ToList();
            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            List<RecordCountNew> model = new List<RecordCountNew>();

            dynamic @params = new
            {
                p_SchemeId = string.Join(",", SchemeId),
                p_StatusCode = string.Join(",", StatusCode),
                p_DistrictId = string.Join(",", DistrictId),
                p_From_Year = from,
                p_To_Year = to,
                pExpireInDays = expireInDays,
                pUserId = userId,
                pRoleId = roleId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<RecordCountNew>(connection, "Application_Get_Count_All", @params, commandType: CommandType.StoredProcedure) ?? new List<RecordCountNew>();
        }
        public List<ApplicationDistrictWiseCount> ApplicationCountListDistrictWise(List<string> SchemeId, List<string> DistrictId, List<string> StatusCode, string Year, string roleId, string userId, int expireInDays)
        {
            List<string> Years = Year.Split('-').ToList();
            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            dynamic @params = new
            {
                p_SchemeId = string.Join(",", SchemeId),
                p_StatusCode = string.Join(",", StatusCode),
                p_DistrictId = string.Join(",", DistrictId),
                p_From_Year = from,
                p_To_Year = to,
                pExpireInDays = expireInDays,
                pUserId = userId,
                pRoleId = roleId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationDistrictWiseCount>(connection, "Application_Get_Count_District_Wise", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationDistrictWiseCount>();
        }

        #region Dashboard

        public DashboardResponseCountModel DashBoardSetI( List<string> SchemeId, List<string> DistrictId, List<string> StatusCode, string Year, string roleId, string userId, int expireInDays)
        {
            List<string> Years = Year.Split('-').ToList();

            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            var paramSet1 = new
            {
                pUserId = userId,
                pRoleId = roleId,
                p_From_Year = from,
                p_To_Year = to,
                pExpireInDays = expireInDays,
                p_DistrictId = string.Join(",", DistrictId),
                p_SchemeId = string.Join(",", SchemeId)
            };

            var paramSet2 = new
            {
                pRoleId = roleId,
                p_DistrictId = string.Join(",", DistrictId),
                p_From_Year = from,
                p_To_Year = to,
                pDelayDays = expireInDays
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            var response = new DashboardResponseCountModel();

            /* ---------------- DashboardSetI ---------------- */

            var set1 = connection.QueryFirstOrDefault<string>(
                "DashboardSetI",
                paramSet1,
                commandType: CommandType.StoredProcedure);

            if (!string.IsNullOrEmpty(set1))
            {
                var json = JsonConvert.DeserializeObject<DashboardResponseCountModel>(set1);
                response.member_application_count = json.member_application_count;
                response.scheme_application_count = json.scheme_application_count;
            }

            /* ---------------- DashboardSetIPartII ---------------- */

            using (var multi = connection.QueryMultiple(
     "DashboardSetIPartII",
     paramSet2,
     commandType: CommandType.StoredProcedure,
     commandTimeout: 500))
            {

                var roleWise = multi.Read<RoleWiseModel>().ToList();
                var approvalDelay = multi.Read<ApprovalDelayModel>().FirstOrDefault();
                var cardPrinted = multi.Read<CardPrintedModel>().FirstOrDefault();
                var cardDelay = multi.Read<CardDelayModel>().FirstOrDefault();

                var districtData = multi.Read<DashboardDistrictModel>().ToList();
                var genderData = multi.Read<DashboardGenderModel>().ToList();

                response.member_dashboard_data = new DashboardResponseCountModel.MemberDashboardData
                {
                    pending_approval = new DashboardResponseCountModel.ChartSeries
                    {
                        labels = roleWise.Select(x => x.RoleName),
                        values = roleWise.Select(x => x.PendingCount)
                    },

                    approved = new DashboardResponseCountModel.ChartSeries
                    {
                        labels = roleWise.Select(x => x.RoleName),
                        values = roleWise.Select(x => x.ApprovedCount)
                    },

                    approval_delay = approvalDelay?.approval_delay ?? 0,
                    card_printed = cardPrinted?.card_printed ?? 0,
                    card_delay = cardDelay?.card_delay ?? 0,

                    charts = new DashboardResponseCountModel.MemberCharts
                    {
                        districtwise_count = new DashboardResponseCountModel.DistrictwiseMemberCount
                        {
                            pending_approval_count = districtData.Select(x => new { x.District, x.pending_approval_count }),
                            approved_by_hq_count = districtData.Select(x => new { x.District, x.approved_by_hq_count }),
                            card_printed = districtData.Select(x => new { x.District, x.card_printed }),
                            approval_delay = districtData.Select(x => new { x.District, x.approval_delay }),
                            card_delay = districtData.Select(x => new { x.District, x.card_delay })
                        },

                        member_by_gender = new DashboardResponseCountModel.GenderChart
                        {
                            pending_approval_count = genderData.Select(x => new { x.Gender, x.pending_approval_count }),
                            approved_by_hq_count = genderData.Select(x => new { x.Gender, x.approved_by_hq_count }),
                            card_printed = genderData.Select(x => new { x.Gender, x.card_printed }),
                            approval_delay = genderData.Select(x => new { x.Gender, x.approval_delay }),
                            card_delay = genderData.Select(x => new { x.Gender, x.card_delay })
                        }
                    }
                };

            }

            return response;
        }

        private DashboardResponseCountModel.DistrictwiseMemberCount BuildDistrictChart(List<DistrictWiseModel> data)
        {
            var districts = data.Select(x => x.District).ToList();

            return new DashboardResponseCountModel.DistrictwiseMemberCount
            {
                pending_approval_count = new object[]
                {
                    districts,
                    data.Select(x => x.pending_approval_count).ToList()
                },

                approved_by_hq_count = new object[]
                {
                   districts,
                   data.Select(x => x.approved_by_hq_count).ToList()
                },

                card_printed = new object[]
                {
                   districts,
                   data.Select(x => x.card_printed).ToList()
                },

                approval_delay = new object[]
                {
                   districts,
                   data.Select(x => x.approval_delay).ToList()
                },

                card_delay = new object[]
                {
                    districts,
                    data.Select(x => x.card_delay).ToList()
                }
            };
        }

        private DashboardResponseCountModel.GenderChart BuildGenderChart(List<GenderWiseModel> data)
        {
            var genders = data.Select(x => x.Gender.ToLower()).ToList();

            return new DashboardResponseCountModel.GenderChart
            {
                pending_approval_count = new object[]
                {
                   genders,
                   data.Select(x => x.pending_approval_count).ToList()
                },

                approved_by_hq_count = new object[]
                {
                   genders,
                   data.Select(x => x.approved_by_hq_count).ToList()
                },

                card_printed = new object[]
                {
                   genders,
                   data.Select(x => x.card_printed).ToList()
                },

                approval_delay = new object[]
                {
                   genders,
                   data.Select(x => x.approval_delay).ToList()
                },

                card_delay = new object[]
                {
                    genders,
                    data.Select(x => x.card_delay).ToList()
                }
            };
        }

        public DashboardResponseCountModel DashBoardSetII(List<string> SchemeId, List<string> DistrictId, List<string> StatusCode, string Year, string roleId, string userId, int expireInDays)
        {
            List<string> Years = Year.Split('-').ToList();

            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            var parameters = new
            {
                p_DistrictId = string.Join(",", DistrictId),
                p_From_Year = from,
                p_To_Year = to,
                p_SchemeId = string.Join(",", SchemeId),
                pExpireInDays = expireInDays,
                pRoleId = roleId
            };

            using IDbConnection connection =
                new MySqlConnection(_configuration.GetConnectionString(connectionId));

            var dashboard = new DashboardResponseCountModel
            {
                scheme_dashboard_data = new DashboardResponseCountModel.SchemeDashboardData
                {
                    eligible_applicant_count = 0,
                    member_applied_count = new DashboardResponseCountModel.SchemeChartSeries
                    {
                        labels = new List<string>(),
                        values = new List<int>()
                    },

                    benificary_applied_count = new DashboardResponseCountModel.SchemeChartSeries
                    {
                        labels = new List<string>(),
                        values = new List<int>()
                    },
                    statuswise_application_count = new Dictionary<string, int>(),
                    charts = new DashboardResponseCountModel.SchemeCharts
                    {
                        districtwise_count = new Dictionary<string, DashboardResponseCountModel.SchemeChartSeries>(),
                        schemes_by_types = new Dictionary<string, DashboardResponseCountModel.SchemeChartSeries>()
                    }
                }
            };

            using var multi = connection.QueryMultiple(
                "DashBoardSetII",
                parameters,
                commandType: CommandType.StoredProcedure,
                commandTimeout: 500
            );



            /* ---------------------------------------------------------
               RESPONSE 1 : ELIGIBLE APPLICANT COUNT
            --------------------------------------------------------- */

            dashboard.scheme_dashboard_data.eligible_applicant_count =
                Convert.ToInt32(multi.ReadFirstOrDefault<long>());



            /* ---------------------------------------------------------
               RESPONSE 2 : STATUS COUNTS
            --------------------------------------------------------- */

            var statusCounts = multi.Read<dynamic>().ToList();

            foreach (var row in statusCounts)
            {
                string status = row.Status_Code;
                int count = Convert.ToInt32(row.Count);

                dashboard.scheme_dashboard_data.statuswise_application_count[status] = count;
            }



            /* ---------------------------------------------------------
               RESPONSE 3 : SCHEME STATUS TABLE (OPTIONAL)
            --------------------------------------------------------- */

            var schemeStatus = multi.Read<dynamic>().ToList();

            foreach (var row in schemeStatus)
            {
                dashboard.scheme_dashboard_data.scheme_statuswise_application_count.Add(
                    new SchemeStatusCount
                    {
                        GroupName = row.GroupName ?? "",
                        SchemeName = row.SchemeName ?? "",
                        Status_Code = row.Status_Code ?? "",
                        Count = Convert.ToInt32(row.Count)
                    }
                );
            }

            /* ---------------------------------------------------------
               RESPONSE 4 : MEMBER / BENEFICIARY COUNTS
            --------------------------------------------------------- */

            var memberBeneficiary = multi.Read<dynamic>().ToList();

            var memberChart = new DashboardResponseCountModel.SchemeChartSeries();
            var beneficiaryChart = new DashboardResponseCountModel.SchemeChartSeries();

            foreach (var row in memberBeneficiary)
            {
                string status = row.Status_Code.ToString();

                memberChart.labels.Add(status);
                memberChart.values.Add(Convert.ToInt32(row.member_applied_count));

                beneficiaryChart.labels.Add(status);
                beneficiaryChart.values.Add(Convert.ToInt32(row.benificary_applied_count));
            }

            dashboard.scheme_dashboard_data.member_applied_count = memberChart;
            dashboard.scheme_dashboard_data.benificary_applied_count = beneficiaryChart;


            /* ---------------------------------------------------------
               RESPONSE 5 : DISTRICT CHART
            --------------------------------------------------------- */

            var districtData = multi.Read<dynamic>().ToList();

            foreach (IDictionary<string, object> row in districtData)
            {
                string district = row["District"].ToString();

                foreach (var col in row)
                {
                    if (col.Key == "District")
                        continue;

                    if (!dashboard.scheme_dashboard_data.charts.districtwise_count
                        .ContainsKey(col.Key))
                    {
                        dashboard.scheme_dashboard_data.charts
                            .districtwise_count[col.Key] =
                            new DashboardResponseCountModel.SchemeChartSeries
                            {
                                labels = new List<string>(),
                                values = new List<int>()
                            };
                    }

                    var chart = dashboard.scheme_dashboard_data.charts
                        .districtwise_count[col.Key];

                    chart.labels.Add(district);
                    chart.values.Add(Convert.ToInt32(col.Value));
                }
            }



            /* ---------------------------------------------------------
               RESPONSE 6 : SCHEME TYPE CHART
            --------------------------------------------------------- */

            var schemeTypeData = multi.Read<dynamic>().ToList();

            foreach (IDictionary<string, object> row in schemeTypeData)
            {
                string group = row["GroupName"].ToString();

                foreach (var col in row)
                {
                    if (col.Key == "GroupName")
                        continue;

                    if (!dashboard.scheme_dashboard_data.charts.schemes_by_types
                        .ContainsKey(col.Key))
                    {
                        dashboard.scheme_dashboard_data.charts
                            .schemes_by_types[col.Key] =
                            new DashboardResponseCountModel.SchemeChartSeries
                            {
                                labels = new List<string>(),
                                values = new List<int>()
                            };
                    }

                    var chart = dashboard.scheme_dashboard_data.charts
                        .schemes_by_types[col.Key];

                    chart.labels.Add(group);
                    chart.values.Add(Convert.ToInt32(col.Value));
                }
            }

            return dashboard;
        }

        public List<DashboardResponseCountModel> DashBoardSetIII(List<string> SchemeId, List<string> DistrictId, List<string> StatusCode, string Year, string roleId, string userId, int expireInDays)
        {
            List<string> Years = Year.Split('-').ToList();
            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            dynamic @params = new
            {
                p_SchemeId = string.Join(",", SchemeId),
                p_StatusCode = string.Join(",", StatusCode),
                p_DistrictId = string.Join(",", DistrictId),
                p_From_Year = from,
                p_To_Year = to,
                pExpireInDays = expireInDays,
                pUserId = userId,
                pRoleId = roleId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<DashboardResponseCountModel>(connection, "Application_Get_Count_District_Wise", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationDistrictWiseCount>();
        }

        #endregion


        public List<ApplicationSchemeWiseCount> ApplicationCountListSchemeWise(List<string> SchemeId, List<string> DistrictId, List<string> StatusCode, string Year, string roleId, string userId, int expireInDays)
        {
            List<string> Years = Year.Split('-').ToList();
            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            dynamic @params = new
            {
                p_SchemeId = string.Join(",", SchemeId),
                p_StatusCode = string.Join(",", StatusCode),
                p_DistrictId = string.Join(",", DistrictId),
                p_From_Year = from,
                p_To_Year = to,
                pExpireInDays = expireInDays,
                pUserId = userId,
                pRoleId = roleId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationSchemeWiseCount>(connection, "Application_Get_Count_Scheme_Wise", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationSchemeWiseCount>();
        }
        public List<ApplicationAllForDashboardModel> ApplicationListDashboard(List<string> SchemeId, List<string> DistrictId, List<string> StatusCode, string Year, string roleId, string userId, int expireInDays)
        {
            List<string> Years = Year.Split('-').ToList();
            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            TimeZoneInfo istZones = TimeZoneInfo.Local;
            from = TimeZoneInfo.ConvertTime(from, istZones);
            to = TimeZoneInfo.ConvertTime(to, istZones);

            dynamic @params = new
            {
                p_SchemeId = string.Join(",", SchemeId),
                p_StatusCode = string.Join(",", StatusCode),
                p_DistrictId = string.Join(",", DistrictId),
                p_From_Year = from,
                p_To_Year = to,
                pExpireInDays = expireInDays,
                pUserId = userId,
                pRoleId = roleId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationAllForDashboardModel>(connection, "Application_Get_All", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationAllForDashboardModel>();
        }

        // Callletter
        public List<ApplicationSelectListModel> Callletter_Application_SelectList_Get(string District = "", string SchemeId = "", string StatusId = "")
        {
            dynamic @params = new
            {
                pDistrict = District,
                pSchemeId = SchemeId,
                pStatusId = StatusId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationSelectListModel>(connection, "Application_Callletter_Application_SelectList_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationSelectListModel>();
        }
        public List<CallletterApplicationModel> Callletter_Application_Get(string Id = "", string CallletterId = "", string ApplicationId = "", bool IsActive = true)
        {
            dynamic @params = new
            {
                pId = Id ?? "",
                pCallletterId = CallletterId ?? "",
                pApplicationId = ApplicationId ?? "",
                pIsActive = IsActive
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<CallletterApplicationModel>(connection, "Application_Callletter_Application_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<CallletterApplicationModel>();
        }
        public string Callletter_Application_SaveUpdate(CallletterMasterSaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pSchemeId = model.SchemeId,
                pDistrictId = model.DistrictId,
                pMeetingDate = model.MeetingDate,
                pMeetingTimeFrom = model.MeetingTimeFrom,
                pMeetingTimeTo = model.MeetingTimeTo,
                pComments = model.Comments,
                pApplicationIds = string.Join(",", model.ApplicationIds),
                pMeetingStatusId = model.MeetingStatusId,
                pCallletterSubject = model.CallletterSubject,
                pCallletterName = model.CallletterName,
                pVenue = model.Venue,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Callletter_Master_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<CallletterGridModel> Callletter_Grid_Get(CallletterFilterModel model, out int TotalCount)
        {
            TotalCount = 0;
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            string Query = @"SELECT
                            acm.Id, acm.SchemeId, acm.DistrictId, acm.CallletterName, acm.CallletterSubject, acm.MeetingDate, 
                            acm.MeetingTimeFrom, acm.MeetingTimeTo, acm.Comments, acm.MeetingStatusId, acm.CallLetterNumber, acm.Venue, acm.IsActive,
                            sc.Value as 'Scheme',
                            aa.Value as 'District',
                            (NOT EXISTS(SELECT 1 FROM application_callletter_application WHERE CallletterId = acm.Id AND IsSent=0)) as 'IsMessageSentToAll',
                            (MeetingTimeTo < NOW()) as 'IsExpired',
                            acm.CallLetterStatus,
                            acm.CreatedBy, acm.CreatedDate, acm.CreatedByUserName, 
                            acm.ModifiedBy, acm.ModifiedDate, acm.ModifiedByUserName, acm.DeletedBy, acm.DeletedByUserName, acm.DeletedDate
                            FROM application_callletter_master acm
                            INNER JOIN two_column_configuration_values sc ON sc.Id = acm.SchemeId
                            INNER JOIN two_column_configuration_values aa ON aa.Id = acm.DistrictId";

            string CountQuery = @"SELECT COUNT(1) FROM application_callletter_master acm
                                INNER JOIN two_column_configuration_values sc ON sc.Id = acm.SchemeId
                                INNER JOIN two_column_configuration_values aa ON aa.Id = acm.DistrictId";

            if (model != null)
            {
                #region Build Query Conditions

                string Condition = " WHERE ";

                if (model.Where != null)
                {
                    List<string> ignoreProps = new List<string>() { "SchemeIds", "DistrictIds" };

                    PropertyInfo[] whereProperties = typeof(CallletterWhereClauseProperties).GetProperties().Where(x => !ignoreProps.Contains(x.Name)).ToArray();
                    foreach (var property in whereProperties)
                    {
                        var value = property.GetValue(model.Where)?.ToString() ?? "";
                        if (value == "True")
                        {
                            value = "1";
                        }
                        else if (value == "False")
                        {
                            value = "0";
                        }
                        if (property.PropertyType.Name == "DateTime")
                        {
                            if (Convert.ToDateTime(value) != DateTime.MinValue)
                            {
                                value = Convert.ToDateTime(value).ToString("yyyy-MM-dd HH:mm:ss");
                            }
                        }
                        else if (!string.IsNullOrWhiteSpace(value))
                        {
                            Condition += " acm." + property.Name + "='" + value.Replace('\'', '%').Trim() + "' AND ";
                        }
                    }

                    if (model.Where.DistrictIds != null && model.Where.DistrictIds.Count > 0)
                    {
                        List<string> distList = new List<string>();
                        model.Where.DistrictIds.ForEach(x =>
                        {
                            distList.Add("'" + x + "'");
                        });

                        Condition += " acm.DistrictId IN("+ string.Join(",", distList) + ")" + " AND ";
                    }

                    if (model.Where.SchemeIds != null && model.Where.SchemeIds.Count > 0)
                    {
                        List<string> schemeList = new List<string>();
                        model.Where.SchemeIds.ForEach(x =>
                        {
                            schemeList.Add("'" + x + "'");
                        });

                        Condition += " acm.SchemeId IN(" + string.Join(",", schemeList) + ")" + " AND ";
                    }

                }
                if (model.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in model.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = "";

                            #region Field Name Select
                            if (string.Equals(item.FieldName, "Scheme", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "sc.Value";
                            }
                            else if (string.Equals(item.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "aa.Value";
                            }
                            else if (string.Equals(item.FieldName, "CallLetterStatus", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "acm.CallLetterStatus";
                            }
                            else if (string.Equals(item.FieldName, "CallLetterNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "acm.CallLetterNumber";
                            }
                            else if (string.Equals(item.FieldName, "CallletterName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "acm.CallletterName";
                            }
                            else if (string.Equals(item.FieldName, "CallletterSubject", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "acm.CallletterSubject";
                            }
                            else if (string.Equals(item.FieldName, "MeetingDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                DateTime dd;

                                bool isOkay = DateTime.TryParseExact(item.SearchString, "dd-MM-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out dd);

                                if (isOkay)
                                {
                                    item.SearchString = dd.ToString("yyyy-MM-dd");
                                }

                                columnName = "acm.MeetingDate";
                            }
                            else if (string.Equals(item.FieldName, "ModifiedByUserName", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "acm.ModifiedByUserName";
                            }
                            else if (string.Equals(item.FieldName, "ModifiedDate", StringComparison.CurrentCultureIgnoreCase))
                            {
                                DateTime dd;

                                bool isOkay = DateTime.TryParseExact(item.SearchString, "dd-MM-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out dd);

                                if (isOkay)
                                {
                                    item.SearchString = dd.ToString("yyyy-MM-dd");
                                }

                                columnName = "acm.ModifiedDate";
                            }
                            #endregion Field Name Select

                            //Condition += " " + columnName + "='" + item.SearchString.Replace('\'', '%').Trim() + "' AND ";
                            Condition += " " + columnName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ";
                        }
                    }
                }
                if (!string.IsNullOrWhiteSpace(model?.SearchString))
                {
                    string searchCondition = " (";
                    
                    searchCondition += " acm.MeetingDate LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";
                    searchCondition += " aa.Value LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";
                    searchCondition += " sc.Value LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";
                    searchCondition += " acm.CallletterName LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";
                    searchCondition += " acm.CallletterSubject LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";
                    searchCondition += " acm.CallLetterNumber LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";
                    searchCondition += " acm.CallLetterStatus LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";

                    int sub_pos = searchCondition.Length - 3;
                    if (!(sub_pos < 0) && searchCondition.Substring(searchCondition.Length - 3) == "OR ")
                    {
                        searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    }
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

                TotalCount = SqlMapper.ExecuteScalar<int>(connection, CountQuery + Condition, commandType: CommandType.Text);

                if (model?.Sorting != null && !string.IsNullOrWhiteSpace(model?.Sorting.FieldName) && !string.IsNullOrWhiteSpace(model?.Sorting.Sort))
                {
                    string FieldName = "";

                    #region Field Name Select
                    if (string.Equals(model?.Sorting.FieldName, "Scheme", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "sc.Value";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "District", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "aa.Value";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "CallletterName", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "acm.CallletterName";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "CallLetterStatus", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "acm.CallLetterStatus";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "CallletterSubject", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "acm.CallletterSubject";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "MeetingDate", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "acm.MeetingDate";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "MeetingTimeFrom", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "acm.MeetingTimeFrom";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "MeetingTimeTo", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "acm.MeetingTimeTo";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "CallLetterNumber", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "acm.CallLetterNumber";
                    }
                    else if (string.Equals(model?.Sorting.FieldName, "ModifiedByUserName", StringComparison.CurrentCultureIgnoreCase))
                    {
                        FieldName = "acm.ModifiedByUserName";
                    }
                    else
                    {
                        FieldName = "acm.ModifiedDate";
                    }
                    #endregion Select Field

                    if (model?.Skip == 0 && model?.Take == 0)
                    {
                        Condition += " ORDER BY " + FieldName + " " + model?.Sorting.Sort + " ";
                    }
                    else
                    {
                        Condition += " ORDER BY " + FieldName + " " + model?.Sorting.Sort + " LIMIT  " + model?.Take + "  OFFSET " + model?.Skip;
                    }
                }
                else if (model?.Skip == 0 && model?.Take == 0)
                {
                    Condition += " ORDER BY acm.CreatedDate ";
                }
                else
                {
                    Condition += " ORDER BY acm.CreatedDate LIMIT " + model?.Take + " OFFSET " + model?.Skip;
                }

                Query += Condition;

                #endregion Build Query Conditions
            }

            return SqlMapper.Query<CallletterGridModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<CallletterGridModel>();
        }
        public CallletterMasterSaveModel Callletter_Application_Master_Get(string Id)
        {
            dynamic @params = new
            {
                pId = Id
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<CallletterMasterSaveModel>(connection, "Application_Callletter_Master_Get", @params, commandType: CommandType.StoredProcedure);
        }
        public string Callletter_Application_Master_Delete(string Id, bool IsActive, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = Id,
                pIsActive = IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Callletter_Master_Delete", @params, commandType: CommandType.StoredProcedure);
        }
        public int CallletterHistorySave(CallletterHistoryModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pCallletterId = model.CallletterId,
                pApplicationId = model.ApplicationId,
                pRecordType = model.RecordType,
                pCommunicatedAddress = model.CommunicatedAddress,
                pSubject = model.Subject,
                pBody = model.Body,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, "application_callletter_message_history_save", @params, commandType: CommandType.StoredProcedure);
        }
        public Tuple<string, string> Callletter_Get_StatusId(string Id, bool IsActive, AuditColumnsModel audit)
        {
            string Query = "";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            SqlMapper.ExecuteScalar<string>(connection, Query.ToLower(), commandType: CommandType.Text);

            return System.Tuple.Create("", "");
        }
        public List<string> Callletter_Get_StatusId(string schemeId)
        {
            List<string> list = new List<string>();
            using (var conn = _dapperContext.CreateConnection())
            {
                string Query = "SELECT CallLetterStatusId FROM config_scheme WHERE SchemeId='" + schemeId + "' AND IsActive=1 LIMIT 1;";
                string StatusIds = conn.ExecuteScalar<string>(Query.ToLower(), commandType: CommandType.Text);

                if (!string.IsNullOrEmpty(StatusIds))
                {
                    list = StatusIds.Split(",").ToList();
                }
            }
            return list;
        }
        public List<string> DocRequired_Get_StatusId(string schemeId)
        {
            List<string> list = new List<string>();
            using (var conn = _dapperContext.CreateConnection())
            {
                string Query = "SELECT DocRequiredStatusId FROM config_scheme WHERE SchemeId='" + schemeId + "' AND IsActive=1 LIMIT 1;";
                string StatusIds = conn.ExecuteScalar<string>(Query.ToLower(), commandType: CommandType.Text);

                if (!string.IsNullOrEmpty(StatusIds))
                {
                    list = StatusIds.Split(",").ToList();
                }
            }
            return list;
        }
        public string Callletter_Update_Callletter_Status(string callLetterId, string status)
        {
            dynamic @params = new
            {
                pCallletterId = callLetterId,
                pStatus = status
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Callletter_Master_Update_Callletter_Status", @params, commandType: CommandType.StoredProcedure);
        }
        public string CallletterApplicationStatusSave(string CallletterApplicationId, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = CallletterApplicationId,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Callletter_Application_Callletter_StatusUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        // UC 
        public List<ApplicationUtilizationCirtificateModel> Application_Utilisation_Certificate_Get(string Id = "", string ApplicationId = "")
        {
            dynamic @params = new
            {
                pId = Id ?? "",
                pApplicationId = ApplicationId ?? ""
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationUtilizationCirtificateModel>(connection, "Application_Utilisation_Certificate_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationUtilizationCirtificateModel>();
        }
        public string Application_Utilisation_Certificate_SaveUpdate(ApplicationUtilizationCirtificateSaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pApplicationId = model.ApplicationId,
                pNameAndAddress = model.NameAndAddress,
                pNameOfTrade = model.NameOfTrade,
                pNodalNumber = model.NodalNumber,
                pSubsidy = model.Subsidy,
                pPromotorContribution = model.PromotorContribution,
                pBankLoan = model.BankLoan,
                pTotalAmountReleased = model.TotalAmountReleased,
                pDateOfLoanSanction = model.DateOfLoanSanction,
                pDateOfDisbursement = model.DateOfDisbursement,
                pDateOfAssetCreated = model.DateOfAssetCreated,
                pDateOfAssetVerified = model.DateOfAssetVerified,
                pLoanAccountNumber = model.LoanAccountNumber,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Utilisation_Certificate_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        // Form 3 
        public List<ApplicationForm3Model> Application_Form_3_Get(string Id = "", string ApplicationId = "")
        {
            dynamic @params = new
            {
                pId = Id ?? "",
                pApplicationId = ApplicationId ?? ""
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationForm3Model>(connection, "Application_Form_3_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationForm3Model>();
        }
        public string Application_Form_3_SaveUpdate(ApplicationForm3SaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pApplicationId = model.ApplicationId,
                pNameAndAddress = model.NameAndAddress,
                pNameOfTrade = model.NameOfTrade,
                pRefNumber = model.RefNumber,
                pSubsidy = model.Subsidy,
                pPromotorContribution = model.PromotorContribution,
                pBankLoan = model.BankLoan,
                pTotalUtilCost = model.TotalUtilCost,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Form_3_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        // Type of Training 
        public List<ApplicationTypeOfTrainingModel> TypeOfTraining_Get(string ApplicationId)
        {
            dynamic @params = new
            {
                pApplicationId = ApplicationId ?? ""
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationTypeOfTrainingModel>(connection, "Application_TypeOfTraining_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationTypeOfTrainingModel>();
        }
        public bool TypeOfTraining_Delete(string ApplicationId)
        {
            dynamic @params = new
            {
                pApplicationId = ApplicationId,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, "Application_TypeOfTraining_Delete", @params, commandType: CommandType.StoredProcedure) > 0;
        }
        public string TypeOfTraining_SaveUpdate(ApplicationTypeOfTrainingModel model)
        {
            if (string.IsNullOrEmpty(model.Id))
            {
                model.Id = Guid.NewGuid().ToString();
            }

            dynamic @params = new
            {
                pId = model.Id,
                pApplicationId = model.ApplicationId,
                pTypeOfTraining = model.TypeOfTraining,
                pNameOfTheInstitution = model.NameOfTheInstitution,
                pFromDate = model.FromDate,
                pToDate = model.ToDate,
                pIsActive = model.IsActive
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_TypeOfTraining_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        #region Application Approval File
        public string Application_Approval_File_Save(ApplicationApprovalFileModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Ida,
                pApprovalCommentId = model.ApprovalCommentId,
                pApplicationId = model.ApplicationId,
                pStatusId = model.StatusId,
                pOriginalFileName = model.OriginalFileName,
                pSavedFileName = model.SavedFileName,
                pDocCategoryId = model.DocCategoryId,
                pIsActive = model.IsActive,

                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Approval_File_Save", @params, commandType: CommandType.StoredProcedure);
        }
        public List<ApplicationApprovalFileModel> Application_Approval_File_Get(string ApplicationId = "", string StatusId = "", string ApprovalCommentId = "")
        {
            dynamic @params = new
            {
                pApplicationId = ApplicationId?.Trim() ?? "",
                pStatusId = StatusId?.Trim() ?? "",
                pApprovalCommentId = ApprovalCommentId?.Trim() ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationApprovalFileModel>(connection, "Application_Approval_File_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationApprovalFileModel>();
        }
        public List<ApplicationApprovalFileModel> Application_Approval_Doc_Category_Get(string ApplicationId, string SchemeId, string StatusId, string ApprovalCommentId)
        {
            dynamic @params = new
            {
                pApplicationId = ApplicationId?.Trim() ?? "",
                pSchemeId = SchemeId?.Trim() ?? "",
                pStatusId = StatusId?.Trim() ?? "",
                pApprovalCommentId = ApprovalCommentId?.Trim() ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationApprovalFileModel>(connection, "Application_Approval_Doc_Category_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationApprovalFileModel>();
        }
        public ApplicationApprovalFileModel Application_Approval_Doc_Category_GetSavedFileNames(string Id)
        {
            string Qauery = "select OriginalFileName, SavedFileName from application_approval_file_master where Id ='" + Id + "';";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<ApplicationApprovalFileModel>(connection, Qauery, commandType: CommandType.Text);
        }
        #endregion Application Approval File
    }
}
