// --- DATABASE SIMULASI (Menggunakan localStorage) ---

// Fungsi untuk mendapatkan data dari localStorage atau default data jika kosong
const getInitialData = (key, defaultData) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
};

// Fungsi untuk menyimpan data ke localStorage
const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Data Produk Awal (Hanya digunakan jika localStorage kosong)
const initialProducts = [
    { id: 1, name: "Buku Kalkulus I Edisi 7", price: 45000, campus: "UI", category: "buku", condition: "Bagus", seller: "andi@ui.ac.id", image: "buku-kalkulus.jpg", badges: ["terfavorit"] },
    { id: 2, name: "Mouse Wireless Logitech M330", price: 99000, campus: "ITB", category: "elektronik", condition: "Seperti Baru", seller: "budi@itb.ac.id", image: "mouse-logitech.jpg", badges: [] },
    { id: 3, name: "Dispenser Air Minum Mini", price: 180000, campus: "UGM", category: "kos", condition: "Bekas Wajar", seller: "citra@ugm.ac.id", image: "dispenser-mini.jpg", badges: ["diskon"] },
    { id: 4, name: "Set Alat Praktikum Kimia Dasar", price: 250000, campus: "UI", category: "praktikum", condition: "Lengkap", seller: "dini@ui.ac.id", image: "alat-kimia.jpg", badges: [] },
    { id: 5, name: "Kemeja Flanel Uniqlo Size M", price: 60000, campus: "ITB", category: "pakaian", condition: "90%", seller: "eko@itb.ac.id", image: "kemeja-flanel.jpg", badges: ["diskon", "terfavorit"] },
    { id: 6, name: "Gitar Akustik Yamaha F-310", price: 950000, campus: "UGM", category: "hobi", condition: "Mulus", seller: "fajar@ugm.ac.id", image: "gitar-akustik.jpg", badges: [] }
];

// Data Pengguna Awal (Menggunakan email sebagai identifier, password diabaikan untuk simulasi)
const initialUsers = [
    { email: 'andi@ui.ac.id', phone: '08111', campus: 'UI', username: 'Andi (Teknik)' },
    { email: 'budi@itb.ac.id', phone: '08222', campus: 'ITB', username: 'Budi (Fisika)' },
    { email: 'guest@email.com', phone: '08500', campus: 'UNPAD', username: 'Guest User' }
];

let productsData = getInitialData('products', initialProducts);
let usersData = getInitialData('users', initialUsers);

// Data Dummy Kampus dan State
const campuses = ["UI", "ITB", "UGM", "UNPAD", "UNDIP"];
let currentUser = getInitialData('currentUser', null); // Simpan status login di localStorage
let cart = getInitialData('cart', []);


// --- UTILITY FUNCTIONS ---

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
const findProductById = (id) => productsData.find(p => p.id === id);
const getNextProductId = () => productsData.length > 0 ? Math.max(...productsData.map(p => p.id)) + 1 : 1;
const getSellerUsername = (sellerEmail) => {
    const user = usersData.find(u => u.email === sellerEmail);
    return user ? user.username : 'Penjual Tidak Dikenal';
};


// --- RENDER FUNCTIONS ---

const createProductCard = (product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);

    const badgesHtml = product.badges.map(badge => {
        let className = badge === 'diskon' ? 'badge-diskon' : 'badge-terfavorit';
        return `<span class="badge ${className}">${badge.toUpperCase()}</span>`;
    }).join('');

    card.innerHTML = `
        <img src="https://via.placeholder.com/250x200?text=${product.name.substring(0, 15).replace(/\s/g, '+')}" alt="${product.name}" class="product-image">
        <div class="product-badges">${badgesHtml}</div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-price">${formatRupiah(product.price)}</p>
            <div class="product-meta">
                <span><i class="fas fa-university"></i> ${product.campus}</span>
                <span><i class="fas fa-tag"></i> ${product.condition}</span>
            </div>
        </div>
    `;
    card.addEventListener('click', () => showProductDetails(product));
    return card;
};

