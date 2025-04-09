async function mergePdfs() {
    const input = document.getElementById('pdf-input');
    const status = document.getElementById('merge-status');

    if (!input.files.length || input.files.length < 2) {
        status.textContent = "Select at least two PDF files.";
        return;
    }

    status.textContent = "Merging PDFs, please wait...";

    const mergedPdf = await PDFLib.PDFDocument.create();

    // Sort files based on filename (assuming format page_#.pdf)
    const files = Array.from(input.files).sort((a, b) => {
        const aNum = parseInt(a.name.match(/\d+/)[0]);
        const bNum = parseInt(b.name.match(/\d+/)[0]);
        return aNum - bNum;
    });

    for (const file of files) {
        const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    download(mergedBytes, 'merged_pdf.pdf');

    status.textContent = "PDF merging complete!";
}

// Utility function to download PDF
function download(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
