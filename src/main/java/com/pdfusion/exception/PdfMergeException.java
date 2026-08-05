package com.pdfusion.exception;

/**
 * Exception thrown when a PDF merge operation fails validation or processing.
 */
public class PdfMergeException extends RuntimeException {

    public PdfMergeException(String message) {
        super(message);
    }

    public PdfMergeException(String message, Throwable cause) {
        super(message, cause);
    }
}

