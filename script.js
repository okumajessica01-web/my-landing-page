// ==========================================
// CONFIGURATION: BUSINESS SETTINGS
// ==========================================
const WHATSAPP_NUMBER = "2348000000000"; // <-- ENTER YOUR REAL WHATSAPP PHONE NUMBER HERE (Keep the 234 prefix)

// DYNAMIC INVENTORY COLLECTION ENGINE: MODIFY OR ADD NEW PRODUCTS HERE ANYTIME
const PRODUCT_INVENTORY = [
    {
        id: "prime-01",
        name: "Alpha Stamina Booster Max",
        price: 15000, // Raw numerical Naira value
        image: "https://unsplash.com", // Swap with real image link
        description: "100% natural organic extraction compound designed for sustained endurance and power enhancement."
    },
    {
        id: "prime-02",
        name: "Vigor Endurance Extract Capsules",
        price: 22000,
        image: "https://unsplash.com",
        description: "Fast-acting daily booster capsules providing immediate cell recovery and core energy optimization."
    },
    {
        id: "prime-03",
        name: "Supreme Testo Surge Drops",
        price: 18500,
        image: "https://unsplash.com",
        description: "Concentrated liquid herbal drops formulated for fast circulatory blood flow support."
    }
];

// ==========================================
// RUNTIME LOGIC CONTROLLERS
// ==========================================
let basketRegistry = [];

const UserState = {
    isLoggedIn: () => localStorage.getItem('prime_auth_valid') === 'true',
    getUsername: () => localStorage.getItem('prime_user_uname') || '',
    getFirstName: () => localStorage.getItem('prime_user_fname') || 'Customer',
    getLastName: () => localStorage.getItem('prime_user_lname') || '',
    getEmail: () => localStorage.getItem('prime_user_mail') || '',
    login: (uname, fname, lname, mail) => {
        localStorage.setItem('prime_auth_valid', 'true');
        localStorage.setItem('prime_user_uname', uname);
        localStorage.setItem('prime_user_fname', fname);
        localStorage.setItem('prime_user_lname', lname);
        localStorage.setItem('prime_user_mail', mail);
        window.location.reload();
    },
    logout: () => {
        localStorage.clear();
        window.location.reload();
    }
};

function refreshAuthHeader() {
    const panel = document.getElementById('ecommerce-auth-panel');
    if (!panel) return;

    if (UserState.isLoggedIn()) {
        panel.innerHTML = `
            <div class="flex items-center gap-2 text-xs md:text-sm">
                <span class="text-brand-300 font-semibold max-w-[80px] truncate">👋 ${UserState.getFirstName()}</span>
                <button onclick="UserState.logout()" class="bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] px-2 py-1 rounded-md transition hover:bg-red-500/20">Sign Out</button>
            </div>`;
    } else {
        panel.innerHTML = `<button onclick="toggleAuthModal(true)" class="bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white shadow-md transition">Register / Sign In</button>`;
    }
}

function toggleAuthModal(show) {
    const modal = document.getElementById('authProfileModal');
    if (!modal) return;
    if (show) modal.classList.add('active');
    else modal.classList.remove('active');
}

function saveAccountIdentityProfile() {
    const uname = document.getElementById('reg-username').value.trim();
    const fname = document.getElementById('reg-firstname').value.trim();
    const lname = document.getElementById('reg-lastname').value.trim();
    const mail = document.getElementById('reg-email').value.trim();

    if (!uname || !fname || !lname || !mail) {
        alert('Please fill out your Username, First Name, Last Name, and Email to complete registration!');
        return;
    }
    UserState.login(uname, fname, lname, mail);
}

function toggleCartDrawer(open) {
    const panel = document.getElementById('cartPanel');
    const backdrop = document.getElementById('cartBackdrop');
    if (!panel || !backdrop) return;
    if (open) {
        panel.classList.add('open');
        backdrop.classList.add('open');
    } else {
        panel.classList.remove('open');
        backdrop.classList.remove('open');
    }
}

