const express = require('express');
const cors = require('cors');
const pool = require('./db');
const users_endpoint = require ('./Modules/users');
const products_endpoint = require('./Modules/products');
const product_bid_endpoint = require('./Modules/product_bid');
const payment_setting_endpoint = require('./Modules/payment_setting');
const id_verification_endpoint =require('./Modules/id_verification');
const contact_endpoint=require('./Modules/contact')
const adminRoutes = require('./Modules/admin');

pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL database');
    connection.release(); 
  });

const index = express();
const port = 5000;

index.use(express.json({ limit: '50mb' }));
index.use(express.urlencoded({ limit: '50mb', extended: true }));
index.use(cors());

index.use('/users', users_endpoint);
index.use('/products', products_endpoint);
index.use('/product_bid', product_bid_endpoint);
index.use('/payment_setting',payment_setting_endpoint);
index.use('/id_verification',id_verification_endpoint);
index.use('/contact',contact_endpoint);
index.use('/admin', adminRoutes);

index.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
