using DAL;
using Model.DomainModel;
using Model.ViewModel;

namespace BAL.Interface
{
    public interface IAccountBAL
    {
        public LoginModel? GetLogin(LoginRequestModel model);
        public string SaveLogin(LoginModel model);
        public string SaveLoginLog(AccountLoginLogModel model);
        public string SaveUserActivityLog(UserActivityLogModel model);
       
        // Updated by sivasankar On 11/12/2025 for user log report
        public List<UserActivityLogModels> GetLogs(UserActivityLogFilter filter, out int totalCount);
        public List<AccountLoginLogModel> GetLoginLog(string Id = "", string LoginId = "");
        public AccountUserModel? GetUser(bool IsActive = true, string UserId = "", string DistrictId = "", string DivisionId = "",
            string UserGroup = "", string RoleId = "", string MobileNumber = "", string Email = "",
            string UserGroupName = "", string SchemeId = "", string BranchId = "", string BankId = "");

        MobileRoleModel? GetUserByEmail(string email);

        public string Login_OTP_Save(string UserId, string OTP, string PasswordToken);
        public string Login_OTP_Get(string UserId);
        public bool Login_Password_Save(string PasswordToken, string Password, string OTP);
        public string SendOtpMail(AccountApplicantMasterModel applicant, string otp);

        #region Applicant
        public List<string> Application_Check_Exist_By_Mobile(string Mobile);
        public List<AccountApplicantMasterModel> Application_Get_By_Mobile(string Mobile);
        public string Application_Get_Otp_By_Mobile(string Mobile);
        public string Application_SaveUpdate_Otp_By_Mobile(string Mobile, string Otp);
        #endregion Applicant

        #region OTP Validation
        public string Account_Login_Otp_Save(AccountLoginOtpValidationModel model);
        public List<AccountLoginOtpValidationModel> Account_Login_Otp_Get(string Id = "", string ValidationCode = "");
        #endregion OTP Validation


         public MobileRoleModel? CheckMobileRole(string mobileNumber);
        public List<string> GetPrivilegesByUserId(string userId);


    }
}
