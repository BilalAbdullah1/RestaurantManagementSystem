using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Domain.DTO_s;
using SMS.Infrastructure.Security;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using OtpNet;
using Microsoft.AspNetCore.Authorization;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _repository;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly IRoleRepository _roleRepository;

        public UsersController(IUserRepository repository, IConfiguration configuration, IEmailService emailService, IRoleRepository roleRepository)
        {
            _repository = repository;
            _configuration = configuration;
            _emailService = emailService;
            _roleRepository = roleRepository;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> CreateUser(RegisterRequest request)
        {
            var roles = await _roleRepository.GetByTenantAsync(request.tenant_id);
            var role = roles.FirstOrDefault(r => string.Equals(r.name, request.role_name, StringComparison.OrdinalIgnoreCase));
            
            if (role == null)
            {
                // Auto-seed standard roles for this tenant if not yet present
                var standardRoles = new[] { "Admin", "Teacher", "Student", "Parent", "Staff" };
                foreach (var roleName in standardRoles)
                {
                    if (!roles.Any(r => string.Equals(r.name, roleName, StringComparison.OrdinalIgnoreCase)))
                    {
                        var newRole = new Role
                        {
                            id = Guid.NewGuid(),
                            tenant_id = request.tenant_id,
                            name = roleName,
                            description = $"System generated {roleName} role",
                            is_system_role = true,
                            created_at = DateTime.UtcNow
                        };
                        await _roleRepository.AddAsync(newRole);
                    }
                }
                await _roleRepository.SaveChangesAsync();

                // Re-fetch after auto-seeding
                roles = await _roleRepository.GetByTenantAsync(request.tenant_id);
                role = roles.FirstOrDefault(r => string.Equals(r.name, request.role_name, StringComparison.OrdinalIgnoreCase));
            }

            if (role == null)
            {
                // Fallback: If custom role requested, create it on the fly
                var customRole = new Role
                {
                    id = Guid.NewGuid(),
                    tenant_id = request.tenant_id,
                    name = request.role_name,
                    description = $"System generated {request.role_name} role",
                    is_system_role = false,
                    created_at = DateTime.UtcNow
                };
                await _roleRepository.AddAsync(customRole);
                await _roleRepository.SaveChangesAsync();
                role = new SMS.Application.DTOs.RoleDto { id = customRole.id, name = customRole.name, tenant_id = customRole.tenant_id };
            }

            var user = new User
            {
                id = Guid.NewGuid(),
                tenant_id = request.tenant_id,
                role_id = role.id,
                first_name = request.first_name,
                last_name = request.last_name,
                email = request.email,
                phone_number = request.phone_number ?? string.Empty,
                is_active = true,
                created_at = DateTime.UtcNow,
                password_hash = PasswordHasher.HashPassword(request.password)
            };

            await _repository.AddAsync(user);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.id }, user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _repository.GetByEmailAndTenantAsync(request.email, request.tenant_id);

            if (user == null || !user.is_active)
                return Unauthorized(new { message = "Invalid username/email, tenant configuration, or inactive account" });

            if (!PasswordHasher.VerifyPassword(request.password, user.password_hash))
                return Unauthorized(new { message = "Invalid username/email or password" });

            if (user.two_factor_enabled)
            {
                if (string.IsNullOrEmpty(request.otp_code))
                {
                    return Ok(new AuthResponse { requires_2fa = true });
                }

                var totp = new Totp(Base32Encoding.ToBytes(user.two_factor_secret));
                if (!totp.VerifyTotp(request.otp_code, out long timeStepMatched, new VerificationWindow(2, 2)))
                {
                    return Unauthorized(new { message = "Invalid 2FA code" });
                }
            }

            var role = await _roleRepository.GetByIdAsync(user.role_id);
            string roleName = role?.name ?? "User";

            var jwtToken = GenerateJwtToken(user, roleName);
            var refreshToken = GenerateRefreshToken();

            user.refresh_token = refreshToken;
            user.refresh_token_expiry = DateTime.UtcNow.AddDays(7);

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                requires_2fa = false,
                token = jwtToken,
                refresh_token = user.refresh_token,
                refresh_token_expiry = user.refresh_token_expiry.Value,
                user_id = user.id,
                email = user.email,
                tenant_id = user.tenant_id,
                role_id = user.role_id,
                role_name = roleName,
                profile_picture_url = user.profile_picture_url
            });
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> Refresh(TokenRefreshRequest request)
        {
            var user = await _repository.GetByEmailAndTenantAsync(request.email, request.tenant_id);

            if (user == null || user.refresh_token != request.refresh_token || user.refresh_token_expiry <= DateTime.UtcNow)
            {
                return Unauthorized(new { message = "Invalid or expired refresh token configuration" });
            }

            var role = await _roleRepository.GetByIdAsync(user.role_id);
            string roleName = role?.name ?? "User";

            var jwtToken = GenerateJwtToken(user, roleName);
            var newRefreshToken = GenerateRefreshToken();

            user.refresh_token = newRefreshToken;
            user.refresh_token_expiry = DateTime.UtcNow.AddDays(7);

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                token = jwtToken,
                refresh_token = user.refresh_token,
                refresh_token_expiry = user.refresh_token_expiry.Value,
                user_id = user.id,
                email = user.email,
                tenant_id = user.tenant_id,
                role_id = user.role_id,
                role_name = roleName,
                profile_picture_url = user.profile_picture_url
            });
        }

        [Authorize]
        [HttpGet("tenant/{tenantId}")]
        [HasPermission("users.manage")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsersByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [Authorize]
        [HttpGet("{id}")]
        [HasPermission("users.manage")]
        public async Task<ActionResult<User>> GetUser(Guid id)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });
            return Ok(user);
        }

        // STEP 1: Forgot Password (Token response se remove kar diya hai)
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            var user = await _repository.GetByEmailAndTenantAsync(request.email, request.tenant_id);
            if (user == null)
                return BadRequest(new { message = "Email address not found." });

            var resetToken = GenerateResetToken();
            user.refresh_token = resetToken;
            user.refresh_token_expiry = DateTime.UtcNow.AddHours(2); // 2 hours validity

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            // Email ke zariye token bhejna (Background task so HTTP response doesn't block UI)
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendPasswordResetEmail(user.email, resetToken, user.tenant_id);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[PasswordReset Error]: {ex.Message}");
                }
            });

            return Ok(new
            {
                message = "Password reset token has been sent to your email successfully."
            });
        }

        // NAYA ENDPOINT STEP 2 KE LIYE: Token frontend se verify karne ke liye
        [HttpPost("verify-token")]
        public async Task<IActionResult> VerifyToken([FromBody] TokenVerifyRequest request)
        {
            if (string.IsNullOrEmpty(request.token))
                return BadRequest(new { message = "Token cannot be empty." });

            var user = await _repository.GetByResetTokenAsync(request.token);
            if (user == null || user.refresh_token_expiry < DateTime.UtcNow)
                return BadRequest(new { message = "Invalid token or token has been expired." });

            return Ok(new { message = "Token is valid. You can proceed." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
        {
            var user = await _repository.GetByResetTokenAsync(request.token);
            if (user == null || user.refresh_token_expiry < DateTime.UtcNow)
                return BadRequest(new { message = "Invalid or expired token" });

            user.password_hash = PasswordHasher.HashPassword(request.newPassword);
            user.refresh_token = null;
            user.refresh_token_expiry = null;

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Password reset successful" });
        }

        private string GenerateJwtToken(User user, string roleName)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretFallbackKeyThatIsLongEnough";
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Email, user.email),
                new Claim("tenant_id", user.tenant_id.ToString()),
                new Claim("role_id", user.role_id.ToString()),
                new Claim("role_name", roleName)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }

        private string GenerateResetToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("/", "")
                .Replace("+", "")
                .Substring(0, 8)
                .ToUpper();
        }
        [Authorize]
        [HttpPut("{id}")]
        [HasPermission("users.manage")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserUpdateDto updatedUser)
        {
            if (id != updatedUser.id)
                return BadRequest(new { message = "Identity mismatch in update parameters." });

            var existingUser = await _repository.GetByIdAsync(id);
            if (existingUser == null)
                return NotFound(new { message = "User not found." });

            existingUser.first_name = updatedUser.first_name;
            existingUser.last_name = updatedUser.last_name;
            existingUser.email = updatedUser.email;
            existingUser.phone_number = updatedUser.phone_number;
            if (updatedUser.role_id != Guid.Empty) existingUser.role_id = updatedUser.role_id;
            existingUser.is_active = updatedUser.is_active;

            // Check both 'password' (from frontend DTO) and 'password_hash'
            string? newPassword = !string.IsNullOrEmpty(updatedUser.password) 
                ? updatedUser.password 
                : updatedUser.password_hash;

            if (!string.IsNullOrEmpty(newPassword))
            {
                existingUser.password_hash = PasswordHasher.HashPassword(newPassword);
            }

            _repository.Update(existingUser);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "User profile updated successfully." });
        }

        [Authorize]
        [HttpDelete("{id}")]
        [HasPermission("users.manage")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Note: If you want soft delete, just set user.is_active = false and update. 
            // This performs a hard delete.
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully." });
        }

        [Authorize]
        [HttpPost("generate-2fa")]
        public async Task<IActionResult> Generate2FA()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var user = await _repository.GetByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var secretKey = KeyGeneration.GenerateRandomKey(20);
            var secretString = Base32Encoding.ToString(secretKey);

            user.two_factor_secret = secretString;
            // Dont enable it yet, just store the secret
            _repository.Update(user);
            await _repository.SaveChangesAsync();

            var tenant = await _roleRepository.GetByTenantAsync(user.tenant_id); // we need tenant name ideally
            var issuer = "VokeSolutions_SMS";

            // Generate provisioning URI
            var otpAuthUri = $"otpauth://totp/{issuer}:{user.email}?secret={secretString}&issuer={issuer}";

            return Ok(new { 
                secret = secretString, 
                qrCodeUri = otpAuthUri
            });
        }

        [Authorize]
        [HttpPost("enable-2fa")]
        public async Task<IActionResult> Enable2FA([FromBody] TokenVerifyRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var user = await _repository.GetByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            if (string.IsNullOrEmpty(user.two_factor_secret))
                return BadRequest(new { message = "2FA has not been generated for this user." });

            var totp = new Totp(Base32Encoding.ToBytes(user.two_factor_secret));
            if (!totp.VerifyTotp(request.token, out long timeStepMatched, new VerificationWindow(2, 2)))
            {
                return BadRequest(new { message = "Invalid 2FA code." });
            }

            user.two_factor_enabled = true;
            _repository.Update(user);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Two-Factor Authentication has been enabled." });
        }

        [Authorize]
        [HttpGet("profile/me")]
        public async Task<ActionResult<UserProfileDto>> GetMyProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "User identity claim not found." });

            var user = await _repository.GetByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User profile not found." });

            var role = await _roleRepository.GetByIdAsync(user.role_id);

            return Ok(new UserProfileDto
            {
                id = user.id,
                tenant_id = user.tenant_id,
                role_id = user.role_id,
                role_name = role?.name ?? "User",
                first_name = user.first_name,
                last_name = user.last_name,
                email = user.email,
                phone_number = user.phone_number,
                profile_picture_url = user.profile_picture_url,
                two_factor_enabled = user.two_factor_enabled,
                created_at = user.created_at
            });
        }

        [Authorize]
        [HttpPut("profile/me")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "User identity claim not found." });

            var user = await _repository.GetByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User profile not found." });

            if (!string.IsNullOrWhiteSpace(dto.first_name))
                user.first_name = dto.first_name.Trim();

            if (dto.last_name != null)
                user.last_name = dto.last_name.Trim();

            if (dto.phone_number != null)
                user.phone_number = dto.phone_number.Trim();

            if (dto.profile_picture_url != null)
                user.profile_picture_url = dto.profile_picture_url;

            if (!string.IsNullOrWhiteSpace(dto.new_password))
            {
                if (!string.IsNullOrEmpty(dto.current_password) && !PasswordHasher.VerifyPassword(dto.current_password, user.password_hash))
                {
                    return BadRequest(new { message = "Current password is incorrect." });
                }

                if (dto.new_password.Length < 6)
                {
                    return BadRequest(new { message = "New password must be at least 6 characters long." });
                }

                user.password_hash = PasswordHasher.HashPassword(dto.new_password);
            }

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            var role = await _roleRepository.GetByIdAsync(user.role_id);

            return Ok(new
            {
                message = "Profile updated successfully.",
                user = new UserProfileDto
                {
                    id = user.id,
                    tenant_id = user.tenant_id,
                    role_id = user.role_id,
                    role_name = role?.name ?? "User",
                    first_name = user.first_name,
                    last_name = user.last_name,
                    email = user.email,
                    phone_number = user.phone_number,
                    profile_picture_url = user.profile_picture_url,
                    two_factor_enabled = user.two_factor_enabled,
                    created_at = user.created_at
                }
            });
        }
    }

    public class TokenVerifyRequest
    {
        public string token { get; set; } = default!;
    }

    public class UserUpdateDto
    {
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid role_id { get; set; }
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string password { get; set; }
        public string? password_hash { get; set; }
        public string? phone_number { get; set; }
        public bool is_active { get; set; } = true;
    }

    public class UserProfileDto
    {
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid role_id { get; set; }
        public string role_name { get; set; } = string.Empty;
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string? phone_number { get; set; }
        public string? profile_picture_url { get; set; }
        public bool two_factor_enabled { get; set; }
        public DateTime created_at { get; set; }
    }

    public class UpdateMyProfileDto
    {
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string? phone_number { get; set; }
        public string? profile_picture_url { get; set; }
        public string? current_password { get; set; }
        public string? new_password { get; set; }
    }
}