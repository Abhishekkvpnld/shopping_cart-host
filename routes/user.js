var express = require('express');
var router = express.Router();
const product = require('../helpers/models/product-model')
const userHelper = require('../helpers/user-helper');

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  const products = await product.find({}).lean();
  let user = req.session.user
  if (user) {
    let userId = req.session.user._id
    userHelper.getCartCount(userId).then((count) => { 
      res.render('./user/user', { count, user, products, admin: false });
    })
  } else {
    res.render('./user/user', { user, products, admin: false });
  }

});

router.get('/login', (req, res) => {

  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    let loginErr = 'invalid user name and password'
    if (loginErr) {
      res.render('./user/login', { loginErr })
      loginErr = null
    }
    res.render('./user/login', {})
    loginErr = null
  }
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', async function (req, res) {
  userHelper.doSingup(req.body).then((response) => {
    req.session.user = response
    // req.session.userLoggedIn = true
    res.redirect('/login')
  })
})

router.post('/login', (req, res,next) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      res.redirect('/login')
      req.session.loginErr = "invalid user name and password"
      req.session.loginErr = true
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  // req.session.user.destroy()
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  let userId = req.session.user._id
  let user = req.session.user
  let products = await userHelper.getCartProduct(userId)
  let total = await userHelper.getTotalPrice(userId)
  res.render('user/cart', { user, products, total })
})

router.get('/add-to-cart/:id', (req, res) => {
  let proId = req.params.id
  let userId = req.session.user._id
  console.log('proId' + proId)
  console.log('userId' + userId)
  userHelper.addToCart(userId, proId).then((response) => {
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', async (req, res) => {
  console.log(req.body);
  let userId = req.session.user._id
  let cartId = req.body.cart
  let proId = req.body.product
  let changeCount = req.body.changeCount
  let quantity = req.body.quantity
  userHelper.changeProductQuantity(cartId, proId, changeCount, quantity).then(async (response) => {
    let total = await userHelper.getTotalPrice(userId)
    response.total = total;
    res.json({ response })
  })
})

router.post('/remove-cart-product', (req, res) => {
  let cartId = req.body.cart;
  let proId = req.body.product;
  userHelper.removeCartProduct(cartId, proId).then((response) => {
    res.json({ response })
  })
})

router.get('/orderPage', verifyLogin, (req, res) => {
  res.render('./user/order')
})

router.get('/place-order', verifyLogin, (req, res) => {
  let userId = req.session.user._id
  userHelper.getTotalPrice(userId).then((total) => {
    res.render('./user/placeOrder', { total, userId })
  });
})

router.post('/place-order', async (req, res) => {
  let cartProducts = await userHelper.getCartProductList(req.body.userId)
  let totalPrice = await userHelper.getTotalPrice(req.body.userId).then((totalPrice)=>{

  let date = new Date();
  let userId = req.body.userId
  userHelper.placeOrder(req.body, cartProducts, totalPrice, date, userId).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ CodStatus: true })
    } else {
      CodStatus=false
      userHelper.generateRazorPay(orderId, totalPrice).then((order) => {
        // console.log(order);
        res.json(order)
      })
    }  
  })
})
})

router.get('/order-status', verifyLogin, (req, res) => {
  res.render('user/order-status')
})

router.get('/order-details', verifyLogin, async (req, res) => {
  let userId = req.session.user._id
  let orderDetails = await userHelper.orderDetails(userId)
  // console.log(orderDetails);
  res.render('user/order-details', { orderDetails })
})

router.get('/view-order-products/:id', verifyLogin, (req, res) => {
  let orderId = req.params.id
  userHelper.viewOrderProducts(orderId).then((products) => {
    res.render('user/view-order-products', { products })
  }) 
})

router.post('/verify-payment', (req, res) => {
console.log(req.body);
userHelper.verifyPayment(req.body).then((response)=>{
  userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
    res.json({status:true})
  })
}).catch((err)=>{
  res.json({status:false,errMsg:''})
})
})


module.exports = router; 
