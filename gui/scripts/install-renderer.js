// Install button for service
document.getElementById('install-btn').addEventListener('click', function() {

    document.getElementById('install-status').textContent = 'Installing...';
    //ipcRenderer.send



});

    // Uninstall button for service 
document.getElementById('uninstall-btn').addEventListener('click', function() {

    document.getElementById('uninstall-status').textContent = 'uninstalling...';

});

//  submit button to get email list
document.getElementById('submit-btn').addEventListener('click', function() {

    // TODO: clean the array, remove spaces and confirm its an email address etc 
    const emailList = document.getElementById('email-list').value;
    const emailArray = emailList.split(","); 
    const emailObject = {
        name: 'email-array',
        contents: emailArray
    }
    if (emailList === '')
    {
        document.getElementById('submit-status').textContent = 'Enter an email address..';
        
        // fade out the error notification
        setTimeout(function() {
            document.getElementById('submit-status').textContent = '';
        }, 2000)
        return;
    } else {
        document.getElementById('submit-status').textContent = 'Recieved';
            // fade out the received confirmation
        setTimeout(function() {
            document.getElementById('submit-status').textContent = '';
        }, 2000)

        try {
            window.electronAPI.sendData(emailObject);
            console.log('Array sent successfully');
          } catch (error) {
            console.error('Error sending array:', error);
          }
    }
});
