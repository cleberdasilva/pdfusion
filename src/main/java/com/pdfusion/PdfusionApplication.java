package com.pdfusion;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;

@SpringBootApplication
public class PdfusionApplication {

	private static final Logger log = LoggerFactory.getLogger(PdfusionApplication.class);

	private final Environment environment;

	public PdfusionApplication(Environment environment) {
		this.environment = environment;
	}

	public static void main(String[] args) {
		SpringApplication.run(PdfusionApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void openBrowserOnStartup() {
		String port = environment.getProperty("server.port", "8080");
		String contextPath = environment.getProperty("server.servlet.context-path", "");
		String url = "http://localhost:" + port + contextPath;
		openBrowser(url);
	}

	private void openBrowser(String url) {
		try {
			if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
				Desktop.getDesktop().browse(URI.create(url));
				return;
			}
			openBrowserFallback(url);
		} catch (Exception e) {
			log.warn("Could not automatically open the browser at {}: {}", url, e.getMessage());
		}
	}

	private void openBrowserFallback(String url) throws IOException {
		String os = System.getProperty("os.name", "").toLowerCase();
		Runtime runtime = Runtime.getRuntime();
		if (os.contains("win")) {
			runtime.exec(new String[]{"rundll32", "url.dll,FileProtocolHandler", url});
		} else if (os.contains("mac")) {
			runtime.exec(new String[]{"open", url});
		} else {
			runtime.exec(new String[]{"xdg-open", url});
		}
	}

}
