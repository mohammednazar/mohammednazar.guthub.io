async function convertHeicToJpeg() {
    const input = document.getElementById("heic-input");
    const status = document.getElementById("convert-status");
    status.textContent = "";

    if (!input.files.length) {
        status.textContent = "Please select HEIC files first.";
        return;
    }

    for (const file of input.files) {
        console.log(`Attempting to convert file: ${file.name}`);
        console.log(`Type: ${file.type}, Size: ${file.size} bytes`);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: file.type || "image/heic" });
            console.log("Blob created:", blob);

            const jpegBlob = await heic2any({
                blob: blob,
                toType: "image/jpeg",
                quality: 0.9
            });

            console.log(`Conversion successful for: ${file.name}`);
            const a = document.createElement("a");
            a.href = URL.createObjectURL(jpegBlob);
            a.download = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            console.error(`❌ Error converting ${file.name}:`, err);
            status.textContent += `\n❌ Failed to convert ${file.name}: ${err.message || err}`;
        }
    }

    status.textContent += "\n✅ Conversion process finished!";
}
