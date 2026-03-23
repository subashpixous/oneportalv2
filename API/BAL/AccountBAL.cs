using AutoMapper;
using BAL.Interface;
using DAL;
using Dapper;
using Microsoft.Extensions.Configuration;
using Model.DomainModel;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using Org.BouncyCastle.Asn1.IsisMtt.X509;
using SixLabors.ImageSharp;
using System.Configuration;
using System.Data;
using Utils;
using Utils.Interface;
using Utils.UtilModels;

namespace BAL
{
    public class AccountBAL : IAccountBAL
    {
        private readonly AccountDAL _accountDAL;
        private readonly SettingsDAL _settingsDAL;
        private readonly IMapper _mapper;
        private readonly IMailHelper _mailHelpers;

        public AccountBAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IMapper mapper, IMailHelper mailHelpers, IConfiguration configuration)
        {
            _accountDAL = new AccountDAL(mySqlDapperHelper, mySqlHelper, configuration);
            _settingsDAL = new SettingsDAL(configuration);
            _mailHelpers = mailHelpers;
            _mapper = mapper;
        }
        public LoginModel? GetLogin(LoginRequestModel model)
        {
            return _accountDAL.GetLogin(model);
        }
        public string SaveLogin(LoginModel model)
        {
            model.AccessToken = Utils.EncryptDecrypt.Encrypt(model.AccessToken);
            model.RefreshToken = Utils.EncryptDecrypt.Encrypt(model.RefreshToken);
            return _accountDAL.SaveLogin(model);
        }
        public string SaveLoginLog(AccountLoginLogModel model)
        {
            return _accountDAL.SaveLoginLog(model);
        }
        public List<AccountLoginLogModel> GetLoginLog(string Id = "", string LoginId = "")
        {
            return _accountDAL.GetLoginLog(Id, LoginId);
        }
        public AccountUserModel? GetUser(bool IsActive = true, string UserId = "", string DistrictId = "", string DivisionId = "" ,
            string UserGroup = "", string RoleId = "", string MobileNumber = "", string Email = "",
            string UserGroupName = "", string SchemeId = "", string BranchId = "", string BankId = "")
        {
            AccountUserModel? model = _settingsDAL.User_Get(IsActive, UserId,DistrictId, DivisionId, UserGroup, RoleId, MobileNumber, Email, UserGroupName, SchemeId, BranchId, BankId).FirstOrDefault();
            return model;
        }
        public string SaveUserActivityLog(UserActivityLogModel model)
        {
            return _accountDAL.SaveUserActivityLog(model);
        }

        // Updated by sivasankar On 11/12/2025 for user log report
        public List<UserActivityLogModels> GetLogs(UserActivityLogFilter filter, out int totalCount)
        {
            return _accountDAL.GetActivityLogs(filter, out totalCount);
        }
        public string Login_OTP_Save(string UserId, string OTP, string PasswordToken)
        {
            return _accountDAL.Login_OTP_Save(UserId,OTP,PasswordToken);
        }
        public string Login_OTP_Get(string UserId)
        {
            return _accountDAL.Login_OTP_Get(UserId);
        }
        public bool Login_Password_Save(string PasswordToken, string Password, string OTP)
        {
            return _accountDAL.Login_Password_Save(PasswordToken, Password, OTP);
        }
        public string SendOtpMail(AccountApplicantMasterModel applicant, string otp)
        {
            if (applicant == null || string.IsNullOrWhiteSpace(applicant.Email))
                return "Applicant email not found";

            try
            {
                string mailCode = ApplicationEmailTemplateCode.OTP;

                EmailSMSTemplate _templateClass = new EmailSMSTemplate();
                EmailTemplateModel template = _templateClass.GetEmailTemplate(mailCode);
                if (template == null)
                    return "Email template not found";

                EmailModel email = new EmailModel
                {
                    To = new List<string> { applicant.Email },
                    Subject = template.Subject,
                    Body = template.Body,
                    BodyPlaceHolders = new Dictionary<string, string>()
            {
                { "{RECIPIENTFIRSTNAME}", applicant.Name ?? "" },
                
                { "{OTP}", otp }
            }
                };

                string subject, body;
                bool sent = _mailHelpers.SendMail(email, out body, out subject);

                if (sent)
                {
                    Console.WriteLine($"OTP Email sent to {applicant.Email}");
                    return "SUCCESS";
                }
                else
                {
                    Console.WriteLine($"Failed to send OTP Email to {applicant.Email}");
                    return "FAILED";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendOtpMail: {ex}");
                return $"ERROR: {ex.Message}";
            }
        }

        public MobileRoleModel? CheckMobileRole(string mobileNumber)
    {
        var user = _accountDAL.GetUserByMobile(mobileNumber);
        if (user != null)
        {
            user.Privileges = _accountDAL.GetPrivilegesByUserId(user.UserId);
        }
        return user;
    }
        public List<string> GetPrivilegesByUserId(string userId)
        {
            return _accountDAL.GetPrivilegesByUserId(userId);
        }

        public MobileRoleModel? GetUserByEmail(string email)
        {
            return _accountDAL.GetUserByEmail(email);
        }


        #region Applicant
        public List<string> Application_Check_Exist_By_Mobile(string Mobile)
        {
            return _accountDAL.Application_Check_Exist_By_Mobile(Mobile);
        }
        public List<AccountApplicantMasterModel> Application_Get_By_Mobile(string Mobile)
        {
            return _accountDAL.Application_Get_By_Mobile(Mobile);
        }
        public string Application_Get_Otp_By_Mobile(string Mobile)
        {
            return _accountDAL.Application_Get_Otp_By_Mobile(Mobile);
        }
        public string Application_SaveUpdate_Otp_By_Mobile(string Mobile, string Otp)
        {
            return _accountDAL.Application_SaveUpdate_Otp_By_Mobile(Mobile, Otp);
        }
        #endregion Applicant

        #region OTP Validation
        public string Account_Login_Otp_Save(AccountLoginOtpValidationModel model)
        {
            return _accountDAL.Account_Login_Otp_Save(model);
        }
        public List<AccountLoginOtpValidationModel> Account_Login_Otp_Get(string Id = "", string ValidationCode = "")
        {
            return _accountDAL.Account_Login_Otp_Get(Id, ValidationCode);
        }
        #endregion OTP Validation

    }
}