function renderCatalogSection() {
    const wrapper = document.getElementById('catalog-products-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = PRODUCT_INVENTORY.map(item => `
        <div class="bg-dark-800 border border-gray-800 rounded-3xl overflow-hidden product-card-hover flex flex-col justify-between p-4">
            <div>
                <div class="w-full h-52 bg-dark-900 rounded-2xl overflow-hidden mb-4 relative">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <h3 class="text-xl font-bold tracking-tight text-white mb-1 font-display">${item.name}</h3>
                <p class="text-gray-400 text-xs line-clamp-3 mb-4">${item.description}</p>
            </div>
            <div>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xs text-gray-500">Price Structure</span>
                    <span class="text-xl font-extrabold text-brand-400">₦${item.price.toLocaleString()}</span>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <a href="https://wa.me{WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Primehealthcare! I am reviewing your site and want to make an enquiry regarding: ' + item.name)}" target="_blank" class="w-full text-center block text-xs border border-gray-700 hover:border-brand-500 text-gray-400 hover:text-brand-300 font-medium py-2.5 rounded-xl transition">
                        <i data-lucide="help-circle" class="w-4 h-4 inline mr-1 text-brand-400"></i> Ask Enquiry
                    </a>
                    <button onclick="addItemToBasket('${item.id}')" class="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md">
                        Add to Basket
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    if (window.lucide) { lucide.createIcons(); }
}

function addItemToBasket(id) {
    if (!UserState.isLoggedIn()) {
        toggleAuthModal(true);
        return;
    }

    const selection = PRODUCT_INVENTORY.find(prod => prod.id === id);
    if (selection) {
        basketRegistry.push(selection);
        syncBasketUIState();
        showToastNotification(`Added ${selection.name} to basket!`);
    }
}

function removeItemFromBasket(idx) {
    basketRegistry.splice(idx, 1);
    syncBasketUIState();
}

function syncBasketUIState() {
    const container = document.getElementById('cartItemsContainer');
    const totalField = document.getElementById('cartTotalField');
    const badge = document.getElementById('cart-badge');

    if (badge) badge.innerText = basketRegistry.length;
    if (!container) return;

    if (basketRegistry.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-gray-600">
                <i data-lucide="shopping-basket" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>
                Your item basket is empty.
            </div>`;
        if (totalField) totalField.innerText = "₦0";
        if (window.lucide) { lucide.createIcons(); }
        return;
    }

    let subtotal = 0;
    container.innerHTML = basketRegistry.map((product, index) => {
        subtotal += product.price;
        return `
            <div class="flex justify-between items-center bg-dark-900 border border-gray-800 p-3 rounded-2xl mb-2">
                <div class="pr-2">
                    <p class="font-bold text-white text-xs">${product.name}</p>
                    <p class="text-brand-400 text-xs font-bold mt-0.5">₦${product.price.toLocaleString()}</p>
                </div>
                <button onclick="removeItemFromBasket(${index})" class="text-gray-500 hover:text-red-400 p-1 transition">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>`;
    }).join('');

    if (totalField) totalField.innerText = "₦" + subtotal.toLocaleString();
    if (window.lucide) { lucide.createIcons(); }
}

function showToastNotification(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    document.getElementById('toast-message').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

function submitMultiCartCheckout() {
    if (basketRegistry.length === 0) { alert('Your basket is currently empty!'); return; }

    let manifest = `Hello Primehealthcare!\n\n`;
    manifest += ` CUSTOMER REGISTRATION PROFILE:\n`;
    manifest += `• Username: ${UserState.getUsername()}\n`;
    manifest += `• First Name: ${UserState.getFirstName()}\n`;
    manifest += `• Last Name: ${UserState.getLastName()}\n`;
    manifest += `• Email: ${UserState.getEmail()}\n\n`;

    manifest += ` PURCHASE ORDER DETAILS:\n`;
    let grossTotal = 0;

    basketRegistry.forEach((item, pos) => {
        manifest += `${pos + 1}. ${item.name} — ₦${item.price.toLocaleString()}\n`;
        grossTotal += item.price;
    });

    manifest += `\n Total Checkout Value: ₦${grossTotal.toLocaleString()}\n\nPlease verify my items and send over your payment details!`;

    window.open(`https://wa.me{WHATSAPP_NUMBER}?text=${encodeURIComponent(manifest)}`, '_blank');
}

// Start everything up when the document loads
window.addEventListener('DOMContentLoaded', () => {
    refreshAuthHeader();
    renderCatalogSection();
    syncBasketUIState();
    if (window.lucide) { lucide.createIcons(); }
});
