# Manual Data Migration: PostgreSQL to H2

Since this project has moved to H2 file-based database, you may want to migrate your existing data from PostgreSQL.

## Steps

1. **Dump PostgreSQL Data**
   Run the following command to dump your data as SQL inserts:
   `ash
   pg_dump --column-inserts --data-only --username=myuser mydatabase > data_dump.sql
   `

2. **Start BookWiki**
   Run the application to ensure the H2 database file is initialized:
   `ash
   ./gradlew bootRun
   `

3. **Access H2 Console**
   Navigate to http://localhost:3906/h2-console.
   - **JDBC URL:** `jdbc:h2:file:./data/bookwiki`
   - **User:** `sa`
   - **Password:** (leave empty)

4. **Execute Dump**
   Open the data_dump.sql file, copy its contents, and run them in the H2 console SQL editor.
   *Note: You might need to adjust some PostgreSQL-specific syntax if any exists in your dump.*

5. **Verify**
   Check the tables in H2 to ensure data has been imported.
