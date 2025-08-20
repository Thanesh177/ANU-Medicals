let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];



const updateCartInDatabase = () => {
  const user = firebase.auth().currentUser;
  if (user) {
    const db = firebase.firestore();
    db.collection('carts').doc(user.uid).set({ cart }, { merge: true })
      .then(() => console.log('Cart updated in Firestore'))
      .catch(error => console.error('Error updating cart in Firestore:', error));
  } else {
    localStorage.setItem('cart_guest', JSON.stringify(cart));
  }
};

const clearCartInDatabase = () => {
  const user = firebase.auth().currentUser;
  if (user) {
    const db = firebase.firestore();
    db.collection('carts').doc(user.uid).set({ cart: [] }, { merge: true })
      .then(() => console.log('Cart cleared in Firestore'))
      .catch(error => console.error('Error clearing cart in Firestore:', error));
  } else {
    localStorage.removeItem('cart_guest');
  }
};

const loadCartFromDatabase = () => {
  const user = firebase.auth().currentUser;
  if (user) {
    const db = firebase.firestore();
    db.collection('carts').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          cart = doc.data().cart || [];
          addCartToHTML();
        }
      })
      .catch(error => console.error('Error loading cart from Firestore:', error));
  } else {
    const savedCart = localStorage.getItem('cart_guest');
    if (savedCart) {
      cart = JSON.parse(savedCart);
      addCartToHTML();
    }
  }
};

// Unique key for cart storage per logged-in user
const getCartKey = () => {
  const user = firebase.auth().currentUser;
  return user ? `cart_${user.uid}` : 'cart';
};

iconCart.addEventListener('click', () => {
  body.classList.toggle('showCart');
});
closeCart.addEventListener('click', () => {
  body.classList.toggle('showCart');
});

