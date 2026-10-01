using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeSectionIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "two_factor_enabled",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "two_factor_secret",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "login_background_url",
                table: "tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "primary_color",
                table: "tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "biometric_id",
                table: "students",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "house_name",
                table: "students",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "rfid_card_id",
                table: "students",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "check_in_time",
                table: "student_attendance",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "check_out_time",
                table: "student_attendance",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "fine_amount",
                table: "student_attendance",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "is_half_day",
                table: "student_attendance",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_late",
                table: "student_attendance",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "fine_amount",
                table: "staff_attendance",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "is_half_day",
                table: "staff_attendance",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_late",
                table: "staff_attendance",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "latitude",
                table: "staff_attendance",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "location_address",
                table: "staff_attendance",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "longitude",
                table: "staff_attendance",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "biometric_id",
                table: "staff",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "rfid_card_id",
                table: "staff",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_locked",
                table: "exam_setups",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "assignment_marks",
                table: "exam_marks",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "practical_marks",
                table: "exam_marks",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "theory_marks",
                table: "exam_marks",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "holidays",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_holidays", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "house_point_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    house_name = table.Column<string>(type: "text", nullable: false),
                    student_id = table.Column<Guid>(type: "uuid", nullable: true),
                    points = table.Column<int>(type: "integer", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    awarded_by = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_house_point_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "lesson_plans",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    class_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    teacher_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    target_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    completion_percentage = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lesson_plans", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "live_classes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    class_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    teacher_id = table.Column<Guid>(type: "uuid", nullable: false),
                    topic = table.Column<string>(type: "text", nullable: false),
                    platform = table.Column<string>(type: "text", nullable: false),
                    meeting_link = table.Column<string>(type: "text", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_live_classes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "online_exam_questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    online_exam_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_bank_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_online_exam_questions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "online_exams",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    class_id = table.Column<Guid>(type: "uuid", nullable: false),
                    section_id = table.Column<Guid>(type: "uuid", nullable: true),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    exam_setup_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    exam_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    total_marks = table.Column<int>(type: "integer", nullable: false),
                    passing_marks = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_online_exams", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "question_banks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    class_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_text = table.Column<string>(type: "text", nullable: false),
                    option_a = table.Column<string>(type: "text", nullable: false),
                    option_b = table.Column<string>(type: "text", nullable: false),
                    option_c = table.Column<string>(type: "text", nullable: false),
                    option_d = table.Column<string>(type: "text", nullable: false),
                    correct_option = table.Column<string>(type: "text", nullable: false),
                    marks = table.Column<int>(type: "integer", nullable: false),
                    difficulty_level = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_question_banks", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_diaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_id = table.Column<Guid>(type: "uuid", nullable: false),
                    class_id = table.Column<Guid>(type: "uuid", nullable: false),
                    section_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    remarks = table.Column<string>(type: "text", nullable: false),
                    homework_summary = table.Column<string>(type: "text", nullable: true),
                    conduct = table.Column<string>(type: "text", nullable: true),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_diaries", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_exam_attempts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    online_exam_id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false),
                    responses_json = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_exam_attempts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_medical_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_id = table.Column<Guid>(type: "uuid", nullable: false),
                    allergies = table.Column<string>(type: "text", nullable: true),
                    chronic_conditions = table.Column<string>(type: "text", nullable: true),
                    vaccination_status = table.Column<string>(type: "text", nullable: true),
                    family_medical_history = table.Column<string>(type: "text", nullable: true),
                    emergency_contact_name = table.Column<string>(type: "text", nullable: true),
                    emergency_contact_phone = table.Column<string>(type: "text", nullable: true),
                    emergency_contact_relation = table.Column<string>(type: "text", nullable: true),
                    doctor_name = table.Column<string>(type: "text", nullable: true),
                    doctor_phone = table.Column<string>(type: "text", nullable: true),
                    additional_notes = table.Column<string>(type: "text", nullable: true),
                    last_updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_medical_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_subject_attendance",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_id = table.Column<Guid>(type: "uuid", nullable: false),
                    timetable_period_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    remarks = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_subject_attendance", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_subjects",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_id = table.Column<Guid>(type: "uuid", nullable: false),
                    class_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_elective = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "study_materials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    class_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    material_type = table.Column<string>(type: "text", nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: true),
                    video_url = table.Column<string>(type: "text", nullable: true),
                    uploaded_by = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_study_materials", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "holidays");

            migrationBuilder.DropTable(
                name: "house_point_logs");

            migrationBuilder.DropTable(
                name: "lesson_plans");

            migrationBuilder.DropTable(
                name: "live_classes");

            migrationBuilder.DropTable(
                name: "online_exam_questions");

            migrationBuilder.DropTable(
                name: "online_exams");

            migrationBuilder.DropTable(
                name: "question_banks");

            migrationBuilder.DropTable(
                name: "student_diaries");

            migrationBuilder.DropTable(
                name: "student_exam_attempts");

            migrationBuilder.DropTable(
                name: "student_medical_records");

            migrationBuilder.DropTable(
                name: "student_subject_attendance");

            migrationBuilder.DropTable(
                name: "student_subjects");

            migrationBuilder.DropTable(
                name: "study_materials");

            migrationBuilder.DropColumn(
                name: "two_factor_enabled",
                table: "users");

            migrationBuilder.DropColumn(
                name: "two_factor_secret",
                table: "users");

            migrationBuilder.DropColumn(
                name: "login_background_url",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "primary_color",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "biometric_id",
                table: "students");

            migrationBuilder.DropColumn(
                name: "house_name",
                table: "students");

            migrationBuilder.DropColumn(
                name: "rfid_card_id",
                table: "students");

            migrationBuilder.DropColumn(
                name: "check_in_time",
                table: "student_attendance");

            migrationBuilder.DropColumn(
                name: "check_out_time",
                table: "student_attendance");

            migrationBuilder.DropColumn(
                name: "fine_amount",
                table: "student_attendance");

            migrationBuilder.DropColumn(
                name: "is_half_day",
                table: "student_attendance");

            migrationBuilder.DropColumn(
                name: "is_late",
                table: "student_attendance");

            migrationBuilder.DropColumn(
                name: "fine_amount",
                table: "staff_attendance");

            migrationBuilder.DropColumn(
                name: "is_half_day",
                table: "staff_attendance");

            migrationBuilder.DropColumn(
                name: "is_late",
                table: "staff_attendance");

            migrationBuilder.DropColumn(
                name: "latitude",
                table: "staff_attendance");

            migrationBuilder.DropColumn(
                name: "location_address",
                table: "staff_attendance");

            migrationBuilder.DropColumn(
                name: "longitude",
                table: "staff_attendance");

            migrationBuilder.DropColumn(
                name: "biometric_id",
                table: "staff");

            migrationBuilder.DropColumn(
                name: "rfid_card_id",
                table: "staff");

            migrationBuilder.DropColumn(
                name: "is_locked",
                table: "exam_setups");

            migrationBuilder.DropColumn(
                name: "assignment_marks",
                table: "exam_marks");

            migrationBuilder.DropColumn(
                name: "practical_marks",
                table: "exam_marks");

            migrationBuilder.DropColumn(
                name: "theory_marks",
                table: "exam_marks");
        }
    }
}
