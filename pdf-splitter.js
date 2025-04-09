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

    for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFLib.PDFDocument.create();
        const [page] = await newDoc.copyPages(pdfDoc, [i]);
        newDoc.addPage(page);
        const pdfBytes = await newDoc.save();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
        link.download = `page_${i + 1}.pdf`;
        link.click();
    }

    status.textContent = "PDF split completed! Files downloaded.";
}
