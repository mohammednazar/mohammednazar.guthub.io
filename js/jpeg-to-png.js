function convertToPng() {
    const input = document.getElementById('jpeg-input');
    const status = document.getElementById('convert-status');

    if (!input.files.length) {
        status.textContent = "Please select JPEG files.";
        return;
    }

    status.textContent = "Converting to PNG, please wait...";

    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob(blob => {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = file.name.replace(/\.(jpeg|jpg)$/i, '.png');
                    link.click();
                }, 'image/png');
            };
        };
        reader.readAsDataURL(file);
    });

    status.textContent = "Conversion complete! PNG files downloaded.";
}
