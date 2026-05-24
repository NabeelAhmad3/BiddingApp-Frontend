const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/startBid/:userid/:productid', (req, res) => {
    const { productid } = req.params;
    const { price, duration_hours } = req.body;

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + parseInt(duration_hours));

    const checkSql = `SELECT * FROM product_bid WHERE productid = ?`;
    pool.query(checkSql, [productid], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            const updateSql = `
                UPDATE product_bid 
                SET price = ?, bid_end_time = ?, is_active = 1 
                WHERE productid = ?
            `;
            pool.query(updateSql, [price, endTime, productid], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: 'Bid started successfully', bid_end_time: endTime });
            });
        } else {
            const insertSql = `
                INSERT INTO product_bid (price, productid, bid_end_time, is_active) 
                VALUES (?, ?, ?, 1)
            `;
            pool.query(insertSql, [price, productid, endTime], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: 'Bid started successfully', bid_end_time: endTime });
            });
        }
    });
});
router.put('/createBid/:userid/:productid', (req, res) => {
    const { userid, productid } = req.params;
    const { price } = req.body;
    const checkSql = `SELECT * FROM product_bid WHERE productid = ?`;
    pool.query(checkSql, [productid], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'No bid found for this product' });

        const bid = results[0];
        const now = new Date();
        const endTime = new Date(bid.bid_end_time);
        if (!bid.is_active) {
            return res.status(400).json({ error: 'Bidding has not started yet' });
        }
        if (now > endTime) {
            pool.query(`UPDATE product_bid SET is_active = 0 WHERE productid = ?`, [productid]);
            return res.status(400).json({ error: 'Bidding time has ended' });
        }
        if (parseFloat(price) <= parseFloat(bid.price)) {
            return res.status(400).json({
                error: `Bid must be higher than current bid of PKR ${bid.price.toLocaleString()}`
            });
        }
        const updateSql = `UPDATE product_bid SET price = ?, userid = ? WHERE productid = ?`;
        pool.query(updateSql, [price, userid, productid], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Bid placed successfully', new_price: price });
        });
    });
});
router.get('/bidStatus/:productid', (req, res) => {
    const { productid } = req.params;
    const sql = `SELECT price, bid_end_time, is_active FROM product_bid WHERE productid = ?`;
    pool.query(sql, [productid], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(200).json({ is_active: false });

        const bid = results[0];
        const now = new Date();
        const endTime = new Date(bid.bid_end_time);
        if (now > endTime && bid.is_active) {
            pool.query(`UPDATE product_bid SET is_active = 0 WHERE productid = ?`, [productid]);
            bid.is_active = 0;
        }

        res.status(200).json({
            price: bid.price,
            bid_end_time: bid.bid_end_time,
            is_active: bid.is_active,
            time_left_ms: Math.max(0, endTime - now)
        });
    });
});

module.exports = router;