const addDataToHTML = () => {
  listProductHTML.innerHTML = ''; // Clear existing content
  if (products.length > 0) {
    products.forEach(product => {
      let newProduct = document.createElement('div');
      newProduct.dataset.id = product.id;
      newProduct.classList.add('item');
      newProduct.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <h2>${product.use}</h2>
        <div class="price">$${product.price}</div>
        <button class="addCart">Add To Cart</button>`;
      listProductHTML.appendChild(newProduct);
    });
  }
};

listProductHTML.addEventListener('click', (event) => {
  if (event.target.classList.contains('addCart')) {
    const productId = event.target.parentElement.dataset.id;
    addToCart(productId);
  }
});

const addToCart = (product_id) => {
  const index = cart.findIndex(item => item.product_id == product_id);
  if (index === -1) {
    cart.push({ product_id, quantity: 1 });
  } else {
    cart[index].quantity += 1;
  }
  addCartToHTML();
  updateCartInFirestore();
};

const updateCartInFirestore = () => {
  const user = firebase.auth().currentUser;
  console.log('Current user:', user); // ✅ Add this for debugging

  if (user) {
    const db = firebase.firestore();
    db.collection('carts').doc(user.uid).set({ cart }, { merge: true })
      .then(() => console.log('✅ Cart updated in Firestore'))
      .catch(error => console.error('❌ Error updating cart in Firestore:', error));
  } else {
    console.warn('⚠️ No user found — using localStorage');
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
  }
};

const loadCartFromFirestore = () => {
  const user = firebase.auth().currentUser;
  if (user) {
    const db = firebase.firestore();
    db.collection('carts').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          cart = doc.data().cart || [];
          addCartToHTML();
        }
      })
      .catch(error => console.error('Error loading cart from Firestore:', error));
  } else {
    const savedCart = localStorage.getItem(getCartKey());
    if (savedCart) {
      cart = JSON.parse(savedCart);
      addCartToHTML();
    }
  }
};

const addCartToHTML = () => {
  listCartHTML.innerHTML = '';
  let totalQuantity = 0;
  if (cart.length > 0) {
    cart.forEach(item => {
      totalQuantity += item.quantity;
      let newItem = document.createElement('div');
      newItem.classList.add('item');
      newItem.dataset.id = item.product_id;
      
      // Use find() for product info
      let productInfo = products.find(p => p.id == item.product_id);
      if (productInfo) {
        newItem.innerHTML = `
          <div class="image">
            <img src="${productInfo.image}" alt="${productInfo.name}">
          </div>
          <div class="name">
            <span>${productInfo.name}</span>
          </div>
          <div class="totalPrice">$${(productInfo.price * item.quantity).toFixed(2)}</div>
          <div class="quantity">
            <span class="minus"><</span>
            <span>${item.quantity}</span>
            <span class="plus">></span>
          </div>
          <button class="clear-product">Clear</button>
        `;
        listCartHTML.appendChild(newItem);
      }
    });
  }
  iconCartSpan.innerText = totalQuantity;
};

listCartHTML.addEventListener('click', (event) => {
  let target = event.target;
  if (target.classList.contains('minus') || target.classList.contains('plus')) {
    let product_id = target.closest('.item').dataset.id;
    let type = target.classList.contains('plus') ? 'plus' : 'minus';
    changeQuantityCart(product_id, type);
  } else if (target.classList.contains('clear-product')) {
    let product_id = target.parentElement.dataset.id;
    clearProduct(product_id);
  }
});

const clearProduct = (product_id) => {
  cart = cart.filter(item => item.product_id != product_id);
  addCartToHTML();
  updateCartInFirestore();
};

const changeQuantityCart = (product_id, type) => {
  let index = cart.findIndex(item => item.product_id == product_id);
  if (index >= 0) {
    if (type === 'plus') {
      cart[index].quantity += 1;
    } else {
      cart[index].quantity -= 1;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
    }
  }
  addCartToHTML();
  updateCartInFirestore();
};

const initApp = () => {
  firebase.auth().onAuthStateChanged(user => {
    loadCartFromFirestore();
  });
  
  fetch('products.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      addDataToHTML();
      generateEmailContent(products);
    })
    .catch(error => console.error('Error fetching products:', error));
};

const title = document.querySelector('.title');
const leaf1 = document.querySelector('.leaf1');
const leaf2 = document.querySelector('.leaf2');
const bush2 = document.querySelector('.bush2');
const mount1 = document.querySelector('.mount1');
const mount2 = document.querySelector('.mount2');

document.addEventListener('scroll', function() {
  let value = window.scrollY;
  title.style.marginTop = value * 1.1 + 'px';
  leaf1.style.marginLeft = -value + 'px';
  leaf2.style.marginLeft = value + 'px';
  bush2.style.marginBottom = -value + 'px';
  mount1.style.marginBottom = -value * 1.1 + 'px';
  mount2.style.marginBottom = -value * 1.2 + 'px';
});

const filterProductItems = (query) => {
  const items = document.querySelectorAll('.listProduct .item');
  items.forEach(item => {
    const name = item.querySelector('h4').innerText.toLowerCase();
    const use = item.querySelector('h2').innerText.toLowerCase();
    if (name.includes(query.toLowerCase()) || use.includes(query.toLowerCase())) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
};

document.getElementById('search-button').addEventListener('click', () => {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.trim();
  filterProductItems(query);
});
document.getElementById('search-input').addEventListener('input', () => {
  const query = document.getElementById('search-input').value.trim();
  filterProductItems(query);
});

document.addEventListener('DOMContentLoaded', (event) => {
  const modal = document.getElementById("checkoutModal");
  let span = document.getElementsByClassName("close")[0];
  let name = localStorage.getItem('name') || '';
  let address = localStorage.getItem('address') || '';
  let phone = localStorage.getItem('phone') || '';

  const showCheckoutModal = () => {
    modal.style.display = "block";
  };
  
  const closeCheckoutModal = () => {
    modal.style.display = "none";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    address = document.getElementById('address').value;
    phone = document.getElementById('phone').value;
    name = document.getElementById('name').value;
    localStorage.setItem('name', name);
    localStorage.setItem('phone', phone);
    localStorage.setItem('address', address);
    performCheckout();
  };

  const performCheckout = () => {
    const emailContent = generateEmailContent(products, name, address, phone);
    const email = "ntthanesh@gmail.com";
    sendEmail(emailContent, email);
    
    const user = firebase.auth().currentUser;
    if (user) {
      const db = firebase.firestore();
      db.collection('carts').doc(user.uid).set({ cart: [] }, { merge: true })
        .then(() => console.log('Cart cleared in Firestore'))
        .catch(error => console.error('Error clearing cart in Firestore:', error));
    } else {
      localStorage.removeItem(getCartKey());
    }
    cart = [];
    addCartToHTML();
    closeCheckoutModal();
  };

  document.querySelector('.checkOut').addEventListener('click', () => {
      showCartDetailsAndTotal();
      showCheckoutModal();
  });

  document.querySelector('#checkoutModal .close').addEventListener('click', () => {
    closeCheckoutModal();
  });

  
  document.getElementById('checkoutForm').addEventListener('submit', handleSubmit);
});

const generateEmailContent = (products, name = '', address = '', phone = '') => {
  let emailContent = `Name: ${name}\n\nAddress: ${address}\n\nPhone: ${phone}\nItems in the cart:\n`;
  const cartItems = JSON.parse(localStorage.getItem(getCartKey())) || [];
  cartItems.forEach(cartItem => {
    const product = products.find(p => p.id == cartItem.product_id);
    if (product) {
      emailContent += `Product: ${product.name}, Quantity: ${cartItem.quantity}, Price: $${(product.price * cartItem.quantity).toFixed(2)}\n`;
    } else {
      console.log(`Product with ID ${cartItem.product_id} not found`);
    }
  });
  return emailContent;
};

const showCartDetailsAndTotal = () => {
  const cartDetails = document.getElementById('cartDetails');
  cartDetails.innerHTML = '';
  let tp = 0;
  cart.forEach(cartItem => {
    const product = products.find(p => p.id == cartItem.product_id);
    if (product) {
      const itemTotalPrice = product.price * cartItem.quantity;
      tp += itemTotalPrice;
      cartDetails.innerHTML += `
        <div class="cart-item">
          <span>${product.name}</span>
          <span>Quantity: ${cartItem.quantity}</span>
          <span>Total Price: $${itemTotalPrice.toFixed(2)}</span>
          <br>
        </div>
      `;
    }
  });
  cartDetails.innerHTML += `
    <div class="total-price">
      <strong>Total Price: $${tp.toFixed(2)}</strong>
    </div>
  `;
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
      alert('Order placed successfully!');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to send order');
    });
};














//=============================================================================
// Configuration
//=============================================================================

// The DOM element that the Google Pay button will be rendered into
const GPAY_BUTTON_CONTAINER_ID = 'gpay-container';

// Update the `merchantId` and `merchantName` properties with your own values.
// Your real info is required when the environment is `PRODUCTION`.
const merchantInfo = {
  merchantId: '12345678901234567890',
  merchantName: 'Example Merchant'
};

// This is the base configuration for all Google Pay payment data requests.
const baseGooglePayRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: [
          "PAN_ONLY", "CRYPTOGRAM_3DS"
        ],
        allowedCardNetworks: [
          "AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"
        ]
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'example',
          gatewayMerchantId: 'exampleGatewayMerchantId'
        }
      }
    }
  ],
  merchantInfo
};

// Prevent accidental edits to the base configuration. Mutations will be
// handled by cloning the config using deepCopy() and modifying the copy.
Object.freeze(baseGooglePayRequest);


//=============================================================================
// Google Payments client singleton
//=============================================================================

let paymentsClient = null;

function getGooglePaymentsClient() {
  if (paymentsClient === null) {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST',
      merchantInfo,
      // todo: paymentDataCallbacks (codelab pay-web-201)
    });
  }

  return paymentsClient;
}

//=============================================================================
// Helpers
//=============================================================================

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

function renderGooglePayButton() {
  const button = getGooglePaymentsClient().createButton({
    onClick: onGooglePaymentButtonClicked
  });

  document.getElementById(GPAY_BUTTON_CONTAINER_ID).appendChild(button);
}


//=============================================================================
// Event Handlers
//=============================================================================

function onGooglePayLoaded() {
  const req = deepCopy(baseGooglePayRequest);

  getGooglePaymentsClient()
    .isReadyToPay(req)
    .then(function(res) {
      if (res.result) {
        renderGooglePayButton();
      } else {
        console.log("Google Pay is not ready for this user.");
      }
    })
    .catch(console.error);
}

function onGooglePaymentButtonClicked() {
  // Calculate total price from cart
  let totalPrice = 0;
  cart.forEach(item => {
    const product = products.find(p => p.id == item.product_id);
    if (product) {
      totalPrice += product.price * item.quantity;
    }
  });

  // Create a new request data object for this request
  const req = {
    ...deepCopy(baseGooglePayRequest),
    transactionInfo: {
      countryCode: 'US',
      currencyCode: 'USD',
      totalPriceStatus: 'FINAL',
      totalPrice: totalPrice.toFixed(2),
    },
    // todo: callbackIntents (codelab gpay-web-201)
  };

  // Write request object to console for debugging
  console.log(req);

  getGooglePaymentsClient()
    .loadPaymentData(req)
    .then(function (res) {
      // Write response object to console for debugging
      console.log(res);
      // @todo pass payment token to your gateway to process payment
      // @note DO NOT save the payment credentials for future transactions
      paymentToken = res.paymentMethodData.tokenizationData.token;
    })
    .catch(console.error);
}


const container = document.getElementById("container");

const registerButton = document.getElementById("register");
const loginButton = document.getElementById("login");

const switchToSignup = document.getElementById("switch-to-signup");
const switchToLogin = document.getElementById("switch-to-login");



// Mobile toggle
switchToSignup.addEventListener("click", () => container.classList.add("active"));
switchToLogin.addEventListener("click", () => container.classList.remove("active"));

initApp();
