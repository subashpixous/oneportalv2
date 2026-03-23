using GTranslate;
using GTranslate.Results;
using GTranslate.Translators;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;


namespace BAL.Service
{
    public interface ITranslationService
    {
        Task<string> TranslateToTamil(string text);
    }




    public class TranslationService : ITranslationService
    {
        private readonly HttpClient _httpClient;

        public TranslationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }


        public async Task<string> TranslateToTamil(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            try
            {

              
                // Free Google Translate API (unofficial)
                string url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q={Uri.EscapeDataString(text)}";

                var response = await _httpClient.GetStringAsync(url);

                Console.WriteLine("🔹 Raw Response: " + response);

                // The response is a nested array, e.g. [[["வணக்கம்","Hello",...]],...]
                var doc = JsonDocument.Parse(response);
                var translated = doc.RootElement[0][0][0].GetString();

                // Step 2: Fix special case for (S)
                translated = translated.Replace("(S)", "(எஸ்)", StringComparison.OrdinalIgnoreCase);
                translated = translated.Replace("(கள்)", "(எஸ்)", StringComparison.OrdinalIgnoreCase); // Google’s wrong translation

               
                return translated ?? text;
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Translation failed: " + ex.Message);
                return text; // fallback to original
            }
        }
    }
}
