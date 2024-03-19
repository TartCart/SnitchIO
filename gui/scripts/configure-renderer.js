document.getElementById('submit-btn').addEventListener('click', function() {

    // TODO: clean the array, remove spaces and confirm its an email address etc 
    const emailList = document.getElementById('email-list').value;
    const emailArray = emailList.split(","); 
    const emailObject = {
        name: 'email-array',
        content: emailArray,
        update: true
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
            console.log('update email array sent successfully');
          } catch (error) {
            console.error('Error sending update email array:', error);
          }
    }
});