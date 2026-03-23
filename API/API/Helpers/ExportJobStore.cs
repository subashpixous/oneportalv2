using System.Collections.Concurrent;
using System.Collections.Generic;
// [06-11-2025] Updated by Sivasankar K: Modified To Export All Data
namespace API.Helpers
{
    public static class ExportJobStore
    {
        // 🧠 Thread-safe dictionary for background job tracking
        private static readonly ConcurrentDictionary<string, ExportJobStatus> _jobs = new();

        public static void Add(string jobId, ExportJobStatus status) =>
            _jobs[jobId] = status;

        public static ExportJobStatus? Get(string jobId) =>
            _jobs.TryGetValue(jobId, out var status) ? status : null;

        public static void Update(string jobId, ExportJobStatus status) =>
            _jobs[jobId] = status;

        // ✅ Correct removal method for ConcurrentDictionary
        public static void Remove(string jobId)
        {
            _jobs.TryRemove(jobId, out _);
        }
    }

    public class ExportJobStatus
    {
        public string Status { get; set; } = "Pending";   // Pending / Completed / Failed

        // 🔹 File metadata
        public string? FileName { get; set; }
        public string? MimeType { get; set; }

        // 🔹 File data (stored temporarily in memory)
        public byte[]? FileBytes { get; set; }

        // 🔹 Optional file path (if ever used)
        public string? FilePath { get; set; }

        // 🔹 For failed jobs
        public string? ErrorMessage { get; set; }

        // 🔹 Timestamp for cleanup tracking
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
