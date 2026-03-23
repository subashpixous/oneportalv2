using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.Extensions.Configuration;
using Model;
using Model.LogModel;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utils.Services
{
    public interface ILogService
    {
        Task LogAsync(UserActivityLogModel model);
    }

    public class LogService : ILogService
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly string connectionId = "Default";

        public LogService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task LogAsync(UserActivityLogModel model)
        {
            var parameters = new
            {
                pActivityLogId = model.ActivityLogId,
                pUserId = model.UserId,
                pUserName = model.UserName,
                pRoleId = model.RoleId,
                pRoleName = model.RoleName,
                pModuleName = model.ModuleName,
                pEventType = model.EventType,
                pEventDescription = model.EventDescription,
                pEventStatus = model.EventStatus,
                pFailureCount = model.FailureCount,
                pSuccessCount = model.SuccessCount
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            await connection.ExecuteAsync("User_Activity_Log_Save", parameters, commandType: CommandType.StoredProcedure);
        }
    }
}
