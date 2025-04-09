const STORAGE_KEY = 'monthlyExpenses';

document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    setupListeners();
    calculateTotals();
});

function setupListeners() {
    const rows = document.querySelectorAll('#expenses-table tbody tr');
    rows.forEach(row => {
        const amountInput = row.cells[1].querySelector('input');
        const paidSelect = row.cells[2].querySelector('select');
        const dueDateInput = row.cells[3].querySelector('input');

        amountInput.addEventListener('input', () => {
            saveExpenses();
            calculateTotals();
        });
        paidSelect.addEventListener('change', () => {
            saveExpenses();
            calculateTotals();
        });
        dueDateInput.addEventListener('change', () => {
            saveExpenses();
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
        const dueDate = row.cells[3].querySelector('input').value.trim();
        expenses.push({ name, amount, paid, dueDate });
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
            row.cells[3].querySelector('input').value = expenses[index].dueDate || '';
        }
    });
}

function calculateTotals() {
    const rows = document.querySelectorAll('#expenses-table tbody tr');

    let totalAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;

    rows.forEach(row => {
        const amount = parseFloat(row.cells[1].querySelector('input').value) || 0;
        const paid = row.cells[2].querySelector('select').value;

        totalAmount += amount;

        if (paid === 'yes') {
            paidAmount += amount;
            row.style.backgroundColor = '#d4edda'; // light green
        } else {
            unpaidAmount += amount;
            row.style.backgroundColor = ''; // reset
        }
    });

    document.getElementById('total-amount').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('total-paid').textContent = `$${paidAmount.toFixed(2)} Paid`;
    document.getElementById('total-unpaid').textContent = `$${unpaidAmount.toFixed(2)} Unpaid`;
}

function setAllPaid(value) {
    const rows = document.querySelectorAll('#expenses-table tbody tr');

    rows.forEach(row => {
        const select = row.cells[2].querySelector('select');
        select.value = value;
    });

    saveExpenses();
    calculateTotals();
}

function exportCSV() {
    const rows = document.querySelectorAll('#expenses-table tbody tr');
    let csvContent = "Expense Type,Amount,Paid,Due Date\n";

    rows.forEach(row => {
        const name = row.cells[0].textContent.trim();
        const amount = row.cells[1].querySelector('input').value.trim() || '0';
        const paid = row.cells[2].querySelector('select').value;
        const dueDate = row.cells[3].querySelector
