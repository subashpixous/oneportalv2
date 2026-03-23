namespace Model.Constants
{
    public static class FTPFolderConstants
    {
        public const string ProfileImagesFolder = "USER_PROFILE_IMAGES";
        public const string ProfileThumbnailImagesFolder = "USER_PROFILE_IMAGES_THUMBNAILS";
    }
    public static class ResponseConstants
    {   
        public const string Success = "SUCCESS";
        public const string Failed = "FAILED";
        public const string Error = "ERROR";
    }
    public static class ResponceErrorCodes
    {
        public const string TCC_ConfigurationSaved = "TCCEC0000"; // Value Exist
        public const string TCC_ConfigurationValueExist = "TCCEC0001"; // Value Exist
        public const string TCC_ConfigurationCodeExist = "TCCEC0002"; // Code Exist
        public const string TCC_ConfigurationDependentRecordExist = "TCCEC0001"; // Dependent record exist

        public const string ROLE_ConfigurationSaved = "ROLEEC0000"; // Value Exist
        public const string ROLE_ConfigurationValueExist = "ROLEEC0001"; // Value Exist
        public const string ROLE_ConfigurationCodeExist = "ROLEEC0002"; // Code Exist
        public const string ROLE_ConfigurationDependentRecordExist = "ROLEEC0001"; // Dependent record exist

        public const string USER_ConfigurationSaved = "USEREC0000"; // Value Exist
        public const string USER_ConfigurationEmailExist = "USEREC0001"; // Value Exist
        public const string USER_ConfigurationMobileExist = "USEREC0002"; // Code Exist

        public const string Distribution_ConfigurationSaved = "DISTRIB000";// Value Exist
        public const string Distribution_ConfigurationValueExist = "DISTRIB001"; // Value Exist
    }
    public static class ConfigurationCategory
    {
        public const string Division = "DIVISION";
        public const string UserGroup = "USERGROUP";
        public const string District = "DISTRICT";
        public const string Branch = "BRANCH";
    }
}
