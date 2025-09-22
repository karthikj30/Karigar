// Karigar - AI-Powered Artisan Marketplace JavaScript
// Index page functionality - cleaned version

let map;
let markers = [];
let selectedArtisan = null;

// Initialize the application

// Expose all required functions globally for Google Maps and AI tools
window.initMap = initMap;
window.generateStory = generateStory;
window.generateVoice = typeof generateVoice !== 'undefined' ? generateVoice : undefined;
window.enhanceDesign = typeof enhanceDesign !== 'undefined' ? enhanceDesign : undefined;
window.generateVideoScript = typeof generateVideoScript !== 'undefined' ? generateVideoScript : undefined;
window.analyzeDrawing = typeof analyzeDrawing !== 'undefined' ? analyzeDrawing : undefined;
window.generateImage = typeof generateImage !== 'undefined' ? generateImage : undefined;
window.copyToClipboard = typeof copyToClipboard !== 'undefined' ? copyToClipboard : undefined;
window.retrySearch = typeof retrySearch !== 'undefined' ? retrySearch : undefined;
window.loadProfile = typeof loadProfile !== 'undefined' ? loadProfile : undefined;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Show alert function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function initializeApp() {
    initializeHeaderSearch();
    initializeAuthFormHandlers();
    addScrollAnimations();
    addInteractiveAnimations();
    initializeMapEnhancements();
    
    // Map initialization
    ensureMapContainerStyling();
    setTimeout(() => {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.style.display = 'block';
            mapContainer.style.visibility = 'visible';
            mapContainer.style.opacity = '1';
        }
        
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.position = 'relative';
            mapElement.style.zIndex = '2';
            mapElement.style.width = '100%';
            mapElement.style.height = '100%';
            mapElement.style.borderRadius = '18px';
        }
    }, 100);
    
    // Fallback map initialization
    setTimeout(() => {
        if (!map && typeof google !== 'undefined' && google.maps) {
            console.log('Attempting fallback map initialization...');
            initMap();
        }
    }, 3000);
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ENHANCED SEARCH FUNCTIONALITY
function initializeHeaderSearch() {
    const input = document.getElementById('navSearch');
    const menu = document.getElementById('navSearchResults');
    
    if (!input || !menu) {
        console.error('Search elements not found:', { input: !!input, menu: !!menu });
        return;
    }
    
    let debounceTimer;
    let isSearching = false;
    
    input.addEventListener('input', function() {
        const query = this.value.trim();
        clearTimeout(debounceTimer);
        
        if (!query || query.length < 2) {
            menu.style.display = 'none';
            menu.innerHTML = '';
            return;
        }
        
        menu.innerHTML = '<div class="dropdown-item text-center"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        menu.style.display = 'block';
        
        debounceTimer = setTimeout(async () => {
            if (isSearching) return;
            
            isSearching = true;
            
            try {
                console.log('Searching for:', query);
                const response = await fetch(`/api/search-profiles?q=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Search response:', data);
                
                if (data.success && data.results) {
                    displaySearchResults(data.results, menu, query);
                } else {
                    showNoResults(menu, query, data.error);
                }
                
            } catch (error) {
                console.error('Search error:', error);
                showSearchError(menu, error.message);
            } finally {
                isSearching = false;
            }
        }, 300);
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== input) {
            menu.style.display = 'none';
        }
    });
    
    // Handle keyboard navigation
    input.addEventListener('keydown', function(e) {
        const items = menu.querySelectorAll('.search-result-item');
        let activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
                updateActiveItem(items, activeIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                activeIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
                updateActiveItem(items, activeIndex);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && items[activeIndex]) {
                    const userEmail = items[activeIndex].dataset.userEmail;
                    if (userEmail) {
                        viewUserProfile(userEmail);
                    }
                }
                break;
            case 'Escape':
                menu.style.display = 'none';
                input.blur();
                break;
        }
    });
}

// Display search results
function displaySearchResults(results, menu, query) {
    menu.innerHTML = '';
    
    if (!results || results.length === 0) {
        showNoResults(menu, query);
        return;
    }
    
    const currentEmail = localStorage.getItem('karigar_user_email');
    const displayedResults = results.slice(0, 8);
    
    displayedResults.forEach((user, index) => {
        if (user.email === currentEmail) return;
        
        const resultItem = createSearchResultItem(user, index === 0);
        menu.appendChild(resultItem);
    });
    
    if (results.length > 8) {
        const viewAllItem = document.createElement('div');
        viewAllItem.className = 'dropdown-item text-center border-top';
        viewAllItem.innerHTML = `
            <small class="text-muted">
                <i class="fas fa-ellipsis-h me-1"></i>
                ${results.length - 8} more results available
            </small>
        `;
        menu.appendChild(viewAllItem);
    }
    
    menu.style.display = 'block';
}

// Create individual search result item
function createSearchResultItem(user, isFirst = false) {
    const item = document.createElement('div');
    item.className = `dropdown-item search-result-item d-flex align-items-center justify-content-between p-2 ${isFirst ? 'active' : ''}`;
    item.dataset.userEmail = user.email;
    
    const userName = user.name || user.email || 'Unknown User';
    const userProfilePic = user.profile_pic || '/static/logo.png';
    const followerCount = user.followers || 0;
    const userBio = user.bio ? (user.bio.length > 50 ? user.bio.substring(0, 50) + '...' : user.bio) : '';
    
    item.innerHTML = `
        <div class="d-flex align-items-center flex-grow-1 profile-area" style="cursor: pointer;">
            <img src="${userProfilePic}" 
                 style="width:32px;height:32px;border-radius:50%;margin-right:10px;object-fit:cover;"
                 onerror="this.src='/static/logo.png'"> 
            <div class="flex-grow-1">
                <div class="fw-bold text-truncate" style="max-width: 150px;">${userName}</div>
                <small class="text-muted">${followerCount} followers</small>
                ${userBio ? `<div class="text-muted" style="font-size: 0.75rem;">${userBio}</div>` : ''}
            </div>
        </div>
        <div class="d-flex gap-1 action-buttons">
            <button class="btn btn-sm btn-outline-primary view-btn" 
                    data-user-email="${user.email}"
                    style="font-size: 0.7rem; padding: 3px 8px;"
                    title="View ${userName}'s profile">
                <i class="fas fa-eye"></i>
                <span class="d-none d-sm-inline ms-1">View</span>
            </button>
        </div>
    `;
    
    // Add event listeners
    const profileArea = item.querySelector('.profile-area');
    const viewBtn = item.querySelector('.view-btn');
    
    if (profileArea) {
        profileArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            viewUserProfile(user.email);
        });
    }
    
    if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            viewUserProfile(user.email);
        });
    }
    // No contact button in search results
    
    item.addEventListener('mouseenter', () => {
        item.classList.add('active');
    });
    
    item.addEventListener('mouseleave', () => {
        if (!isFirst) {
            item.classList.remove('active');
        }
    });
    
    return item;
}

// Show no results message
function showNoResults(menu, query, error = null) {
    menu.innerHTML = `
        <div class="dropdown-item text-center p-3">
            <i class="fas fa-search text-muted mb-2" style="font-size: 2rem;"></i>
            <div class="text-muted">
                ${error ? `Error: ${error}` : `No results found for "${query}"`}
            </div>
            ${!error ? '<small class="text-muted">Try a different search term</small>' : ''}
        </div>
    `;
    menu.style.display = 'block';
}

// Show search error
function showSearchError(menu, errorMessage) {
    menu.innerHTML = `
        <div class="dropdown-item text-center p-3">
            <i class="fas fa-exclamation-triangle text-warning mb-2" style="font-size: 2rem;"></i>
            <div class="text-warning">Search Error</div>
            <small class="text-muted">${errorMessage}</small>
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-primary" onclick="retrySearch()">
                    <i class="fas fa-redo me-1"></i>Retry
                </button>
            </div>
        </div>
    `;
    menu.style.display = 'block';
}

// Update active item for keyboard navigation
function updateActiveItem(items, activeIndex) {
    items.forEach((item, index) => {
        item.classList.toggle('active', index === activeIndex);
    });
    
    if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Retry search function
function retrySearch() {
    const input = document.getElementById('navSearch');
    if (input && input.value.trim()) {
        input.dispatchEvent(new Event('input'));
    }
}

// FIXED: User profile viewing function
function viewUserProfile(userEmail) {
    if (!userEmail) {
        console.error('No user email provided');
        return;
    }
    
    console.log('Viewing profile for:', userEmail);
    
    // Check if user is signed in - FIXED localStorage key
    const currentUserEmail = localStorage.getItem('karigar_user_email');
    
    if (!currentUserEmail) {
        showAlert('Please sign in first to view profiles', 'warning');
        return;
    }
    
    // If it's the current user, redirect to their profile page
    if (userEmail === currentUserEmail) {
        window.location.href = '/profile';
        return;
    }
    
    try {
        // Hide search dropdown
        const menu = document.getElementById('navSearchResults');
        if (menu) {
            menu.style.display = 'none';
        }
        
        // Clear search input
        const input = document.getElementById('navSearch');
        if (input) {
            input.value = '';
        }
        
        // Load and show user profile in modal
        loadAndShowUserProfile(userEmail);
        
    } catch (error) {
        console.error('Error viewing profile:', error);
        showAlert('Error opening profile', 'danger');
    }
}

// Load user profile and show modal
async function loadAndShowUserProfile(userEmail) {
    // Check if modal exists
    const modalElement = document.getElementById('userProfileViewModal');
    if (!modalElement) {
        console.error('User profile modal not found! Make sure you added the modal HTML to index.html');
        showAlert('Profile modal not available', 'danger');
        return;
    }
    
    // Show modal first
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Show loading state
    showUserProfileLoading();
    
    try {
        console.log('Loading profile for:', userEmail);
        console.log('API call: /api/profile?email=' + encodeURIComponent(userEmail));
        
        // FIXED: Changed from /api/get-profile to /api/profile (matching your backend)
        const response = await fetch(`/api/profile?email=${encodeURIComponent(userEmail)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Profile API response:', data);
        
        if (data.success && data.user) {
            // FIXED: Changed from data.profile to data.user (matching your backend response)
            await displayUserProfileData(data.user);
        } else {
            console.error('Profile API error:', data.error);
            showAlert('Error loading profile: ' + (data.error || 'User not found'), 'danger');
            modal.hide();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Error loading profile: ' + error.message, 'danger');
        modal.hide();
    }
}

// Show loading state
function showUserProfileLoading() {
    document.getElementById('viewUserName').textContent = 'Loading...';
    document.getElementById('viewUserNameText').textContent = 'Loading...';
    document.getElementById('viewUserEmail').textContent = 'Loading...';
    document.getElementById('viewUserBio').textContent = 'Loading...';
    document.getElementById('viewUserPosts').textContent = '0';
    document.getElementById('viewUserFollowers').textContent = '0';
    document.getElementById('viewUserFollowing').textContent = '0';
    
    // Show posts loading
    document.getElementById('viewPostsLoading').style.display = 'block';
    document.getElementById('viewPostsGrid').style.display = 'none';
    document.getElementById('viewNoPosts').style.display = 'none';
    
    // Hide follow button initially
    document.getElementById('followToggleBtn').style.display = 'none';
}

// Display user profile data
async function displayUserProfileData(profile) {
    console.log('Displaying profile:', profile);
    
    // Update basic info
    document.getElementById('viewUserName').textContent = profile.name || 'User Profile';
    document.getElementById('viewUserNameText').textContent = profile.name || 'Unknown User';
    const emailElem = document.getElementById('viewUserEmail');
    emailElem.textContent = profile.email || '';
    if (profile.email) {
        emailElem.setAttribute('data-email', profile.email);
        console.log('[ContactBtn Debug] Set data-email on #viewUserEmail:', profile.email);
    } else {
        emailElem.removeAttribute('data-email');
        console.log('[ContactBtn Debug] Removed data-email from #viewUserEmail');
    }
    // Immediately update Contact button with correct email
    const contactBtn = document.getElementById('contactUserBtn');
    if (contactBtn) {
        if (profile.email && profile.email.includes('@')) {
            contactBtn.href = `/chat.html?user=${encodeURIComponent(profile.email)}`;
            contactBtn.target = '_blank';
            contactBtn.rel = 'noopener';
            contactBtn.style.display = '';
            contactBtn.setAttribute('data-chat-email', profile.email);
            contactBtn.classList.remove('disabled');
        } else {
            contactBtn.href = '#';
            contactBtn.style.display = 'none';
            contactBtn.removeAttribute('data-chat-email');
            contactBtn.classList.add('disabled');
        }
    }
    document.getElementById('viewUserBio').textContent = profile.bio || 'No bio available';
    document.getElementById('viewUserPic').src = profile.profile_pic || 'https://via.placeholder.com/120x120/32CD32/FFFFFF?text=U';
    
    // Update stats
    document.getElementById('viewUserPosts').textContent = profile.posts ? profile.posts.length : 0;
    document.getElementById('viewUserFollowers').textContent = profile.followers || 0;
    document.getElementById('viewUserFollowing').textContent = profile.following || 0;
    
    // Setup follow button
    const currentUserEmail = localStorage.getItem('karigar_user_email');
    if (currentUserEmail && currentUserEmail !== profile.email) {
        await setupFollowButton(profile.email, currentUserEmail);
    }
    
    // Load posts
    loadUserProfilePosts(profile.posts || []);
}

// Setup follow button
async function setupFollowButton(targetEmail, currentUserEmail) {
    const followBtn = document.getElementById('followToggleBtn');
    
    try {
        // Check if already following - you may need to create this API endpoint
        const response = await fetch(`/api/check-follow?follower=${encodeURIComponent(currentUserEmail)}&followee=${encodeURIComponent(targetEmail)}`);
        const data = await response.json();
        const isFollowing = data.success && data.is_following;
        
        // Update button
        followBtn.className = `btn ${isFollowing ? 'btn-outline-danger' : 'btn-success'}`;
        followBtn.innerHTML = `<i class="fas ${isFollowing ? 'fa-user-minus' : 'fa-user-plus'} me-1"></i>${isFollowing ? 'Unfollow' : 'Follow'}`;
        followBtn.dataset.action = isFollowing ? 'unfollow' : 'follow';
        followBtn.dataset.targetEmail = targetEmail;
        followBtn.style.display = 'inline-block';
        
    } catch (error) {
        console.error('Error checking follow status:', error);
        // Default to follow button if check fails
        followBtn.className = 'btn btn-success';
        followBtn.innerHTML = '<i class="fas fa-user-plus me-1"></i>Follow';
        followBtn.dataset.action = 'follow';
        followBtn.dataset.targetEmail = targetEmail;
        followBtn.style.display = 'inline-block';
    }
}

// Load user posts
function loadUserProfilePosts(posts) {
    const loading = document.getElementById('viewPostsLoading');
    const grid = document.getElementById('viewPostsGrid');
    const noPosts = document.getElementById('viewNoPosts');
    
    loading.style.display = 'none';
    
    if (!posts || posts.length === 0) {
        grid.style.display = 'none';
        noPosts.style.display = 'block';
        return;
    }
    
    noPosts.style.display = 'none';
    grid.style.display = 'block';
    grid.innerHTML = '';
    
    posts.forEach((post, index) => {
        const postCard = createUserPostCard(post, index);
        grid.appendChild(postCard);
    });
}

// Create post card for viewing
function createUserPostCard(post, index) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-3';
    
    const imageUrl = post.image_url || 'https://via.placeholder.com/300x200/32CD32/FFFFFF?text=No+Image';
    const tags = post.tags ? post.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('') : '';
    
    col.innerHTML = `
        <div class="card h-100">
            <img src="${imageUrl}" class="card-img-top" alt="Post image" 
                 style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
                <h6 class="card-title">${post.title || 'Untitled Post'}</h6>
                <p class="card-text flex-grow-1">${post.description || post.caption || 'No description'}</p>
                <div class="mb-2">${tags}</div>
                <div class="mt-auto">
                    <button class="btn btn-sm btn-outline-danger me-2" onclick="likeUserPost(${index})">
                        <i class="fas fa-heart me-1"></i>Like
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="shareUserPost(${index})">
                        <i class="fas fa-share me-1"></i>Share
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Placeholder functions for like and share
function likeUserPost(index) {
    showAlert('Like feature coming soon!', 'info');
}

// Replace the placeholder shareUserPost function with this enhanced version

function shareUserPost(index) {
    // Get the post data from the DOM
    const postCards = document.querySelectorAll('#viewPostsGrid .col-md-4');
    if (index < 0 || index >= postCards.length) {
        showAlert('Post not found', 'danger');
        return;
    }
    
    const postCard = postCards[index];
    const title = postCard.querySelector('.card-title')?.textContent || 'Untitled Post';
    const description = postCard.querySelector('.card-text')?.textContent || 'Check out this amazing craft!';
    const imageUrl = postCard.querySelector('.card-img-top')?.src || '';
    
    // Get user info from modal
    const userName = document.getElementById('viewUserNameText')?.textContent || 'A talented artisan';
    
    // Create share content
    const shareData = {
        title: `${title} by ${userName}`,
        text: `${description}\n\nBy ${userName} on Karigar - AI-Powered Artisan Marketplace`,
        url: window.location.href
    };
    
    // Try native Web Share API first (mobile devices)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData)
            .then(() => console.log('Post shared successfully'))
            .catch(err => {
                console.log('Error sharing:', err);
                fallbackShare(shareData, imageUrl);
            });
    } else {
        // Fallback to custom share modal
        fallbackShare(shareData, imageUrl);
    }
}

// Fallback share function with multiple options
function fallbackShare(shareData, imageUrl) {
    // Create share modal if it doesn't exist
    let shareModal = document.getElementById('shareModal');
    if (!shareModal) {
        shareModal = createShareModal();
        document.body.appendChild(shareModal);
    }
    
    // Update modal content
    document.getElementById('shareTitle').textContent = shareData.title;
    document.getElementById('shareDescription').textContent = shareData.text;
    document.getElementById('shareUrl').value = shareData.url;
    
    if (imageUrl) {
        document.getElementById('shareImage').src = imageUrl;
        document.getElementById('shareImage').style.display = 'block';
    } else {
        document.getElementById('shareImage').style.display = 'none';
    }
    
    // Show modal
    const modal = new bootstrap.Modal(shareModal);
    modal.show();
}

// Create share modal HTML
function createShareModal() {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = 'shareModal';
    modalDiv.setAttribute('tabindex', '-1');
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-md">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-share me-2"></i>Share Post
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-3">
                        <img id="shareImage" class="img-fluid rounded" style="max-height: 200px; display: none;">
                    </div>
                    <h6 id="shareTitle" class="fw-bold mb-2"></h6>
                    <p id="shareDescription" class="text-muted mb-3"></p>
                    
                    <div class="mb-3">
                        <label class="form-label">Share URL:</label>
                        <div class="input-group">
                            <input type="text" id="shareUrl" class="form-control" readonly>
                            <button class="btn btn-outline-secondary" onclick="copyShareUrl()">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="row g-2">
                        <div class="col-6">
                            <button class="btn btn-primary w-100" onclick="shareToFacebook()">
                                <i class="fab fa-facebook me-1"></i>Facebook
                            </button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-info w-100" onclick="shareToTwitter()">
                                <i class="fab fa-twitter me-1"></i>Twitter
                            </button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success w-100" onclick="shareToWhatsApp()">
                                <i class="fab fa-whatsapp me-1"></i>WhatsApp
                            </button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-dark w-100" onclick="shareToLinkedIn()">
                                <i class="fab fa-linkedin me-1"></i>LinkedIn
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return modalDiv;
}

// Copy URL to clipboard
function copyShareUrl() {
    const urlInput = document.getElementById('shareUrl');
    urlInput.select();
    urlInput.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(urlInput.value).then(() => {
        showAlert('URL copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        document.execCommand('copy');
        showAlert('URL copied to clipboard!', 'success');
    });
}

// Social media share functions
function shareToFacebook() {
    const url = encodeURIComponent(document.getElementById('shareUrl').value);
    const text = encodeURIComponent(document.getElementById('shareDescription').textContent);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
}

function shareToTwitter() {
    const url = encodeURIComponent(document.getElementById('shareUrl').value);
    const text = encodeURIComponent(document.getElementById('shareTitle').textContent);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=Karigar,Crafts,Handmade`, '_blank', 'width=600,height=400');
}

function shareToWhatsApp() {
    const url = document.getElementById('shareUrl').value;
    const title = document.getElementById('shareTitle').textContent;
    const text = encodeURIComponent(`${title}\n\n${url}\n\nShared via Karigar`);
    
    // Check if on mobile
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.open(`whatsapp://send?text=${text}`, '_blank');
    } else {
        window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
    }
}

function shareToLinkedIn() {
    const url = encodeURIComponent(document.getElementById('shareUrl').value);
    const title = encodeURIComponent(document.getElementById('shareTitle').textContent);
    const summary = encodeURIComponent(document.getElementById('shareDescription').textContent);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank', 'width=600,height=400');
}

// Enhanced like function with visual feedback
function likeUserPost(index) {
    const postCards = document.querySelectorAll('#viewPostsGrid .col-md-4');
    if (index < 0 || index >= postCards.length) {
        showAlert('Post not found', 'danger');
        return;
    }
    
    const postCard = postCards[index];
    const likeBtn = postCard.querySelector('button[onclick*="likeUserPost"]');
    
    if (likeBtn) {
        // Visual feedback
        const originalContent = likeBtn.innerHTML;
        likeBtn.innerHTML = '<i class="fas fa-heart text-danger me-1"></i>Liked!';
        likeBtn.classList.remove('btn-outline-danger');
        likeBtn.classList.add('btn-danger');
        
        // Animate the heart
        likeBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
        }, 200);
        
        // Reset after 2 seconds
        setTimeout(() => {
            likeBtn.innerHTML = originalContent;
            likeBtn.classList.remove('btn-danger');
            likeBtn.classList.add('btn-outline-danger');
        }, 2000);
    }
    
    showAlert('Post liked! (Feature in development)', 'success');
    
    // Here you could add actual API call to save the like:
    // await fetch('/api/like-post', { method: 'POST', body: JSON.stringify({...}) });
}

// Follow button click handler
document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'followToggleBtn') {
        const btn = e.target;
        const action = btn.dataset.action;
        const targetEmail = btn.dataset.targetEmail;
        const currentEmail = localStorage.getItem('karigar_user_email');
        
        if (!currentEmail || !targetEmail) {
            showAlert('Please sign in first', 'warning');
            return;
        }
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        
        try {
            const response = await fetch(`/api/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ follower: currentEmail, followee: targetEmail })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update button state
                const isNowFollowing = action === 'follow';
                btn.className = `btn ${isNowFollowing ? 'btn-outline-danger' : 'btn-success'}`;
                btn.innerHTML = `<i class="fas ${isNowFollowing ? 'fa-user-minus' : 'fa-user-plus'} me-1"></i>${isNowFollowing ? 'Unfollow' : 'Follow'}`;
                btn.dataset.action = isNowFollowing ? 'unfollow' : 'follow';
                
                // Update follower count
                const followersEl = document.getElementById('viewUserFollowers');
                let currentCount = parseInt(followersEl.textContent) || 0;
                if (isNowFollowing) {
                    followersEl.textContent = currentCount + 1;
                } else {
                    followersEl.textContent = Math.max(0, currentCount - 1);
                }
                
                showAlert(data.message || `${isNowFollowing ? 'Followed' : 'Unfollowed'} successfully`, 'success');
            } else {
                showAlert('Error: ' + (data.error || 'Unknown error'), 'danger');
            }
        } catch (error) {
            console.error('Error with follow action:', error);
            showAlert('Error updating follow status', 'danger');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
});

// AUTH FORM HANDLERS
function initializeAuthFormHandlers() {
    const signupForm = document.getElementById('signupForm');
    const signinForm = document.getElementById('signinForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const msg = document.getElementById('signupMsg');
            
            msg.textContent = '';
            
            if (!name || !email || !password) {
                msg.classList.remove('text-success');
                msg.classList.add('text-danger');
                msg.textContent = 'Please fill in all fields.';
                return;
            }
            
            if (password.length < 6) {
                msg.classList.remove('text-success');
                msg.classList.add('text-danger');
                msg.textContent = 'Password must be at least 6 characters long.';
                return;
            }
            
            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    msg.classList.remove('text-danger');
                    msg.classList.add('text-success');
                    msg.textContent = 'Sign up successful! You can now sign in.';
                    signupForm.reset();
                } else {
                    msg.classList.remove('text-success');
                    msg.classList.add('text-danger');
                    msg.textContent = data.error || 'Sign up failed.';
                }
            } catch (error) {
                msg.classList.remove('text-success');
                msg.classList.add('text-danger');
                msg.textContent = 'Error signing up. Please try again.';
            }
        });
    }
    
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('signinEmail').value.trim();
            const password = document.getElementById('signinPassword').value;
            const msg = document.getElementById('signinMsg');
            
            msg.textContent = '';
            
            if (!email || !password) {
                msg.classList.remove('text-success');
                msg.classList.add('text-danger');
                msg.textContent = 'Please fill in all fields.';
                return;
            }
            
            try {
                const response = await fetch('/api/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    msg.classList.remove('text-danger');
                    msg.classList.add('text-success');
                    msg.textContent = 'Sign in successful!';
                    signinForm.reset();
                    
                    // Store email in localStorage
                    localStorage.setItem('karigar_user_email', email);
                    
                    // Update UI to show signed in state
                    updateUIForSignedInUser();
                    
                    // Close modal
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('signinModal'));
                        if (modal) modal.hide();
                    }, 1000);
                    
                } else {
                    msg.classList.remove('text-success');
                    msg.classList.add('text-danger');
                    msg.textContent = data.error || 'Sign in failed.';
                }
            } catch (error) {
                msg.classList.remove('text-success');
                msg.classList.add('text-danger');
                msg.textContent = 'Error signing in. Please try again.';
            }
        });
    }
}

// Update UI for signed in user
function updateUIForSignedInUser() {
    const userEmail = localStorage.getItem('karigar_user_email');
    if (userEmail) {
        console.log('User signed in:', userEmail);
        
        // Update profile link to go to user's own profile
        const profileLink = document.getElementById('profileHeaderLink');
        if (profileLink) {
            profileLink.href = '/profile';
        }
    }
}

// SMOOTH SCROLLING AND NAVIGATION
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add smooth scrolling for navigation
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ARTISAN DATA AND MAP FUNCTIONALITY
async function loadArtisans() {
    try {
        const response = await fetch('/api/artisans');
        const data = await response.json();
        
        if (data.success) {
            displayArtisans(data.artisans);
            // Only initialize map if it's ready
            if (map) {
                initializeMap(data.artisans);
            } else {
                // Store artisans for when map is ready
                window.pendingArtisans = data.artisans;
            }
        } else {
            console.error('Failed to load artisans:', data.error);
        }
    } catch (error) {
        console.error('Error loading artisans:', error);
    }
}

// Display artisans in the sidebar
function displayArtisans(artisans) {
    const container = document.getElementById('artisan-cards');
    if (!container) return;
    
    container.innerHTML = '';

    artisans.forEach(artisan => {
        const card = createArtisanCard(artisan);
        container.appendChild(card);
    });
}

// Create artisan card element
function createArtisanCard(artisan) {
    const card = document.createElement('div');
    card.className = 'artisan-card d-flex align-items-center';
    card.onclick = () => selectArtisan(artisan);
    
    card.innerHTML = `
        <img src="${artisan.image}" alt="${artisan.name}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">
        <div class="artisan-info flex-grow-1">
            <h6 class="mb-1">${artisan.name}</h6>
            <p class="mb-0 text-muted">${artisan.craft} • ${artisan.city}</p>
        </div>
    `;
    
    return card;
}

// Select artisan and update map
function selectArtisan(artisan) {
    // Remove active class from all cards
    document.querySelectorAll('.artisan-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected card
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    selectedArtisan = artisan;
    
    // Update map to focus on selected artisan
    if (map && artisan.location) {
        const position = { lat: artisan.location.lat, lng: artisan.location.lng };
        map.setCenter(position);
        map.setZoom(15);
        
        // Update marker
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        addMarker(position, artisan);
    }
}

// GOOGLE MAPS FUNCTIONALITY
function initMap() {
    console.log('Initializing map...');
    const mapElement = document.getElementById('map');
    
    if (!mapElement) {
        console.error('Map element not found!');
        return;
    }
    
    // Ensure map element is properly positioned within container
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.style.position = 'relative';
        mapContainer.style.overflow = 'hidden';
        mapContainer.style.height = '600px';
        mapContainer.style.width = '100%';
        
        mapElement.style.position = 'relative';
        mapElement.style.zIndex = '2';
        mapElement.style.width = '100%';
        mapElement.style.height = '600px';
        mapElement.style.borderRadius = '18px';
        mapElement.style.display = 'block';
        mapElement.style.visibility = 'visible';
        mapElement.style.opacity = '1';
        
        console.log('Map container and element positioned');
    }
    
    const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India
    
    try {
        map = new google.maps.Map(mapElement, {
            zoom: 5,
            center: defaultCenter,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                },
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#4A90E2' }]
                },
                {
                    featureType: 'landscape',
                    elementType: 'geometry',
                    stylers: [{ color: '#f5f5f5' }]
                }
            ],
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'cooperative'
        });
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        showAlert('Error initializing map: ' + error.message, 'danger');
    }
}

// Add marker to map
function addMarker(position, artisan) {
    // Create custom marker based on craft type
    const craftColors = {
        'Madhubani Painting': '#6f42c1',
        'Bamboo Weaving': '#28a745',
        'Block Printing': '#fd7e14',
        'Pottery': '#dc3545',
        'Textile Weaving': '#17a2b8',
        'Wood Carving': '#6c757d'
    };
    
    const craftIcons = {
        'Madhubani Painting': '🎨',
        'Bamboo Weaving': '🎋',
        'Block Printing': '🖨️',
        'Pottery': '🏺',
        'Textile Weaving': '🧵',
        'Wood Carving': '🪵'
    };
    
    const color = craftColors[artisan.craft] || '#6f42c1';
    const icon = craftIcons[artisan.craft] || '🎨';
    
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: artisan.name,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
                        </filter>
                    </defs>
                    <circle cx="25" cy="25" r="22" fill="${color}" stroke="white" stroke-width="3" filter="url(#shadow)"/>
                    <circle cx="25" cy="25" r="18" fill="rgba(255,255,255,0.2)"/>
                    <text x="25" y="30" text-anchor="middle" fill="white" font-family="Arial" font-size="20">${icon}</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 25)
        },
        animation: google.maps.Animation.DROP
    });
    
    // Add bounce animation on click
    marker.addListener('click', () => {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
            marker.setAnimation(null);
        }, 1000);
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 15px; max-width: 250px; font-family: 'Poppins', sans-serif;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <img src="${artisan.image}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; object-fit: cover;">
                    <div>
                        <h6 style="margin: 0; color: ${color}; font-weight: 600;">${artisan.name}</h6>
                        <small style="color: #666;">${artisan.craft}</small>
                    </div>
                </div>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">${artisan.story}</p>
                <div style="margin: 8px 0;">
                    <strong style="color: #666; font-size: 12px;">Products:</strong>
                    <div style="font-size: 12px; color: #666;">${artisan.products ? artisan.products.join(', ') : 'Various crafts'}</div>
                </div>
                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee;">
                    <small style="color: #999;">📍 ${artisan.city}</small>
                </div>
            </div>
        `
    });
    
    marker.addListener('click', () => {
        // Close other info windows
        markers.forEach(m => {
            if (m.infoWindow) {
                m.infoWindow.close();
            }
        });
        
        infoWindow.open(map, marker);
        marker.infoWindow = infoWindow;
    });
    
    // Add hover effect
    marker.addListener('mouseover', () => {
        marker.setIcon({
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="rgba(0,0,0,0.4)"/>
                        </filter>
                    </defs>
                    <circle cx="30" cy="30" r="26" fill="${color}" stroke="white" stroke-width="3" filter="url(#shadow)"/>
                    <circle cx="30" cy="30" r="22" fill="rgba(255,255,255,0.3)"/>
                    <text x="30" y="36" text-anchor="middle" fill="white" font-family="Arial" font-size="24">${icon}</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(60, 60),
            anchor: new google.maps.Point(30, 30)
        });
    });
    
    marker.addListener('mouseout', () => {
        marker.setIcon({
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
                        </filter>
                    </defs>
                    <circle cx="25" cy="25" r="22" fill="${color}" stroke="white" stroke-width="3" filter="url(#shadow)"/>
                    <circle cx="25" cy="25" r="18" fill="rgba(255,255,255,0.2)"/>
                    <text x="25" y="30" text-anchor="middle" fill="white" font-family="Arial" font-size="20">${icon}</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 25)
        });
    });
    
    markers.push(marker);
}

