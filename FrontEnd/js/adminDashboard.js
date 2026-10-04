// LawyerConnect Admin Dashboard Controller

const API_BASE_URL = 'http://localhost:8080/api/v1/admin';

// Check Auth & Role on Load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if (!token || role !== 'ADMIN') {
    window.location.href = './LoginAndSignUp.html';
    return;
  }

  // Load User Info
  const username = localStorage.getItem('username') || 'Admin';
  document.getElementById('adminName').textContent = username;
  document.getElementById('adminAvatar').textContent = username.charAt(0).toUpperCase();

  // Load Initial Overview Data
  loadDashboardStats();
  loadUsers();
  loadLawyers();
  loadSpecializations();
});

// Helper Headers
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Tab Switcher
function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-section').forEach(el => el.classList.remove('active'));

  const navItem = document.querySelector(`.nav-item[href="#${tabId}"]`);
  if (navItem) navItem.classList.add('active');

  const section = document.getElementById(`${tabId}Section`);
  if (section) section.classList.add('active');

  const titles = {
    overview: 'Dashboard Overview',
    users: 'User Governance & Directory',
    lawyers: 'Lawyer Directory & Verification',
    specializations: 'Practice Area Management'
  };
  document.getElementById('pageTitle').textContent = titles[tabId] || 'Admin Dashboard';
}

// Fetch Stats
async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/stats`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (data.status === 200) {
      document.getElementById('kpiTotalUsers').textContent = data.data.totalUsers || 0;
      document.getElementById('kpiTotalLawyers').textContent = data.data.totalLawyers || 0;
      document.getElementById('kpiTotalClients').textContent = data.data.totalClients || 0;
      document.getElementById('kpiTotalAppointments').textContent = data.data.totalAppointments || 0;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// Fetch & Render Users
let allUsersData = [];

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (data.status === 200) {
      allUsersData = data.data || [];
      renderUsers(allUsersData);
    }
  } catch (err) {
    console.error('Failed to load users:', err);
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>#${u.userId}</td>
      <td><strong>${u.name || 'N/A'}</strong></td>
      <td>${u.email || u.username}</td>
      <td><span class="badge badge-${(u.role || '').toLowerCase()}">${u.role}</span></td>
      <td><span class="badge badge-${(u.status || 'ACTIVE').toLowerCase()}">${u.status || 'ACTIVE'}</span></td>
      <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
      <td>
        ${u.role !== 'ADMIN' ? `
          <button class="btn-secondary" onclick="toggleUserStatus(${u.userId}, '${u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'}')">
            ${u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
          </button>
        ` : '<span style="color: var(--text-muted);">Protected</span>'}
      </td>
    </tr>
  `).join('');
}

function filterUsers() {
  const query = document.getElementById('userSearchInput').value.toLowerCase();
  const filtered = allUsersData.filter(u => 
    (u.name && u.name.toLowerCase().includes(query)) ||
    (u.email && u.email.toLowerCase().includes(query)) ||
    (u.username && u.username.toLowerCase().includes(query))
  );
  renderUsers(filtered);
}

async function toggleUserStatus(userId, newStatus) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/status?status=${newStatus}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.status === 200) {
      showToast(`User status updated to ${newStatus}`, 'success');
      loadUsers();
      loadDashboardStats();
    }
  } catch (err) {
    showToast('Failed to update user status', 'danger');
  }
}

// Fetch Lawyers
async function loadLawyers() {
  try {
    const res = await fetch(`${API_BASE_URL}/lawyers`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (data.status === 200) {
      const tbody = document.getElementById('lawyersTableBody');
      tbody.innerHTML = (data.data || []).map(l => `
        <tr>
          <td>#${l.id}</td>
          <td><strong>${l.fullName || 'N/A'}</strong></td>
          <td>${l.licenceNumber || 'Pending'}</td>
          <td>${l.yearsOfExperience ? l.yearsOfExperience + ' Yrs' : 'N/A'}</td>
          <td>Rs. ${l.onlineFee || 0} / Rs. ${l.inPersonFee || 0}</td>
          <td>${l.phone || 'N/A'}</td>
          <td>
            <button class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
              <i class="fa-solid fa-eye"></i> View Profile
            </button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load lawyers:', err);
  }
}

// Fetch & Manage Specializations
async function loadSpecializations() {
  try {
    const res = await fetch(`http://localhost:8080/api/v1/explore/specializations`, { headers: getAuthHeaders() });
    let specs = [];
    if (res.ok) {
      const data = await res.json();
      specs = data.data || [];
    }
    renderSpecializations(specs);
  } catch (err) {
    console.error('Failed to load specializations:', err);
  }
}

function renderSpecializations(specs) {
  const tbody = document.getElementById('specTableBody');
  tbody.innerHTML = specs.map(s => `
    <tr>
      <td>#${s.id}</td>
      <td><strong>${s.specialization}</strong></td>
      <td>
        <button class="btn-danger" onclick="deleteSpecialization(${s.id})">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

async function handleAddSpecialization(e) {
  e.preventDefault();
  const nameInput = document.getElementById('specName');
  const name = nameInput.value.trim();
  if (!name) return;

  try {
    const res = await fetch(`${API_BASE_URL}/specializations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.status === 201) {
      showToast('Specialization created successfully', 'success');
      nameInput.value = '';
      loadSpecializations();
    }
  } catch (err) {
    showToast('Failed to create specialization', 'danger');
  }
}

async function deleteSpecialization(id) {
  if (!confirm('Are you sure you want to delete this specialization?')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/specializations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      showToast('Specialization deleted', 'success');
      loadSpecializations();
    }
  } catch (err) {
    showToast('Failed to delete specialization', 'danger');
  }
}

// Logout
function handleLogout() {
  localStorage.clear();
  window.location.href = './LoginAndSignUp.html';
}
