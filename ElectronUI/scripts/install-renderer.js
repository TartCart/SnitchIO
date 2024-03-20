
// fade out button click status'
function fadeOutText(id) {
    setTimeout(function () {
        document.getElementById(id).textContent = '';
    }, 4000);
}

// delay execution
function delayExecution(callback, delay) {
  setTimeout(callback, delay);
}

//  update status with a delay for readability
function updateStatusWithDelay(elementId, status) {
  delayExecution(() => {
      const element = document.getElementById(elementId);
      element.textContent = status;
      element.style.color = "#56B847";
      fadeOutText(elementId);
  }, 3000); // Delay of 3 seconds
}

// handle install or uninstall status reporting
function handleStatusReporting(type, status) {
  const elementId = type === 'install' ? 'install-status' : 'uninstall-status';
  updateStatusWithDelay(elementId, status);
}

// Listen for operation status updates
electronAPI.onOperationStatus(({type, status}) => {
  handleStatusReporting(type, status);
});



// Install button for service
document.getElementById('install-btn').addEventListener('click', function() {

    document.getElementById('install-status').textContent = 'Installing...';
    fadeOutText('install-status');

    const installObject = {
        name: 'install-bool',
        content: true
    }

        try {
            window.electronAPI.sendData(installObject);
            console.log('install bool sent successfully');
          } catch (error) {
            console.error('Error sending install bool:', error);
          }

});

    // Uninstall button for service 
document.getElementById('uninstall-btn').addEventListener('click', function() {

    document.getElementById('uninstall-status').textContent = 'uninstalling...';
    fadeOutText('uninstall-status')

    const uninstallObject = {
        name: 'uninstall-bool',
        content: true
    }

        try {
            window.electronAPI.sendData(uninstallObject);
            console.log('uninstall bool sent successfully');
          } catch (error) {
            console.error('Error sending uninstall bool:', error);
          }

});

//  submit button to get email list
document.getElementById('submit-btn').addEventListener('click', function() {

    // TODO: clean the array, remove spaces and confirm its an email address etc 
    const emailList = document.getElementById('email-list').value;
    const emailArray = emailList.split(","); 
    const emailObject = {
        name: 'email-array',
        content: emailArray
    }
    if (emailList === '')
    {
        document.getElementById('submit-status').textContent = 'Enter an email address..';
        
        // fade out the error notification
        fadeOutText('submit-status');
    } else {
        document.getElementById('submit-status').textContent = 'Recieved';
        // fade out the received confirmation
        fadeOutText('submit-status');

        try {
            window.electronAPI.sendData(emailObject);
            console.log('Array sent successfully');
          } catch (error) {
            console.error('Error sending array:', error);
          }
    }
});




