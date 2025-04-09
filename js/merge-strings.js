function mergeStrings() {
    const inputText = document.getElementById('merge-input').value.trim();
    const delimiter = document.getElementById('merge-delimiter').value;
    const resultDisplay = document.getElementById('merge-result');

    if (!inputText) {
        resultDisplay.textContent = "Please enter some text.";
        return;
    }

    const words = inputText
        .split(/\s+/) // split on any whitespace (spaces, newlines)
        .filter(word => word !== ''); // remove empty strings

    if (!delimiter && delimiter !== '') {
        resultDisplay.textContent = "Please enter a delimiter.";
        return;
    }

    resultDisplay.textContent = words.join(delimiter);
}
