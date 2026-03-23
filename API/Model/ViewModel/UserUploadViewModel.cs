using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class UserUploadViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Schemes { get; set; } = string.Empty;
        public string Bank { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string RoleCode { get; set; } = string.Empty;

        public List<string>? ErrorColumns { get; set; }
        public bool IsError { get; set; }
        public List<string>? Error { get; set; }
    }
    public class UserFieldValueModel
    {
        public List<KeyValuePairs>? Role_KeyValuePairs { get; set; }
        public List<KeyValuePairs>? Scheme_KeyValuePairs { get; set; }
        public List<KeyValuePairs>? District_KeyValuePairs { get; set; }
        public List<KeyValuePairs>? Bank_KeyValuePairs { get; set; }
        public List<KeyValuePairs>? Branch_KeyValuePairs { get; set; }
        public List<KeyValuePairs>? Gender_KeyValuePairs { get; set; }
        public List<UserValidationModel>? UserList { get; set; }
    }
    public class UserValidationModel
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
    }
    public class KeyValuePairs
    {
        public int Int_Parant { get; set; }
        public int Int_Key { get; set; }
        public int Int_Value { get; set; }

        public string String_Parant { get; set; } = null!;
        public string String_Key { get; set; } = null!;
        public string String_Value { get; set; } = null!;

        public string String_Code { get; set; } = null!;
    }
}
