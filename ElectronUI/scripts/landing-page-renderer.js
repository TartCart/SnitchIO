// Get references to the buttons and main content
const homebutton = document.getElementById('home-button');
const installButton = document.getElementById('install-button');
const configureButton = document.getElementById('configure-button');
const monitorButton = document.getElementById('monitor-button');
const mainContent = document.getElementById('main-content');

// loads the home.hmtl page into #main-content as soon as the script runs
$('#main-content').load('content/home.html');


homebutton.addEventListener('click', () => {
    homebutton.classList.add('active');
    installButton.classList.remove('active');
    configureButton.classList.remove('active');
    monitorButton.classList.remove('active');

    $('#main-content').load('content/home.html');        
});


// Add event listeners to the buttons
installButton.addEventListener('click', () => {
    // Add/remove classes to show active state
    homebutton.classList.remove('active');
    installButton.classList.add('active');
    configureButton.classList.remove('active');
    monitorButton.classList.remove('active');
    
    
    // Update main content
    $('#main-content').load('content/install.html');
});

configureButton.addEventListener('click', () => {
    // Add/remove classes to show active state
    homebutton.classList.remove('active');
    installButton.classList.remove('active');
    configureButton.classList.add('active');
    monitorButton.classList.remove('active');
    
    
    // Update main content
    $('#main-content').load('content/configure.html');
});

monitorButton.addEventListener('click', () => {
    // Add/remove classes to show active state
    homebutton.classList.remove('active');
    installButton.classList.remove('active');
    configureButton.classList.remove('active');
    monitorButton.classList.add('active');
    
    
    // Update main content
    $('#main-content').load('content/monitor.html');
});