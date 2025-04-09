const STORAGE_KEY = 'monthlyExpenses';

window.onload = () => {
  loadExpenses();
  setupListeners();
  calculateTotals();
};

function setupListeners() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  rows.forEach(row => {
    row.cells[1].querySelector('input').addEventListener('input', () => {
      saveExpenses();
      calculateTotals();
    });
    row.cells[2].querySelector('select').addEventListener('change', () => {
      saveExpenses();
      calculateTotals();
    });
    row.cells[3].querySelector('input').addEventListener('change', () => {
      saveExpenses();
    });
  });
}

function saveExpenses() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  const data = [];
  rows.forEach(row => {
    data.push({
      name: row.cells[0].textContent.trim(),
      amount: row.cells[1].querySelector('input').value,
      paid: row.cells[2].querySelector('select').value,
      dueDate: row.cells[3].querySelector('input').value
    });
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadExpenses() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  rows.forEach((row, index) => {
    if (data[index]) {
      row.cells[1].querySelector('input').value = data[index].amount || '';
      row.cells[2].querySelector('select').value = data[index].paid || 'no';
      row.cells[3].querySelector('input').value = data[index].dueDate || '';
    }
  });
}

function calculateTotals() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  let total = 0, paid = 0, unpaid = 0;

  rows.forEach(row => {
    const amount = parseFloat(row.cells[1].querySelector('input').value) || 0;
    const isPaid = row.cells[2].querySelector('select').value === 'yes';
    total += amount;
    if (isPaid) {
      paid += amount;
      row.style.backgroundColor = '#d4edda';
    } else {
      unpaid += amount;
      row.style.backgroundColor = '';
    }
  });

  document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
  document.getElementById('total-paid').textContent = `$${paid.toFixed(2)} Paid`;
  document.getElementById('total-unpaid').textContent = `$${unpaid.toFixed(2)} Unpaid`;
}

function setAllPaid(value) {
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  rows.forEach(row => {
    row.cells[2].querySelector('select').value = value;
  });
  saveExpenses();
  calculateTotals();
}

function exportCSV() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  let csv = 'Expense Type,Amount,Paid,Due Date\n';
  rows.forEach(row => {
    const name = row.cells[0].textContent.trim();
    const amount = row.cells[1].querySelector('input').value.trim();
    const paid = row.cells[2].querySelector('select').value;
    const dueDate = row.cells[3].querySelector('input').value.trim();
    csv += `"${name}","${amount}","${paid}","${dueDate}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'monthly_expenses.csv';
  link.click();
}

function clearExpenses() {
  if (confirm('Would you like to export your expenses before clearing?')) {
    exportCSV();
  }

  localStorage.removeItem(STORAGE_KEY);
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  rows.forEach(row => {
    row.cells[1].querySelector('input').value = '';
    row.cells[2].querySelector('select').value = 'no';
    row.cells[3].querySelector('input').value = '';
    row.style.backgroundColor = '';
  });
  calculateTotals();
}
