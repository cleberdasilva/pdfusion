# PDFusion — Build & Run Guide

A local web application to merge multiple PDF files into one, with a drag-and-drop interface.

---

## Prerequisites

Make sure the following tools are installed on your machine before proceeding:

| Tool | Version | Download |
|------|---------|----------|
| **Java (JDK)** | 25 or higher | https://adoptium.net |
| **Git** | Any recent version | https://git-scm.com |

> Maven does **not** need to be installed separately — the project includes the **Maven Wrapper** (`mvnw` / `mvnw.cmd`), which downloads the correct Maven version automatically on the first run.

---

## Clone the Repository

```bash
git clone https://github.com/<your-username>/pdfusion.git
cd pdfusion
```

---

## Run the Application

### On Windows

```cmd
.\mvnw.cmd spring-boot:run
```

### On Linux / macOS

```bash
./mvnw spring-boot:run
```

The first run will download all Maven dependencies automatically (internet connection required). This may take a minute or two.

Once started, you will see a log line like:

```
Started PdfusionApplication in X.XXX seconds
```

Open your browser and go to:

```
http://localhost:8080
```

---

## Build a Runnable JAR (optional)

To package the application into a single executable JAR:

### On Windows

```cmd
.\mvnw.cmd package -DskipTests
```

### On Linux / macOS

```bash
./mvnw package -DskipTests
```

The JAR will be generated at:

```
target/pdfusion-0.0.1.jar
```

Run it with:

```bash
java -jar target/pdfusion-0.0.1.jar
```

Then access the app at `http://localhost:8080` as usual.

---

## How to Use

1. Open `http://localhost:8080` in your browser.
2. Drag and drop your PDF files onto the upload area, or click **Browse Files**.
3. Reorder the files by dragging rows up or down — the merge follows the top-to-bottom order.
4. Remove any unwanted file by clicking the **✕** button on its row.
5. Click **Merge PDFs** to combine the files.
6. The merged PDF (`merged.pdf`) will download automatically.

---

## Configuration

The following properties can be adjusted in `src/main/resources/application.properties`:

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | `8080` | HTTP port the application listens on |
| `spring.servlet.multipart.max-file-size` | `100MB` | Maximum size per uploaded file |
| `spring.servlet.multipart.max-request-size` | `500MB` | Maximum total upload size per request |

---

## Tech Stack

- **Java 25**
- **Spring Boot 4.0.7** (Spring MVC + Thymeleaf)
- **Apache PDFBox 3.x** — PDF merging
- **SortableJS** — drag-and-drop list reordering (loaded from CDN)
- **Lombok** — boilerplate reduction

