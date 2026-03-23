using DAL.Helpers;
using Dapper;
using Microsoft.Extensions.Configuration;
using Model.ViewModel;
using Model.ViewModel.MemberModels;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utils.Interface;

namespace DAL
{
    public class ApplicantDAL
    {
        private readonly IConfiguration _configuration;
        private readonly string connectionId = "Default";
        public ApplicantDAL(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public int CheckMemberExist(string PhoneNumber)
        {
            string Query = "SELECT COUNT(1) FROM member_master WHERE Phone_Number = '"+ PhoneNumber + "' AND IsActive=1;";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<int>(connection, Query, commandType: CommandType.Text);
        }
    }
}
