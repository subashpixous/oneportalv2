using AutoMapper;
using BAL.Interface;
using DAL;
using Microsoft.Extensions.Configuration;
using Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utils.Interface;

namespace BAL
{
    public class ApplicantBAL : IApplicantBAL
    {
        private readonly SettingsDAL _settingDAL;
        private readonly GeneralDAL _generalDAL;
        private readonly SchemeDAL _schemeDAL;
        private readonly ApplicantDAL _applicantDAL;
        private readonly IMapper _mapper;
        private readonly IFTPHelpers _fTPHelpers;

        public ApplicantBAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IMapper mapper, IConfiguration configuration, IFTPHelpers fTPHelpers)
        {
            _settingDAL = new SettingsDAL(configuration);
            _generalDAL = new GeneralDAL(configuration);
            _schemeDAL = new SchemeDAL(mySqlDapperHelper, mySqlHelper, configuration);
            _applicantDAL = new ApplicantDAL(configuration);
            _mapper = mapper;
            _fTPHelpers = fTPHelpers;
        }

        public List<ApplicationGridViewModel> Application_GetList(string Id = "", string ApplicationId = "", string Mobile = "", string Email = "", string MemberId = "")
        {
            return _schemeDAL.Application_GetList(Id, ApplicationId, Mobile, Email, true, _generalDAL.ApplicationExpiryDays(), MemberId);
        }
        public int CheckMemberExist(string PhoneNumber)
        {
            return _applicantDAL.CheckMemberExist(PhoneNumber);
        }
    }
}
