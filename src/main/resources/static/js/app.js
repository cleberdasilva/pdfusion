/**
 * PDFusion — Frontend Application
 *
 * Handles:
 *  - Drag-and-drop file detection on the drop zone
 *  - File browsing via the hidden <input>
 *  - Sortable list reordering via SortableJS
 *  - Individual file removal
 *  - Clear-all action
 *  - Sending files in order to the backend and triggering the download
 *  - User-friendly error messages
 */

'use strict';

// ── DOM References ──────────────────────────────────────────────────────────
const dropZone       = document.getElementById('drop-zone');
const fileInput      = document.getElementById('file-input');
const fileListSection = document.getElementById('file-list-section');
const fileListEl     = document.getElementById('file-list');
const fileCountBadge = document.getElementById('file-count');
const clearBtn       = document.getElementById('clear-btn');
const mergeBtn       = document.getElementById('merge-btn');
const errorBanner    = document.getElementById('error-banner');
const errorMessage   = document.getElementById('error-message');
const loadingOverlay = document.getElementById('loading-overlay');

// ── State ────────────────────────────────────────────────────────────────────
/** @type {{ id: string, file: File }[]} */
let fileEntries = [];
let idCounter   = 0;

// ── SortableJS Initialization ────────────────────────────────────────────────
/**
 * SortableJS enables drag-and-drop reordering of the file list rows.
 * The `handle` option restricts dragging to the ⠿ icon so clicks on
 * other parts of the row still work normally.
 */
const sortable = Sortable.create(fileListEl, {
    animation:  180,
    handle:     '.file-list__drag-handle',
    ghostClass: 'sortable-ghost',
    chosenClass:'sortable-chosen',
    onEnd() { refreshIndices(); }
});

// ── Drop Zone — Drag Events ──────────────────────────────────────────────────
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone--active');
});

dropZone.addEventListener('dragleave', (e) => {
    if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove('drop-zone--active');
    }
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone--active');
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
});

// Allow keyboard activation of the drop zone (Enter / Space)
dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
    }
});

dropZone.setAttribute('tabindex', '0');

// ── File Input (Browse Button) ───────────────────────────────────────────────
fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    addFiles(files);
    fileInput.value = ''; // reset so the same file can be re-added after removal
});

// ── Add Files ────────────────────────────────────────────────────────────────
/**
 * Validates and adds an array of File objects to the list.
 * @param {File[]} files
 */
function addFiles(files) {
    hideError();

    const rejected = [];

    files.forEach((file) => {
        if (!isPdf(file)) {
            rejected.push(file.name);
            return;
        }
        const entry = { id: `file-${++idCounter}`, file };
        fileEntries.push(entry);
        renderFileItem(entry);
    });

    if (rejected.length > 0) {
        showError(
            `The following file(s) were skipped because they are not PDFs: ${rejected.join(', ')}`
        );
    }

    refreshUI();
}

// ── Validate PDF ─────────────────────────────────────────────────────────────
/**
 * Quick client-side check: content type OR file extension must indicate PDF.
 * @param {File} file
 * @returns {boolean}
 */
function isPdf(file) {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

// ── Render File Item ─────────────────────────────────────────────────────────
/**
 * Creates and appends a list item for the given file entry.
 * @param {{ id: string, file: File }} entry
 */
function renderFileItem(entry) {
    const li = document.createElement('li');
    li.className = 'file-list__item';
    li.dataset.id = entry.id;
    li.setAttribute('role', 'listitem');

    li.innerHTML = `
        <span class="file-list__drag-handle" title="Drag to reorder" aria-hidden="true">⠿</span>
        <span class="file-list__index" aria-hidden="true"></span>
        <span class="file-list__icon" aria-hidden="true">📄</span>
        <span class="file-list__name" title="${escapeHtml(entry.file.name)}">${escapeHtml(entry.file.name)}</span>
        <span class="file-list__size">${formatFileSize(entry.file.size)}</span>
        <button type="button" class="file-list__remove" title="Remove file" aria-label="Remove ${escapeHtml(entry.file.name)}">✕</button>
    `;

    li.querySelector('.file-list__remove').addEventListener('click', () => removeFile(entry.id));
    fileListEl.appendChild(li);
}

// ── Remove File ──────────────────────────────────────────────────────────────
/**
 * Removes a file entry by its ID.
 * @param {string} id
 */
function removeFile(id) {
    fileEntries = fileEntries.filter((e) => e.id !== id);
    const li = fileListEl.querySelector(`[data-id="${id}"]`);
    if (li) li.remove();
    refreshUI();
}

// ── Clear All ────────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
    fileEntries = [];
    fileListEl.innerHTML = '';
    refreshUI();
    hideError();
});

// ── Refresh UI Visibility ────────────────────────────────────────────────────
/**
 * Shows or hides the file list section depending on whether there are files.
 * Also refreshes the file count badge and row indices.
 */
function refreshUI() {
    const count = fileEntries.length;
    fileListSection.hidden = count === 0;
    fileCountBadge.textContent = count === 1 ? '1 file' : `${count} files`;
    refreshIndices();
}

/**
 * Refreshes the 1-based index shown next to each row,
 * reading the current DOM order (which may differ from fileEntries after reordering).
 */
function refreshIndices() {
    const items = fileListEl.querySelectorAll('.file-list__item');
    items.forEach((item, i) => {
        item.querySelector('.file-list__index').textContent = i + 1;
    });
}

// ── Merge ─────────────────────────────────────────────────────────────────────
mergeBtn.addEventListener('click', mergePdfs);

async function mergePdfs() {
    hideError();

    // Read the current DOM order from the list (SortableJS may have reordered it)
    const orderedIds = Array.from(
        fileListEl.querySelectorAll('.file-list__item')
    ).map((li) => li.dataset.id);

    const orderedEntries = orderedIds
        .map((id) => fileEntries.find((e) => e.id === id))
        .filter(Boolean);

    if (orderedEntries.length < 2) {
        showError('Please add at least 2 PDF files before merging.');
        return;
    }

    const formData = new FormData();
    orderedEntries.forEach((entry) => {
        formData.append('files', entry.file, entry.file.name);
    });

    showLoading(true);

    try {
        const response = await fetch('/api/merge', {
            method: 'POST',
            body:   formData,
        });

        if (!response.ok) {
            const contentType = response.headers.get('Content-Type') || '';
            let message = `Server error (${response.status}).`;
            if (contentType.includes('application/json')) {
                const json = await response.json();
                message = json.error || message;
            }
            showError(message);
            return;
        }

        // Trigger file download
        const blob = await response.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'merged.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error('Merge request failed:', err);
        showError('Could not connect to the server. Please make sure the application is running and try again.');
    } finally {
        showLoading(false);
    }
}

// ── Error Helpers ─────────────────────────────────────────────────────────────
/**
 * Displays an error message in the fixed error banner.
 * @param {string} message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorBanner.hidden = false;
}

/** Hides the error banner. Exposed globally for the inline onclick in the HTML. */
function hideError() {
    errorBanner.hidden = true;
    errorMessage.textContent = '';
}

// ── Loading Helpers ───────────────────────────────────────────────────────────
function showLoading(visible) {
    loadingOverlay.hidden   = !visible;
    loadingOverlay.setAttribute('aria-hidden', String(!visible));
    mergeBtn.disabled       = visible;
    clearBtn.disabled       = visible;
}

// ── Utility ───────────────────────────────────────────────────────────────────
/**
 * Returns a human-readable file size string.
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Escapes HTML special characters to prevent XSS when inserting filenames into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

