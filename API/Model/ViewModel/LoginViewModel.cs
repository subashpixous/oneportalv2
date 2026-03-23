using DocumentFormat.OpenXml.EMMA;
using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class LoginViewModel
    {
        public string LoginId { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime LastLoginDate { get; set; }
        public string UserNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public List<string> Privillage { get; set; } = null!;

        public AccountUserModel UserDetails { get; set; } = null!;
    }

    public class LoginRequestModel
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Device { get; set; } = string.Empty;
    }

    public class ValidateOtpModel
    {
        public string MobileNumber { get; set; } = string.Empty;
        public string OTP { get; set; } = string.Empty;
        public string ? AccessType { get; set; } = string.Empty;
    }
    public class SaveNewPasswordModel
    {
        public string Token { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string OTP { get; set; } = string.Empty;
    }


    public class AadharGetOtpModel
    {
        public AUAKUAParameters AUAKUAParameters { get; set; }

        public string PIDXML { get; set; }

        public string ENVIRONMENT { get; set; }
    }

    public class ApiResponseModel
    {
        public string data { get; set; }
    }


    public class AUAKUAParameters
    {
        public string LAT { get; set; }

        public string LONG { get; set; }

        public string DEVMACID { get; set; }

        public string DEVID { get; set; }

        public string CONSENT { get; set; }

        public string SHRC { get; set; }

        public string VER { get; set; }

        public string SERTYPE { get; set; }

        public string ENV { get; set; }

        public string AADHAARID { get; set; }

        public string CH { get; set; }

        public string OTP { get; set; }

        public string TXN { get; set; }

        public string SLK { get; set; }

        public string RRN { get; set; }

        public string REF { get; set; }


        public string LANG { get; set; }

        public string PFR { get; set; }

     }


    public class AadharOtpApiResponse
    {
        public AadharOtpData data { get; set; }
    }

    public class AadharOtpData
    {
        public string ret { get; set; }
        public string code { get; set; }
        public string txn { get; set; }
        public string ts { get; set; }
        public string err { get; set; }
        public string errdesc { get; set; }
        public string rrn { get; set; }
        public string  Ref { get; set; }
        public string responseXML { get; set; }
    }


    public class AadharOtpVerifyApiResponse
    {
        public string ret { get; set; }
        public string code { get; set; }
        public string txn { get; set; }
        public string ts { get; set; }
        public string err { get; set; }
        public string errdesc { get; set; }
        public string rrn { get; set; }
        public string @ref { get; set; }
        public string responseXML { get; set; }
    }


    //public class AadhaarKycData
    //{
    //    public string AadhaarNumber { get; set; }
    //    public string Name { get; set; }
    //    public string Gender { get; set; }
    //    public string DOB { get; set; }
    //    public string CareOf { get; set; }
    //    public string District { get; set; }
    //    public string State { get; set; }
    //    public string Pincode { get; set; }

    //    public string PhotoBase64 { get; set; }   // for frontend display
    //    public byte[] PhotoBytes { get; set; }    // for saving as file
    //}

    public class EmisApiResponse
    {
        public bool dataStatus { get; set; }
        public int status { get; set; }
        public List<EmisStudentResult> result { get; set; }
    }

    public class EmisStudentResult
    {
        public string name { get; set; }
        public string dob { get; set; }
        //public string emsid { get; set; }
        public string school_name { get; set; }
        public string district_name { get; set; }
        public string management { get; set; }
        public string school_type { get; set; }
        public string block_name { get; set; }
        public string father_name { get; set; }
        public string mother_name { get; set; }
        public string class_studying_id { get; set; }
        public string class_section { get; set; }
        public string MEDINSTR_DESC { get; set; }
    }

    public class UmisStudentResponse
    {
        public string emsid { get; set; }
        public string name { get; set; }
        public string dateOfBirth { get; set; }
        public string mobileNumber { get; set; }
        public string instituteName { get; set; }
        public string mediumOfInstructionType { get; set; }
        public string universityName { get; set; }
        public string departmentName { get; set; }
        public string courseType { get; set; }
        public string academicStatusType { get; set; }
        public string yearOfStudy { get; set; }
    }


    public class AadhaarKycData
    {
        public string AadhaarNumber { get; set; }
        public string Name { get; set; }
        public string Gender { get; set; }
        public string DOB { get; set; }
        public string CareOf { get; set; }
        public string District { get; set; }
        public string State { get; set; }
        public string Pincode { get; set; }
        public string PhotoUrl { get; set; }
        public string PhotoBase64 { get; set; }
        public string? MemberId { get; set; }
        public bool? AadhaarVerified { get; set; }
        //public AccountApplicantLoginResponseModel LoginDetails { get; set; } = null!;
        public AccountApplicantLoginResponseModel LoginDetails { get; set; } = new AccountApplicantLoginResponseModel();

    }


    public class PdsData
    {
        public string NewRationCardNo { get; set; }
        public string name_in_english { get; set; }
        public string name_in_tamil { get; set; }
        public string sex { get; set; }
        public string addressInEnglish { get; set; }
        public string addressInTamil { get; set; }
        public string village_name { get; set; }
        public string taluk_name { get; set; }
        public string district_name { get; set; }
        public string pincode { get; set; }
        public string mobileNumber { get; set; }
        public string dob { get; set; }
        public string FamilyRelationship { get; set; }
    }

}
