const router = require('express').Router();
const connection = require('../config/db');


router.get('/', (req, res) => {
    const queryString = 'SELECT * FROM test';
    connection.query(queryString, (error, rows) => {
        if (error) {
            res.render('index', { error });
        } else {
            res.render('index', { rows: rows.rows });
        }
    });
});

module.exports = router;