@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "JAR_FILE=%SCRIPT_DIR%target\pdfusion-0.0.1.jar"

if not exist "%JAR_FILE%" (
    echo Jar file not found at "%JAR_FILE%".
    echo Building the project with Maven first...
    call "%SCRIPT_DIR%mvnw.cmd" -f "%SCRIPT_DIR%pom.xml" clean package -DskipTests
)

echo Starting PDFusion...
start "PDFusion" /D "%SCRIPT_DIR%" java -jar "%JAR_FILE%"

endlocal

