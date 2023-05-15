function updateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

async function getProducts() {
try {
    const data = await fetch("https://ecommercebackend.fundamentos-29.repl.co/");
    const res = await data.json();
    
    updateLocalStorage('products', res);

    return res;
    } catch (error) {
    console.error(error);
    }    
}

function printProducts(db) {
    let html = "";

    db.products.forEach(({ image, name, price, quantity, id }) => {
        html += `
        <div class="product">
            <div class="product__img">
                <img src="${image}"
                    alt="${name}">
                </div>
                <div class="product__body">
                    <h4>${name}</h4>
                    <p>
                        <b>Precio: </b> $${price}.00
                    </p>
                    <p class="${quantity ? "" : "soldOut"}">
                        <b> Stock: </b> ${quantity ? quantity : "Agotado"}
                    </p>
                    ${
                        quantity
                            ? `<i class='bx bx-plus' id="${id}"></i>`
                            : "<div></div>"
                    }                    
                </div>
            </div>
        `;
    });

    document.querySelector('.products').innerHTML = html;
}

function printProductsCart(db) {
    let html = "";

    Object.values(db.cart).forEach((item) => {
        html += `
            <div class="cartItem">
                <div class="cartItem__img">
                    <img src="${item.image}" alt="${item.name}" />
                </div>
                
                <div class="cartItem__body">
                    <h4>${item.name}</h4>
                    <p>$${item.price}.00 | $${item.price * item.amount}.00</p>

                <div class="cartItem__options" data-id="${item.id}">
                    <i class='bx bxs-minus-square'></i>
                    <span>${item.amount}</span>
                    <i class='bx bxs-plus-square'></i>
                    <i class='bx bxs-trash' ></i>
                </div>

                </div>


            </div>
        `;
    });

    document.querySelector(".cart__products").innerHTML = html
}

function handleShowCart() {
    const iconCartHTML = document.querySelector("#iconCart");
    const cartHTML = document.querySelector(".cart");

    iconCartHTML.addEventListener("click", function() {
        cartHTML.classList.toggle("cart__show");
    });
}

function addCartFromProducts(db) {
    const productHTML = document.querySelector(".products");

    productHTML.addEventListener("click", function (e) {
        if (e.target.classList.contains("bx-plus")) {
            const productId = Number(e.target.id);

            const productFind = db.products.find(function (product) {
                return product.id === productId;
            });

            if (db.cart[productId]) {
                if (db.cart[productId].amount === db.cart[productId].quantity)
                    return alert("Ya no hay Stock disponible");

                    db.cart[productId].amount += 1;
            } else {
                db.cart[productId] = structuredClone(productFind);
                db.cart[productId].amount = 1;
            }

            updateLocalStorage("cart", db.cart);
            printTotal(db);
            printProductsCart(db);
        }
    });
}

function printTotal(db) {
    const amountIemsHTML = document.querySelector('#amountItems')
    const cartTotalInfoHTML = document.querySelector(".cart__total--info");

    let amountProducts = 0;
    let priceTotal = 0;

    Object.values(db.cart).forEach((item) => {
        amountProducts += item.amount;
        priceTotal += item.amount * item.price;
    });
    
    let html = `
    <p>
        <b>Items: </b> ${amountProducts} items
    </p>
    <p>
        <b>Precio Total: </b> $${priceTotal}.00 USD
    </p>
    `;

    cartTotalInfoHTML.innerHTML = html;
    amountIemsHTML.textContent = amountProducts;
}

function handleCart(db) {
    const cartProductsHTML = document.querySelector(".cart__products");
    
    cartProductsHTML.addEventListener("click", function (e) {
        if (e.target.classList.contains("bxs-minus-square")) {
            const productId = Number(e.target.parentElement.dataset.id);

            if (db.cart[productId].amount === 1) {

            const response = confirm ('Quieres eliminar este producto?');
            if (!response) return;
            
                delete db.cart[productId];
            } else {
                db.cart[productId].amount -=1;
            }
        }
        
        if (e.target.classList.contains("bxs-plus-square")) {
            const productId = Number(e.target.parentElement.dataset.id);

            if (db.cart[productId].amount === db.cart[productId].quantity)
                return alert("Ya no hay Stock disponible");

            db.cart[productId].amount += 1;
        }

        if (e.target.classList.contains("bxs-trash")) {
            const productId = Number(e.target.parentElement.dataset.id);
        
            const response = confirm ('Quieres eliminar este producto?');
            if (!response) return;
            
            delete db.cart[productId];
        }

        printProductsCart(db);
        updateLocalStorage("cart", db.cart);
        printTotal(db);
    });
}

function handleBuy(db) {
    document.querySelector("#btn__buy").addEventListener("click",function(){
        if (!Object.values(db.cart).length) 
            return alert("Tu Bolsa esta vacia");
        
        const newProducts = [];

        for (const product of db.products) {
            const productCart = db.cart[product.id];
        
            if (product.id === productCart?.id) {
                newProducts.push({
                        ...product,
                    quantity: product.quantity - productCart.amount,
                });
            } else {
                newProducts.push(product);
            }
        }

        db.products = newProducts;
        db.cart = {};

        updateLocalStorage("products", db.products);
        updateLocalStorage("cart", db.cart);

        printProducts(db);
        printProductsCart(db);
        printTotal(db);

    });
}

async function main() {
    const db = {
        products:
            JSON.parse(localStorage.getItem("products")) ||
            (await getProducts()),
        cart: JSON.parse(localStorage.getItem("cart")) || {},
    };

    printProducts(db);
    handleShowCart();
    printProductsCart(db);
    addCartFromProducts(db);
    handleCart(db);
    printTotal(db);
    handleBuy(db);
}

main();