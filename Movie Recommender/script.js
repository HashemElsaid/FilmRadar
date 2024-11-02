const tmdbApiKey = '0b93e314138aadfc8300d5eda801e2b1'; // Replace with your TMDB API key
let currentGenreIds = []; // Store multiple genre IDs for more accurate filtering
let currentPage = 1; // Track the current page for pagination
let startYear = null;
let endYear = null;

// Add the movie to favorites and fetch recommendations
function addFavorite() {
    const movieInput = document.getElementById('favorite-movie');
    const movieName = movieInput.value.trim();

    if (movieName) {
        document.getElementById('recommendations-section').style.display = 'block'; // Show recommendations section
        fetchMovieRecommendations(movieName);
        movieInput.value = ''; // Clear the input field
    } else {
        alert('Please enter a valid movie name.');
    }
}

// Enable 'Enter' key to trigger the search
document.getElementById('favorite-movie').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        addFavorite(); // Call the search function
    }
});

// Function to open movie details in a new page
function openMovieDetails(movieId) {
    window.location.href = `movie-details.html?movieId=${movieId}`;
}

// Fetch movie recommendations based on a movie name
async function fetchMovieRecommendations(movieName) {
    const recommendationList = document.getElementById('recommendation-list');
    recommendationList.innerHTML = '<p>Loading recommendations...</p>'; // Loading indicator

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}&language=en-US`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const movieId = data.results[0].id; // Get the ID of the first movie result
            fetchMovieGenres(movieId);
        } else {
            recommendationList.innerHTML = '<p>No recommendations found. Try another movie.</p>';
        }
    } catch (error) {
        console.error("Error fetching movie data:", error);
        recommendationList.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    }
}

// Fetch genres for a movie by its ID and use them to fetch recommendations
async function fetchMovieGenres(movieId) {
    const recommendationList = document.getElementById('recommendation-list');
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&language=en-US`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.genres && data.genres.length > 0) {
            currentGenreIds = data.genres.map(genre => genre.id); // Store all genres for the movie
            fetchMoviesByGenres(currentGenreIds); // Fetch movies by multiple genres with randomized recommendations
        } else {
            recommendationList.innerHTML = '<p>No genre found for this movie.</p>';
        }
    } catch (error) {
        console.error("Error fetching movie genres:", error);
        recommendationList.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    }
}

// Fetch movies based on multiple genre IDs with random page selection and shuffled results
async function fetchMoviesByGenres(genreIds) {
    const recommendationList = document.getElementById('recommendation-list');
    recommendationList.innerHTML = ''; // Clear previous recommendations

    const genreIdString = genreIds.join(',');
    const randomPage = Math.floor(Math.random() * 5) + 1;

    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${genreIdString}&page=${randomPage}&language=en-US`;

    // Apply year range if specified
    if (startYear && endYear) {
        url += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Shuffle the results array for random ordering
            const shuffledResults = data.results.sort(() => 0.5 - Math.random());

            shuffledResults.forEach(movie => {
                const posterUrl = movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : 'path/to/fallback-image.jpg'; // Replace with a valid fallback image if needed
                
                const rec = document.createElement('div');
                rec.classList.add('movie-item');
                rec.innerHTML = `
                    <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" onclick="openMovieDetails(${movie.id})">
                    <p>${movie.title} (${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'})</p>
                    <div class="stars">
                        ${generateStars(movie.vote_average)}
                        <span class="rating">(${movie.vote_average.toFixed(1)}/10)</span>
                    </div>
                `;
                recommendationList.appendChild(rec);
            });

            if (data.page < data.total_pages) {
                showGenerateMoreButton();
            } else {
                hideGenerateMoreButton();
            }
        } else {
            recommendationList.innerHTML = `<p>No similar movies found in this genre.</p>`;
            hideGenerateMoreButton();
        }
    } catch (error) {
        console.error("Error fetching movies by genre:", error);
        recommendationList.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    }
}

// Additional utility functions
function showGenerateMoreButton() {
    const generateMoreBtn = document.getElementById('generate-more-btn');
    if (generateMoreBtn) {
        generateMoreBtn.style.display = 'block';
    }
}

function hideGenerateMoreButton() {
    const generateMoreBtn = document.getElementById('generate-more-btn');
    if (generateMoreBtn) {
        generateMoreBtn.style.display = 'none';
    }
}

function generateMore() {
    currentPage++; // Move to the next page
    fetchMoviesByGenres(currentGenreIds);
}

function generateStars(voteAverage) {
    const rating = (voteAverage / 2).toFixed(1); // Convert the 10-point scale to a 5-star scale
    const fullStars = Math.floor(rating); // Number of full stars
    const halfStar = rating % 1 >= 0.5 ? 1 : 0; // Determine if there should be a half star
    const emptyStars = 5 - fullStars - halfStar; // Remaining empty stars

    let starsHTML = '';

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>'; // Full star icon
    }

    // Add half star
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>'; // Half star icon
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>'; // Empty star icon
    }

    return starsHTML;
}
