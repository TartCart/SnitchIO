using System.Diagnostics.Eventing.Reader;
using System.Net;
using System.Net.Sockets;

public class RDPMonitor
{
    private EventLogWatcher watcher;
    private EmailSender emailSender;

    public RDPMonitor()
    {
        emailSender = new EmailSender();
    }

    public void StartMonitoring()
    {
        try
        {
            // Define the query to retrieve events with Event ID 1149 from the TerminalServices-RemoteConnectionManager/Operational log
            string queryString = @"<QueryList>
                                        <Query Path='Microsoft-Windows-TerminalServices-RemoteConnectionManager/Operational'>
                                            <Select Path='Microsoft-Windows-TerminalServices-RemoteConnectionManager/Operational'>*[System[(EventID=1149)]]</Select>
                                        </Query>
                                    </QueryList>";

            EventLogQuery query = new EventLogQuery("Microsoft-Windows-TerminalServices-RemoteConnectionManager/Operational", PathType.LogName, queryString);

            // Create and configure the event log watcher
            watcher = new EventLogWatcher(query);

            // Subscribe to the event record written event
            watcher.EventRecordWritten += (sender, eventArgs) =>
            {
                // Get the event record
                EventRecord eventRecord = eventArgs.EventRecord;
                Console.WriteLine("event found");

                // Retrieve the relevant details from the event record
                string user = eventRecord.Properties[0].Value.ToString();
                string sourceHostname = eventRecord.Properties[1].Value.ToString();
                string sourceIP = eventRecord.Properties[2].Value.ToString();

                if (sourceHostname == "")
                {
                    sourceHostname = "Null/Not provided";
                }
                

                // combine these to retreive once to make cleaner... shouldnt have to be called every time
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
                                   $"User Account Authenticated: {user}\n" +
                                   $"Source Hostname (Connection made from): {sourceHostname}\n" +
                                   $"Source IP (Connection made from): {sourceIP}";

                // Send email *****CHANGE FOR RECIPIENT LIST*********
                emailSender.SendEmail("evollutiion@gmail.com", "RDP Connection Notification", emailBody);
                Console.WriteLine("Sending RDP EMAIL");
            };

            // Start listening for events
            watcher.Enabled = true;
            Console.WriteLine("RDP Monitoring started.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during monitoring start: {ex.Message}");
        }
    }

    public void StopMonitoring()
    {
        try
        {
            // Stop the event log watcher
            watcher.Enabled = false;
            Console.WriteLine("RDP Monitoring stopped.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during monitoring stop: {ex.Message}");
        }
    }
}
