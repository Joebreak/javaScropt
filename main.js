// 呼叫 API 並將資料顯示在表格中
fetch('https://voter.dev.box70000.com/api/admin/voter/ofDocument/68/fieldEdit', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU1MDUyNjc3fQ.r0yqu6xFUUtTliIVSyJBwWXpJj846CEqlN1eY3eiO-Q',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(result => {
    const data = JSON.parse(result.data);
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.in}</td>
        <td>${item.out}</td>
        <td>${item.color}</td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(error => console.error('載入資料失敗:', error));