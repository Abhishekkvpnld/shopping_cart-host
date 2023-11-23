var express = require('express');
var router = express.Router();
const product = require('../helpers/models/product-model')
const adminHelper = require('../helpers/admin-helper');

const verifyAdminLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/adminLogin')
  }
}


/* GET users listing. */
router.get('/', async function (req, res, next) {
  let products = await product.find({}).lean();
  let adminData = req.session.admin
  if (req.session.adminLoggedIn) {
    res.render('./admin/admin-page', { adminData, products, admin: true });
  } else {
    res.render('./admin/admin-page', { products, admin: true });
  }
}

);

router.get('/add-product', verifyAdminLogin, function (req, res, next) {
  let adminData = req.session.admin
  res.render('./admin/addproduct', { adminData, admin: true })
})

router.post('/add-product', verifyAdminLogin, async function (req, res) {
  let data = new product(req.body);
  await data.save()

  let image = req.files.image;
  image.mv('./public/product-image/' + data._id + '.png', () => {
    let adminData = req.session.admin
    res.render('./admin/addproduct', { adminData, admin: true })

  })
})

router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  if (req.session.admin) {
    adminHelper.deleteProduct(proId).then((response) => {
      res.redirect('/admin')
    })
  } else {
    res.redirect('/admin/adminLogin')
  }
})

router.get('/edit-product/:id', async (req, res) => {
  // console.log(req.params.id); 
  if (req.session.admin) {
    let proId = req.params.id
    let productData = await adminHelper.getproductDetails(proId)
    let adminData = req.session.admin
    console.log(productData)
    res.render('./admin/edit-product', { adminData, productData, admin: true })
  } else {
    res.redirect('/admin/adminLogin')
  }
})

router.post('/edit-product/:id', async (req, res) => {
  let image = req.files.image
  let proId = req.params.id
  let proDetails = req.body
  let updateData = await adminHelper.updateProduct(proId, proDetails).then(() => {
    res.redirect('/admin')
    if (image) {
      image.mv('./public/product-image/' + proId + '.png')
    } else {
      res.redirect('/admin')
    }
  })
})

router.get('/adminLogin', (req, res) => {
  res.render('admin/adminLogin', { admin: true })
})


router.get('/signup', (req, res) => {
  res.render('./admin/super-admin-signup', { admin: true })
})

 
router.post('/signup', (req, res) => {
  adminHelper.doSignup(req.body).then((response) => {
    // req.session.admin=response
    res.redirect('/admin/adminLogin')
  }) 
})

router.post('/adminLogin', (req, res) => {
  let loginData = req.body
  adminHelper.doLogin(loginData).then((response) => {
    if (response) {
      req.session.adminLoggedIn = true
      req.session.admin = response
      res.redirect('/admin')
    } else {
      res.redirect('/admin/adminLogin')
      req.session.adminLoginErr = "invalid admin name and password"
      req.session.adminLoginErr = true
    }
  })
})

router.get('/logOut', (req, res) => {
  // req.session.admin.destroy()
  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/admin/adminLogin')
})

router.get('/userOrderDetails', verifyAdminLogin, (req, res) => {
  adminHelper.userOrderDetais().then((details) => {
    let adminData = req.session.admin
    res.render('admin/user-order', { adminData, details, admin: true })
  })
})

router.get('/getProductShipped/:id', (req, res) => {
  let orderId = req.params.id
  adminHelper.changeShippingStatus(orderId).then(() => {
    res.redirect('/admin/userOrderDetails')
  })
})

module.exports = router;   