const renderProducts = (products) => {
    const grid = document.getElementById('product-grid');
    const title = document.getElementById('listing-title');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 20px;">Tidak ada barang yang sesuai dengan filter atau Anda belum memposting barang.</p>';
    }

    products.forEach(product => grid.appendChild(createProductCard(product)));
    title.textContent = `✨ Barang Ditemukan (${products.length} Barang)`;
};

const populateCampusFilter = () => {
    const select = document.getElementById('filter-campus');
    campuses.forEach(campus => {
        const option = document.createElement('option');
        option.value = campus;
        option.textContent = campus;
        select.appendChild(option);
    });
};


// --- AUTHENTICATION & UI ---

const updateLoginLink = () => {
    const loginLink = document.getElementById('login-link');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (currentUser) {
        loginLink.innerHTML = `<i class="fas fa-shopping-cart"></i> Keranjang (${totalItems})`;
        loginLink.title = `Klik untuk melihat keranjang Anda, ${currentUser.username}`;
        // Tambahkan tombol Logout dan My Items
        const userMenu = document.getElementById('user-menu') || document.createElement('div');
        userMenu.id = 'user-menu';
        userMenu.innerHTML = `
            <a href="#" id="my-items-link"><i class="fas fa-box"></i> Barang Saya</a>
            <a href="#" id="logout-link" style="color: #ea4335;"><i class="fas fa-sign-out-alt"></i> Logout</a>
        `;
        // Pastikan menu hanya ada 1 kali
        if (!document.getElementById('user-menu')) {
             document.querySelector('.navbar nav').appendChild(userMenu.children[0]);
             document.querySelector('.navbar nav').appendChild(userMenu.children[0]);
        }
        
        document.getElementById('my-items-link').addEventListener('click', (e) => {
            e.preventDefault();
            viewMyItems();
        });

        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });

    } else {
        loginLink.innerHTML = `<i class="fas fa-user-circle"></i> Login/Daftar`;
        loginLink.title = `Login atau Daftar`;
        
        // Hapus tombol Barang Saya dan Logout jika ada
        const myItemsLink = document.getElementById('my-items-link');
        const logoutLink = document.getElementById('logout-link');
        if (myItemsLink) myItemsLink.remove();
        if (logoutLink) logoutLink.remove();
    }
    saveData('currentUser', currentUser);
};

const handleLogin = () => {
    if (currentUser) {
        // Jika sudah login, klik tombol keranjang
        viewCart();
        return;
    }

    const mode = prompt("Pilih mode: 1. Login/Daftar dengan Email, 2. Login/Daftar dengan No. HP. (Ketik 1 atau 2):");
    let identifier;

    if (mode === '1') {
        identifier = prompt("Masukkan Email Anda:");
        if (!identifier || !identifier.includes('@')) return alert("Email tidak valid.");
        identifier = identifier.toLowerCase();
    } else if (mode === '2') {
        identifier = prompt("Masukkan Nomor HP Anda:");
        if (!identifier || identifier.length < 5) return alert("Nomor HP tidak valid.");
    } else {
        return alert("Mode tidak valid.");
    }

    // Cek apakah user sudah ada
    let user = usersData.find(u => u.email === identifier || u.phone === identifier);
    
    if (user) {
        currentUser = user;
        alert(`Selamat datang kembali, ${currentUser.username}! Anda berhasil Login.`);
    } else {
        // Pendaftaran
        const newUsername = prompt("Anda pengguna baru! Masukkan Nama Pengguna (misal: Bintang Teknik):");
        const newCampus = prompt(`Masukkan Kampus Anda (${campuses.join(', ')}):`).toUpperCase();

        if (newUsername && campuses.includes(newCampus)) {
            const newUser = {
                email: mode === '1' ? identifier : `temp-${identifier}@kampus.com`,
                phone: mode === '2' ? identifier : '',
                campus: newCampus,
                username: newUsername
            };
            usersData.push(newUser);
            saveData('users', usersData);
            currentUser = newUser;
            alert(`Pendaftaran berhasil! Selamat datang, ${currentUser.username}.`);
        } else {
            return alert("Pendaftaran dibatalkan. Nama pengguna/Kampus tidak valid.");
        }
    }
    updateLoginLink();
    renderProducts(productsData); // Refresh listing
};

