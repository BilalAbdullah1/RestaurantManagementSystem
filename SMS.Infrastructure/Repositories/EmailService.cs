using Microsoft.Extensions.Configuration;
using SMS.Application.Repositories;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private static readonly HttpClient _httpClient = new HttpClient();

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private async Task SendEmailInternalAsync(string toEmail, string subject, string htmlBody)
    {
        // 1. Try Resend HTTP REST API first (Bypasses Render outbound port blocking 100%)
        var resendApiKey = _configuration["Resend:ApiKey"] ?? _configuration["Resend__ApiKey"];
        if (!string.IsNullOrEmpty(resendApiKey))
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
                request.Headers.Add("Authorization", $"Bearer {resendApiKey.Trim()}");

                var fromEmail = _configuration["Resend:FromEmail"] ?? "onboarding@resend.dev";
                var payload = new
                {
                    from = $"Voke SMS <{fromEmail}>",
                    to = new[] { toEmail.Trim().ToLowerInvariant() },
                    subject = subject,
                    html = htmlBody
                };

                request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await _httpClient.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[EmailService - Resend API] Successfully sent email to {toEmail}");
                    return;
                }
                else
                {
                    Console.WriteLine($"[EmailService - Resend Warning] Status: {response.StatusCode}, Response: {responseBody}");
                }
            }
            catch (Exception resendEx)
            {
                Console.WriteLine($"[EmailService - Resend Error]: {resendEx.Message}");
            }
        }

        // 2. Fallback to MailKit SMTP
        var smtpSettings = _configuration.GetSection("Smtp");
        var host = smtpSettings["Host"] ?? "smtp.gmail.com";
        var portStr = smtpSettings["Port"] ?? "587";
        var port = int.TryParse(portStr, out var p) ? p : 587;
        var emailFrom = smtpSettings["Email"] ?? "bilalabdullah5393@gmail.com";
        var rawPassword = smtpSettings["Password"] ?? "";
        var cleanPassword = rawPassword.Replace(" ", "").Trim();

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Voke School SMS", emailFrom));
        message.To.Add(new MailboxAddress(toEmail, toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlBody
        };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        client.ServerCertificateValidationCallback = (s, c, h, e) => true;
        client.Timeout = 10000;

        try
        {
            var socketOptions = port switch
            {
                465 => SecureSocketOptions.SslOnConnect,
                587 => SecureSocketOptions.StartTls,
                _ => SecureSocketOptions.Auto
            };

            await client.ConnectAsync(host, port, socketOptions);
            
            if (!string.IsNullOrEmpty(cleanPassword))
            {
                await client.AuthenticateAsync(emailFrom, cleanPassword);
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            Console.WriteLine($"[EmailService - SMTP] Successfully sent email to {toEmail} via {host}:{port}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService SMTP ERROR] Host={host}:{port}. Error: {ex.Message}");
            Console.WriteLine($"[Render Tip] Render Free tier blocks outbound ports 587/465. To send live emails without blockage, add 'Resend__ApiKey' in Render Environment Variables.");
        }
    }

    public async Task SendPasswordResetEmail(string email, string resetToken, Guid tenantId)
    {
        Console.WriteLine("\n=======================================================");
        Console.WriteLine($"🔑 [PASSWORD RESET TOKEN FOR {email}]: {resetToken}");
        Console.WriteLine("=======================================================\n");

        var html = $@"
        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;'>
            <h2 style='color: #1e3a8a; text-align: center; margin-bottom: 20px;'>Password Reset Request</h2>
            <p style='color: #475569; font-size: 16px;'>We received a request to reset your password. Please copy the verification token below:</p>
            
            <div style='padding: 15px; background-color: #f1f5f9; color: #1e293b; font-size: 22px; font-weight: bold; font-family: monospace; text-align: center; border-radius: 8px; margin: 25px 0; letter-spacing: 2px; border: 1px dashed #cbd5e1;'>
                {resetToken}
            </div>
            
            <p style='color: #ef4444; font-size: 14px; font-weight: 500;'>This token will expire in 2 hours.</p>
            <p style='color: #94a3b8; font-size: 13px; margin-top: 20px;'>If you didn't request this, please ignore this email safely.</p>
        </div>";

        await SendEmailInternalAsync(email, "Reset Your Password - School Management System", html);
    }

    public async Task SendFeeChallanEmailAsync(string email, string studentName, string challanMonth, decimal amount, DateTime dueDate)
    {
        var html = $@"
        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;'>
            <h2 style='color: #1e3a8a; text-align: center; margin-bottom: 20px;'>New Fee Challan Generated</h2>
            <p style='color: #475569; font-size: 16px;'>Dear Parent/Guardian,</p>
            <p style='color: #475569; font-size: 16px;'>A new fee challan has been generated for <strong>{studentName}</strong> for the month of <strong>{challanMonth}</strong>.</p>
            
            <div style='padding: 15px; background-color: #f8fafc; color: #1e293b; text-align: left; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;'>
                <p style='margin: 5px 0;'><strong>Net Payable:</strong> Rs {amount:N2}</p>
                <p style='margin: 5px 0; color: #ef4444;'><strong>Due Date:</strong> {dueDate:dd MMM yyyy}</p>
            </div>
            
            <p style='color: #475569; font-size: 14px;'>Please log in to your Parent Portal to view or pay this challan digitally.</p>
            <p style='color: #94a3b8; font-size: 13px; margin-top: 20px;'>Thank you,<br/>School Management System</p>
        </div>";

        await SendEmailInternalAsync(email, $"New Fee Challan: {challanMonth} - {studentName}", html);
    }

    public async Task SendFeeReceiptEmailAsync(string email, string studentName, string challanMonth, decimal amountPaid)
    {
        var html = $@"
        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;'>
            <h2 style='color: #16a34a; text-align: center; margin-bottom: 20px;'>Payment Successful</h2>
            <p style='color: #475569; font-size: 16px;'>Dear Parent/Guardian,</p>
            <p style='color: #475569; font-size: 16px;'>We have received your payment for <strong>{studentName}</strong> for the month of <strong>{challanMonth}</strong>.</p>
            
            <div style='padding: 15px; background-color: #f0fdf4; color: #166534; text-align: center; border-radius: 8px; margin: 25px 0; font-size: 20px; font-weight: bold; border: 1px solid #bbf7d0;'>
                Amount Paid: Rs {amountPaid:N2}
            </div>
            
            <p style='color: #475569; font-size: 14px;'>You can download your official receipt from the Parent Portal.</p>
            <p style='color: #94a3b8; font-size: 13px; margin-top: 20px;'>Thank you,<br/>School Management System</p>
        </div>";

        await SendEmailInternalAsync(email, $"Payment Receipt: {challanMonth} - {studentName}", html);
    }

    public async Task SendMassEmailAsync(List<string> emails, string subject, string htmlBody)
    {
        foreach (var email in emails)
        {
            if (string.IsNullOrWhiteSpace(email)) continue;
            await SendEmailInternalAsync(email, subject, htmlBody);
        }
    }
}