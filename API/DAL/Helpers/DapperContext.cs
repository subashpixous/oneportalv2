using MySql.Data.MySqlClient;
using System.Data;

namespace DAL.Helpers
{
    public class DapperContext
    {
        private readonly string _connectionstring;
        public DapperContext(string connectionstring)
        {
            _connectionstring = connectionstring;
        }

        public IDbConnection CreateConnection() => new MySqlConnection(_connectionstring);
    }
}
