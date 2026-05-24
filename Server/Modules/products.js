const express = require('express');
const router = express.Router();
const pool = require('../db');


router.post('/addProducts', (req, res) => {
    const { carname, price, fueltype, cartype, description, city, address, userid, images } = req.body;

    const productSql = `
        INSERT INTO products 
        (carname, price, fueltype, cartype, description, city, address, userid) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const productValues = [carname, price, fueltype, cartype, description, city, address, userid];

    pool.query(productSql, productValues, (err, result) => {
        if (err) {
            console.error('Error inserting product:', err);
            return res.status(500).json({ sqlMessage: 'Failed to insert product' });
        }

        const productId = result.insertId;

        if (images && images.length > 0) {
            const imageSql = `INSERT INTO product_images (productid, image) VALUES ?`;
            const imageValues = images.map(img => [productId, img]);

            pool.query(imageSql, [imageValues], (imgErr) => {
                if (imgErr) {
                    console.error('Error inserting images:', imgErr);
                    return res.status(500).json({ sqlMessage: 'Failed to insert images' });
                }

                res.status(201).json({ message: 'Product and images added successfully', result });
            });
        } else {
            res.status(201).json({ message: 'Product added successfully (no images)', result });
        }
    });
});


router.put('/updateProduct/:productid/:userid', (req, res) => {
    const { productid, userid } = req.params;
    const updatedProductData = req.body;

    pool.query(
        'UPDATE products SET ? WHERE productid = ? AND userid = ?',
        [updatedProductData, productid, userid],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send({ message: 'Error updating product' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: 'Product not found or not owned by user' });
            }
            res.send({ message: 'Product updated successfully' });
        }
    );
});


router.get('/livelistings', (req, res) => {
    const sql = `
        SELECT 
            p.productid, 
            p.carname, 
            p.city, 
            b.price,
            MIN(pi.image) AS image
        FROM products p
        INNER JOIN product_bid b ON p.productid = b.productid
        LEFT JOIN product_images pi ON p.productid = pi.productid
        GROUP BY p.productid, p.carname, p.city, b.price
    `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching live listings:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        const formatted = result.map(row => ({
            ...row,
            image: row.image ? `data:image/jpeg;base64,${row.image.toString('base64')}` : null
        }));

        res.status(200).json(formatted);
    });
});


router.get('/productsInfo/:productid', (req, res) => {
    const { productid } = req.params;

    const productSql = `
        SELECT products.carname, products.productid, products.city, products.price, products.model,
               products.cartype, products.fueltype, products.address, products.description,
               products.created_at, product_bid.price AS bid_price,
               users.name AS seller_name, users.city AS seller_city
        FROM products
        LEFT JOIN product_bid ON products.productid = product_bid.productid
        LEFT JOIN users ON products.userid = users.userid
        WHERE products.productid = ?
    `;

    const imagesSql = `SELECT image FROM product_images WHERE productid = ?`;

    pool.query(productSql, [productid], (err, productResults) => {
        if (err) {
            console.error('Error fetching product info:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (productResults.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = productResults[0];

        pool.query(imagesSql, [productid], (err, imageResults) => {
            if (err) {
                console.error('Error fetching images:', err);
                return res.status(500).json({ error: 'Database query error' });
            }

            const images = imageResults.map(row =>
                `data:image/jpeg;base64,${row.image.toString('base64')}`
            );

            res.status(200).json({ ...product, images });
        });
    });
});


router.get('/allData', (req, res) => {
    const sql = `
        SELECT 
            products.productid,
            products.carname,
            products.description,
            products.price,
            products.fueltype,
            products.cartype,
            products.city,
            products.userid,
            GROUP_CONCAT(product_images.image SEPARATOR ',') AS images
        FROM products
        LEFT JOIN product_images ON products.productid = product_images.productid
        GROUP BY products.productid
    `;

    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        const formatted = results.map(row => ({
            ...row,
            images: row.images
                ? row.images.split(',').map(img => `data:image/jpeg;base64,${img}`)
                : []
        }));

        res.status(200).json(formatted);
    });
});


router.get('/myProducts/:userid', (req, res) => {
    const { userid } = req.params;
    const sql = `
        SELECT p.*, pi.image
        FROM products p
        LEFT JOIN product_images pi ON p.productid = pi.productid
        WHERE p.userid = ?
        GROUP BY p.productid
    `;

    pool.query(sql, [userid], (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        results.forEach(row => {
            if (row.image) {
                row.image = `data:image/jpeg;base64,${row.image.toString('base64')}`;
            }
        });

        res.status(200).json(results);
    });
});


router.delete('/deleteProduct/:productid/:userid', (req, res) => {
    const { productid, userid } = req.params;
    const deleteBidsSql = `DELETE FROM product_bid WHERE productid = ?`;

    pool.query(deleteBidsSql, [productid], (err, results) => {
        if (err) {
            console.error('Error deleting related bids:', err);
            return res.status(500).json({ error: 'Error deleting related bids' });
        }

        const deleteProductSql = `DELETE FROM products WHERE productid = ? AND userid = ?`;

        pool.query(deleteProductSql, [productid, userid], (err, results) => {
            if (err) {
                console.error('Error deleting product:', err);
                return res.status(500).json({ error: 'Database query error' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found or does not belong to the user' });
            }

            res.status(200).json({ message: 'Product deleted successfully' });
        });
    });
});


router.get('/search', (req, res) => {
    const carname = req.query.carname;
    const productid = parseInt(req.query.productid, 10);

    if (!carname && isNaN(productid)) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    let sql = `
        SELECT 
            p.productid, p.carname, p.price, p.fueltype,
            p.cartype, p.city, p.description,
            GROUP_CONCAT(pi.image SEPARATOR ',') AS images
        FROM products p
        LEFT JOIN product_images pi ON p.productid = pi.productid
        WHERE `;

    const queryParams = [];

    if (carname) {
        sql += 'p.carname LIKE ? ';
        queryParams.push(`%${carname}%`);
    }

    if (!isNaN(productid)) {
        if (carname) sql += 'OR ';
        sql += 'p.productid = ? ';
        queryParams.push(productid);
    }

    sql += 'GROUP BY p.productid';

    pool.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error('Error searching for product:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        const formatted = results.map(row => ({
            ...row,
            images: row.images
                ? row.images.split(',').map(img => `data:image/jpeg;base64,${img}`)
                : []
        }));

        res.status(200).json(formatted);
    });
});


module.exports = router;