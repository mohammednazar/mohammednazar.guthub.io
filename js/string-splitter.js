function splitString() {
    const inputString = document.getElementById('input-text').value.trim();
    const delimiter = document.getElementById('delimiter').value;
    const outputList = document.getElementById('output-list');

    outputList.innerHTML = '';

    if (!inputString) {
        outputList.innerHTML = '<li>Please enter a string to split.</li>';
        return;
    }

    if (!delimiter) {
        outputList.innerHTML = '<li>Please enter a delimiter.</li>';
        return;
    }

    let regex;
    try {
        regex = new RegExp(delimiter);  // allows advanced patterns like "\s+" or ","
    } catch (error) {
        outputList.innerHTML = `<li>Invalid regular expression: ${error.message}</li>`;
        return;
    }

    const parts = inputString.split(regex).map(s => s.trim());

    parts.forEach((part, i) => {
        const li = document.createElement('li');
        li.textContent = `${part}`;
        outputList.appendChild(li);
    });
}
