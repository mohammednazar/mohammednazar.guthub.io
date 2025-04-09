const STORAGE_KEY = 'monthlyExpenses';

document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    setupListeners();
    calculateTotals();
});

function setupListeners() {
    const rows = document.querySelectorAll('#expenses-table tbody tr');

    rows.forEach((row) => {
        const amountInput = row.cells[1].querySelector('input');
        const paidSelect = row.cells[2].querySelector('select');

        amountInput.addEventListener('input', () => {
            saveExpenses();
            calculateTotals();
        });

        paidSelect.addEventListener('change', () => {
            saveExpenses();
            calculateTotals();
        });
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

function calculateTotals() {
    const rows = document.querySelectorAll('#expenses-table tbody tr');

    let totalAmount = 0;
    let unpaidAmount = 0;

    rows.forEach(row => {
        const amount = parseFloat(row.cells[1].querySelector('input').value) || 0;
        const paid = row.cells[2].querySelector('select').value;

        totalAmount += amount;
        if (paid === 'no') unpaidAmount += amount;

        // Highlight paid rows
        if (paid === 'yes') {
            row.style.backgroundColor = '#d4edda'; // light green
        } else {
            row.style.backgroundColor = ''; // reset
        }
    });

    document.getElementById('total-amount').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('total-unpaid').textContent = `Unpaid: $${unpaidAmount.toFixed(2)}`;
}

function clearExpenses() {
    localStorage.removeItem(STORAGE_KEY);

    const rows = document.querySelectorAll('#expenses-table tbody tr');
    rows.forEach(row => {
        row.cells[1].querySelector('input').value = '';
        row.cells[2].querySelector('select').value = 'no';
        row.style.backgroundColor = '';
    });

    calculateTotals();
    alert("Cleared all expenses. Ready for next month!");
}
