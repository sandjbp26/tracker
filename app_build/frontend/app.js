/**
 * Ledger Pro - Financial Intelligence Controller
 */

// Global App State
const state = {
  token: localStorage.getItem('ledger_token') || null,
  user: JSON.parse(localStorage.getItem('ledger_user')) || null,
  currency: localStorage.getItem('ledger_currency') || '₹',
  theme: localStorage.getItem('ledger_theme') || 'dark',
  activeTab: 'dashboard',
  authMode: 'signin',
  transactions: [],
  categories: [],
  budgets: [],
  charts: {
    category: null,
    cashflow: null
  }
};

// Default Sample Categories
const DEFAULT_CATEGORIES = [
  { id: 'cat_tech', name: 'Software & Cloud', type: 'expense', color: '#06B6D4', isDefault: true },
  { id: 'cat_food', name: 'Dining & Food', type: 'expense', color: '#EF4444', isDefault: true },
  { id: 'cat_groceries', name: 'Groceries & Supplies', type: 'expense', color: '#F97316', isDefault: true },
  { id: 'cat_housing', name: 'Office / Rent', type: 'expense', color: '#8B5CF6', isDefault: true },
  { id: 'cat_transport', name: 'Travel & Mobility', type: 'expense', color: '#3B82F6', isDefault: true },
  { id: 'cat_utilities', name: 'Utilities & Telecom', type: 'expense', color: '#EAB308', isDefault: true },
  { id: 'cat_salary', name: 'Primary Revenue / Salary', type: 'income', color: '#10B981', isDefault: true },
  { id: 'cat_consulting', name: 'Consulting & Contracts', type: 'income', color: '#14B8A6', isDefault: true },
  { id: 'cat_investments', name: 'Portfolio Dividends', type: 'income', color: '#84CC16', isDefault: true }
];

// Initial Seed Ledger Entries
const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-9021',
    title: 'Enterprise Retainer Payout',
    amount: 145000,
    type: 'income',
    categoryId: 'cat_salary',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: 'Q3 Enterprise Client Retainer'
  },
  {
    id: 'TXN-9022',
    title: 'Workspace Lease & Maintenance',
    amount: 32000,
    type: 'expense',
    categoryId: 'cat_housing',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: 'Monthly commercial workspace lease'
  },
  {
    id: 'TXN-9023',
    title: 'AWS Cloud Infrastructure & Hosting',
    amount: 8450,
    type: 'expense',
    categoryId: 'cat_tech',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'card',
    notes: 'Production cluster & CDN tier'
  },
  {
    id: 'TXN-9024',
    title: 'Advisory Consultation Fee',
    amount: 45000,
    type: 'income',
    categoryId: 'cat_consulting',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: 'Architecture audit milestone'
  },
  {
    id: 'TXN-9025',
    title: 'Team Luncheon & Strategy Meet',
    amount: 3600,
    type: 'expense',
    categoryId: 'cat_food',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'upi',
    notes: 'Quarterly review meetup'
  },
  {
    id: 'TXN-9026',
    title: 'High-Speed Dedicated Fiber Bill',
    amount: 2199,
    type: 'expense',
    categoryId: 'cat_utilities',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'card',
    notes: 'Gigabit fiber connection'
  }
];

const INITIAL_BUDGETS = [
  { id: 'BGT-101', categoryId: 'cat_tech', limitAmount: 15000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: 'BGT-102', categoryId: 'cat_housing', limitAmount: 40000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: 'BGT-103', categoryId: 'cat_food', limitAmount: 12000, month: new Date().getMonth() + 1, year: new Date().getFullYear() }
];

// App Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  const currencySelect = document.getElementById('currencySelect');
  if (currencySelect) currencySelect.value = state.currency;

  if (state.token && state.user) {
    showApp();
  } else {
    showAuth();
  }

  const txnDate = document.getElementById('txnDate');
  if (txnDate) txnDate.value = new Date().toISOString().split('T')[0];
});

