async function convertHeicToJpeg() {
    const input = document.getElementById("heic-input");
    const status = document.getElementById("convert-status");
    status.textContent = "Processing...";

    if (!input.files.length) {
        status.textContent = "Please select HEIC files first.";
        return;
    }

    let successCount = 0;
    let failList = [];

    for (const file of input.files) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const jpegBlob = await heic2any({
                blob: new Blob([arrayBuffer]),
                toType: "image/jpeg",
                quality: 0.9
            });

            const a = document.createElement("a");
            a.href = URL.createObjectURL(jpegBlob);
            a.download = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            successCount++;
        } catch (err) {
            console.error(`❌ Failed to convert ${file.name}:`, err);
            failList.push(file.name);
        }
    }

    let message = `${successCount} file(s) converted successfully.`;
    if (failList.length) {
        message += `\nFailed to convert: ${failList.join(", ")}`;
    }
    status.textContent = message;
}
