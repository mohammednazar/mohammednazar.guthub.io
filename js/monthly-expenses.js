const STORAGE_KEY = 'monthlyExpenses';

window.onload = () => {
  loadExpenses();
  setupListeners();
  calculateTotals();
};

function setupListeners() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  rows.forEach(row => {
    attachListeners(row);
  });
}

function attachListeners(row) {
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
    calculateTotals();
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
  const expensesTable = document.getElementById("expenses-table").querySelector("tbody");
  expensesTable.innerHTML = ""; // Clear existing rows

  data.forEach(expense => addExpenseRow(expense));
}

function calculateTotals() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');

  let totalAmount = 0;
  let paidAmount = 0;
  let unpaidAmount = 0;

  const today = new Date();
  const inTwoDays = new Date();
  inTwoDays.setDate(today.getDate() + 2);

  rows.forEach(row => {
    const amount = parseFloat(row.cells[1].querySelector('input').value) || 0;
    const paid = row.cells[2].querySelector('select').value;
    const dueDateValue = row.cells[3].querySelector('input').value;

    totalAmount += amount;

    if (paid === 'yes') {
      paidAmount += amount;
      row.style.backgroundColor = '#d4edda'; // Light green for paid
    } else {
      unpaidAmount += amount;

      if (dueDateValue) {
        const dueDate = new Date(dueDateValue);
        const isPastDue = dueDate < today.setHours(0, 0, 0, 0); // Handles time
        const isDueSoon = dueDate <= inTwoDays;

        if (isPastDue || isDueSoon) {
          row.style.backgroundColor = '#f8d7da'; // Light red for urgent unpaid
        } else {
          row.style.backgroundColor = ''; // Clear if not urgent
        }
      } else {
        row.style.backgroundColor = ''; // No due date, no highlight
      }
    }
  });

  document.getElementById('total-amount').textContent = `$${totalAmount.toFixed(2)}`;
  document.getElementById('total-paid').textContent = `$${paidAmount.toFixed(2)} Paid`;
  document.getElementById('total-unpaid').textContent = `$${unpaidAmount.toFixed(2)} Unpaid`;
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

function addExpenseRow(expense = { type: "", amount: "", paid: "no", dueDate: "" }) {
  const expensesTable = document.getElementById("expenses-table").querySelector("tbody");
  const newRow = expensesTable.insertRow();

  newRow.innerHTML = `
    <td><input type="text" value="${expense.type}" /></td>
    <td><input type="number" value="${expense.amount}" /></td>
    <td>
      <select>
        <option value="no" ${expense.paid === "no" ? "selected" : ""}>No</option>
        <option value="yes" ${expense.paid === "yes" ? "selected" : ""}>Yes</option>
      </select>
    </td>
    <td><input type="date" value="${expense.dueDate}" /></td>
    <td><button onclick="removeExpenseRow(this)">Delete Expense</button></td>
  `;

  attachListeners(newRow);
  saveExpenses();
}
