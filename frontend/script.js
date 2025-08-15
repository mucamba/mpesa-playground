// M-Pesa API Playground JavaScript

// Global variables
let isApiConfigured = false;
const API_BASE_URL = "http://2blink.space:3111";


// Initialize Materialize components
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    const tabs = document.querySelectorAll('.tabs');
    M.Tabs.init(tabs);
    
    // Initialize select
    const selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltips);
    
    // Setup form event listeners
    setupFormListeners();
    
    // Update status
    updateApiStatus();
});

// Setup form event listeners
function setupFormListeners() {
    // Configuration form
    document.getElementById('configForm').addEventListener('submit', handleConfigSubmit);
    
    // API function forms
    document.getElementById('b2cForm').addEventListener('submit', (e) => handleApiSubmit(e, 'b2c'));
    document.getElementById('c2bForm').addEventListener('submit', (e) => handleApiSubmit(e, 'c2b'));
    document.getElementById('b2bForm').addEventListener('submit', (e) => handleApiSubmit(e, 'b2b'));
    document.getElementById('reversalForm').addEventListener('submit', (e) => handleApiSubmit(e, 'reversal'));
    document.getElementById('statusForm').addEventListener('submit', (e) => handleApiSubmit(e, 'status'));
    document.getElementById('customerForm').addEventListener('submit', (e) => handleApiSubmit(e, 'customer-name'));
}

// Handle configuration form submission
async function handleConfigSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const configData = {
        api_key: document.getElementById('api_key').value,
        public_key: document.getElementById('public_key').value,
        environment: document.getElementById('environment').value,
        ssl: document.getElementById('ssl').checked
    };
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Configurando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/configure`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(configData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            isApiConfigured = true;
            updateApiStatus();
            showToast('API configurada com sucesso!', 'success');
            displayResponse(result, true);
        } else {
            showToast('Erro ao configurar API: ' + result.message, 'error');
            displayResponse(result, false);
        }
    } catch (error) {
        showToast('Erro de conexão: ' + error.message, 'error');
        displayResponse({ error: error.message }, false);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle API function form submission
async function handleApiSubmit(event, endpoint) {
    event.preventDefault();
    
    if (!isApiConfigured) {
        showToast('Configure a API primeiro!', 'error');
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        // Remove prefix from field names (e.g., 'b2c_value' -> 'value')
        const cleanKey = key.replace(/^[a-z0-9]+_/, '');
        data[cleanKey] = value;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Processando...';
    submitBtn.disabled = true;
    form.classList.add('form-submitting');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Operação executada com sucesso!', 'success');
            displayResponse(result, true);
        } else {
            showToast('Erro na operação: ' + result.message, 'error');
            displayResponse(result, false);
        }
    } catch (error) {
        showToast('Erro de conexão: ' + error.message, 'error');
        displayResponse({ error: error.message }, false);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.classList.remove('form-submitting');
    }
}

// Update API status indicator
function updateApiStatus() {
    const statusCard = document.getElementById('statusCard');
    
    if (isApiConfigured) {
        statusCard.className = 'card green lighten-4 status-configured';
        statusCard.innerHTML = `
            <div class="card-content">
                <span class="card-title green-text text-darken-2">
                    <i class="material-icons left">check_circle</i>API configurada
                </span>
                <p>A API M-Pesa está configurada e pronta para uso.</p>
            </div>
        `;
    } else {
        statusCard.className = 'card red lighten-4 status-not-configured';
        statusCard.innerHTML = `
            <div class="card-content">
                <span class="card-title red-text">
                    <i class="material-icons left">warning</i>API não configurada
                </span>
                <p>Configure a API M-Pesa antes de usar as funções.</p>
            </div>
        `;
    }
}

// Display API response
function displayResponse(response, isSuccess) {
    const container = document.getElementById('responseContainer');
    
    // Format the response
    const formattedResponse = JSON.stringify(response, null, 2);
    
    // Update container content and styling
    container.textContent = formattedResponse;
    container.className = isSuccess ? 'response-success' : 'response-error';
    
    // Scroll to response section
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastClass = type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';
    M.toast({
        html: `<i class="material-icons left">${getToastIcon(type)}</i>${message}`,
        classes: `${toastClass} darken-2`,
        displayLength: 4000
    });
}

// Get appropriate icon for toast type
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check_circle';
        case 'error': return 'error';
        case 'warning': return 'warning';
        default: return 'info';
    }
}

// Utility function to generate random transaction reference
function generateTransactionReference() {
    return Math.floor(Math.random() * 1000000) + 1;
}

// Utility function to generate random third party reference
function generateThirdPartyReference() {
    return Math.floor(Math.random() * 100000) + 1;
}

// Add helper buttons to generate random values
document.addEventListener('DOMContentLoaded', function() {
    // Add random value generators for transaction references
    const transactionRefInputs = document.querySelectorAll('input[id*="transaction_reference"]');
    const thirdPartyRefInputs = document.querySelectorAll('input[id*="third_party_reference"]');
    
    transactionRefInputs.forEach(input => {
        addRandomButton(input, generateTransactionReference);
    });
    
    thirdPartyRefInputs.forEach(input => {
        addRandomButton(input, generateThirdPartyReference);
    });
});

// Add random value button to input field
function addRandomButton(input, generator) {
    const wrapper = input.closest('.input-field');
    if (wrapper && !wrapper.querySelector('.random-btn')) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-small waves-effect waves-light grey random-btn';
        button.style.cssText = 'position: absolute; right: 0; top: 0; z-index: 1; padding: 0 8px; height: 24px; line-height: 24px; font-size: 10px;';
        button.innerHTML = '<i class="material-icons" style="font-size: 14px;">shuffle</i>';
        button.title = 'Gerar valor aleatório';
        
        button.addEventListener('click', () => {
            input.value = generator();
            input.focus();
            // Trigger Materialize label update
            M.updateTextFields();
        });
        
        wrapper.style.position = 'relative';
        wrapper.appendChild(button);
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Auto-fill demo data function (for testing purposes)
function fillDemoData() {
    // B2C demo data
    document.getElementById('b2c_value').value = '10.00';
    document.getElementById('b2c_client_number').value = '258840000000';
    document.getElementById('b2c_agent_id').value = '171717';
    document.getElementById('b2c_transaction_reference').value = generateTransactionReference();
    document.getElementById('b2c_third_party_reference').value = generateThirdPartyReference();
    
    // Update Materialize labels
    M.updateTextFields();
    
    showToast('Dados de demonstração preenchidos!', 'info');
}

// Add demo data button (can be called from console for testing)
window.fillDemoData = fillDemoData;

