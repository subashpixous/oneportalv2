using Microsoft.AspNetCore.Http;
using MySql.Data.MySqlClient;
using System.Threading.Tasks;

public class ConnectionCleanupMiddleware
{
    private readonly RequestDelegate _next;

    public ConnectionCleanupMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        //try
        //{
        //    await _next(context);
        //}
        //finally
        //{
        //    MySqlConnection.ClearAllPools();
        //}

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Request Pipeline Error: " + ex.Message);
            throw;
        }
        finally
        {
            try
            {
                MySqlConnection.ClearAllPools();
            }
            catch (Exception ex)
            {
                Console.WriteLine("MySQL Pool Clear Error: " + ex.Message);

                // Optional: force GC cleanup
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }
    }
}