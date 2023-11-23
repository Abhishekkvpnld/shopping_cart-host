
const objectId = require('mongodb').ObjectId
const product = require('./models/product-model')
const admin = require('./models/admin_signup_model')
const bcrypt = require('bcrypt');
const adminSignup = require('./models/admin_signup_model');
const orderProduct=require('./models/place-order-model');

module.exports = {
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            product.findOneAndRemove({ _id: new objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getproductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            product.findOne({ _id: new objectId(proId) }).lean().then((productData) => {
                resolve(productData)
            })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            product.updateOne({ _id: new objectId(proId) }, {
                $set: {
                    productNo: proDetails.productNo,
                    productName: proDetails.productName,
                    productPrice: proDetails.productPrice,
                    productDetails: proDetails.productDetails
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    doSignup: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.password = await bcrypt.hash(adminData.password, 10)
            let data = new admin(adminData)
            data.save()
                .then((response) => {
                    resolve(response)
                })
        })
    },

doLogin:(adminData)=>{
    return new Promise(async(resolve,reject)=>{
        loginStatus: false
        const  response = {}
        let adminDetails = await adminSignup.findOne({ Email: adminData.Email }).lean()
        if (adminDetails) {
           let getStatus=await bcrypt.compare(adminData.password,adminDetails.password)
                if (getStatus) {
                    console.log('login success')
                   response.admin = adminDetails
                  response.status = true
                    resolve(response)
                }
                //  else {
                //     console.log('login failed')
                //     resolve({status:false})
                // }
        } else {
            console.log('login failed');
            resolve({status:false})
        }
    })  
},


userOrderDetais:()=>{
    return new Promise((resolve,reject)=>{
orderProduct.find({ status: { $in: ['order-shipped', 'order-placed'] } }).lean().then((response)=>{
   resolve(response)
})
    })
},


changeShippingStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
orderProduct.updateOne({_id: new objectId(orderId)},
{
    $set:{
        status:'order-shipped'
    }
}).then((response)=>{
    resolve(response)
})
    })
}
}