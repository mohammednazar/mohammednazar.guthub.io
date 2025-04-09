function compressAndDownload() {
    const files = document.getElementById('file-input').files;
    const status = document.getElementById('status');

    if (!files.length) {
        status.textContent = "Please select JPEG files.";
        return;
    }

    status.textContent = "Compressing images...";

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `compressed_${file.name}`;
                    link.click();
                }, 'image/jpeg', 0.85);
            };
        };
        reader.readAsDataURL(file);
    });

    status.textContent = "Compression complete!";
}
