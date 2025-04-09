function clearExpenses() {
    const rows = document.querySelectorAll('#expenses-table tbody tr');

    rows.forEach(row => {
        const amountInput = row.cells[1].querySelector('input');
        const paidSelect = row.cells[2].querySelector('select');

        amountInput.value = '';
        paidSelect.value = 'no';
    });

    alert("Cleared all expenses. Ready for next month!");
}
