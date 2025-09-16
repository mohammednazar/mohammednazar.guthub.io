// Robust PDF splitter using pdf-lib + JSZip
// Exposes: window.splitPdf() and window.splitPdfToZip()

(function () {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  function getEls() {
    const input = document.getElementById('pdf-input');
    const status = document.getElementById('split-status');
    if (!input) throw new Error('Missing <input id="pdf-input"> in the page.');
    if (!status) throw new Error('Missing <p id="split-status"> in the page.');
    return { input, status };
  }

  function checkDeps() {
    const hasPDFLib = !!(window.PDFLib && window.PDFLib.PDFDocument);
    const hasJSZip  = !!window.JSZip;
    if (!hasPDFLib && !hasJSZip) {
      throw new Error('Missing pdf-lib and JSZip. Include both CDN scripts before this file.');
    }
    if (!hasPDFLib) throw new Error('Missing pdf-lib. Include its CDN script before this file.');
    if (!hasJSZip) throw new Error('Missing JSZip. Include its CDN script before this file.');
  }

  async function loadPdfFromFile(file) {
    const { PDFDocument } = window.PDFLib;
    const buf = await file.arrayBuffer();
    if (!buf || buf.byteLength === 0) {
      throw new Error(`"${file.name}" appears empty or unreadable.`);
    }
    try {
      // Try to load even if flagged encrypted
      return await PDFDocument.load(buf, { ignoreEncryption: true });
    } catch {
      // Truly password-protected
      throw new Error(
        `"${file.name}" is encrypted/password-protected. Unlock (remove security) and try again.`
      );
    }
  }

  async function splitToZipImpl(pdfDoc, baseName, status) {
    const JSZip = window.JSZip;
    const total = pdfDoc.getPageCount();
    if (total === 0) throw new Error('The PDF has 0 pages.');

    const zip = new JSZip();
    const { PDFDocument } = window.PDFLib;

    for (let i = 0; i < total; i++) {
      // Yield to UI occasionally for big files
      if (i % 10 === 0) await delay(0);

      const newDoc = await PDFDocument.create();
      const [page] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(page);
      const pdfBytes = await newDoc.save();

      zip.file(`page_${String(i + 1).padStart(3, '0')}.pdf`, pdfBytes);
      status.textContent = `Building ZIP… (${i + 1}/${total})`;
    }

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}-split_${total}_pages.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    status.textContent = `✅ ${total} pages split and zipped successfully!`;
  }

  async function splitPerPageImpl(pdfDoc, baseName, status) {
    const total = pdfDoc.getPageCount();
    if (total === 0) throw new Error('The PDF has 0 pages.');

    const { PDFDocument } = window.PDFLib;

    for (let i = 0; i < total; i++) {
      // Yield to UI every few pages
      if (i % 5 === 0) await delay(0);

      const newDoc = await PDFDocument.create();
      const [page] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(page);
      const pdfBytes = await newDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${baseName}-page_${String(i + 1).padStart(3, '0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 0);

      status.textContent = `Downloading pages… (${i + 1}/${total})`;
      // Small delay helps avoid browser throttling of multiple downloads
      await delay(200);
    }

    status.textContent = '✅ PDF split completed! All files downloaded.';
  }

  async function splitCore(mode /* 'zip' | 'perpage' */) {
    const { input, status } = getEls();
    try { checkDeps(); } catch (e) { status.textContent = `Error: ${e.message}`; return; }

    if (!input.files || input.files.length === 0) {
      status.textContent = 'Select a PDF file first!';
      return;
    }

    const file = input.files[0];
    const baseName = (file.name || 'document').replace(/\.pdf$/i, '') || 'document';

    try {
      status.textContent = mode === 'zip'
        ? 'Preparing to split into ZIP…'
        : 'Preparing to split into individual files…';

      const pdfDoc = await loadPdfFromFile(file);
      const total = pdfDoc.getPageCount();
      if (total > 500) {
        status.textContent = `Large PDF detected (${total} pages). This may take a while…`;
        await delay(400);
      }

      if (mode === 'zip') {
        await splitToZipImpl(pdfDoc, baseName, status);
      } else {
        await splitPerPageImpl(pdfDoc, baseName, status);
      }
    } catch (err) {
      console.error(err);
      status.textContent = `Error: ${err.message || String(err)}`;
    }
  }

  // Public functions used by the buttons / inline onclick
  window.splitPdfToZip = function () {
    return splitCore('zip');
  };
  window.splitPdf = function () {
    return splitCore('perpage');
  };

  // Optional: keyboard Enter to start split-per-page
  window.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('pdf-input');
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') splitCore('perpage'); });
  });
})();
