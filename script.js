// ========================================
// CASH-FLOW TRACKER - MAIN JAVASCRIPT FILE
// ========================================

// ================== GLOBAL VARIABLES ==================
let transactions = []; // Array to store all transactions (salary + expenses)
let currentFilter = 'all'; // Current filter for transaction display

// ================== DOM ELEMENT REFERENCES ==================
// Balance display elements
const currentBalanceEl = document.getElementById('currentBalance');
const totalSalaryEl = document.getElementById('totalSalary');
const totalExpensesEl = document.getElementById('totalExpenses');

// Form elements
const salaryForm = document.getElementById('salaryForm');
const expenseForm = document.getElementById('expenseForm');

// Input elements for salary form
const salaryAmountInput = document.getElementById('salaryAmount');
const salarySourceInput = document.getElementById('salarySource');

// Input elements for expense form
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseCategorySelect = document.getElementById('expenseCategory');
const expenseDescriptionInput = document.getElementById('expenseDescription');

// Transaction history elements
const transactionsListEl = document.getElementById('transactionsList');
const filterTabBtns = document.querySelectorAll('.tab-btn');
const clearAllBtn = document.getElementById('clearAllBtn');

// ================== LOCAL STORAGE FUNCTIONS ==================
// Function to load transactions from localStorage
function loadTransactions() {
    // Get data from localStorage using 'cashflow_transactions' key
    const savedTransactions = localStorage.getItem('cashflow_transactions');
    
    // Parse JSON data and update transactions array
    // Handle case where no data exists (return empty array)
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    } else {
        transactions = [];
    }
}

// Function to save transactions to localStorage
function saveTransactions() {
    // Convert transactions array to JSON string
    // Save to localStorage using 'cashflow_transactions' key
    localStorage.setItem('cashflow_transactions', JSON.stringify(transactions));
}

// ================== CALCULATION FUNCTIONS ==================
// Function to calculate total salary
function calculateTotalSalary() {
    // Filter transactions for salary items
    // Sum up all salary amounts
    // Return the total
    return transactions
        .filter(transaction => transaction.type === 'salary')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

// Function to calculate total expenses
function calculateTotalExpenses() {
    // Filter transactions for expense items
    // Sum up all expense amounts
    // Return the total
    return transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

// Function to calculate current balance
function calculateBalance() {
    // Calculate: total salary - total expenses
    // Return the balance
    const totalSalary = calculateTotalSalary();
    const totalExpenses = calculateTotalExpenses();
    return totalSalary - totalExpenses;
}

// ================== UI UPDATE FUNCTIONS ==================
// Function to update balance display
function updateBalanceDisplay() {
    // Calculate totals using the calculation functions
    const totalSalary = calculateTotalSalary();
    const totalExpenses = calculateTotalExpenses();
    const balance = calculateBalance();
    
    // Update the DOM elements with formatted currency values
    currentBalanceEl.textContent = formatCurrency(balance);
    totalSalaryEl.textContent = formatCurrency(totalSalary);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    
    // Handle negative balance display
    if (balance < 0) {
        currentBalanceEl.style.color = 'var(--danger-color)';
    } else {
        currentBalanceEl.style.color = 'var(--primary-color)';
    }
}

// Function to format currency
function formatCurrency(amount) {
    // Format number as currency with ₹ sign and 2 decimal places
    // Handle negative numbers properly
    const formattedAmount = Math.abs(amount).toFixed(2);
    const prefix = amount < 0 ? '-₹' : '₹';
    return prefix + formattedAmount;
}

// Function to render transactions list
function renderTransactions() {
    // Clear current transaction list
    transactionsListEl.innerHTML = '';
    
    // Filter transactions based on currentFilter
    let filteredTransactions = transactions;
    if (currentFilter !== 'all') {
        filteredTransactions = transactions.filter(transaction => transaction.type === currentFilter);
    }
    
    // Sort transactions by date (newest first)
    filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Handle empty state when no transactions exist
    if (filteredTransactions.length === 0) {
        transactionsListEl.innerHTML = `
            <div class="empty-state">
                <p>No ${currentFilter === 'all' ? '' : currentFilter} transactions yet.</p>
            </div>
        `;
        return;
    }
    
    // Create HTML for each transaction item
    filteredTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        transactionsListEl.appendChild(transactionElement);
    });
}

