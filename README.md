# PDFusion

PDFusion is a lightweight desktop-style web application for merging multiple PDF files into a single document. Users can drag and drop PDF files into an intuitive interface, freely reorder them to define the exact merge sequence, and generate a single combined PDF with one click. Built with Java 25, Spring Boot, and Apache PDFBox, PDFusion focuses on simplicity and speed for everyday document consolidation tasks.

## Features

- 🖱️ Drag-and-drop PDF upload
- 🔀 Reorder files before merging
- 📄 Merge two or more PDFs into a single downloadable file
- ✅ File validation (extension, MIME type, and PDF magic-byte header check)
- ⚡ Fast, in-memory merging powered by Apache PDFBox

## Tech Stack

- **Java 25**
- **Spring Boot 4.0.7** (Web MVC + Thymeleaf)
- **Apache PDFBox 3.0.8** for PDF merging
- **Lombok** for boilerplate reduction
- **Maven** (with the included Maven Wrapper `mvnw` / `mvnw.cmd`)

## Prerequisites

- JDK 25 installed and available on your `PATH` (needed to build the project or run the jar with `java -jar`)
- No local Maven installation needed — the project ships with the Maven Wrapper

## Running the Application

### Option 1: Quick start with `start-pdfusion.bat` (Windows)

The easiest way to run PDFusion on Windows is to use the included `start-pdfusion.bat` script:

1. Double-click `start-pdfusion.bat` in the project root, **or** run it from a terminal:
   ```powershell
   .\start-pdfusion.bat
   ```
2. The script will:
   - Check whether `target\pdfusion-0.0.1.jar` already exists.
   - If the jar is missing, it automatically builds the project first by running `mvnw.cmd clean package -DskipTests`.
   - Launch the application in a new window using `java -jar target\pdfusion-0.0.1.jar`.
3. Once started, open your browser at [http://localhost:8080](http://localhost:8080) to use the app.

> To force a rebuild (e.g. after code changes), delete `target\pdfusion-0.0.1.jar` (or run `mvnw clean package`) before executing the script again.

### Option 2: Run with Maven Wrapper directly

```powershell
.\mvnw.cmd spring-boot:run
```

### Option 3: Build and run the jar manually

```powershell
.\mvnw.cmd clean package -DskipTests
java -jar target\pdfusion-0.0.1.jar
```

The application starts on port `8080` by default: [http://localhost:8080](http://localhost:8080)

## Usage

1. Open the app in your browser.
2. Drag and drop (or select) at least **2 PDF files**.
3. Reorder the files as needed to define the merge sequence.
4. Click the merge button to download the combined `merged.pdf`.

## API

| Method | Endpoint      | Description                                                             |
|--------|---------------|--------------------------------------------------------------------------|
| GET    | `/`           | Serves the main web UI                                                  |
| POST   | `/api/merge`  | Accepts `multipart/form-data` with a `files` parameter (ordered list of PDFs) and returns the merged PDF as an attachment |

### Notes & Limits

- A minimum of 2 PDF files is required per merge request.
- Maximum upload size: 100MB per file, 500MB per request (configurable in `application.properties`).
- Each file is validated for a `.pdf` extension, correct MIME type, and a valid `%PDF` file header.

## Project Structure

```
src/main/java/com/pdfusion/
├── PdfusionApplication.java             # Spring Boot entry point
├── config/WebMvcConfig.java             # Web MVC configuration
├── controller/PdfMergeController.java   # UI + /api/merge endpoint
├── exception/                           # Custom exceptions & global handler
└── service/PdfMergeService.java         # PDF merge logic (Apache PDFBox)
```

## License

See [LICENSE](LICENSE) for details.

