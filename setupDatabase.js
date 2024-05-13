const sqlite3 = require('sqlite3').verbose();

// Veritabanını aç
let db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata oluştu:', err.message);
    } else {
        console.log('Veritabanına başarıyla bağlandı.');
    }
});

// Tabloları oluştur
function createTables() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Authors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );`, (err) => {
            if (err) {
                console.error("Authors tablosu oluşturulurken hata oluştu:", err.message);
            } else {
                console.log("Authors tablosu başarıyla oluşturuldu.");
                insertAuthors();
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS Reviewers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );`, (err) => {
            if (err) {
                console.error("Reviewers tablosu oluşturulurken hata oluştu:", err.message);
            } else {
                console.log("Reviewers tablosu başarıyla oluşturuldu.");
                insertReviewers();
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS Papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            abstract TEXT NOT NULL,
            keywords TEXT NOT NULL,
            author_username TEXT NOT NULL,
            FOREIGN KEY (author_username) REFERENCES Authors(username)
        );`, (err) => {
            if (err) {
                console.error("Papers tablosu oluşturulurken hata oluştu:", err.message);
            } else {
                console.log("Papers tablosu başarıyla oluşturuldu.");
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS Reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paper_id INTEGER NOT NULL,
            reviewer_username TEXT NOT NULL,
            score INTEGER NOT NULL,
            comments TEXT,
            FOREIGN KEY (paper_id) REFERENCES Papers(id),
            FOREIGN KEY (reviewer_username) REFERENCES Reviewers(username)
        );`, (err) => {
            if (err) {
                console.error("Reviews tablosu oluşturulurken hata oluştu:", err.message);
            } else {
                console.log("Reviews tablosu başarıyla oluşturuldu.");
            }
        });
    });
}

createTables();

function insertAuthors() {
    const authors = [
        { username: "author1", password: "pass123" },
        { username: "author2", password: "pass456" },
        { username: "author3", password: "pass789" }
    ];
    authors.forEach(author => {
        db.run("INSERT INTO Authors (username, password) VALUES (?, ?)", [author.username, author.password], (err) => {
            if (err) {
                console.error("Author eklenirken hata oluştu:", err.message);
            } else {
                console.log(`Author eklendi: ${author.username}`);
            }
        });
    });
}

function insertReviewers() {
    const reviewers = [
        { username: "reviewer1", password: "review123" },
        { username: "reviewer2", password: "review456" },
        { username: "reviewer3", password: "review789" }
    ];
    reviewers.forEach(reviewer => {
        db.run("INSERT INTO Reviewers (username, password) VALUES (?, ?)", [reviewer.username, reviewer.password], (err) => {
            if (err) {
                console.error("Reviewer eklenirken hata oluştu:", err.message);
            } else {
                console.log(`Reviewer eklendi: ${reviewer.username}`);
            }
        });
    });
}


