async function splitPdfToZip() {
    const input = document.getElementById('pdf-input');
    const status = document.getElementById('split-status');

    if (!input.files.length) {
        status.textContent = "Select a PDF file first!";
        return;
    }

    const file = input.files[0];
    status.textContent = "Splitting PDF and generating ZIP...";

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFLib.PDFDocument.create();
        const [page] = await newDoc.copyPages(pdfDoc, [i]);
        newDoc.addPage(page);
        const pdfBytes = await newDoc.save();
        zip.file(`page_${i + 1}.pdf`, pdfBytes);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipLink = document.createElement('a');
    zipLink.href = URL.createObjectURL(zipBlob);
    zipLink.download = `split_pages.zip`;
    zipLink.click();

    status.textContent = `✅ ${totalPages} pages split and zipped successfully!`;
}


async function splitPdf() {
    const input = document.getElementById('pdf-input');
    const status = document.getElementById('split-status');

    if (!input.files.length) {
        status.textContent = "Select a PDF file first!";
        return;
    }

    const file = input.files[0];
    status.textContent = "Splitting PDF, please wait...";

    const pdfDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const totalPages = pdfDoc.getPageCount();

    // Helper to delay download per page
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFLib.PDFDocument.create();
        const [page] = await newDoc.copyPages(pdfDoc, [i]);
        newDoc.addPage(page);
        const pdfBytes = await newDoc.save();

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `page_${i + 1}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await delay(300); // 300ms delay to prevent browser blocking
    }

    status.textContent = "✅ PDF split completed! All files downloaded.";
}
