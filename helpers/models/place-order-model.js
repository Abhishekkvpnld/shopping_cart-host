const mongoose = require('mongoose');
const collections= require ('../../dbconfig/collections')
const objectId = mongoose.Types.ObjectId;

// const productItemSchema ={
//     item: {
//         type:objectId,
//         ref: 'Product',
//         required: true,
//     },
//     quantity: {
//         type: Number,
//         required: true,
//     },
// };
// const deliverySchema ={
//     address: {
//         type: String,
//         required: true,
//     },
//     mobileNo: {
//         type: Number,
//         required: true,
//     },
//     pinCode: {
//         type:Number,
//         required: true,
//     },
// };

const orderSchema = new mongoose.Schema({
    delivery: {
        type:Object,
        required: true,
    },
    userId: {
        type:objectId,
        ref: 'User',
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: [],
        required: true,
    },
    products:Array,
    totalPrice: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        enum: [],
        required: true,
    },
});

const Order = mongoose.model(collections.ORDER_PRODUCT, orderSchema);

module.exports = Order;