// Initialize map with artisans
function initializeMap(artisans) {
    if (typeof google !== 'undefined' && google.maps && map) {
        // Add markers for all artisans
        artisans.forEach(artisan => {
            if (artisan.location) {
                const position = { lat: artisan.location.lat, lng: artisan.location.lng };
                addMarker(position, artisan);
            }
        });
    } else {
        // If map is not ready, wait and try again
        setTimeout(() => {
            initializeMap(artisans);
        }, 500);
    }
}

// Map utility functions
function ensureMapContainerStyling() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.style.borderRadius = '20px';
        mapContainer.style.overflow = 'hidden';
        mapContainer.style.boxShadow = '0 15px 40px rgba(50,205,50,0.15)';
        mapContainer.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
        mapContainer.style.minHeight = '500px';
        mapContainer.style.width = '100%';
        mapContainer.style.display = 'block';
        mapContainer.style.position = 'relative';
        mapContainer.style.border = '2px solid rgba(50,205,50,0.2)';
        mapContainer.style.transition = 'all 0.3s ease';
        mapContainer.style.margin = '20px 0';
        mapContainer.style.visibility = 'visible';
        mapContainer.style.opacity = '1';
        
        console.log('Map container styling applied');
    }
}

function ensureMapContainment() {
    const mapContainer = document.getElementById('map-container');
    const mapElement = document.getElementById('map');
    
    if (mapContainer && mapElement) {
        mapElement.style.position = 'relative';
        mapElement.style.zIndex = '2';
        mapElement.style.width = '100%';
        mapElement.style.height = '600px';
        mapElement.style.borderRadius = '18px';
        
        mapContainer.style.display = 'block';
        mapContainer.style.visibility = 'visible';
        mapContainer.style.opacity = '1';
        mapContainer.style.position = 'relative';
        mapContainer.style.overflow = 'hidden';
        
        console.log('Map containment ensured');
        
        if (map && typeof google !== 'undefined' && google.maps) {
            setTimeout(() => {
                google.maps.event.trigger(map, 'resize');
                console.log('Map resized to fit container');
            }, 100);
        }
    }
}

