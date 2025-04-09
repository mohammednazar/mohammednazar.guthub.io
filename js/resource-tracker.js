let activeEmployees = JSON.parse(localStorage.getItem("activeEmployees") || "[]");
let inactiveEmployees = JSON.parse(localStorage.getItem("inactiveEmployees") || "[]");

function saveData() {
  localStorage.setItem("activeEmployees", JSON.stringify(activeEmployees));
  localStorage.setItem("inactiveEmployees", JSON.stringify(inactiveEmployees));
}

function renderTables() {
  const activeTable = document.querySelector("#active-table tbody");
  const inactiveTable = document.querySelector("#inactive-table tbody");
  activeTable.innerHTML = "";
  inactiveTable.innerHTML = "";

  activeEmployees.forEach((emp, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.talentId}</td>
      <td>${emp.firstName} ${emp.lastName}</td>
      <td>${emp.email}</td>
      <td>${emp.clientEmail}</td>
      <td>${emp.lwd || ''}</td>
      <td><button onclick="moveToInactive(${index})">Set LWD</button></td>
    `;
    activeTable.appendChild(row);
  });

  inactiveEmployees.forEach((emp, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.talentId}</td>
      <td>${emp.firstName} ${emp.lastName}</td>
      <td>${emp.email}</td>
      <td>${emp.clientEmail}</td>
      <td>${emp.lwd}</td>
      <td><button onclick="moveToActive(${index})">Reactivate</button></td>
    `;
    inactiveTable.appendChild(row);
  });
}

function moveToInactive(index) {
  const emp = activeEmployees[index];
  const lwd = prompt("Enter Last Working Day (YYYY-MM-DD):");
  if (lwd) {
    emp.lwd = lwd;
    inactiveEmployees.push(emp);
    activeEmployees.splice(index, 1);
    saveData();
    renderTables();
  }
}

function moveToActive(index) {
  const emp = inactiveEmployees[index];
  emp.lwd = "";
  activeEmployees.push(emp);
  inactiveEmployees.splice(index, 1);
  saveData();
  renderTables();
}

document.querySelector("#employee-form").addEventListener("submit", e => {
  e.preventDefault();
  const emp = {
    talentId: document.getElementById("talentId").value.trim(),
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    clientEmail: document.getElementById("clientEmail").value.trim(),
    lwd: document.getElementById("lwd").value.trim(),
  };

  if (emp.lwd) {
    inactiveEmployees.push(emp);
  } else {
    activeEmployees.push(emp);
  }

  saveData();
  renderTables();
  e.target.reset();
});

function exportActiveCSV() {
  let csv = "Talent ID,First Name,Last Name,Email,Client Email,LWD\n";
  activeEmployees.forEach(emp => {
    csv += `"${emp.talentId}","${emp.firstName}","${emp.lastName}","${emp.email}","${emp.clientEmail}","${emp.lwd || ''}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "active_employees.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.onload = renderTables;
