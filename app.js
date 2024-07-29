let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];


iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
})
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
})

    const addDataToHTML = () => {
    // remove datas default from HTML

        // add new datas
        if(products.length > 0) // if has data
        {
            products.forEach(product => {
                let newProduct = document.createElement('div');
                newProduct.dataset.id = product.id;
                newProduct.classList.add('item');
                newProduct.innerHTML = 
                `<img src="${product.image}" alt="">
                <h4>${product.name}</h4>
                <h2>${product.use}</h2>
                <div class="price">$${product.price}</div>
                <button class="addCart">Add To Cart</button>`;
                listProductHTML.appendChild(newProduct);
            });
        }
    }
    listProductHTML.addEventListener('click', (event) => {
        let positionClick = event.target;
        if(positionClick.classList.contains('addCart')){
            let id_product = positionClick.parentElement.dataset.id;
            addToCart(id_product);
        }
    })
const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if(cart.length <= 0){
        cart = [{
            product_id: product_id,
            quantity: 1
        }];
    }else if(positionThisProductInCart < 0){
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    }else{
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
}
const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
}

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if(cart.length > 0){
        cart.forEach(item => {
            totalQuantity = totalQuantity +  item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            listCartHTML.appendChild(newItem);
            newItem.innerHTML = `
            <div class="image">
                <img src="${info.image}">
                </div>
                <div class="name"><span>
                ${info.name}</span>
                </div>
                <div class="totalPrice">$${info.price * item.quantity}</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
        })
    }
    iconCartSpan.innerText = totalQuantity;
}

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if(positionClick.classList.contains('plus')){
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
})
const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if(positionItemInCart >= 0){
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;
        
            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                }else{
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
}

const initApp = () => {
    fetch('products.json')
    .then(response => response.json())
    .then(data => {
        products = data;
        addDataToHTML();
        generateEmailContent(products);

        if(localStorage.getItem('cart')){
            cart = JSON.parse(localStorage.getItem('cart'));
            addCartToHTML();
        }
    });
};

const title = document.querySelector('.title')
const leaf1 = document.querySelector('.leaf1')
const leaf2 = document.querySelector('.leaf2')
const bush2 = document.querySelector('.bush2')
const mount1 = document.querySelector('.mount1')
const mount2 = document.querySelector('.mount2')

document.addEventListener('scroll', function() {
    let value = window.scrollY
    // console.log(value)
    title.style.marginTop = value * 1.1 + 'px'

    leaf1.style.marginLeft = -value + 'px'
    leaf2.style.marginLeft = value + 'px'

    bush2.style.marginBottom = -value + 'px'

    mount1.style.marginBottom = -value * 1.1 + 'px'
    mount2.style.marginBottom = -value * 1.2 + 'px'
})


// Search bar
const filterProductItems = (query) => {
    const items = document.querySelectorAll('.listProduct .item');
    items.forEach(item => {
        const name = item.querySelector('h4').innerText.toLowerCase();
        const use = item.querySelector('h2').innerText.toLowerCase();
        if (name.includes(query.toLowerCase()) || use.includes(query.toLowerCase())) {
            item.style.display = 'block'; // Show item if it matches the query
        } else {
            item.style.display = 'none'; // Hide item if it doesn't match the query
        }
    });
};

// Event listener for search button click
document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim(); // Trim whitespace from search query
    filterProductItems(query);
});

// Event listener for search input change (for real-time filtering)
document.getElementById('search-input').addEventListener('input', () => {
    const query = document.getElementById('search-input').value.trim();
    filterProductItems(query);
});

// Send mail

document.addEventListener('DOMContentLoaded', (event) => {
    const modal = document.getElementById("checkoutModal");
    span = document.getElementsByClassName("close")[0];
    let name = localStorage.getItem('name') || ''; // Retrieve name from local storage
    let address = localStorage.getItem('address') || ''; // Retrieve address from local storage
    let phone = localStorage.getItem('phone') || ''; // Retrieve address from local storage

    // Function to show the checkout modal
    const showCheckoutModal = () => {
        modal.style.display = "block";
    };
    
    // Function to close the checkout modal
    const closeCheckoutModal = () => {
    modal.style.display = "none";
    };

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        address = document.getElementById('address').value;
        phone = document.getElementById('phone').value;
        name = document.getElementById('name').value;
        localStorage.setItem('name', name);
        localStorage.setItem('phone', phone);
        localStorage.setItem('address', address);
        performCheckout(); // Proceed to checkout after collecting name and address
    };


    const performCheckout = () => {

        const emailContent = generateEmailContent(products, name, address, phone);
        const email = "ntthanesh@gmail.com";

        sendEmail(emailContent, email); // send the email to the user email

        localStorage.removeItem('cart'); // clear the cart
        cart =[];
        addCartToHTML(); // update the cart display
        modal.style.display = "none"; // hide the modal
    }; 


    document.querySelector('.checkOut').addEventListener('click', () => {
        if (!name || !address || !phone) {
            // If name or address is not collected, show the modal to collect them
            showCheckoutModal();
        } else {
            showCartDetailsAndTotal(); // Show cart details in the modal
            showCheckoutModal(); // Show the modal
        }
    });


    // Event listener for outside click
    window.onclick = (event) => {
        if (event.target == modal) {
            closeCheckoutModal();
        }
    };
    
    // Event listener for form submission
    document.getElementById('checkoutForm').addEventListener('submit', handleSubmit);
});





const generateEmailContent = (products, name, address, phone) => {
    let emailContent = `Name: ${name}\n \nAddress: ${address}\n \nphone: ${phone}Items in the cart:\n`;
    const cartItems = JSON.parse(localStorage.getItem('cart'));
    console.log(cartItems)
    cartItems.forEach(cartItem => {
        let product = products[cartItem.product_id - 1];
        if (product) {
            emailContent += `Product: ${product.name}, Quantity: ${cartItem.quantity}, Price: $${product.price * cartItem.quantity}\n`;
        } else {
            console.log(`Product with ID ${cartItem.product_id} not found`);
        }
    });
    return emailContent;
};

const showCartDetailsAndTotal = () => {
    const cartItems = JSON.parse(localStorage.getItem('cart'));
    const cartDetails = document.getElementById('cartDetails');
    cartDetails.innerHTML = ''; // Clear previous cart details
    let totalPrice = 0; // Initialize total price

    cartItems.forEach(cartItem => {
        let product = products[cartItem.product_id - 1];
        if (product) {
            const itemTotalPrice = product.price * cartItem.quantity;
            totalPrice += itemTotalPrice; // Add item's total price to total price
            const cartItemHTML = `
                <div class="cart-item">
                    <span>${product.name}</span>
                    <span>Quantity: ${cartItem.quantity}</span>
                    <span>Total Price: $${itemTotalPrice}</span>
                    <br>
                </div>
            `;
            cartDetails.innerHTML += cartItemHTML;
        } else {
            console.log(`Product with ID ${cartItem.product_id} not found`);
        }
    });
        // Display total price
        const totalPriceHTML = `
        <div class="total-price">
            <strong>Total Price: $${totalPrice}</strong>
        </div>
    `;
    cartDetails.innerHTML += totalPriceHTML;
};



const sendEmail = (content, recipientEmail) => {
    fetch('http://localhost:3000/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailContent: content, recipientEmail: recipientEmail }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
    })
    .then(data => {
        console.log('Email sent:', data);
        alert('Oder placed successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send oder');
    });
};



initApp();