function debugMapContainer() {
    const mapContainer = document.getElementById('map-container');
    const mapElement = document.getElementById('map');
    const loadingDiv = document.querySelector('.map-loading');
    
    console.log('=== MAP CONTAINER DEBUG ===');
    console.log('Map container exists:', !!mapContainer);
    console.log('Map element exists:', !!mapElement);
    console.log('Loading div exists:', !!loadingDiv);
    
    if (mapContainer) {
        console.log('Container display:', mapContainer.style.display);
        console.log('Container visibility:', mapContainer.style.visibility);
        console.log('Container opacity:', mapContainer.style.opacity);
        console.log('Container computed style:', window.getComputedStyle(mapContainer).display);
        console.log('Container dimensions:', mapContainer.offsetWidth + 'x' + mapContainer.offsetHeight);
    }
    
    if (mapElement) {
        console.log('Map display:', mapElement.style.display);
        console.log('Map visibility:', mapElement.style.visibility);
        console.log('Map opacity:', mapElement.style.opacity);
        console.log('Map dimensions:', mapElement.offsetWidth + 'x' + mapElement.offsetHeight);
    }
    
    console.log('Map object exists:', !!map);
    console.log('Google Maps loaded:', typeof google !== 'undefined' && !!google.maps);
    console.log('================================');
}