/* ==================== AUTHENTICATION FLOW ==================== */

function switchAuthMode(mode) {
  state.authMode = mode;
  const isSignUp = mode === 'signup';

  document.getElementById('tabSignIn').classList.toggle('active', !isSignUp);
  document.getElementById('tabSignUp').classList.toggle('active', isSignUp);
  document.getElementById('signupNameGroup').style.display = isSignUp ? 'block' : 'none';
  document.getElementById('authSubtitle').innerText = isSignUp
    ? 'Create your Master Account on Ledger Pro'
    : 'Enterprise & Personal Financial Intelligence Platform';
  document.getElementById('authSubmitBtn').innerText = isSignUp ? 'Create Ledger Pro Account' : 'Sign In to Ledger Pro';
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const name = document.getElementById('authName').value.trim();

  const user = {
    id: 'usr_' + Date.now(),
    name: state.authMode === 'signup' && name ? name : 'Alex Vance',
    email: email,
    currency: state.currency
  };

  const token = 'jwt_token_ledger_pro_' + Date.now();
  setAuthSession(token, user);
}

function quickGuestLogin() {
  const user = {
    id: 'usr_guest_pro',
    name: 'Alex Vance',
    email: 'alex.pro@ledgerpro.io',
    currency: state.currency
  };
  setAuthSession('guest_token_ledger_pro', user);
}

function setAuthSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('ledger_token', token);
  localStorage.setItem('ledger_user', JSON.stringify(user));
  showApp();
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('ledger_token');
  localStorage.removeItem('ledger_user');
  showAuth();
}

function showAuth() {
  document.getElementById('authContainer').style.display = 'flex';
  document.getElementById('appMain').style.display = 'none';
  if (window.lucide) lucide.createIcons();
}

function showApp() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appMain').style.display = 'flex';

  document.getElementById('userName').innerText = state.user.name || 'User';
  document.getElementById('userEmail').innerText = state.user.email || '';
  document.getElementById('userAvatar').innerText = (state.user.name || 'U').charAt(0).toUpperCase();

  loadData();
  renderAll();
  if (window.lucide) lucide.createIcons();
}

/* ==================== DATA MANAGEMENT ==================== */

function loadData() {
  const savedTxns = localStorage.getItem('ledger_txns_' + state.user.id);
  const savedCats = localStorage.getItem('ledger_cats_' + state.user.id);
  const savedBgts = localStorage.getItem('ledger_bgts_' + state.user.id);

  state.transactions = savedTxns ? JSON.parse(savedTxns) : [...INITIAL_TRANSACTIONS];
  state.categories = savedCats ? JSON.parse(savedCats) : [...DEFAULT_CATEGORIES];
  state.budgets = savedBgts ? JSON.parse(savedBgts) : [...INITIAL_BUDGETS];

  persistData();
}

function persistData() {
  if (!state.user) return;
  localStorage.setItem('ledger_txns_' + state.user.id, JSON.stringify(state.transactions));
  localStorage.setItem('ledger_cats_' + state.user.id, JSON.stringify(state.categories));
  localStorage.setItem('ledger_bgts_' + state.user.id, JSON.stringify(state.budgets));
}

/* ==================== UI RENDERING ==================== */

function renderAll() {
  renderKPIs();
  renderRecentTransactions();
  renderAllTransactions();
  renderBudgets();
  renderCategories();
  populateCategorySelects();
  renderCharts();
  if (window.lucide) lucide.createIcons();
}

function renderKPIs() {
  let totalIncome = 0;
  let totalExpense = 0;

  state.transactions.forEach((t) => {
    if (t.type === 'income') totalIncome += Number(t.amount);
    if (t.type === 'expense') totalExpense += Number(t.amount);
  });

  const totalBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

  document.getElementById('kpiBalance').innerText = formatCurrency(totalBalance);
  document.getElementById('kpiIncome').innerText = formatCurrency(totalIncome);
  document.getElementById('kpiExpense').innerText = formatCurrency(totalExpense);
  document.getElementById('kpiSavingsRate').innerText = `${savingsRate}%`;
}

