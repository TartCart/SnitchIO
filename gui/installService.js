function generateScript() {
    // Get the email list from the textarea
    var emailList = document.getElementById('email-list').value.trim();

    // Check if the email list is empty
    if (emailList === '') {
        alert('Please enter at least one email address.');
        return;
    }

    // Convert email list to PowerShell command
    var script = '$emailList = "' + emailList.replace(/\n/g, '","') + '"\n' +
                 'Set-Content -Path "C:\\email_list.txt" -Value $emailList';

    // Execute the PowerShell script
    executeScript(script);
}

function executeScript(script) {
    // Your script execution logic here
    console.log('Executing script:', script);
}
