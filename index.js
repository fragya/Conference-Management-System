let papers = {};

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Login failed');
        }
    }).then(data => {
        document.getElementById('login').style.display = 'none';
        if (data.user.role === 'author') {
            document.getElementById('submit-paper').style.display = 'block';
            document.getElementById('review-paper').style.display = 'none';
            document.getElementById('all-scores').style.display = 'block'; // Yazar için skorlar bölümünü göster
            fetchMyPapers(data.user.id); // Yazarın makalelerini çek
        } else if (data.user.role === 'reviewer') {
            document.getElementById('review-paper').style.display = 'block';
            document.getElementById('submit-paper').style.display = 'none';
            document.getElementById('all-scores').style.display = 'none'; // Reviewer için skorlar bölümünü gizle
        }
        alert(data.message);
    }).catch(error => {
        alert(error.message);
    });
});

function fetchMyPapers(authorId) {
    fetch(`/my-papers?authorId=${authorId}`)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch papers');
        }
    })
    .then(papers => {
        const papersList = document.getElementById('papers-list');
        papersList.innerHTML = ''; // Listeyi temizle
        papers.forEach(paper => {
            papersList.innerHTML += `
                <div>
                    <h3>${paper.title}</h3>
                    <p>Abstract: ${paper.abstract}</p>
                    <p>Keywords: ${paper.keywords}</p>
                    <p>Average Score: ${paper.averageScore || 'Not reviewed yet'}</p>
                </div>
            `;
        });
    })
    .catch(error => {
        console.error('Error fetching papers:', error);
        alert(error.message);
    });
    // Sayfa yüklendiğinde makaleleri çek
    document.addEventListener('DOMContentLoaded', fetchMyPapers);
}


fetchMyPapers

// Randomly assign a paper for review to simulate double-blind review
function assignRandomPaperToReview() {
    const paperIds = Object.keys(papers);
    if (paperIds.length > 0) {
        const randomPaperId = paperIds[Math.floor(Math.random() * paperIds.length)];
        document.getElementById('paperId').value = randomPaperId;
        document.getElementById('review-paper').style.display = 'block';
        console.log(`Assigned paper ID ${randomPaperId} for review`);
    } else {
        alert('No papers available for review.');
    }
}

// Handle review submission
document.getElementById('paperReviewForm').addEventListener('submit', function(event) {
    event.preventDefault();
    assignRandomPaperToReview();

    const paperId = document.getElementById('paperId').value; // This gets the value of the hidden input
    const score = parseInt(document.getElementById('score').value, 10);
    const comments = document.getElementById('comments').value;

    if (papers[paperId]) { // This checks if the paperId exists in the papers object
        papers[paperId].scores.push(score);
        papers[paperId].totalReviews++;
        console.log('Review Submitted:', { paperId, score, comments });
        alert('Review submitted successfully!');
        updateScores();
    } else {
        alert('Invalid paper ID'); // This alert is shown if the paperId is not found in papers object
    }
});

// Calculate and display average scores for all papers
function updateScores() {
    let output = '';
    Object.keys(papers).forEach(paperId => {
        const averageScore = calculateAverage(papers[paperId].scores);
        output += `Paper ID: ${paperId}, Title: ${papers[paperId].title}, Average Score: ${averageScore.toFixed(2)}, Reviews: ${papers[paperId].totalReviews}<br>`;
    });
    document.getElementById('allScores').innerHTML = output;
}

// Helper function to calculate average score
function calculateAverage(scores) {
    const totalScore = scores.reduce((acc, score) => acc + score, 0);
    return scores.length > 0 ? totalScore / scores.length : 0;
}
