const STORAGE_KEY = 'monthlyExpenses';

document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    setupListeners();
});

function setupListeners() {
    const rows = document.querySelectorAll('#expenses-table tbody tr');

    rows.forEach((row, index) => {
        const amountInput = row.cells[1].querySelector('input');
        const paidSelect = row.cells[2].querySelector('select');

        amountInput.addEventListener('input', () => saveExpenses());
        paidSelect.addEventListener('change', () => saveExpenses());
    });
}

function saveExpenses() {
    const rows = document.querySelectorAll('#expenses-table tbody tr');
    const expenses = [];

    rows.forEach(row => {
        const name = row.cells[0].textContent.trim();
        const amount = row.cells[1].querySelector('input').value.trim();
        const paid = row.cells[2].querySelector('select').value;

        expenses.push({ name, amount, paid });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadExpenses() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const expenses = JSON.parse(stored);
    const rows = document.querySelectorAll('#expenses-table tbody tr');

    rows.forEach((row, index) => {
        if (expenses[index]) {
            row.cells[1].querySelector('input').value = expenses[index].amount;
            row.cells[2].querySelector('select').value = expenses[index].paid;
        }
    });
}

function clearExpenses() {
    localStorage.removeItem(STORAGE_KEY);

    const rows = document.querySelectorAll('#expenses-table tbody tr');
    rows.forEach(row => {
        row.cells[1].querySelector('input').value = '';
        row.cells[2].querySelector('select').value = 'no';
    });

    alert("Cleared all expenses. Ready for next month!");
}