function renderRecentTransactions() {
  const tbody = document.getElementById('recentTransactionsBody');
  const recent = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-dim);">No transactions recorded in ledger yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = recent
    .map((txn) => {
      const cat = getCategory(txn.categoryId);
      const isIncome = txn.type === 'income';
      return `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--text-main);">${escapeHTML(txn.title)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim); font-family: monospace;">${txn.id} ${txn.notes ? '• ' + escapeHTML(txn.notes) : ''}</div>
        </td>
        <td>
          <span class="tag tag-cat" style="border-left: 3px solid ${cat.color};">
            ${escapeHTML(cat.name)}
          </span>
        </td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(txn.date)}</td>
        <td><span style="text-transform: uppercase; font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">${txn.paymentMethod.replace('_', ' ')}</span></td>
        <td class="${isIncome ? 'amount-inflow' : 'amount-outflow'}">
          ${isIncome ? '+' : '-'}${formatCurrency(txn.amount)}
        </td>
      </tr>
    `;
    })
    .join('');
}

function renderAllTransactions() {
  const tbody = document.getElementById('allTransactionsBody');
  const filtered = getFilteredTransactions();

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-dim);">No ledger records found matching current filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((txn) => {
      const cat = getCategory(txn.categoryId);
      const isIncome = txn.type === 'income';
      return `
      <tr>
        <td>
          <div style="font-weight: 700;">${escapeHTML(txn.title)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim); font-family: monospace;">${txn.id} ${txn.notes ? '• ' + escapeHTML(txn.notes) : ''}</div>
        </td>
        <td>
          <span class="tag ${isIncome ? 'tag-inflow' : 'tag-outflow'}">
            ${isIncome ? 'Inflow' : 'Outflow'}
          </span>
        </td>
        <td>
          <span class="tag tag-cat" style="border-left: 3px solid ${cat.color};">
            ${escapeHTML(cat.name)}
          </span>
        </td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(txn.date)}</td>
        <td><span style="text-transform: uppercase; font-size: 0.74rem; font-weight: 700; color: var(--text-muted);">${txn.paymentMethod.replace('_', ' ')}</span></td>
        <td class="${isIncome ? 'amount-inflow' : 'amount-outflow'}">
          ${isIncome ? '+' : '-'}${formatCurrency(txn.amount)}
        </td>
        <td style="text-align: right;">
          <button class="btn btn-icon btn-sm" onclick="editTransaction('${txn.id}')" title="Edit Entry">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="btn btn-icon btn-sm" onclick="deleteTransaction('${txn.id}')" title="Delete Entry" style="color: var(--outflow);">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join('');

  if (window.lucide) lucide.createIcons();
}

function renderBudgets() {
  const container = document.getElementById('budgetCardsContainer');
  if (state.budgets.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--text-dim);">No monthly spending caps defined. Click "+ Define Spending Cap" above.</div>`;
    return;
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  container.innerHTML = state.budgets
    .map((bgt) => {
      const cat = getCategory(bgt.categoryId);

      const spent = state.transactions
        .filter((t) => {
          if (t.type !== 'expense') return false;
          const d = new Date(t.date);
          return (
            d.getMonth() + 1 === currentMonth &&
            d.getFullYear() === currentYear &&
            (bgt.categoryId === 'overall' || t.categoryId === bgt.categoryId)
          );
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const pct = bgt.limitAmount > 0 ? Math.min(100, Math.round((spent / bgt.limitAmount) * 100)) : 0;
      const statusClass = pct >= 100 ? 'gauge-exceeded' : pct >= 80 ? 'gauge-warning' : 'gauge-safe';

      return `
      <div class="panel-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${cat.color};"></span>
            ${escapeHTML(cat.name)}
          </h3>
          <button class="btn btn-icon btn-sm" onclick="deleteBudget('${bgt.id}')" title="Remove Cap">
            <i data-lucide="trash-2"></i>
          </button>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
          <span>Utilized: <strong>${formatCurrency(spent)}</strong></span>
          <span style="color: var(--text-muted);">Ceiling: ${formatCurrency(bgt.limitAmount)}</span>
        </div>

        <div class="gauge-track">
          <div class="gauge-bar ${statusClass}" style="width: ${pct}%;"></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-dim); font-weight:600;">
          <span>${pct}% Cap Capacity</span>
          <span>${spent > bgt.limitAmount ? 'Over ceiling by ' + formatCurrency(spent - bgt.limitAmount) : formatCurrency(bgt.limitAmount - spent) + ' available'}</span>
        </div>
      </div>
    `;
    })
    .join('');
}

function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  container.innerHTML = state.categories
    .map((cat) => {
      const txnCount = state.transactions.filter((t) => t.categoryId === cat.id).length;
      return `
      <div class="panel-card" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: ${cat.color}22; color: ${cat.color}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem;">
            ${cat.name.charAt(0)}
          </div>
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700;">${escapeHTML(cat.name)}</h4>
            <span style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">${cat.type} • ${txnCount} records</span>
          </div>
        </div>
        ${
          !cat.isDefault
            ? `<button class="btn btn-icon btn-sm" onclick="deleteCategory('${cat.id}')" title="Remove Category"><i data-lucide="trash-2"></i></button>`
            : `<span class="tag tag-cat" style="font-size: 0.7rem;">System Core</span>`
        }
      </div>
    `;
    })
    .join('');
}

