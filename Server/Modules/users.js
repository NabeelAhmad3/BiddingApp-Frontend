const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secretKey = 'helloWorld';

router.post('/register', (req, res) => {
    const { name, email, phone, cnic, city, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing the password' });
        }
        const sql = 'INSERT INTO users (name, email, phone, cnic, city, password) VALUES (?, ?, ?, ?, ?, ?)';
        pool.query(sql, [name, email, phone, cnic, city, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }
            
            const newUser = { name, email }; 
            const token = jwt.sign({ id: result.insertId }, secretKey, { expiresIn: '1d' });

            res.status(201).json({ message: 'User created successfully', token, userid: result.insertId, user: newUser });
        });
    });
});

router.put('/profileDetails/:userid', (req, res) => {
    const { userid } = req.params;
    const { name, email, phone, cnic, city, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing the password' });
        }
        const sql = `UPDATE users SET name = ?, email = ?, phone = ?, cnic = ?, city = ?, password = ? WHERE userid = ?`;
        pool.query(sql, [name, email, phone, cnic, city, hashedPassword, userid], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.status(200).send({ message: 'User updated successfully', result });
        });
    });
});

router.get('/profileDetails/:userid', (req, res) => {
    const { userid } = req.params;
    const sql = `SELECT * FROM users WHERE userid = ?`;
    pool.query(sql, [userid], (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Database query failed' });
        }
        res.status(200).send(result);
    });
});

router.get('/sellerDetails', (req, res) => {
    const userid = req.query.userid;

    const sql = `SELECT name, email, phone, city FROM users WHERE userid = ?`;
    pool.query(sql, [userid], (err, result) => {
        if (err) {
            return res.status(500).send('Error fetching product info');
        }
        res.json(result);
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    pool.query(sql, [email], async (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'User does not exist' });
        }
        const user = result[0];
        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            const token = jwt.sign({ id: user.userid }, secretKey, { expiresIn: '1d' });
          
            res.status(200).json({ message: 'Login successful from backend', token, userid: user.userid, usertype: user.type,
                role: user.role });

        } catch (compareErr) {
            return res.status(500).json({ message: 'Password comparison error', error: compareErr });
        }
    });
});

module.exports = router;
