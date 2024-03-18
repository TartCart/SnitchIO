document.getElementById('submit-btn').addEventListener('click', function() {
    
    const emailList = document.getElementById('email-list').value;
    const array = emailList.split(","); 
    if (emailList === '')
    {
        document.getElementById('submit-status').textContent = 'Enter an email address..';
    } else {
        document.getElementById('submit-status').textContent = 'Recieved';
    }

    // fade out the received confirmation
    setTimeout(function() {
        document.getElementById('submit-status').textContent = '';
    }, 2000)
});