const DEFAULT_EXPENSES = [
  'Alectra', 'Enbridge', 'Water', 'Property Tax', 'CIBC CC', 'MBNA CC',
  'Tangerine CC', 'CT CC', 'CIBC Rida', 'CIBC LOC', 'Tangerine LOC',
  'CIBC LOC Sabi', 'Tangerine LOC Sabi', 'Afrida Insurance', 'H&A Insurance',
  'Sabi RRSP', 'Home Loan', 'Cash'
];

window.onload = () => {
  loadExpenses();
  setupDragAndDrop();
};

function setupListeners() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  rows.forEach(row => {
    const cells = row.cells;
    const nameInput = cells[0].querySelector('input');
    const amountInput = cells[1].querySelector('input');
    const paidSelect = cells[2].querySelector('select');
    const dueDateInput = cells[3].querySelector('input');

    if (nameInput) nameInput.addEventListener('input', saveExpenses);
    if (amountInput) amountInput.addEventListener('input', () => { saveExpenses(); calculateTotals(); });
    if (paidSelect) paidSelect.addEventListener('change', () => { saveExpenses(); calculateTotals(); });
    if (dueDateInput) dueDateInput.addEventListener('change', () => { saveExpenses(); calculateTotals(); });
  });
}

function addExpense(name = '', amount = '', paid = 'no', dueDate = '') {
  const tbody = document.querySelector('#expenses-table tbody');
  const newRow = document.createElement('tr');
  newRow.draggable = true;

  newRow.innerHTML = `
    <td><input type="text" value="${name}" placeholder="Expense Name" /></td>
    <td><input type="number" value="${amount}" /></td>
    <td>
      <select>
        <option value="no" ${paid === 'no' ? 'selected' : ''}>No</option>
        <option value="yes" ${paid === 'yes' ? 'selected' : ''}>Yes</option>
      </select>
    </td>
    <td><input type="date" value="${dueDate}" /></td>
    <td><button class="remove-button" onclick="removeExpense(this)">Remove</button></td>
  `;

  tbody.appendChild(newRow);
  setupListeners();
  setupDragAndDrop();
  saveExpenses();
  calculateTotals();
}

function removeExpense(button) {
  const row = button.closest('tr');
  row.remove();
  saveExpenses();
  calculateTotals();
}

async function saveExpenses() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');
  const data = [];

  rows.forEach(row => {
    const cells = row.cells;
    const name = cells[0].querySelector('input')?.value.trim() || '';
    const amount = cells[1].querySelector('input')?.value.trim() || '0';
    const paid = cells[2].querySelector('select')?.value || 'no';
    const dueDate = cells[3].querySelector('input')?.value || '';

    data.push({ name, amount, paid, dueDate });
  });

  const expensesRef = firebase.firestore().collection('expenses');

  // Clear old data
  const snapshot = await expensesRef.get();
  const batch = firebase.firestore().batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  // Save new data
  data.forEach(item => {
    expensesRef.add(item);
  });
}

async function loadExpenses() {
  const expensesRef = firebase.firestore().collection('expenses');
  const snapshot = await expensesRef.get();

  const tbody = document.querySelector('#expenses-table tbody');
  tbody.innerHTML = '';

  if (!snapshot.empty) {
    snapshot.forEach(doc => {
      const { name, amount, paid, dueDate } = doc.data();
      addExpense(name, amount, paid, dueDate);
    });
  } else {
    DEFAULT_EXPENSES.forEach(name => addExpense(name));
  }

  calculateTotals();
}

function calculateTotals() {
  const rows = document.querySelectorAll('#expenses-table tbody tr');

  let totalAmount = 0, paidAmount = 0, unpaidAmount = 0;
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
      row.style.backgroundColor = '#d4edda';
    } else {
      unpaidAmount += amount;
      if (dueDateValue) {
        const dueDate = new Date(dueDateValue);
        const isPastDue = dueDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isDueSoon = dueDate <= inTwoDays;
        row.style.backgroundColor = (isPastDue || isDueSoon) ? '#f8d7da' : '';
      } else {
        row.style.backgroundColor = '';
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
    const name = row.cells[0].querySelector('input')?.value || '';
    const amount = row.cells[1].querySelector('input')?.value || '';
    const paid = row.cells[2].querySelector('select')?.value || '';
    const dueDate = row.cells[3].querySelector('input')?.value || '';
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

  const tbody = document.querySelector('#expenses-table tbody');
  tbody.innerHTML = '';
  DEFAULT_EXPENSES.forEach(name => addExpense(name));
}

// Drag and drop logic
function setupDragAndDrop() {
  let draggedRow;

  document.querySelectorAll('#expenses-table tbody tr').forEach(row => {
    row.draggable = true;

    row.addEventListener('dragstart', () => {
      draggedRow = row;
      row.style.opacity = 0.5;
    });

    row.addEventListener('dragend', () => {
      draggedRow = null;
      row.style.opacity = '';
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      const targetRow = e.currentTarget;
      const tbody = targetRow.parentNode;
      if (draggedRow !== targetRow) {
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const draggedIndex = rows.indexOf(draggedRow);
        const targetIndex = rows.indexOf(targetRow);
        if (draggedIndex < targetIndex) {
          tbody.insertBefore(draggedRow, targetRow.nextSibling);
        } else {
          tbody.insertBefore(draggedRow, targetRow);
        }
      }
    });

    row.addEventListener('drop', () => {
      saveExpenses();
    });
  });
}
