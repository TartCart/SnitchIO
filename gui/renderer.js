      // Get references to the buttons and main content
      const homebutton = document.getElementById('home-button');
      const installButton = document.getElementById('install-button');
      const configureButton = document.getElementById('configure-button');
      const monitorButton = document.getElementById('monitor-button');
      const mainContent = document.getElementById('main-content');

      // Function to update main content
    function updateMainContent(content) {
        mainContent.innerHTML = content;
    }

    // Function to set the initial state
    function setInitialState() {
        homebutton.classList.add('active');
        updateMainContent(defaultContent); // Load default content
    }

      homebutton.addEventListener('click', () => {
          homebutton.classList.add('active');
          installButton.classList.remove('active');
          configureButton.classList.remove('active');
          monitorButton.classList.remove('active');

            mainContent.innerHTML = '<h1>Welcome to WatchTower</h1><p>This program installs a service on Windows machines to monitor processes and applications to alert system administrators via email of potential threat actor activity.</p><h2>Monitoring and Alerting Functionality</h2><ul><li>Powershell</li><li>Command prompt (CMD.exe)</li><li>Remote Desktop Protocol (RDP)</li><li>Application Installation</li></ul><h3>Prerequisites</h3><ul><li>Windows Server 2012 R2 and greater</li><li>windows 8.1/RT 8.1 and greater</li></ul>';      
        });
      

      // Add event listeners to the buttons
      installButton.addEventListener('click', () => {
          // Add/remove classes to show active state
          homebutton.classList.remove('active');
          installButton.classList.add('active');
          configureButton.classList.remove('active');
          monitorButton.classList.remove('active');
          
          
          // Update main content
          mainContent.innerHTML = '<p>Install content goes here.</p>';
      });

      configureButton.addEventListener('click', () => {
          // Add/remove classes to show active state
          homebutton.classList.remove('active');
          installButton.classList.remove('active');
          configureButton.classList.add('active');
          monitorButton.classList.remove('active');
          
          
          // Update main content
          mainContent.innerHTML = '<p>Configure content goes here.</p>';
      });

      monitorButton.addEventListener('click', () => {
          // Add/remove classes to show active state
          homebutton.classList.remove('active');
          installButton.classList.remove('active');
          configureButton.classList.remove('active');
          monitorButton.classList.add('active');
          
          
          // Update main content
          mainContent.innerHTML = '<p>Monitor content goes here.</p>';
      });