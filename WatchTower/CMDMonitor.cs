using System;
using System.Diagnostics.Eventing.Reader;
using System.Threading;
using System.Security.Principal;
using System.Net;
using System.Net.Sockets;
using WatchTower;
using System.Linq;

// Below must be ran in CMD as admin and will be handled by the installer. must be enabled for testing
// auditpol / set / subcategory:"Process Creation" / success:enable

public class CMDMonitor
{
    private EventLogWatcher watcher;
    private EmailSender emailSender;

    public CMDMonitor()
    {
        emailSender = new EmailSender();
    }

    public void StartMonitoring()
    {
        Program.LogMessage("CMD Monitoring started.");
        Thread.Sleep(10000);
        try
        {
            // Define the query to retrieve events with Event ID 4688 from Windows security log
            string queryString = @"<QueryList>
                                        <Query Path='Security'>
                                            <Select Path='Security'>*[System[(EventID=4688)]]</Select>
                                        </Query>
                                    </QueryList>";

            EventLogQuery query = new EventLogQuery("Security", PathType.LogName, queryString);

            // Create and configure the event log watcher
            watcher = new EventLogWatcher(query);

            // Subscribe to the event record written event
            watcher.EventRecordWritten += (sender, eventArgs) =>
            {
                // Get the event record
                EventRecord eventRecord = eventArgs.EventRecord;


                // Retrieve the ScriptBlockText, Computer, and Security UserID from the event record  // check if event record is null with ?
                string subjectUserSid = eventRecord.Properties[0]?.Value.ToString();  //this is the user account that stared the command
                string newProcessName = eventRecord.Properties[5]?.Value.ToString();  //this will be the process that was started/give an indication of what command was run
                string parentProcessName = eventRecord.Properties[13]?.Value.ToString(); //should be CMD cause thats what were looking for
                string targetSubjectAccountName = eventRecord.Properties[10]?.Value.ToString(); //the account that the command is targeting

                // Check the event log properties for regular system usage/not cmd.exe and filter those out
                string[] excludeList = { "conhost.exe", "wsl.exe", "icacls.exe" };
                if (!parentProcessName.Contains("cmd.exe") || excludeList.Any(process => newProcessName.Contains(process)))
                {
                    return;
                }

                // Resolve SID, filter if it was created by SYSTEM
                string accountName;
                try
                {
                    SecurityIdentifier sid = new SecurityIdentifier(subjectUserSid);
                    NTAccount ntAccount = (NTAccount)sid.Translate(typeof(NTAccount));
                    accountName = ntAccount.Value;

                    if (accountName.Contains("SYSTEM"))
                    {
                        return;
                    }

                }
                catch (IdentityNotMappedException)
                {
                    // If the SID cannot be mapped to an account name, use the SID itself
                    accountName = subjectUserSid;
                }


                // get local IP address
                string localHostname = Dns.GetHostName();
                IPAddress[] addresses = Dns.GetHostAddresses(localHostname);
                string ipv4Addresses = "";

                foreach (IPAddress address in addresses)
                {
                    if (address.AddressFamily == AddressFamily.InterNetwork) // Check if it's an IPv4 address
                    {
                        if (!string.IsNullOrEmpty(ipv4Addresses))
                        {
                            ipv4Addresses += ", ";
                        }

                        ipv4Addresses += address.ToString();
                    }
                }

                // Construct email body
                string emailBody = $"System local time: {DateTime.Now.ToString("h:mm:ss tt")}\n" +
                                   $"Local Computer Hostname: {localHostname}\n" +
                                   $"Local Computer IP(s): {ipv4Addresses}\n" +
                                   $"Security UserID/Username if available that ran the command: {accountName}\n" +
                                   $"Process that the command shell started: {newProcessName}\n" +
                                   $"Target of new process if applicable: {targetSubjectAccountName}";

                // Send email ******** RECIPIENT EMAIL NEEDS TO BE READ IN FROM THE CONFIG FILE  ***********
                Program.LogMessage("CMD.EXE Command Detected: Sending Alert email.");
                emailSender.SendEmail("evollutiion@gmail.com", "CMD.exe Event Notification", emailBody);
            };

            // Start listening for events and logging ******** Needs to be written out to log file************
            watcher.Enabled = true;
        }
        catch (Exception ex)
        {
            Program.LogMessage($"Error during CMD monitoring start: {ex.Message}");
        }
    }

    public void StopMonitoring()
    {
        try
        {
            // Stop the event log watcher ********** Needs to be written out to log file*********
            watcher.Enabled = false;
            Program.LogMessage("CMD Monitoring stopped.");
        }
        catch (Exception ex)
        {
            Program.LogMessage($"Error during CMD monitoring stop: {ex.Message}");
        }
    }
}