/* ==================== CHARTS RENDERING ==================== */

function renderCharts() {
  if (typeof Chart === 'undefined') return;

  // 1. Category Doughnut Chart
  const expenseTxns = state.transactions.filter((t) => t.type === 'expense');
  const catTotals = {};

  expenseTxns.forEach((t) => {
    catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + Number(t.amount);
  });

  const catLabels = [];
  const catData = [];
  const catColors = [];

  Object.keys(catTotals).forEach((catId) => {
    const cat = getCategory(catId);
    catLabels.push(cat.name);
    catData.push(catTotals[catId]);
    catColors.push(cat.color);
  });

  const ctxCat = document.getElementById('categoryChart')?.getContext('2d');
  if (ctxCat) {
    if (state.charts.category) state.charts.category.destroy();

    state.charts.category = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: catLabels.length ? catLabels : ['No Outflows'],
        datasets: [
          {
            data: catData.length ? catData : [1],
            backgroundColor: catColors.length ? catColors : ['#64748b'],
            borderWidth: 0,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: state.theme === 'dark' ? '#94a3b8' : '#475569',
              font: { family: 'Outfit', size: 11, weight: '600' },
              boxWidth: 10,
              padding: 12
            }
          }
        },
        cutout: '74%'
      }
    });
  }

  // 2. Cashflow Inflow vs Outflow Bar Chart
  const ctxCash = document.getElementById('cashflowChart')?.getContext('2d');
  if (ctxCash) {
    if (state.charts.cashflow) state.charts.cashflow.destroy();

    let inc = 0;
    let exp = 0;
    state.transactions.forEach((t) => {
      if (t.type === 'income') inc += Number(t.amount);
      if (t.type === 'expense') exp += Number(t.amount);
    });

    state.charts.cashflow = new Chart(ctxCash, {
      type: 'bar',
      data: {
        labels: ['Gross Inflow', 'Total Outflow', 'Net Capital Retained'],
        datasets: [
          {
            label: 'Volume (' + state.currency + ')',
            data: [inc, exp, Math.max(0, inc - exp)],
            backgroundColor: ['#10b981', '#f43f5e', '#06b6d4'],
            borderRadius: 8,
            barThickness: 40
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: state.theme === 'dark' ? '#94a3b8' : '#475569', font: { family: 'Outfit', weight: '600' } }
          },
          y: {
            grid: { color: state.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
            ticks: { color: state.theme === 'dark' ? '#94a3b8' : '#475569' }
          }
        }
      }
    });
  }
}

