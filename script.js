function compressAndDownload() {
    const files = document.getElementById('file-input').files;
    const status = document.getElementById('status');

    if (files.length === 0) {
        status.textContent = "Please select at least one JPEG file.";
        return;
    }

    status.textContent = "Compressing...";

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                canvas.toBlob(function(blob) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = "compressed_" + file.name;
                    link.click();
                }, 'image/jpeg', 0.85); // Adjust quality as desired
            }
        };
    });

    status.textContent = "Compression complete! Files downloading.";
}
