// js/pdf-merger.js
async function mergePdfs() {
  const statusEl = document.getElementById('merge-status');
  const input = document.getElementById('pdf-input');

  // Basic validation
  if (!input.files || input.files.length < 2) {
    statusEl.textContent = 'Please select at least two PDF files.';
    return;
  }

  statusEl.textContent = 'Merging...';

  try {
    // pdf-lib globals live under window.PDFLib
    const { PDFDocument } = window.PDFLib;
    if (!PDFDocument) {
      throw new Error('pdf-lib failed to load. Check the <script> CDN URL.');
    }

    // Create a new PDF to hold the merged pages
    const mergedPdf = await PDFDocument.create();

    // Optional: sort files by name so order is predictable
    const files = Array.from(input.files).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    for (const file of files) {
      // Read the file
      const arrayBuffer = await file.arrayBuffer();

      // Load the source PDF
      const srcPdf = await PDFDocument.load(arrayBuffer);

      // Copy all pages to the merged doc
      const srcPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
      srcPages.forEach((p) => mergedPdf.addPage(p));
    }

    // Serialize the merged PDF to bytes
    const mergedBytes = await mergedPdf.save();

    // Trigger a download
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Name the merged file using first + count
    const firstName = files[0].name.replace(/\.pdf$/i, '');
    const fileName = `${firstName}-merged-${files.length}.pdf`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    statusEl.textContent = `Done! Downloaded "${fileName}".`;
  } catch (err) {
    console.error(err);
    // Common pitfalls explained for quick debugging
    // 1) "PDFDocument is not defined" -> use window.PDFLib.PDFDocument
    // 2) CORS errors -> only if you try to fetch remote PDFs; local file input is fine
    // 3) Script not found -> check js/pdf-merger.js path and that it's served by your server
    statusEl.textContent = `Error: ${err.message}`;
  }
}