/* ==================== MODAL & CRUD ACTIONS ==================== */

function openTransactionModal(editId = null) {
  const modal = document.getElementById('transactionModal');
  const titleElem = document.getElementById('txnModalTitle');
  const idElem = document.getElementById('txnId');

  if (editId) {
    const txn = state.transactions.find((t) => t.id === editId);
    if (!txn) return;
    titleElem.innerText = 'Edit Ledger Entry';
    idElem.value = txn.id;
    document.getElementById('txnTitle').value = txn.title;
    document.getElementById('txnAmount').value = txn.amount;
    document.getElementById('txnType').value = txn.type;
    populateCategoryOptions(txn.type, txn.categoryId);
    document.getElementById('txnDate').value = txn.date;
    document.getElementById('txnPayment').value = txn.paymentMethod || 'card';
    document.getElementById('txnNotes').value = txn.notes || '';
  } else {
    titleElem.innerText = 'Create Ledger Entry';
    idElem.value = '';
    document.getElementById('transactionForm').reset();
    document.getElementById('txnDate').value = new Date().toISOString().split('T')[0];
    populateCategoryOptions('expense');
  }

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeTransactionModal() {
  document.getElementById('transactionModal').classList.remove('active');
}

function saveTransaction(event) {
  event.preventDefault();
  const id = document.getElementById('txnId').value;
  const title = document.getElementById('txnTitle').value.trim();
  const amount = parseFloat(document.getElementById('txnAmount').value);
  const type = document.getElementById('txnType').value;
  const categoryId = document.getElementById('txnCategory').value;
  const date = document.getElementById('txnDate').value;
  const paymentMethod = document.getElementById('txnPayment').value;
  const notes = document.getElementById('txnNotes').value.trim();

  if (id) {
    const index = state.transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      state.transactions[index] = { ...state.transactions[index], title, amount, type, categoryId, date, paymentMethod, notes };
    }
  } else {
    const newTxn = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      title,
      amount,
      type,
      categoryId,
      date,
      paymentMethod,
      notes
    };
    state.transactions.unshift(newTxn);
  }

  persistData();
  closeTransactionModal();
  renderAll();
}

function editTransaction(id) {
  openTransactionModal(id);
}

function deleteTransaction(id) {
  if (confirm('Permanently remove this entry from Ledger Pro?')) {
    state.transactions = state.transactions.filter((t) => t.id !== id);
    persistData();
    renderAll();
  }
}

