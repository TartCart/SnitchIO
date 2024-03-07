using System;
using System.Diagnostics.Eventing.Reader;
using System.Dynamic;
using System.Security.Principal;
using WatchTowerService;

public class PSMonitor
{
    private EventLogWatcher watcher;
    private EmailSender emailSender;

    public PSMonitor()
    {
        emailSender = new EmailSender();
    }

    public void StartMonitoring()
    {
        try
        {
            // Define the query to retrieve events with Event ID 4104 from the PowerShell Operational log
            string queryString = @"<QueryList>
                                        <Query Path='Microsoft-Windows-PowerShell/Operational'>
                                            <Select Path='Microsoft-Windows-PowerShell/Operational'>*[System[(EventID=4104)]]</Select>
                                        </Query>
                                    </QueryList>";

            EventLogQuery query = new EventLogQuery("Microsoft-Windows-PowerShell/Operational", PathType.LogName, queryString);

            // Create and configure the event log watcher
            watcher = new EventLogWatcher(query);
            // Subscribe to the event record written event

            watcher.EventRecordWritten += (sender, eventArgs) =>
            {
                // Get the event record
                EventRecord eventRecord = eventArgs.EventRecord;

                // Retrieve the ScriptBlockText, Computer, and Security UserID from the event record
                string scriptBlockText = eventRecord.Properties[2].Value.ToString();
                string computer = eventRecord.MachineName;
                string securityUserID = eventRecord.UserId?.Value;

                // The event log only contains the SID, resolve to real name
                string accountName;
                try
                {
                    SecurityIdentifier sid = new SecurityIdentifier(securityUserID);
                    NTAccount ntAccount = (NTAccount)sid.Translate(typeof(NTAccount));
                    accountName = ntAccount.Value;
                }
                catch (IdentityNotMappedException)
                {
                    // If the SID cannot be mapped to an account name, use the SID itself
                    accountName = securityUserID;
                }

                // Check if ScriptBlockText is "prompt" or an error, if so, skip processing because its useless events and unnecessary
                if (scriptBlockText.Trim() == "prompt" || scriptBlockText.Contains("Set-StrictMode"))
                {
                    return;
                }

                // Construct email body
                string emailBody = $"System local time: {DateTime.Now.ToString("h:mm:ss tt")}\n" +
                                   $"Computer Hostname: {computer}\n" +
                                   $"Security UserID/Username if available: {accountName}\n" +
                                   $"Powershell command: {scriptBlockText}";

                // Send email ******** RECIPIENT EMAIL NEEDS TO BE READ IN FROM THE CONFIG FILE  ***********
                emailSender.SendEmail("evollutiion@gmail.com", "PowerShell Event Notification", emailBody);
            };

            // Start listening for events and logging
            watcher.Enabled = true;
            Program.LogMessage("PS Monitoring started.");
        }
        catch (Exception ex)
        {
            Program.LogMessage($"Error during PS monitoring stop: {ex.Message}");
        }
    }

    public void StopMonitoring()
    {
        try
        {
            // Stop the event log watcher ********** Needs to be written out to log file*********
            watcher.Enabled = false;
            Program.LogMessage("PS Monitoring stopped.");
        }
        catch (Exception ex)
        {
            Program.LogMessage($"Error during PS monitoring stop: {ex.Message}");
        }
    }
}
