const Userlogin = require('./models/user-signup');
const userCart = require('./models/cart-model')
const objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt');
const collections = require('../dbconfig/collections');
const orderProduct = require('./models/place-order-model');
const Razorpay = require('razorpay');
const { count } = require('console');
const { response } = require('express');


var instance = new Razorpay({
    key_id: 'rzp_test_4cUhD08dmKn1YA',
    key_secret: 'ZQzLpkUmpong2YDNHtULRGkj',
});

module.exports = {

    doSingup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            let data = new Userlogin(userData)
            data.save()
            resolve(data)
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            loginStatus: false
            let response = { status: false }
            //data taking from database
            let user = await Userlogin.findOne({ Email: userData.Email })
                .then((user) => {
                    console.log(user);
                    if (user) {
                        bcrypt.compare(userData.password, user.password).then((status) => {
                            if (status) {
                                console.log('login success')
                                response.user = user
                                response.status = true
                                resolve(response)
                            } else {
                                console.log('login failed')
                                resolve({ status: false })
                            }
                        })
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
        })
    },


    addToCart: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            let proObj = {
                item: new objectId(proId),
                quantity: 1

            }
            let cart = await userCart.findOne({ user: new objectId(userId) }).lean()
            console.log(cart);
            if (cart) {
                let proExist = cart.products.findIndex(product => product.item == proId)
                // console.log(proExist);
                if (proExist != -1) {
                    userCart.updateOne({ user: new objectId(userId), 'products.item': new objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then((response) => {
                            resolve()
                        })

                }
                else {
                    userCart.updateOne({ user: new objectId(userId) }, {
                        $push: {
                            products: (proObj)
                        }
                    }).then((response) => {
                        resolve(response)
                    })
                }

            } else {
                let cartObj = {
                    user: new objectId(userId),
                    product: [proObj]
                }
                let addCart = new userCart(cartObj).save().then((response) => {
                    resolve(response)
                })
            }

        })
    },

    getCartProduct: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItem = await userCart.aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products' // Fix the typo
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        products: { $arrayElemAt: ["$products", 0] }
                    }
                }
            ]);
            resolve(cartItem);
        });
    },

    // {
    // $lookup: {
    //     from: collections.PRODUCT,
    //     let: { proList: '$product' },
    //     pipeline: [
    //         {
    //             $match: {
    //                 $expr: {
    //                     $in: ["$_id", "$$proList"]
    //                 }
    //             }
    //         } 
    //     ],
    //     as: "cartItems"
    // }
    // }


    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await userCart.findOne({ user: new objectId(userId) }).lean()
            if (user) {
                console.log(user.products.length);
                var count = user.products.length
                resolve(count)
            } else {
                let count = 0;
                resolve(count)
            }
        })
    },


    changeProductQuantity: (cartId, proId, changeCount, quantity) => {
        let Count = parseInt(changeCount)
        return new Promise(async (resolve, reject) => {

            if(changeCount === -1 && quantity ==1){
                let removeProduct = userCart.updateOne({ _id: new objectId(cartId)},
                {
                    $pull:{products:{item: new objectId(proId)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })

            }else{

            let product = await userCart.updateOne({ _id: new objectId(cartId), 'products.item': new objectId(proId) },
                {
                    $inc: { 'products.$.quantity': Count }
                })
                .then((response) => {
                    response.quantity = quantity
                    resolve(response)
                })
            }
        })
    },


    removeCartProduct: (cartId, proId) => {
        return new Promise(async (resolve, reject) => {
            userCart.updateOne(
                { _id: new objectId(cartId) },
                {
                    $pull: { products: { item: new objectId(proId) } }
                }
            )
                .then((response) => {
                    resolve(response)
                })
        });
    },


    getTotalPrice: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await userCart.findOne({ user: new objectId(userId) }).lean()
            if (cart.products.length) {
                let total = await userCart.aggregate([
                    {
                        $match: { user: new objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            products: { $arrayElemAt: ["$products", 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalPrice: { $sum: { $multiply: ['$quantity', '$products.productPrice'] } }
                        }
                    }
                ]);
                let totalPrice = total[0].totalPrice
                resolve(totalPrice);
                console.log('products inside');
            } else {

                console.log('cart is empty');
                let totalPrice = 0;
                resolve(totalPrice)
            }
        });
    },


    getCartProductList: (userId) => {
        return new Promise((resolve, reject) => {
            userCart.findOne({ user: new objectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },


    placeOrder: (deliveryDetails, products, totalPrice, date, userId) => {
        return new Promise((resolve, reject) => {
            let status = deliveryDetails['payment-method'] === 'COD' ? 'order-placed' : 'order-pending'

            orderObj = {
                delivery: {
                    address: deliveryDetails.adress,
                    mobileNo: deliveryDetails.contactNo,
                    pinCode: deliveryDetails.pincode
                },
                userId: new objectId(deliveryDetails.userId),
                paymentMethod: deliveryDetails['payment-method'],
                products: products.products,
                totalPrice: totalPrice,
                date: date,
                status: status
            }
            let data = new orderProduct(orderObj)
            data.save().then((response) => {
                userCart.findOneAndRemove({ user: new objectId(userId) })
                let orderId = response._id
                resolve(orderId)
            })
        })
    },


    orderDetails: (userId) => {
        return new Promise((resolve, reject) => {
            orderProduct.find({ userId: new objectId(userId) }).lean().then((response) => {
                resolve(response)
            })
        })
    },


    viewOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await orderProduct.aggregate([
                {
                    $match: { _id: new objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        products: { $arrayElemAt: ["$products", 0] }
                    }
                }
            ]);
            console.log(orderItems);
            resolve(orderItems);
        })
    },

    generateRazorPay: (orderId, totalPrice) => {
        return new Promise((resolve, reject) => {
            let options = {
                amount: totalPrice,
                currency: "INR",
                receipt: "" + orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }
            instance.orders.create(options

                , (err, order) => {
                    // console.log(order);
                    resolve(order)
                })

        })
    },

    verifyPayment: (orderDetails) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'ZQzLpkUmpong2YDNHtULRGkj');
            hmac.update(orderDetails['payment[razorpay_order_id]'] + '|' + orderDetails['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == orderDetails['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },


    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            orderProduct.updateOne({ _id: new objectId(orderId) },
                {
                    $set: {
                        status: 'order-placed'
                    }
                }).then(() => {
                    resolve()
                })
        })
    }

}  