// AI TOOLS FUNCTIONALITY
async function generateStory() {
    const form = document.getElementById('storyForm');
    const artisanName = document.getElementById('artisanName').value.trim();
    const craftType = document.getElementById('craftType').value;
    const artisanLocation = document.getElementById('artisanLocation').value.trim();
    const artisanExperience = document.getElementById('artisanExperience').value.trim();
    const productDescription = document.getElementById('productDescription').value.trim();
    
    if (!artisanName || !craftType) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }
    
    const button = document.querySelector('#storyModal .btn-primary');
    const originalText = button.textContent;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/generate-story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                artisan_info: {
                    name: artisanName,
                    location: artisanLocation,
                    experience: artisanExperience
                },
                craft_type: craftType,
                product_description: productDescription
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayStoryResults(data.formatted_story || data.story);
            showAlert('Story generated successfully!', 'success');
        } else {
            showAlert('Failed to generate story: ' + (data.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error generating story:', error);
        showAlert('Error generating story: ' + error.message, 'danger');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function displayStoryResults(story) {
    let resultsDiv = document.getElementById('storyResults');
    if (!resultsDiv) {
        const modalBody = document.querySelector('#storyModal .modal-body');
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'storyResults';
        resultsDiv.className = 'mt-4';
        modalBody.appendChild(resultsDiv);
    }
    
    resultsDiv.style.display = 'block';
    
    if (typeof story === 'object') {
        resultsDiv.innerHTML = `
            <h6>Generated Story Content:</h6>
            <div class="row g-3">
                <div class="col-12">
                    <h6 class="text-primary">Personal Story:</h6>
                    <div class="border p-3 rounded bg-light">
                        <p class="mb-0">${story.personal_story || 'No personal story generated'}</p>
                    </div>
                </div>
                <div class="col-12">
                    <h6 class="text-primary">Product Description:</h6>
                    <div class="border p-3 rounded bg-light">
                        <p class="mb-0">${story.product_description || 'No product description generated'}</p>
                    </div>
                </div>
                <div class="col-12">
                    <h6 class="text-primary">Social Media Caption:</h6>
                    <div class="border p-3 rounded bg-light">
                        <p class="mb-0">${story.social_caption || 'No social caption generated'}</p>
                    </div>
                </div>
                <div class="col-12">
                    <h6 class="text-primary">Bio:</h6>
                    <div class="border p-3 rounded bg-light">
                        <p class="mb-0">${story.bio || 'No bio generated'}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <h6>Generated Story:</h6>
            <div class="border p-3 rounded bg-light">
                <p style="white-space: pre-line;">${story}</p>
            </div>
        `;
    }
}

async function generateVoice() {
    const text = document.getElementById('voiceText').value.trim();
    
    if (!text) {
        showAlert('Please enter text to convert to speech', 'danger');
        return;
    }
    
    if (text.length > 5000) {
        showAlert('Text is too long. Please keep it under 5000 characters.', 'danger');
        return;
    }
    
    const button = document.querySelector('#voiceModal .btn-primary');
    const originalText = button.textContent;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/generate-voice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayVoiceResults(data.audio_data);
            showAlert(`Voice generated successfully! (${data.text_length || text.length} characters)`, 'success');
        } else {
            showAlert('Failed to generate voice: ' + (data.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error generating voice:', error);
        showAlert('Error generating voice: ' + error.message, 'danger');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function displayVoiceResults(audioData) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');
    
    if (audioPlayer && audioSource) {
        audioSource.src = 'data:audio/mpeg;base64,' + audioData;
        audioPlayer.style.display = 'block';
        
        const audio = audioPlayer.querySelector('audio');
        if (audio) {
            audio.load();
        }
    }
}

async function enhanceDesign() {
    const craftType = document.getElementById('designCraftType').value;
    const stylePreference = document.getElementById('stylePreference').value;
    const currentDesign = document.getElementById('currentDesign').value.trim();
    
    if (!craftType) {
        showAlert('Please select a craft type', 'danger');
        return;
    }
    
    const button = document.querySelector('#designModal .btn-primary');
    const originalText = button.textContent;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/enhance-design', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                craft_type: craftType,
                current_design: currentDesign,
                style_preference: stylePreference
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayDesignResults(data.enhancement_ideas || data.ideas);
            showAlert('Design ideas generated successfully!', 'success');
        } else {
            showAlert('Failed to generate design ideas: ' + (data.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error generating design ideas:', error);
        showAlert('Error generating design ideas: ' + error.message, 'danger');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function displayDesignResults(ideas) {
    let resultsDiv = document.getElementById('designResults');
    if (!resultsDiv) {
        const modalBody = document.querySelector('#designModal .modal-body');
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'designResults';
        resultsDiv.className = 'mt-4';
        modalBody.appendChild(resultsDiv);
    }
    
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <h6>Enhancement Ideas:</h6>
        <div class="border p-3 rounded bg-light">
            <p style="white-space: pre-line;">${ideas}</p>
        </div>
    `;
}

async function generateVideoScript() {
    const artisanName = document.getElementById('videoArtisanName').value.trim();
    const craftType = document.getElementById('videoCraftType').value.trim();
    const productName = document.getElementById('videoProductName').value.trim();
    const platform = document.getElementById('videoPlatform').value;
    const story = document.getElementById('videoStory').value.trim();
    
    if (!artisanName || !craftType || !productName) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }
    
    const button = document.querySelector('#videoModal .btn-primary');
    const originalText = button.textContent;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/generate-video-script', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                artisan_info: {
                    name: artisanName,
                    craft: craftType,
                    story: story
                },
                product_info: {
                    name: productName
                },
                platform: platform
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayVideoResults(data.video_script || data.script);
            showAlert('Video script generated successfully!', 'success');
        } else {
            showAlert('Failed to generate video script: ' + (data.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error generating video script:', error);
        showAlert('Error generating video script: ' + error.message, 'danger');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function displayVideoResults(script) {
    let resultsDiv = document.getElementById('videoResults');
    if (!resultsDiv) {
        const modalBody = document.querySelector('#videoModal .modal-body');
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'videoResults';
        resultsDiv.className = 'mt-4';
        modalBody.appendChild(resultsDiv);
    }
    
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <h6>Video Script:</h6>
        <div class="border p-3 rounded bg-light">
            <p style="white-space: pre-line;">${script}</p>
        </div>
    `;
}

async function analyzeDrawing() {
    const craftType = document.getElementById('drawingCraftType').value;
    const fileInput = document.getElementById('drawingFile');
    const file = fileInput.files[0];
    
    if (!craftType) {
        showAlert('Please select a craft type', 'danger');
        return;
    }
    
    if (!file) {
        showAlert('Please upload a drawing file', 'danger');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showAlert('Please upload a valid image file (JPG, PNG, GIF, etc.)', 'danger');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showAlert('File size too large. Please upload an image smaller than 10MB.', 'danger');
        return;
    }
    
    const button = document.querySelector('#drawingModal .btn-primary');
    const originalText = button.textContent;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Analyzing...';
    button.disabled = true;
    
    try {
        const base64 = await fileToBase64(file);
        
        const response = await fetch('/api/analyze-drawing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: base64,
                craft_type: craftType
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayDrawingResults(data.analysis);
            showAlert('Drawing analysis completed successfully!', 'success');
        } else {
            showAlert('Failed to analyze drawing: ' + (data.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error analyzing drawing:', error);
        showAlert('Error analyzing drawing: ' + error.message, 'danger');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function displayDrawingResults(analysis) {
    let resultsDiv = document.getElementById('drawingResults');
    if (!resultsDiv) {
        const modalBody = document.querySelector('#drawingModal .modal-body');
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'drawingResults';
        resultsDiv.className = 'mt-4';
        modalBody.appendChild(resultsDiv);
    }
    
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <h6>Analysis Results:</h6>
        <div class="border p-3 rounded bg-light">
            <p style="white-space: pre-line;">${analysis}</p>
        </div>
    `;
}

async function generateImage() {
    const craftType = document.getElementById('imageCraftType').value;
    const style = document.getElementById('imageStyle').value;
    const prompt = document.getElementById('imagePrompt').value.trim();
    
    if (!craftType) {
        showAlert('Please select a craft type', 'danger');
        return;
    }
    
    if (!prompt) {
        showAlert('Please describe the image you want to generate', 'danger');
        return;
    }
    
    if (prompt.length > 1000) {
        showAlert('Description too long. Please keep it under 1000 characters.', 'danger');
        return;
    }
    
    const button = document.querySelector('#imageModal .btn-primary');
    const originalText = button.textContent;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                craft_type: craftType,
                style: style
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayImageResults(data);
            showAlert('Image description generated successfully!', 'success');
        } else {
            showAlert('Failed to generate image description: ' + (data.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error generating image description:', error);
        showAlert('Error generating image description: ' + error.message, 'danger');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function displayImageResults(data) {
    let resultsDiv = document.getElementById('imageResults');
    if (!resultsDiv) {
        const modalBody = document.querySelector('#imageModal .modal-body');
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'imageResults';
        resultsDiv.className = 'mt-4';
        modalBody.appendChild(resultsDiv);
    }
    
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <h6>Generated Description:</h6>
        <div class="border p-3 rounded bg-light mb-3">
            <p style="white-space: pre-line;">${data.description || 'No description generated'}</p>
        </div>
        
        <h6>Enhanced Prompt for Image Generation:</h6>
        <div class="border p-3 rounded bg-light mb-3">
            <p style="white-space: pre-line; font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px;">${data.enhanced_prompt || data.prompt || 'No enhanced prompt generated'}</p>
            <button class="btn btn-sm btn-outline-primary mt-2" onclick="copyToClipboard('${(data.enhanced_prompt || data.prompt || '').replace(/'/g, "\\'")}')">
                <i class="fas fa-copy me-1"></i>Copy Enhanced Prompt
            </button>
        </div>
        
        <div class="alert alert-info">
            <h6><i class="fas fa-info-circle me-2"></i>How to Use This Description:</h6>
            <p class="mb-2">Copy the enhanced prompt and use it with these image generation services:</p>
            <ul class="mb-0">
                <li><strong>DALL-E 3 (OpenAI):</strong> Paste the prompt directly</li>
                <li><strong>Midjourney:</strong> Use /imagine with the prompt</li>
                <li><strong>Stable Diffusion:</strong> Use the prompt in your preferred interface</li>
                <li><strong>Adobe Firefly:</strong> Paste the prompt in the text-to-image tool</li>
            </ul>
        </div>
    `;
}

// Utility functions
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showAlert('Enhanced prompt copied to clipboard!', 'success');
        }).catch(() => {
            showAlert('Failed to copy to clipboard', 'danger');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showAlert('Enhanced prompt copied to clipboard!', 'success');
        } catch (err) {
            showAlert('Failed to copy to clipboard', 'danger');
        }
        document.body.removeChild(textArea);
    }
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = 'none';
    }
}

// ANIMATIONS AND UI ENHANCEMENTS
function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.classList.contains('tool-card')) {
                    element.classList.add('bounce-in');
                    element.style.animationDelay = `${(index % 5) * 0.1}s`;
                } else if (element.classList.contains('stat-item')) {
                    element.classList.add('scale-in');
                    element.style.animationDelay = `${(index % 4) * 0.1}s`;
                } else {
                    element.classList.add('fade-in');
                }
                
                const icon = element.querySelector('.tool-icon');
                if (icon) {
                    setTimeout(() => {
                        icon.classList.add('float');
                    }, 1000);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.tool-card, .artisan-card, .stat-item, .hero-section, .map-container').forEach(el => {
        observer.observe(el);
    });
}

function addInteractiveAnimations() {
    // Add hover effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            this.style.transition = 'all 0.3s ease';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
    });
    
    // Add click animations to tool cards
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', function() {
            this.style.animation = 'wiggle 0.5s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(255,255,255,0.6)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            ripple.classList.add('ripple-effect');
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}
function initializeMapEnhancements() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        // Add loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'map-loading';
        loadingDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 10;
            color: #666;
        `;
        loadingDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i>
            </div>
            <div>Loading map...</div>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                If the map doesn't load, check the browser console for errors
            </div>
        `;
        mapContainer.appendChild(loadingDiv);
        
        // Add map controls
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'map-controls';
        controlsDiv.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 5;
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;
        controlsDiv.innerHTML = `
            <button class="map-control-btn btn btn-sm btn-light" onclick="resetMapView()" title="Reset View">
                <i class="fas fa-home"></i>
            </button>
            <button class="map-control-btn btn btn-sm btn-light" onclick="toggleMapStyle()" title="Toggle Style">
                <i class="fas fa-palette"></i>
            </button>
            <button class="map-control-btn btn btn-sm btn-light" onclick="toggleMapLegend()" title="Toggle Legend">
                <i class="fas fa-info-circle"></i>
            </button>
        `;
        mapContainer.appendChild(controlsDiv);
        
        // Add map legend
        const legendDiv = document.createElement('div');
        legendDiv.className = 'map-legend';
        legendDiv.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(255,255,255,0.95);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 5;
            font-size: 12px;
        `;
        legendDiv.innerHTML = `
            <h6 style="margin-bottom: 8px; font-size: 14px;">Artisan Types</h6>
            <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 12px; height: 12px; background: #6f42c1; border-radius: 50%; margin-right: 6px;"></div>
                <span>Madhubani Artists</span>
            </div>
            <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 12px; height: 12px; background: #28a745; border-radius: 50%; margin-right: 6px;"></div>
                <span>Bamboo Craftsmen</span>
            </div>
            <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 12px; height: 12px; background: #fd7e14; border-radius: 50%; margin-right: 6px;"></div>
                <span>Block Printers</span>
            </div>
            <div class="legend-item" style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: #dc3545; border-radius: 50%; margin-right: 6px;"></div>
                <span>Pottery Makers</span>
            </div>
        `;
        mapContainer.appendChild(legendDiv);
        
        // Fallback: Hide loading after timeout
        setTimeout(() => {
            const loadingDiv = document.querySelector('.map-loading');
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
                console.log('Loading state hidden by fallback');
            }
            
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.style.display = 'block';
                mapContainer.style.visibility = 'visible';
                mapContainer.style.opacity = '1';
                console.log('Map container forced visible by fallback');
            }
            
            showMapContainerElements();
        }, 5000);
    }
}

function showMapContainerElements() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        console.log('Map container found, showing elements...');
        
        const controls = mapContainer.querySelector('.map-controls');
        const legend = mapContainer.querySelector('.map-legend');
        
        if (controls) {
            controls.style.display = 'flex';
            console.log('Controls displayed');
        }
        if (legend) {
            legend.style.display = 'block';
            console.log('Legend displayed');
        }
        
        mapContainer.style.position = 'relative';
        mapContainer.style.overflow = 'hidden';
        mapContainer.style.visibility = 'visible';
        mapContainer.style.opacity = '1';
        
        console.log('Map container elements shown');
    }
}

// Map control functions
function resetMapView() {
    if (map) {
        map.setCenter({ lat: 20.5937, lng: 78.9629 });
        map.setZoom(5);
        console.log('Map view reset to India center');
    }
}

function toggleMapStyle() {
    if (map) {
        const currentStyle = map.get('styles');
        if (currentStyle && currentStyle.length > 0) {
            map.set('styles', []);
            console.log('Map style reset to default');
        } else {
            map.set('styles', [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                },
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#4A90E2' }]
                },
                {
                    featureType: 'landscape',
                    elementType: 'geometry',
                    stylers: [{ color: '#f5f5f5' }]
                }
            ]);
            console.log('Map style applied');
        }
    }
}

function toggleMapLegend() {
    const legend = document.querySelector('.map-legend');
    if (legend) {
        legend.style.display = legend.style.display === 'none' ? 'block' : 'none';
        console.log('Legend toggled');
    }
}

// Follow/unfollow click handler
document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'followToggleBtn') {
        const btn = e.target;
        const action = btn.dataset.action;
        const targetEmail = btn.dataset.targetEmail;
        const currentEmail = localStorage.getItem('karigar_user_email');
        
        if (!currentEmail || !targetEmail) {
            showAlert('Please sign in first', 'warning');
            return;
        }
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        
        try {
            const response = await fetch(`/api/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ follower: currentEmail, followee: targetEmail })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh profile to update counts/state
                await loadProfile(targetEmail);
                showAlert(data.message || `${action === 'follow' ? 'Followed' : 'Unfollowed'} successfully`, 'success');
            } else {
                showAlert('Error: ' + (data.error || 'Unknown error'), 'danger');
            }
        } catch (error) {
            console.error('Error with follow action:', error);
            showAlert('Error updating follow status', 'danger');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
});


document.head.appendChild(style);

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Karigar app...');
    
    // Check if user is already signed in
    const userEmail = localStorage.getItem('karigar_user_email');
    if (userEmail) {
        console.log('User already signed in:', userEmail);
        updateUIForSignedInUser();
    }
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Make functions globally available
    window.viewProfileFromHeader = viewProfileFromHeader;
    window.toggleFollowFromHeader = toggleFollowFromHeader;
    window.resetMapView = resetMapView;
    window.toggleMapStyle = toggleMapStyle;
    window.toggleMapLegend = toggleMapLegend;
    window.debugMapContainer = debugMapContainer;
    window.showMapContainerElements = showMapContainerElements;
    window.ensureMapContainment = ensureMapContainment;
    window.scrollToSection = scrollToSection;
    window.generateStory = generateStory;
    window.generateVoice = generateVoice;
    window.enhanceDesign = enhanceDesign;
    window.generateVideoScript = generateVideoScript;
    window.analyzeDrawing = analyzeDrawing;
    window.generateImage = generateImage;
    window.copyToClipboard = copyToClipboard;
    window.retrySearch = retrySearch;
    window.loadProfile = loadProfile;
    
    console.log('Karigar app initialized successfully');
});