// Function to create transaction HTML element
function createTransactionElement(transaction) {
    // Create HTML structure for a single transaction
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.dataset.transactionId = transaction.id;
    
    // Include: type icon, description, amount, date, delete button
    const typeIcon = transaction.type === 'salary' ? '💵' : '💸';
    const amountClass = transaction.type === 'salary' ? 'salary' : 'expense';
    
    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-type">${typeIcon} ${transaction.type === 'salary' ? 'Salary' : 'Expense'}</div>
            <div class="transaction-description">${transaction.description}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="transaction-amount ${amountClass}">${formatCurrency(transaction.amount)}</span>
            <span class="transaction-date">${transaction.date}</span>
            <button class="btn btn-danger" onclick="deleteTransaction('${transaction.id}')" style="padding: 0.5rem; font-size: 0.8rem;">
                🗑️
            </button>
        </div>
    `;
    
    // Apply appropriate CSS classes based on transaction type
    // Format amount with correct color (green for salary, red for expense)
    return div;
}

// ================== TRANSACTION MANAGEMENT ==================
// Function to add new transaction
function addTransaction(type, amount, description, category = null) {
    // Create transaction object with unique ID
    const transaction = {
        id: generateId(),
        type: type,
        amount: parseFloat(amount),
        description: description,
        category: category,
        date: getCurrentDate(),
        timestamp: Date.now()
    };
    
    // Include: id, type, amount, description, category, date, timestamp
    // Add to transactions array
    transactions.push(transaction);
    
    // Save to localStorage
    saveTransactions();
    
    // Update UI
    updateBalanceDisplay();
    renderTransactions();
    
    // Show success feedback
    showNotification(`${type === 'salary' ? 'Salary' : 'Expense'} added successfully!`, 'success');
}

// Function to delete transaction
function deleteTransaction(transactionId) {
    // Find transaction by ID in the array
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
        showNotification('Transaction not found!', 'error');
        return;
    }
    
    const deletedTransaction = transactions[transactionIndex];
    
    // Remove it from the array
    transactions.splice(transactionIndex, 1);
    
    // Save to localStorage
    saveTransactions();
    
    // Update UI immediately
    updateBalanceDisplay();
    renderTransactions();
    
    // Show feedback to user
    showNotification(`${deletedTransaction.type === 'salary' ? 'Salary' : 'Expense'} deleted successfully!`, 'success');
}

// Function to clear all transactions
function clearAllTransactions() {
    // Ask for user confirmation
    if (confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
        // Clear transactions array
        transactions = [];
        
        // Clear localStorage
        localStorage.removeItem('cashflow_transactions');
        
        // Update UI
        updateBalanceDisplay();
        renderTransactions();
        
        // Show feedback
        showNotification('All transactions cleared!', 'success');
    }
}

// ================== FORM HANDLERS ==================
// Function to handle salary form submission
function handleSalarySubmit(event) {
    // Prevent form default submission
    event.preventDefault();
    
    // Get form values (amount, source)
    const amount = salaryAmountInput.value;
    const source = salarySourceInput.value;
    
    // Validate inputs (check if amount is positive number)
    if (!amount || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid positive amount!', 'error');
        return;
    }
    
    if (!source.trim()) {
        showNotification('Please enter a source for your salary!', 'error');
        return;
    }
    
    // Add salary transaction using addTransaction function
    addTransaction('salary', amount, source);
    
    // Reset form fields
    salaryForm.reset();
}

// Function to handle expense form submission
function handleExpenseSubmit(event) {
    // Prevent form default submission
    event.preventDefault();
    
    // Get form values (amount, category, description)
    const amount = expenseAmountInput.value;
    const category = expenseCategorySelect.value;
    const description = expenseDescriptionInput.value;
    
    // Validate inputs (check if amount is positive number)
    if (!amount || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid positive amount!', 'error');
        return;
    }
    
    if (!category) {
        showNotification('Please select a category!', 'error');
        return;
    }
    
    if (!description.trim()) {
        showNotification('Please enter a description!', 'error');
        return;
    }
    
    // Add expense transaction using addTransaction function
    const categoryIcons = {
        food: '🍔',
        transport: '🚗',
        utilities: '💡',
        entertainment: '🎬',
        shopping: '🛍️',
        health: '🏥',
        other: '📦'
    };
    
    const categoryIcon = categoryIcons[category] || '📦';
    const fullDescription = `${categoryIcon} ${description}`;
    
    addTransaction('expense', amount, fullDescription, category);
    
    // Reset form fields
    expenseForm.reset();
}

// ================== FILTER FUNCTIONS ==================
// Function to handle filter tab clicks
function handleFilterClick(event) {
    // Get filter type from clicked tab
    const filterType = event.target.dataset.filter;
    
    if (!filterType) return;
    
    // Update currentFilter variable
    currentFilter = filterType;
    
    // Update active tab styling
    filterTabBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Re-render transactions list
    renderTransactions();
}

// ================== INITIALIZATION ==================
// Function to initialize the app
function initApp() {
    // Load transactions from localStorage
    loadTransactions();
    
    // Update balance display
    updateBalanceDisplay();
    
    // Render transactions list
    renderTransactions();
    
    // Set up event listeners for all interactive elements
    setupEventListeners();
}

// ================== EVENT LISTENERS ==================
// Function to set up all event listeners
function setupEventListeners() {
    // Add event listener for salary form submission
    salaryForm.addEventListener('submit', handleSalarySubmit);
    
    // Add event listener for expense form submission
    expenseForm.addEventListener('submit', handleExpenseSubmit);
    
    // Add event listeners for filter tabs
    filterTabBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Add event listener for clear all button
    clearAllBtn.addEventListener('click', clearAllTransactions);
}

// Add event listener for page load to initialize app
document.addEventListener('DOMContentLoaded', initApp);

// ================== UTILITY FUNCTIONS ==================
// Function to generate unique ID
function generateId() {
    // Generate unique timestamp-based ID
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Function to get current date string
function getCurrentDate() {
    // Return formatted date string (e.g., "Jan 23, 2026")
    const now = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return now.toLocaleDateString('en-US', options);
}

// Function to show notification/message to user
function showNotification(message, type = 'success') {
    // Create temporary notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style based on type (success/error)
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background-color: var(--success-color);' : 'background-color: var(--danger-color);'}
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after few seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ================== APP STARTUP ==================
// Call initApp() when DOM is fully loaded
// (This is handled by the DOMContentLoaded event listener above)
