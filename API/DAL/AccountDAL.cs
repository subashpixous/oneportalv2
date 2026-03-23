using DAL.Helpers;
using Dapper;
using Microsoft.Extensions.Configuration;
using Model.DomainModel;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using System.Data;
using Utils.Interface;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace DAL
{
    public class AccountDAL
    {
        private readonly IMySqlHelper _mySqlHelper;
        private readonly IConfiguration _configuration;
        private readonly IMySqlDapperHelper _mySqlDapperHelper;
        private readonly DapperContext _dapperContext;

        private readonly string connectionId = "Default";
        public AccountDAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IConfiguration configuration)
        {
            _mySqlHelper = mySqlHelper;
            _configuration = configuration;
            _mySqlDapperHelper = mySqlDapperHelper;
            _dapperContext = new DapperContext(_configuration.GetConnectionString(connectionId));
        }
        public LoginModel? GetLogin(LoginRequestModel model)
        {
            dynamic @params = new { pUserName = model.UserName, pPassword = model.Password, pEmail = model.UserName };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<LoginModel>(connection, "Account_LoginGet", @params, commandType: CommandType.StoredProcedure);
        }
        public string SaveLogin(LoginModel model)
        {
            dynamic @params = new
            {
                pLoginId = model.LoginId,
                pUserId = model.UserId,
                pUserName = model.UserName,
                pPassword = model.Password,
                pEmail = model.Email,
                pAccessToken = model.AccessToken,
                pRefreshToken = model.RefreshToken,
                pIsActive = model.IsActive,
                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = DateTime.Now,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return SqlMapper.ExecuteScalar<string>(connection, "Account_LoginSave", @params, commandType: CommandType.StoredProcedure);
        }
        public string SaveLoginLog(AccountLoginLogModel model)
        {
            dynamic @params = new
            {
                pId = Guid.NewGuid().ToString(),
                pLoginId = model.LoginId,
                pDevice = model.Device,
                pUserName = model.UserName,
                pSavedDate = DateTime.Now,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return SqlMapper.ExecuteScalar<string>(connection, "Account_Login_Log_Save", @params, commandType: CommandType.StoredProcedure);
        }
        public List<AccountLoginLogModel> GetLoginLog(string Id = "", string LoginId = "")
        {
            dynamic @params = new
            {
                pLoginId = LoginId?.Trim() ?? "",
                pId = Id?.Trim() ?? "",
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<AccountLoginLogModel>(connection, "Account_Login_Log_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<AccountLoginLogModel>();
        }
        public string Login_OTP_Save(string UserId, string OTP, string PasswordToken)
        {
            dynamic @params = new
            {
                pUserId = UserId,
                pOTP = OTP,
                pPasswordToken = PasswordToken,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return SqlMapper.ExecuteScalar<string>(connection, "Login_OTP_Save", @params, commandType: CommandType.StoredProcedure);
        }
        public string Login_OTP_Get(string UserId)
        {
            dynamic @params = new
            {
                pUserId = UserId,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return SqlMapper.ExecuteScalar<string>(connection, "Login_OTP_GetById", @params, commandType: CommandType.StoredProcedure);
        }
        public bool Login_Password_Save(string PasswordToken, string Password, string OTP)
        {
            dynamic @params = new
            {
                pPasswordToken = PasswordToken,
                pPassword = Password,
                pOtp = OTP,
                pSavedDate = DateTime.Now
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            int res = SqlMapper.Execute(connection, "Login_Password_Save", @params, commandType: CommandType.StoredProcedure);

            if (res > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        public string SaveUserActivityLog(UserActivityLogModel model)
        {
         

            using IDbConnection connection =
                new MySqlConnection(_configuration.GetConnectionString(connectionId));

            int res = SqlMapper.Execute(connection, @"
        INSERT INTO user_activity_log
        (ActivityLogId, UserId, UserName, RoleId, RoleName, EventType, EventDescription, CreatedAt)
        VALUES
        (@ActivityLogId, @UserId, @UserName, @RoleId, @RoleName, @EventType, @EventDescription, @CreatedAt)
    ", model);

            return res > 0 ? "SUCCESS" : "FAILED";
        }

        // Updated by sivasankar On 11/12/2025 for user log report
        public List<UserActivityLogModels> GetActivityLogs(UserActivityLogFilter filter, out int totalCount)
        {
      
            if (filter.GetLastLogPerUser)
            {
                return GetUsersWithLastLog(filter, out totalCount);
            }

            return GetLogs(filter, out totalCount);
        }

      
        private string ToGuidInClause(string ids)
        {
            if (string.IsNullOrWhiteSpace(ids))
                return string.Empty;

            return string.Join(",",
                ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
                   .Where(x => Guid.TryParse(x.Trim(), out _))
                   .Select(x => $"'{x.Trim()}'"));
        }

      
        public List<UserActivityLogModels> GetLogs(UserActivityLogFilter filter, out int totalCount)
        {
            totalCount = 0;

            using var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            conn.Open();

            string districtIn = ToGuidInClause(filter?.DistrictIds);

            string baseQuery = @"
            SELECT 
                ual.ActivityLogId,
                ual.UserId,
                ual.UserName,
                ual.RoleId,
                ual.RoleName,
                ual.ModuleName,
                ual.EventType,
                ual.EventDescription,
                ual.EventStatus,
                CASE
                    WHEN ual.EventStatus = 0 THEN 'Failed'
                    WHEN ual.EventStatus = 1 THEN 'Partial Success'
                    WHEN ual.EventStatus = 2 THEN 'Success'
                END AS EventStatusText,
                ual.FailureCount,
                ual.SuccessCount,
                ual.CreatedAt,
                au.DistrictIds AS DistrictId,
                dist.Value AS DistrictName
            FROM user_activity_log ual
            INNER JOIN account_user au ON au.UserId = ual.UserId
            LEFT JOIN two_column_configuration_values dist
                ON dist.Id = au.DistrictIds
            WHERE 1=1
        ";

            string where = "";

            if (!string.IsNullOrWhiteSpace(filter?.RoleId))
                where += " AND ual.RoleId = @RoleId ";

            if (!string.IsNullOrEmpty(districtIn))
                where += $" AND au.DistrictIds IN ({districtIn}) ";

            if (filter?.FromDate != null)
                where += " AND DATE(ual.CreatedAt) >= @FromDate ";

            if (filter?.ToDate != null)
                where += " AND DATE(ual.CreatedAt) <= @ToDate ";

            if (filter?.Where != null)
            {
                if (!string.IsNullOrWhiteSpace(filter.Where.UserName))
                    where += " AND ual.UserName LIKE @UserName ";
                if (!string.IsNullOrWhiteSpace(filter.Where.RoleName))
                    where += " AND ual.RoleName LIKE @RoleName ";
                if (!string.IsNullOrWhiteSpace(filter.Where.ModuleName))
                    where += " AND ual.ModuleName LIKE @ModuleName ";
                if (!string.IsNullOrWhiteSpace(filter.Where.EventType))
                    where += " AND ual.EventType LIKE @EventType ";
                if (!string.IsNullOrWhiteSpace(filter.Where.DistrictName))
                    where += " AND dist.Value LIKE @DistrictName ";
                if (filter.Where.EventStatus != null)
                    where += " AND ual.EventStatus = @EventStatus ";
            }

            if (!string.IsNullOrWhiteSpace(filter?.SearchString))
            {
                where += @"
                AND (
                    ual.UserName LIKE @Search
                    OR ual.RoleName LIKE @Search
                    OR ual.ModuleName LIKE @Search
                    OR ual.EventType LIKE @Search
                    OR ual.EventDescription LIKE @Search
                    OR dist.Value LIKE @Search
                )";
            }

            string countQuery = $"SELECT COUNT(1) FROM ({baseQuery + where}) t";
            totalCount = conn.ExecuteScalar<int>(countQuery, new
            {
                Search = $"%{filter?.SearchString}%",
                filter?.RoleId,
                filter?.FromDate,
                filter?.ToDate,
                UserName = $"%{filter?.Where?.UserName}%",
                RoleName = $"%{filter?.Where?.RoleName}%",
                ModuleName = $"%{filter?.Where?.ModuleName}%",
                EventType = $"%{filter?.Where?.EventType}%",
                DistrictName = $"%{filter?.Where?.DistrictName}%",
                filter?.Where?.EventStatus
            });

            string finalQuery = baseQuery + where +
                " ORDER BY ual.CreatedAt DESC LIMIT @Take OFFSET @Skip ";

            return conn.Query<UserActivityLogModels>(finalQuery, new
            {
                Search = $"%{filter?.SearchString}%",
                filter?.RoleId,
                filter?.FromDate,
                filter?.ToDate,
                UserName = $"%{filter?.Where?.UserName}%",
                RoleName = $"%{filter?.Where?.RoleName}%",
                ModuleName = $"%{filter?.Where?.ModuleName}%",
                EventType = $"%{filter?.Where?.EventType}%",
                DistrictName = $"%{filter?.Where?.DistrictName}%",
                filter?.Where?.EventStatus,
                filter?.Take,
                filter?.Skip
            }).ToList();
        }


        public List<UserActivityLogModels> GetUsersWithLastLog(UserActivityLogFilter filter, out int totalCount)
        {
            totalCount = 0;

            using var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            conn.Open();

            string districtIn = ToGuidInClause(filter?.DistrictIds);

            string countSql = @"
            SELECT COUNT(1) 
            FROM account_user au
            WHERE au.RoleId = @RoleId
        ";

            if (!string.IsNullOrEmpty(districtIn))
                countSql += $" AND au.DistrictIds IN ({districtIn}) ";

            totalCount = conn.ExecuteScalar<int>(countSql, new { filter.RoleId });

            string sql = @"
            SELECT 
                au.UserId,
                CONCAT(au.FirstName, ' ', au.LastName) AS UserName,
                au.RoleId,
                ar.RoleName,
                au.DistrictIds AS DistrictId,
                dist.Value AS DistrictName,

                log.ActivityLogId,
                log.EventType,
                log.EventDescription,
                log.EventStatus,
                CASE
                    WHEN log.EventStatus = 0 THEN 'Failed'
                    WHEN log.EventStatus = 1 THEN 'Partial Success'
                    WHEN log.EventStatus = 2 THEN 'Success'
                END AS EventStatusText,
                log.FailureCount,
                log.SuccessCount,
                log.CreatedAt

            FROM account_user au
            LEFT JOIN account_role ar ON ar.Id = au.RoleId
            LEFT JOIN two_column_configuration_values dist ON dist.Id = au.DistrictIds

            LEFT JOIN (
                SELECT t.*
                FROM user_activity_log t
                INNER JOIN (
                    SELECT UserId, MAX(CreatedAt) AS LastDate
                    FROM user_activity_log
                    GROUP BY UserId
                ) x ON x.UserId = t.UserId AND x.LastDate = t.CreatedAt
            ) log ON log.UserId = au.UserId

            WHERE au.RoleId = @RoleId
        ";

            if (!string.IsNullOrEmpty(districtIn))
                sql += $" AND au.DistrictIds IN ({districtIn}) ";
            if (!string.IsNullOrWhiteSpace(filter.Where.EventType))
                sql += " AND log.EventType LIKE @EventType ";

            sql += " ORDER BY log.CreatedAt DESC LIMIT @Take OFFSET @Skip ";

            var data = conn.Query<UserActivityLogModels>(sql, new
            {
                filter?.RoleId,
                EventType = $"%{filter?.Where?.EventType}%",
                filter?.Take,
                filter?.Skip
            }).ToList();

            return data;
        }


        #region Applicant
        public List<string> Application_Check_Exist_By_Mobile(string Mobile)
        {
            string Query = "SELECT Id FROM application_details WHERE Mobile='" + Mobile + "'";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<string>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<string>();
        }
        public List<AccountApplicantMasterModel> Application_Get_By_Mobile(string Mobile)
        {
            string Query = @"SELECT 
                            aam.Id, 
                            aam.Name, 
                            aam.Mobile, 
                            aam.Otp,
                            mm.Member_Id,
                            mm.Email
                            FROM account_applicant_master aam
                            left join member_master mm on mm.Id = aam.Id AND IFnULL(mm.IsActive,0) = 1 AND IFnULL(mm.IsTemp,0) = 0 
                            WHERE aam.Mobile='" + Mobile + "'";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<AccountApplicantMasterModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<AccountApplicantMasterModel>();
        }

        public MobileRoleModel? GetUserByMobile(string mobileNumber)
        {
            string query = @"
            SELECT 
                u.UserId,
                CONCAT(u.FirstName, ' ', u.LastName) AS UserName,
                u.FirstName,
                u.LastName,
                u.Email,
                u.Mobile AS MobileNumber,
                u.UserNumber,
                IFNULL(u.IsActive,0) AS IsActive,
                u.RoleId,
                r.RoleName,
                r.RoleCode
            FROM account_user u
            LEFT JOIN account_role r ON r.Id = u.RoleId        
            WHERE u.Mobile = @MobileNumber AND IFNULL(u.IsActive,0) = 1
            LIMIT 1;
        ";


            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return connection.QueryFirstOrDefault<MobileRoleModel>(query, new { MobileNumber = mobileNumber });
        }

        public MobileRoleModel? GetUserByEmail(string email)
        {
            string query = @"
    SELECT 
        u.UserId,
        CONCAT(u.FirstName, ' ', u.LastName) AS UserName,
        u.FirstName,
        u.LastName,
        u.Email,
        u.Mobile AS MobileNumber,
        u.UserNumber,
        IFNULL(u.IsActive,0) AS IsActive,
        u.RoleId,
        r.RoleName,
        r.RoleCode
    FROM account_user u
    LEFT JOIN account_role r ON r.Id = u.RoleId
    WHERE u.Email = @Email AND IFNULL(u.IsActive,0) = 1
    LIMIT 1;
    ";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return connection.QueryFirstOrDefault<MobileRoleModel>(query, new { Email = email });
        }


        public List<string> GetPrivilegesByUserId(string userId)
        {
            string query = @"
        SELECT p.PrivilegeCode
        FROM account_user u
        INNER JOIN account_role r ON r.Id = u.RoleId
        INNER JOIN account_role_privilege rp ON rp.RoleId = r.Id
        INNER JOIN account_privilege p ON p.PrivilegeId = rp.PrivilegeId
        WHERE u.UserId = @UserId AND u.IsActive = 1 AND p.IsActive = 1";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return connection.Query<string>(query, new { UserId = userId })?.ToList() ?? new List<string>();
        }

        public string Application_Get_Otp_By_Mobile(string Mobile)
        {
            string Query = "SELECT Otp FROM Account_Applicant_Master WHERE Mobile='" + Mobile + "'";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, Query.ToLower(), commandType: CommandType.Text);
        }
        public string Application_SaveUpdate_Otp_By_Mobile(string Mobile, string Otp)
        {
            string Query = "UPDATE Account_Applicant_Master SET Otp = '"+ Otp + "' WHERE Mobile='" + Mobile + "'";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            SqlMapper.ExecuteScalar<string>(connection, Query.ToLower(), commandType: CommandType.Text);
            return Otp;
        }
        #endregion Applicant

        #region OTP Validation
        public string Account_Login_Otp_Save(AccountLoginOtpValidationModel model)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pValidationCode = model.ValidationCode,
                pOtp = model.Otp,
                pIsExpired = model.IsExpired,
                pExpireOn = model.ExpireOn
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return SqlMapper.ExecuteScalar<string>(connection, "Account_Login_Otp_Save", @params, commandType: CommandType.StoredProcedure);
        }
        public List<AccountLoginOtpValidationModel> Account_Login_Otp_Get(string Id = "", string ValidationCode = "")
        {
            dynamic @params = new
            {
                pId = Id,
                pValidationCode = ValidationCode,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<AccountLoginOtpValidationModel>(connection, "Account_Login_Otp_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<AccountLoginOtpValidationModel>();
        }
        #endregion OTP Validation

    }
}