// Papers object to store each paper's details, scores, and number of reviews
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Veritabanı bağlantısı
const db = new sqlite3.Database('./mydatabase.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Veritabanına bağlandı.');
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json()); // JSON girişlerini işlemek için
app.use(express.static(path.join(__dirname, )));


app.get('/', (req, res) => {
    // `index.html` dosyanızın tam yolunu belirtin
    res.sendFile(path.join(__dirname, 'index.html')); // `__dirname` uygulamanızın çalıştığı dizini ifade eder
});

// Yazarın kendi makalelerini ve puanlarını çeken endpoint
app.get('/my-papers', (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).send({ error: 'Username is required' });
    }

    const query = `
    SELECT p.id, p.title, p.abstract, p.keywords, AVG(r.score) as averageScore
    FROM Papers p
    LEFT JOIN Reviews r ON p.id = r.paper_id
    WHERE p.author_username = ?
    GROUP BY p.id, p.title, p.abstract, p.keywords`;

    db.all(query, [username], (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            res.status(500).send({ error: 'Database error' });
        } else {
            res.send(rows);
        }
    });
});


app.post('/submit-paper', (req, res) => {
    const { title, abstract, keywords, authorUsername } = req.body;
    const query = `INSERT INTO Papers (title, abstract, keywords, author_username) VALUES (?, ?, ?, ?)`;

    db.run(query, [title, abstract, keywords, authorUsername], function(err) {
        if (err) {
            console.error('Error inserting paper:', err.message);
            res.status(500).send({ error: 'Error inserting paper' });
        } else {
            console.log(`A new paper has been added with ID ${this.lastID}`);
            res.send({ message: 'Paper submitted successfully!', paperId: this.lastID });
        }
    });
});





// Giriş yönetimi
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `
        SELECT username, password, 'author' as role FROM Authors WHERE username = ? AND password = ?
        UNION
        SELECT username, password, 'reviewer' as role FROM Reviewers WHERE username = ? AND password = ?`;

    db.get(query, [username, password, username, password], (err, user) => {
        if (err) {
            res.status(500).send({ error: 'Veritabanı hatası' });
        } else if (user) {
            res.send({ message: 'Giriş başarılı!', user: user });
        } else {
            res.status(400).send({ error: 'Kullanıcı adı veya şifre yanlış.' });
        }
    });
});



// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
});