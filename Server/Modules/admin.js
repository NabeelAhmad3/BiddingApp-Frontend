const express = require('express');
const router = express.Router();
const pool = require('../db');

function isAdmin(req, res, next) {
    const { userid } = req.params;

    pool.query('SELECT role FROM users WHERE userid = ?', [userid], (err, results) => {
        if (err || results.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (results[0].role !== 'admin') {
            return res.status(403).json({ message: 'Admins only' });
        }
        next();
    });
}

router.get('/users/:userid', isAdmin, (req, res) => {
    pool.query('SELECT userid, name, email, city, role, created_at FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

router.delete('/deleteUser/:userid/:targetid', isAdmin, (req, res) => {
    const { targetid } = req.params;
    pool.query('DELETE FROM users WHERE userid = ?', [targetid], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'User deleted successfully' });
    });
});

router.get('/products/:userid', isAdmin, (req, res) => {
    const sql = `
        SELECT 
            p.productid, p.carname, p.price, p.model,
            p.cartype, p.fueltype, p.city, p.created_at,
            u.name AS seller_name,
            MIN(pi.image) AS image
        FROM products p
        LEFT JOIN users u ON p.userid = u.userid
        LEFT JOIN product_images pi ON p.productid = pi.productid
        GROUP BY p.productid
    `;
    pool.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const formatted = results.map(row => ({
            ...row,
            image: row.image
                ? `data:image/jpeg;base64,${row.image.toString('base64')}`
                : null
        }));
        res.status(200).json(formatted);
    });
});

// ✅ Delete any product (admin)
router.delete('/deleteProduct/:userid/:productid', isAdmin, (req, res) => {
    const { productid } = req.params;

    pool.query('DELETE FROM product_bid WHERE productid = ?', [productid], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        pool.query('DELETE FROM products WHERE productid = ?', [productid], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json({ message: 'Product deleted successfully' });
        });
    });
});

router.get('/productDetail/:userid/:productid', isAdmin, (req, res) => {
    const { productid } = req.params;

    const productSql = `
        SELECT 
            p.productid, p.carname, p.price, p.model, p.cartype,
            p.fueltype, p.city, p.address, p.description, p.created_at,
            u.userid AS owner_id, u.name AS owner_name, u.email AS owner_email,
            u.phone AS owner_phone, u.city AS owner_city, u.cnic AS owner_cnic
        FROM products p
        LEFT JOIN users u ON p.userid = u.userid
        WHERE p.productid = ?
    `;

    const imagesSql = `SELECT image FROM product_images WHERE productid = ?`;

    pool.query(productSql, [productid], (err, productResults) => {
        if (err) {
            console.error('Product detail error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (productResults.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = productResults[0];

        pool.query(imagesSql, [productid], (err, imageResults) => {
            if (err) {
                console.error('Images error:', err.message);
                return res.status(500).json({ error: err.message });
            }

            const images = imageResults.map(row =>
                `data:image/jpeg;base64,${row.image.toString('base64')}`
            );

            res.status(200).json({ ...product, images });
        });
    });
});

module.exports = router;