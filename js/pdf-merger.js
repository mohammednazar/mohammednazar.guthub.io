// js/pdf-merger.js

// Optional: keep file order by name (natural sort)
function sortFilesByName(files) {
  return Array.from(files).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );
}

async function mergePdfs() {
  const statusEl = document.getElementById('merge-status');
  const inputEl = document.getElementById('pdf-input');
  statusEl.textContent = '';

  if (!inputEl || !inputEl.files || inputEl.files.length < 2) {
    statusEl.textContent = 'Please select at least two PDF files.';
    return;
  }

  // Ensure pdf-lib is available
  const PDFLib = window.PDFLib || {};
  const PDFDocument = PDFLib.PDFDocument;
  if (!PDFDocument) {
    statusEl.textContent = 'Error: pdf-lib failed to load. Check the CDN <script> tag.';
    return;
  }

  const files = sortFilesByName(inputEl.files);
  statusEl.textContent = `Merging ${files.length} PDFs…`;

  try {
    const merged = await PDFDocument.create();

    for (const file of files) {
      const ab = await file.arrayBuffer();
      if (!ab || ab.byteLength === 0) {
        throw new Error(`"${file.name}" appears empty or unreadable.`);
      }

      let src;
      try {
        // Key: attempt to load even if flagged encrypted
        src = await PDFDocument.load(ab, { ignoreEncryption: true });
      } catch {
        // If we still fail here, it’s almost certainly password-protected.
        throw new Error(
          `The file "${file.name}" is encrypted/password-protected. ` +
          `Please unlock it (remove security) and try again.`
        );
      }

      // Copy every page
      const pageIndices = src.getPageIndices();
      const pages = await merged.copyPages(src, pageIndices);
      pages.forEach((p) => merged.addPage(p));
    }

    // Save & download
    const bytes = await merged.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const firstBase = files[0].name.replace(/\.pdf$/i, '') || 'merged';
    const outName = `${firstBase}-merged-${files.length}.pdf`;

    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    statusEl.textContent = `Done! Downloaded “${outName}”.`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error: ${err.message || String(err)}`;
  }
}

// If you keep the inline onclick in HTML, make it global:
window.mergePdfs = mergePdfs;

// Also wire up the button (in case you prefer addEventListener)
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('merge-btn');
  const input = document.getElementById('pdf-input');
  if (btn) btn.addEventListener('click', mergePdfs);
  if (input) input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') mergePdfs();
  });
});
