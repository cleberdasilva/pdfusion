package com.pdfusion.controller;

import com.pdfusion.service.PdfMergeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller responsible for serving the main UI page and
 * handling PDF merge requests.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class PdfMergeController {

    private final PdfMergeService pdfMergeService;

    /**
     * Serves the main application page.
     */
    @GetMapping("/")
    public String index() {
        return "index";
    }

    /**
     * Accepts an ordered list of PDF files via multipart form data,
     * merges them using PDFBox, and returns the result as a downloadable PDF.
     *
     * @param files ordered list of PDF files to merge
     * @return merged PDF file as a byte array response
     */
    @ResponseBody
    @PostMapping(value = "/api/merge", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> mergePdfs(@RequestParam("files") List<MultipartFile> files) {
        log.info("Received merge request with {} file(s)", files.size());

        byte[] mergedPdf = pdfMergeService.mergePdfs(files);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename("merged.pdf").build()
        );
        headers.setContentLength(mergedPdf.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(mergedPdf);
    }
}

