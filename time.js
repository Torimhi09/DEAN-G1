// Handle login form submission
function handleLogin(event) {
    event.preventDefault();

    const studentId = document.getElementById('student-id').value;
    const password = document.getElementById('password').value;
    const loginButton = document.querySelector('.btn-login');
    const loadingSpinner = document.querySelector('.loading');

    // Show loading spinner
    toggleLoadingState(loginButton, loadingSpinner, true);

    // Simulate API call with setTimeout
    setTimeout(() => {
        // For demo purposes, check if credentials are valid
        // In production, this would be a real API call
        if (isValidCredentials(studentId, password)) {
            // Store login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', studentId);

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. Please try again.');
            // Reset loading state
            toggleLoadingState(loginButton, loadingSpinner, false);
        }
    }, 1500);
}

// Function to toggle loading state
function toggleLoadingState(loginButton, loadingSpinner, isLoading) {
    if (isLoading) {
        loginButton.querySelector('span').style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        loginButton.querySelector('span').style.display = 'block';
        loadingSpinner.style.display = 'none';
    }
}

// Function to validate credentials
function isValidCredentials(studentId, password) {
    // Replace this with actual validation logic
    return studentId === 'demo' && password === 'password';
}

// Check if user is already logged in
window.addEventListener('load', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'dashboard.html';
    }
});

// Attach the handleLogin function to the form submission
document.querySelector('.login-form').addEventListener('submit', handleLogin);