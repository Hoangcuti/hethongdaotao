using System.Text.Json;
using System.Text;
using System.Text.RegularExpressions;

namespace KhoaHoc.Services;

public class GeminiAIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<GeminiAIService> _logger;

    public GeminiAIService(HttpClient httpClient, IConfiguration config, ILogger<GeminiAIService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task<GeneratedCourseDto> GenerateCourseContentAsync(string topic)
    {
        var apiKey = _config["GeminiAI:ApiKey"];
        var model = _config["GeminiAI:Model"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Gemini API Key is missing. Using Mock Mode for GenerateCourseContentAsync.");
            return GetMockGeneratedCourse(topic);
        }

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            
            var prompt = $@"Bạn là Giám đốc Đào tạo ưu tú của một Tập đoàn lớn.
Nhiệm vụ của bạn là soạn thảo cấu trúc khóa học nội bộ cho nhân sự về chủ đề: '{topic}'. KHÔNG SỬ DỤNG FORMAT MARKDOWN HOẶC CÁC KÍ TỰ ĐẶC BIỆT THỪA VÌ SẼ BỊ LỖI JSON PARSE.
Vui lòng trả về kết quả 100% dưới định dạng JSON hợp lệ cực kỳ nghiêm ngặt như mẫu sau:
{{
  ""Title"": ""Khóa học: Tên khóa học ngắn gọn"",
  ""Description"": ""Mô tả lợi ích khóa học từ góc độ thực tiễn doanh nghiệp"",
  ""Modules"": [
    {{
      ""Title"": ""Chương 1: Tiêu đề chương"",
      ""LessonTitles"": [""Bài 1.1: Tên bài"", ""Bài 1.2: Tên bài""]
    }}
  ]
}}";

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Gemini API Error: {errorText}");
                return GetMockGeneratedCourse(topic);
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            
            var textResult = doc.RootElement
                                .GetProperty("candidates")[0]
                                .GetProperty("content")
                                .GetProperty("parts")[0]
                                .GetProperty("text")
                                .GetString();

            if (textResult == null) return GetMockGeneratedCourse(topic);

            // Xử lý json bị bọc ngoài bởi markdown
            var cleanJson = Regex.Replace(textResult, @"```json|```", "").Trim();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var result = JsonSerializer.Deserialize<GeneratedCourseDto>(cleanJson, options);
            
            return result ?? GetMockGeneratedCourse(topic);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error calling AI: {ex.Message}");
            return GetMockGeneratedCourse(topic);
        }
    }

    public async Task<GeneratedQuizDto> GenerateQuizAsync(string topic)
    {
        var apiKey = _config["GeminiAI:ApiKey"];
        var model = _config["GeminiAI:Model"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Gemini API Key missing. Using Mock Mode for GenerateQuizAsync.");
            return GetMockGeneratedQuiz(topic);
        }

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            
            var prompt = $@"Bạn là một Chuyên gia khảo thí giáo dục chuyên nghiệp.
Nhiệm vụ: Soạn thảo một bộ 5 câu hỏi trắc nghiệm cho bài kiểm tra về chủ đề: '{topic}'.
Yêu cầu: Trả về 100% định dạng JSON chính xác như sau:
{{
  ""ExamTitle"": ""Bài kiểm tra: {topic}"",
  ""DurationMinutes"": 30,
  ""Questions"": [
    {{
      ""QuestionText"": ""Câu hỏi chi tiết?"",
      ""Points"": 10,
      ""Options"": [""Đáp án A"", ""Đáp án B"", ""Đáp án C"", ""Đáp án D""],
      ""CorrectOptionIndex"": 1
    }}
  ]
}}
Lưu ý: CorrectOptionIndex từ 1 đến 4. Không dùng markdown.";

            var requestBody = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode) return GetMockGeneratedQuiz(topic);

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var textResult = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

            if (textResult == null) return GetMockGeneratedQuiz(topic);
            var cleanJson = Regex.Replace(textResult, @"```json|```", "").Trim();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<GeneratedQuizDto>(cleanJson, options) ?? GetMockGeneratedQuiz(topic);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in GenerateQuizAI: {ex.Message}");
            return GetMockGeneratedQuiz(topic);
        }
    }

    public async Task<GeneratedQuizDto> GenerateQuizFromDocumentAsync(string base64Data, string mimeType)
    {
        var apiKey = _config["GeminiAI:ApiKey"];
        var model = _config["GeminiAI:Model"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Gemini API Key missing. Returning Mock Quiz for Document.");
            return GetMockGeneratedQuiz("Tài liệu tải lên");
        }

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            
            var prompt = $@"Bạn là một Chuyên gia khảo thí giáo dục. 
Nhiệm vụ: Đọc tài liệu đính kèm và trích xuất/soạn thảo một bộ tối đa 10 câu hỏi trắc nghiệm dựa trên nội dung tài liệu.
Yêu cầu: Trả về 100% định dạng JSON chính xác như sau:
{{
  ""ExamTitle"": ""Bài kiểm tra từ tài liệu"",
  ""DurationMinutes"": 30,
  ""Questions"": [
    {{
      ""QuestionText"": ""Câu hỏi chi tiết?"",
      ""Points"": 10,
      ""Options"": [""Đáp án A"", ""Đáp án B"", ""Đáp án C"", ""Đáp án D""],
      ""CorrectOptionIndex"": 1
    }}
  ]
}}
Lưu ý: CorrectOptionIndex từ 1 đến 4. Không dùng markdown.";

            var requestBody = new
            {
                contents = new[] 
                { 
                    new { 
                        parts = new object[] 
                        { 
                            new { text = prompt },
                            new { inlineData = new { mimeType = mimeType, data = base64Data } }
                        } 
                    } 
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode) 
            {
                var err = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Gemini File API Error: {err}");
                return GetMockGeneratedQuiz("Tài liệu");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var textResult = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

            if (textResult == null) return GetMockGeneratedQuiz("Tài liệu");
            var cleanJson = Regex.Replace(textResult, @"```json|```", "").Trim();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<GeneratedQuizDto>(cleanJson, options) ?? GetMockGeneratedQuiz("Tài liệu");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in GenerateQuizFromDocumentAsync: {ex.Message}");
            return GetMockGeneratedQuiz("Tài liệu");
        }
    }

    public async Task<GeneratedModuleDto> GenerateModuleAsync(string topic)
    {
        var apiKey = _config["GeminiAI:ApiKey"];
        var model = _config["GeminiAI:Model"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            return new GeneratedModuleDto { Title = $"Chương: {topic} (Draft AI)", LessonTitles = new List<string> { "Bài 1: Tổng quan", "Bài 2: Chi tiết" } };
        }

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            var prompt = $@"Nhiệm vụ: Đề xuất nội dung cho 1 chương (module) trong khóa học về: '{topic}'.
Yêu cầu: Trả về 100% định dạng JSON chính xác như sau:
{{
  ""Title"": ""Tên chương hấp dẫn"",
  ""LessonTitles"": [""Bài 1: ..."", ""Bài 2: ..."", ""Bài 3: ...""]
}}
Chỉ trả về JSON, không markdown.";

            var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            if (!response.IsSuccessStatusCode) return new GeneratedModuleDto { Title = topic, LessonTitles = new List<string>() };

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var textResult = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            if (textResult == null) return new GeneratedModuleDto { Title = topic, LessonTitles = new List<string>() };
            var cleanJson = Regex.Replace(textResult, @"```json|```", "").Trim();
            return JsonSerializer.Deserialize<GeneratedModuleDto>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new GeneratedModuleDto { Title = topic };
        }
        catch { return new GeneratedModuleDto { Title = topic }; }
    }

    public async Task<GeneratedLessonDto> GenerateLessonAsync(string topic)
    {
        var apiKey = _config["GeminiAI:ApiKey"];
        var model = _config["GeminiAI:Model"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            return new GeneratedLessonDto { Title = $"Bài giảng: {topic}", ContentBody = $"Nội dung chi tiết về {topic} sẽ được cập nhật ở đây." };
        }

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            var prompt = $@"Nhiệm vụ: Soạn thảo nội dung chi tiết cho 1 bài giảng về: '{topic}'.
Yêu cầu: Trả về 100% định dạng JSON chính xác như sau:
{{
  ""Title"": ""Tên bài giảng"",
  ""ContentBody"": ""Toàn bộ nội dung bài giảng dưới định dạng HTML đơn giản (dùng p, b, ul, li). Trình bày khoa học, chuyên nghiệp.""
}}
Chỉ trả về JSON, không markdown.";

            var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            if (!response.IsSuccessStatusCode) return new GeneratedLessonDto { Title = topic, ContentBody = "Đang soạn thảo..." };

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var textResult = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            if (textResult == null) return new GeneratedLessonDto { Title = topic, ContentBody = "" };
            var cleanJson = Regex.Replace(textResult, @"```json|```", "").Trim();
            return JsonSerializer.Deserialize<GeneratedLessonDto>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new GeneratedLessonDto { Title = topic };
        }
        catch { return new GeneratedLessonDto { Title = topic }; }
    }

    private GeneratedQuizDto GetMockGeneratedQuiz(string topic)
    {
        return new GeneratedQuizDto
        {
            ExamTitle = $"Bài Kiểm Tra: {topic} (Bản thảo AI)",
            DurationMinutes = 30,
            Questions = new List<GeneratedQuestionDto>
            {
                new GeneratedQuestionDto {
                    QuestionText = $"Đâu là khái niệm cơ bản nhất của {topic}?",
                    Options = new List<string> { "Định nghĩa A", "Định nghĩa B (Đúng)", "Định nghĩa C", "Định nghĩa D" },
                    CorrectOptionIndex = 2,
                    Points = 10
                },
                new GeneratedQuestionDto {
                    QuestionText = $"Mục tiêu chính khi áp dụng {topic} vào doanh nghiệp là gì?",
                    Options = new List<string> { "Tăng doanh thu", "Giảm chi phí", "Tối ưu hóa quy trình", "Tất cả các ý trên" },
                    CorrectOptionIndex = 4,
                    Points = 10
                }
            }
        };
    }

    public async Task<string> AnswerStudentQuestionAsync(string courseTitle, string lessonContext, string studentQuestion)
    {
        var apiKey = _config["GeminiAI:ApiKey"];
        var model = _config["GeminiAI:Model"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            return "Xin chào! Hiện tại tính năng Trợ lý AI đang được bảo trì (Vui lòng nhập API Key vào appsettings.json). Tôi luôn sẵn sàng hỗ trợ bạn ngay khi kết nối được phục hồi.";
        }

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            
            var prompt = $@"Bạn là Giảng viên AI nhiệt tình và uyên bác cho Khóa học '{courseTitle}'.
Bối cảnh bài học hiện tại: '{lessonContext}'
Câu hỏi của học viên: '{studentQuestion}'

Nhiệm vụ: Hãy trả lời học viên một cách súc tích, dễ hiểu, chuyên nghiệp và có tính khích lệ học tập. Trả về dưới định dạng HTML đơn giản (như dùng <b>, <p>, <ul>) để hiển thị trên web. Nếu hỏi không liên quan khóa học, hãy khéo léo nhắc nhở quay lại.";

            var requestBody = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode)
                return "Rất tiếc, tôi đang gặp chút sự cố kết nối API. Bạn có thể thử lại sau được không?";

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var textResult = doc.RootElement
                                .GetProperty("candidates")[0]
                                .GetProperty("content")
                                .GetProperty("parts")[0]
                                .GetProperty("text")
                                .GetString();

            return textResult ?? "Không có câu trả lời.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"AI Assistant Error: {ex.Message}");
            return "Có lỗi kỹ thuật, AI chưa thể trả lời bạn lúc này.";
        }
    }

    public async Task<string> SummarizeModuleAsync(string moduleTitle, string lessonsContext)
    {
        var apiKey = _config["GeminiAI:ApiKey"];
        var model = _config["GeminiAI:Model"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            return "Xin chào! Hiện tại tính năng Tóm tắt AI đang được bảo trì. Vui lòng quay lại sau.";
        }

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            
            var prompt = $@"Bạn là Chuyên gia Đào tạo cao cấp.
Nhiệm vụ: Hãy tóm tắt nội dung của chương học '{moduleTitle}' dựa trên danh sách bài giảng và nội dung bài giảng dưới đây.

Nội dung tham khảo:
{lessonsContext}

Yêu cầu: 
1. Bản tóm tắt phải súc tích, làm nổi bật được các kiến thức cốt lõi.
2. Trình bày dưới định dạng HTML đơn giản (dùng <b>, <p>, <ul>, <li>).
3. Sử dụng ngôn từ chuyên nghiệp, dễ hiểu và truyền cảm hứng học tập.";

            var requestBody = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode)
                return "Rất tiếc, AI chưa thể tóm tắt nội dung này lúc này. Vui lòng thử lại sau.";

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var textResult = doc.RootElement
                                .GetProperty("candidates")[0]
                                .GetProperty("content")
                                .GetProperty("parts")[0]
                                .GetProperty("text")
                                .GetString();

            return textResult ?? "Không thể tạo bản tóm tắt.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"AI Module Summary Error: {ex.Message}");
            return "Có lỗi kỹ thuật khi thực hiện tóm tắt nội dung chương học.";
        }
    }

    private GeneratedCourseDto GetMockGeneratedCourse(string topic)
    {
        return new GeneratedCourseDto
        {
            Title = $"Khóa học: Nâng Cấp Kỹ Năng {topic}",
            Description = $"Khóa học này cung cấp quy trình toàn diện nhằm làm chủ {topic}. Nội dung do AI tự động biên soạn (Mock Mode do thiếu API Key).\n\nLợi ích:\n✅ Hiểu sâu về cách thức ứng dụng.\n✅ Case study thực tế phù hợp với chuyên môn của phòng ban.\n✅ Nâng cao hiệu suất xử lý công việc ngay sau khóa học.",
            Modules = new List<GeneratedModuleDto>
            {
                new GeneratedModuleDto
                {
                    Title = "Chương 1: Tổng quan và Lợi ích",
                    LessonTitles = new List<string> { "Bài 1: Giới thiệu chung", "Bài 2: Tính ứng dụng thực tiễn" }
                },
                new GeneratedModuleDto
                {
                    Title = "Chương 2: Kiến thức Chuyên sâu",
                    LessonTitles = new List<string> { "Bài 1: Quy trình thực hiện", "Bài 2: Bài tập tình huống (Case study)", "Bài 3: Đánh giá quá trình" }
                }
            }
        };
    }
}
