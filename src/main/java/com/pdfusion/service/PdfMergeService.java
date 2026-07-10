package com.pdfusion.service;

import com.pdfusion.exception.PdfMergeException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Service responsible for merging multiple PDF files into a single PDF
 * using Apache PDFBox.
 */
@Slf4j
@Service
public class PdfMergeService {

    private static final String PDF_MIME_TYPE = "application/pdf";
    private static final String PDF_EXTENSION = ".pdf";
    private static final byte[] PDF_MAGIC_BYTES = {'%', 'P', 'D', 'F'};

    /**
     * Merges the given list of PDF files in the order they are provided.
     *
     * @param files ordered list of PDF files to merge
     * @return byte array representing the merged PDF document
     * @throws PdfMergeException if any file is invalid or the merge operation fails
     */
    public byte[] mergePdfs(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new PdfMergeException("No PDF files were provided. Please add at least one file.");
        }

        if (files.size() < 2) {
            throw new PdfMergeException("At least 2 PDF files are required to perform a merge.");
        }

        log.info("Starting PDF merge for {} files", files.size());

        for (MultipartFile file : files) {
            validatePdfFile(file);
        }

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
             PDDocument mergedDocument = new PDDocument()) {

            PDFMergerUtility merger = new PDFMergerUtility();

            for (MultipartFile file : files) {
                log.debug("Adding file to merge queue: {}", file.getOriginalFilename());
                try (PDDocument sourceDocument = Loader.loadPDF(file.getBytes())) {
                    merger.appendDocument(mergedDocument, sourceDocument);
                }
            }

            mergedDocument.save(outputStream);

            byte[] result = outputStream.toByteArray();
            log.info("PDF merge completed successfully. Output size: {} bytes", result.length);
            return result;

        } catch (IOException ex) {
            log.error("I/O error during PDF merge: {}", ex.getMessage(), ex);
            throw new PdfMergeException(
                    "Failed to merge the PDF files. One or more files may be corrupted or password-protected.", ex);
        }
    }

    /**
     * Validates that the given file is a non-empty, valid PDF.
     */
    private void validatePdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new PdfMergeException("One of the provided files is empty.");
        }

        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();

        boolean hasValidExtension = filename != null && filename.toLowerCase().endsWith(PDF_EXTENSION);
        boolean hasValidContentType = PDF_MIME_TYPE.equalsIgnoreCase(contentType);

        if (!hasValidExtension && !hasValidContentType) {
            throw new PdfMergeException(
                    String.format("File \"%s\" is not a PDF. Only PDF files (.pdf) are accepted.", filename));
        }

        // Validate PDF magic bytes (%PDF header)
        try {
            byte[] bytes = file.getBytes();
            if (bytes.length < 4
                    || bytes[0] != PDF_MAGIC_BYTES[0]
                    || bytes[1] != PDF_MAGIC_BYTES[1]
                    || bytes[2] != PDF_MAGIC_BYTES[2]
                    || bytes[3] != PDF_MAGIC_BYTES[3]) {
                throw new PdfMergeException(
                        String.format("File \"%s\" does not appear to be a valid PDF (invalid file header).", filename));
            }
        } catch (IOException ex) {
            throw new PdfMergeException(
                    String.format("Could not read file \"%s\": %s", filename, ex.getMessage()), ex);
        }

        log.debug("File validated successfully: {}", filename);
    }
}

