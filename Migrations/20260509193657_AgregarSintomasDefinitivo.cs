using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApiDemo2.Migrations
{
    /// <inheritdoc />
    public partial class AgregarSintomasDefinitivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Sintomas",
                table: "Triaje_Jeison",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Sintomas",
                table: "Triaje_Jeison");
        }
    }
}