/* Category Modal */
function openCategoryModal() {
  document.getElementById('categoryModal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.remove('active');
}

function saveCategory(event) {
  event.preventDefault();
  const name = document.getElementById('catName').value.trim();
  const type = document.getElementById('catType').value;
  const color = document.getElementById('catColor').value;

  const newCat = {
    id: 'cat_' + Date.now(),
    name,
    type,
    color,
    isDefault: false
  };

  state.categories.push(newCat);
  persistData();
  closeCategoryModal();
  renderAll();
}

function deleteCategory(id) {
  if (confirm('Remove this custom category from architect?')) {
    state.categories = state.categories.filter((c) => c.id !== id);
    persistData();
    renderAll();
  }
}

/* Budget Modal */
function openBudgetModal() {
  const select = document.getElementById('budgetCategory');
  const expenseCats = state.categories.filter((c) => c.type === 'expense');

  select.innerHTML =
    `<option value="overall">Total Enterprise Inflow Cap</option>` +
    expenseCats.map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('');

  document.getElementById('budgetModal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeBudgetModal() {
  document.getElementById('budgetModal').classList.remove('active');
}

function saveBudget(event) {
  event.preventDefault();
  const categoryId = document.getElementById('budgetCategory').value;
  const limitAmount = parseFloat(document.getElementById('budgetLimit').value);
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const existingIdx = state.budgets.findIndex((b) => b.categoryId === categoryId);
  if (existingIdx !== -1) {
    state.budgets[existingIdx].limitAmount = limitAmount;
  } else {
    state.budgets.push({
      id: 'BGT-' + Math.floor(100 + Math.random() * 900),
      categoryId,
      limitAmount,
      month,
      year
    });
  }

  persistData();
  closeBudgetModal();
  renderAll();
}

function deleteBudget(id) {
  state.budgets = state.budgets.filter((b) => b.id !== id);
  persistData();
  renderAll();
}

/* ==================== FILTERS & SEARCH ==================== */

function handleSearchFilter() {
  renderAllTransactions();
}

function getFilteredTransactions() {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const typeFilter = document.getElementById('typeFilter')?.value || 'all';
  const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
  const sortFilter = document.getElementById('sortFilter')?.value || 'date-desc';

  let list = [...state.transactions];

  if (typeFilter !== 'all') {
    list = list.filter((t) => t.type === typeFilter);
  }

  if (categoryFilter !== 'all') {
    list = list.filter((t) => t.categoryId === categoryFilter);
  }

  if (query) {
    list = list.filter((t) => t.title.toLowerCase().includes(query) || t.id.toLowerCase().includes(query) || (t.notes && t.notes.toLowerCase().includes(query)));
  }

  list.sort((a, b) => {
    if (sortFilter === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortFilter === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortFilter === 'amount-desc') return b.amount - a.amount;
    if (sortFilter === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  return list;
}

function populateCategorySelects() {
  const filterSelect = document.getElementById('categoryFilter');
  if (filterSelect) {
    filterSelect.innerHTML =
      `<option value="all">All Categories</option>` +
      state.categories.map((c) => `<option value="${c.id}">${escapeHTML(c.name)} (${c.type})</option>`).join('');
  }
}

function populateCategoryOptions(type = 'expense', selectedId = null) {
  const select = document.getElementById('txnCategory');
  const cats = state.categories.filter((c) => c.type === type);
  select.innerHTML = cats.map((c) => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${escapeHTML(c.name)}</option>`).join('');
}

/* ==================== UTILITY FUNCTIONS ==================== */

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-pane').forEach((pane) => pane.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach((link) => link.classList.remove('active'));

  const targetPane = document.getElementById('view-' + tabId);
  const targetNav = document.getElementById('nav-' + tabId);

  if (targetPane) targetPane.classList.add('active');
  if (targetNav) targetNav.classList.add('active');

  const titles = {
    dashboard: { title: 'Financial Intelligence Overview', sub: 'Real-time cashflow, liquidity tracking & category analytics' },
    transactions: { title: 'Transactions & Master Ledger', sub: 'Audited log of all capital inflows and outflows' },
    budgets: { title: 'Spending Caps & Budgets', sub: 'Automated guardrails and monthly category limits' },
    categories: { title: 'Category Architect', sub: 'Manage classifications and revenue streams' }
  };

  const meta = titles[tabId] || { title: 'Ledger Pro', sub: '' };
  document.getElementById('pageTitle').innerText = meta.title;
  document.getElementById('pageSubtitle').innerText = meta.sub;

  renderAll();
}

function getCategory(catId) {
  return state.categories.find((c) => c.id === catId) || { name: 'Uncategorized', color: '#64748b' };
}

function formatCurrency(amount) {
  const num = Number(amount || 0);
  return `${state.currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function changeCurrency(newCurrency) {
  state.currency = newCurrency;
  localStorage.setItem('ledger_currency', newCurrency);
  renderAll();
}

function toggleTheme() {
  const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ledger_theme', theme);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    if (window.lucide) lucide.createIcons();
  }
  renderCharts();
}

function exportDataJSON() {
  const exportPayload = {
    platform: 'Ledger Pro Financial Suite',
    exportTimestamp: new Date().toISOString(),
    user: state.user,
    transactions: state.transactions,
    categories: state.categories,
    budgets: state.budgets
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `ledger_pro_audit_export_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
