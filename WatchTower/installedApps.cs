using Microsoft.Win32;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Net;
using System.Net.Sockets;
using WatchTower;

public class InstalledApps
{
    private static RegistryKey uninstallKey;

    private System.Timers.Timer timer;
    private EmailSender emailSender;

    //set for comparing already installed apps to newly added apps 
    private HashSet<String> preInstalledAppsByName;

    // Set up the preinstalled apps by name as a reference to newly installed apps
    private string[] preInstalledApps;

    //Constructor 
    public InstalledApps()
    {
        uninstallKey = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall");
        preInstalledApps = uninstallKey.GetSubKeyNames();
        emailSender = new EmailSender();
    }

    private void SetupTimer()
    {
        // Set up timer to check for new installed apps periodically
        //timer = new System.Timers.Timer(120000); // Check every 2 min
        timer = new System.Timers.Timer(10000); // Check every 10 sec for testing
        timer.Elapsed += Timer_Elapsed;
        timer.Start();
    }

    public void StartMonitoring()
    {
        preInstalledAppsByName = CleanAppList(preInstalledApps);
        SetupTimer();
        Program.LogMessage("Installed Apps Monitoring started.");
    }

    public void StopMonitoring()
    {
        timer.Stop();
        Program.LogMessage("Installed Apps Monitoring stopped.");
    }

    private void Timer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
    {
        // Get the list of currently installed applications and convert it to set for comparison with default set
        HashSet<String> installedApps = new HashSet<string>(uninstallKey.GetSubKeyNames());
        // Check for new installed apps
        foreach (string appKey in installedApps)
        {
            RegistryKey key = uninstallKey.OpenSubKey(appKey);
            if (key != null)
            {
                string appName = key.GetValue("DisplayName") as string;
                if (appName != null && appKey.ToString() != "AddressBook")
                    // Program.LogMessage("checking");
                    // Program.LogMessage(appKey);
                {
                    // Check if the app is newly installed
                    if (!IsAppAlreadyNotified(appName))
                    {
                        // Populate email variables 
                        string installDate = key.GetValue("InstallDate") as string;
                        string installSource = key.GetValue("InstallSource") as string;
                        string installLocation = key.GetValue("InstallLocation") as string;
                        string publisher = key.GetValue("Publisher") as string;
                        // get machine info
                        string localHostname = Dns.GetHostName();
                        IPAddress[] addresses = Dns.GetHostAddresses(localHostname);
                        string ipv4Addresses = string.Join(", ", addresses.Where(a => a.AddressFamily == AddressFamily.InterNetwork));

                        // Send email notification
                        string emailBody = $"System local time: {DateTime.Now.ToString("h:mm:ss tt")}\n" +
                                            $"Local Computer Hostname: {localHostname}\n" +
                                            $"Local Computer IP(s): {ipv4Addresses}\n" +
                                            "\n--Below data may be unavailable for some applications--\n" +
                                            $"Installed Software: {appName}\n" +
                                            $"Publisher: {publisher}\n" +
                                            $"Installed Location: {installLocation}\n" +
                                            $"Install Source: {installSource}\n" +
                                            $"Data found: SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{appKey}";


                        // Send email ******** RECIPIENT EMAIL NEEDS TO BE READ IN FROM THE CONFIG FILE  ***********
                        Program.LogMessage($"New Software Detected: Sending Alert email.{appName}");
                        emailSender.SendEmail("evollutiion@gmail.com", "Installed Software Event Notification", emailBody);

                        // Mark the app as notified
                        MarkAppAsNotified(appName);
                    }
                }
            }
        }
    }

    // Create the set from the already installed apps
    private static HashSet<String> CleanAppList(string[] apps)
    {
        HashSet<string> appNames = new HashSet<string>();

        foreach (string appKey in apps)
        {
            RegistryKey key = uninstallKey.OpenSubKey(appKey);
            if (key != null)
            {
                string appName = key.GetValue("DisplayName") as string;
                if (appName != null)
                {
                    appNames.Add(appName);
                }
            }
        }
        return appNames;
       
    }

    // Compare the app in the newly aquired set to see if it is in the old set (indicating a program has been installed)
    private bool IsAppAlreadyNotified(string appName)
    {
        bool isPresent = preInstalledAppsByName.Contains(appName);
        return isPresent;
    }

    //Add app to default set after sending notification email so its known it is already installed
    private void MarkAppAsNotified(string appName)
    {
        preInstalledAppsByName.Add(appName);
    }
}