const handleLogout = () => {
    currentUser = null;
    saveData('currentUser', null);
    cart = [];
    saveData('cart', []);
    updateLoginLink();
    alert("Anda telah berhasil Logout.");
    renderProducts(productsData); // Refresh listing
};


// --- CRUD PRODUK (Jual Barang) ---

const handlePostItem = () => {
    if (!currentUser) {
        alert("Anda harus Login terlebih dahulu untuk menjual barang.");
        return handleLogin();
    }

    const mode = prompt("Pilih aksi: 1. Jual Barang Baru, 2. Kelola Barang Jualan Saya (Ketik 1 atau 2):");
    
    if (mode === '2') {
        return viewMyItems();
    }
    
    // 1. Jual Barang Baru (CREATE)
    const name = prompt("Nama Barang:");
    const priceStr = prompt("Harga (Rupiah, misal: 150000):");
    const category = prompt(`Kategori (${document.getElementById('filter-category').innerText.replace(/\n\s*/g, ', ')}):`);
    const condition = prompt("Kondisi (misal: 90%, Bekas Wajar):");

    if (name && priceStr && category && condition) {
        const newProduct = {
            id: getNextProductId(),
            name: name,
            price: parseInt(priceStr) || 0,
            campus: currentUser.campus,
            category: category.toLowerCase().trim(),
            condition: condition,
            seller: currentUser.email, // Gunakan email sebagai ID unik penjual
            image: `placeholder-${name.substring(0, 5)}.jpg`,
            badges: []
        };
        productsData.push(newProduct);
        saveData('products', productsData);
        alert(`Sukses! Barang "${newProduct.name}" berhasil diposting. (ID: ${newProduct.id})`);
        renderProducts(productsData); // Refresh listing utama
    } else {
        alert("Input tidak lengkap. Posting dibatalkan.");
    }
};

const viewMyItems = () => {
    if (!currentUser) return;

    const myItems = productsData.filter(p => p.seller === currentUser.email);
    
    if (myItems.length === 0) {
        return alert("Anda belum memposting barang apapun.");
    }
    
    let itemList = "📦 BARANG JUALAN SAYA 📦\n\n";
    myItems.forEach((item, index) => {
        itemList += `${index + 1}. [ID: ${item.id}] ${item.name} - ${formatRupiah(item.price)} (${item.condition})\n`;
    });
    itemList += "\n=============================\n";
    itemList += "Pilih aksi: \n1. Hapus Barang (ketik ID)\n2. Batalkan/Selesai";
    
    alert(itemList);
    
    const action = prompt("Masukkan ID barang yang ingin dihapus (misal: 4) atau ketik 'batal':");

    if (action && action.toLowerCase() !== 'batal') {
        const idToDelete = parseInt(action);
        const productIndex = productsData.findIndex(p => p.id === idToDelete && p.seller === currentUser.email);
        
        if (productIndex !== -1) {
            const productName = productsData[productIndex].name;
            // DELETE
            productsData.splice(productIndex, 1);
            saveData('products', productsData);
            alert(`Barang "${productName}" (ID ${idToDelete}) berhasil dihapus.`);
            renderProducts(productsData); // Refresh listing
            // Coba kelola lagi
            viewMyItems();
        } else {
            alert("ID barang tidak ditemukan atau barang tersebut bukan milik Anda.");
            viewMyItems();
        }
    }
};


// --- CUSTOMER ACTIONS (Filter, Cart, Checkout) ---

const filterProducts = () => {
    const search = document.getElementById('search-input').value.toLowerCase();
    const campus = document.getElementById('filter-campus').value;
    const category = document.getElementById('filter-category').value;
    const priceRange = document.getElementById('filter-price').value;

    const filtered = productsData.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search) || getSellerUsername(product.seller).toLowerCase().includes(search);
        const matchesCampus = campus === "" || product.campus === campus;
        const matchesCategory = category === "" || product.category === category;
        
        const matchesPrice = (() => {
            if (priceRange === "") return true;
            const [minStr, maxStr] = priceRange.split('-');
            const min = parseInt(minStr);
            const max = maxStr === 'max' ? Infinity : parseInt(maxStr);
            return product.price >= min && product.price <= max;
        })();

        return matchesSearch && matchesCampus && matchesCategory && matchesPrice;
    });

    renderProducts(filtered);
    alert(`Filter Diterapkan! Ditemukan ${filtered.length} barang.`);
};


