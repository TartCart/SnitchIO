// email submit instructions
document.getElementById('email-submit-btn').addEventListener('click', function() {

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
        }, 5000)

        try {
            window.electronAPI.sendData(emailObject);
            console.log('update email array sent successfully');
          } catch (error) {
            console.error('Error sending update email array:', error);
          }
    }
});

// exclusion submit isntructions
document.getElementById('exclusions-submit-btn').addEventListener('click', function() {
 
    const exclusionList = document.getElementById('exclusions-list').value;
    const exclusionArray = exclusionList.split(","); 
    const exclusionObject = {
        name: 'exclusion-array',
        content: exclusionArray
    }
    if (exclusionList === '')
    {
        document.getElementById('exclusion-submit-status').textContent = 'No exclusions entered..';
        
        // fade out the error notification
        setTimeout(function() {
            document.getElementById('exclusion-submit-status').textContent = '';
        }, 2000)
        return;
    } else {
        document.getElementById('exclusion-submit-status').textContent = 'Recieved';
            // fade out the received confirmation
        setTimeout(function() {
            document.getElementById('exclusion-submit-status').textContent = '';
        }, 5000)

        try {
            window.electronAPI.sendData(exclusionObject);
            console.log('exclusion array sent successfully');
          } catch (error) {
            console.error('Error sending exclusion array:', error);
          }
    }
});