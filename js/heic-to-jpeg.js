async function convertHeicToJpeg() {
    const input = document.getElementById("heic-input");
    const status = document.getElementById("convert-status");
    status.textContent = "";

    if (!input.files.length) {
        status.textContent = "Please select HEIC files first.";
        return;
    }

    for (const file of input.files) {
        try {
            const jpegBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.9
            });

            const a = document.createElement("a");
            a.href = URL.createObjectURL(jpegBlob);
            a.download = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            console.error("Error converting", file.name, err);
            status.textContent += `\nFailed to convert ${file.name}`;
        }
    }

    status.textContent += "\nConversion complete!";
}