const showProductDetails = (product) => {
    const isOwner = currentUser && product.seller === currentUser.email;
    const sellerInfo = getSellerUsername(product.seller);

    let actionButton;
    if (isOwner) {
        actionButton = `<button onclick="alert('Ini barang Anda! Kelola di menu Barang Saya.')" style="background-color: #aaa;">Barang Saya</button>`;
    } else if (product.seller === currentUser?.email) {
         actionButton = `<button onclick="alert('Anda tidak bisa membeli barang Anda sendiri!')" style="background-color: #aaa;">Barang Saya</button>`;
    } else {
        actionButton = `<button onclick="addToCart(${product.id})"><i class="fas fa-cart-plus"></i> Tambah ke Keranjang</button>`;
    }

    const detailsMessage = `
        =============================
        🛒 DETAIL PRODUK 🛒
        =============================
        Nama: ${product.name}
        Harga: ${formatRupiah(product.price)}
        Kampus: ${product.campus}
        Kategori: ${product.category}
        Kondisi: ${product.condition}
        Penjual: ${sellerInfo} 
        
        Aksi Pembeli:
        ${isOwner ? "Barang ini milik Anda." : `Kontak Penjual: ${product.seller}`}
        
        ${actionButton}
        =============================
    `;
    alert(detailsMessage);
};


const addToCart = (productId) => {
    if (!currentUser) {
        alert("Anda harus Login terlebih dahulu untuk menambahkan barang ke keranjang.");
        return handleLogin();
    }

    const product = findProductById(productId);
    if (!product) return alert("Produk tidak ditemukan.");

    if (product.seller === currentUser.email) {
        return alert("Anda tidak bisa membeli barang yang Anda jual sendiri!");
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
        alert(`${product.name} sudah ada di keranjang. Jumlah diperbarui menjadi ${existingItem.quantity}.`);
    } else {
        cart.push({ ...product, quantity: 1 });
        alert(`${product.name} berhasil ditambahkan ke keranjang!`);
    }
    saveData('cart', cart);
    updateLoginLink();
};

const viewCart = () => {
    if (cart.length === 0) {
        alert("Keranjang Anda kosong. Yuk, cari barang bekas keren!");
        return;
    }

    let cartSummary = "🛒 ISI KERANJANG ANDA 🛒\n\n";
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        cartSummary += `${index + 1}. ${item.name} (${item.quantity}x) - ${formatRupiah(itemTotal)}\n`;
    });

    cartSummary += `\n=============================
Total Belanja: ${formatRupiah(subtotal)}
=============================`;

    alert(cartSummary);

    const confirmCheckout = confirm("Lanjutkan ke proses Checkout?");

    if (confirmCheckout) {
        checkout(subtotal);
    }
};

const checkout = (finalTotal) => {
    alert(`🎉 Checkout Berhasil! 🎉
Pembayaran sebesar ${formatRupiah(finalTotal)} telah diproses.
Penjual akan dihubungi otomatis.
Terima kasih telah berhemat dengan Kampus Beken!`);
    
    // Reset keranjang setelah checkout
    cart = [];
    saveData('cart', []);
    updateLoginLink();
};


// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Awal
    populateCampusFilter();
    renderProducts(productsData);
    updateLoginLink();

    // 2. Hubungkan Event Listener untuk Tombol/Link Utama
    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        handleLogin();
    });

    document.getElementById('post-link').addEventListener('click', (e) => {
        e.preventDefault();
        handlePostItem();
    });

    // 3. Tambahkan Event Listener Filter
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterProducts();
    });

    // Hubungkan fungsi ke window agar bisa dipanggil dari onclick di HTML
    window.filterProducts = filterProducts;
    window.addToCart = addToCart;
    window.viewMyItems = viewMyItems;
    window.handleLogout = handleLogout;
});