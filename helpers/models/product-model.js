const mongoose = require('mongoose');
const collections=require('../../dbconfig/collections');
const productSchema = new mongoose.Schema({
    productNo: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productPrice: {
      type: Number,
      required: true
    },
    productDetails: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    imageName: {
      type: String
    }
  });
  
const Product = mongoose.model(collections.PRODUCT, productSchema);

module.exports =Product;