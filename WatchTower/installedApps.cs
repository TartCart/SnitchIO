using Microsoft.Win32;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Net;
using System.Net.Sockets;
using WatchTower;

// Class for checking installed apps by looking up the uninstall keys in the registry

public class InstalledApps
{ 
    private System.Timers.Timer timer;
    private EmailSender emailSender;
    
    // Declare comparison sets/arrays as fields for all the methods to access
    private HashSet<String> ogInstalledAppsSet = new HashSet<string>();

    // Constructor 
    public InstalledApps()
    {
        emailSender = new EmailSender();
    }

    private void SetupTimer()
    {
        // Set up timer to check for new installed apps periodically
        // timer = new System.Timers.Timer(120000); // Check every 2 min
        timer = new System.Timers.Timer(20000); // Check every 20 sec for testing
        timer.Elapsed += Timer_Elapsed;
        timer.Start();
    }

    public void StartMonitoring()
    {
        CleanAppList();
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
        checkBaseKey(RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry64));
        checkBaseKey(RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry32));
    }

    private void checkBaseKey(RegistryKey localMachine)
    {
        
        // Have to generate a fresh set here, need access to both the key and the app name for comparison and recording in this method
        using (var newUninstallKey = localMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"))
        {
            string[] newInstalledAppsArray = new string[0];
            try
            {
                newInstalledAppsArray = newUninstallKey.GetSubKeyNames();
                string numApps = newInstalledAppsArray.Length.ToString();
            }
            catch (Exception ex)
            {
                Program.LogMessage($"Error retrieving new master uninstall key for installed apps: {ex.Message}");
            }

            foreach (string appKey in newInstalledAppsArray)
            {
                RegistryKey key = newUninstallKey.OpenSubKey(appKey);

                if (key != null)
                {
                    string appName = key.GetValue("DisplayName") as string;
                    if (appName != null && appKey.ToString() != "AddressBook")
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
                            Program.LogMessage($"New Software Detected: Sending Alert email.{appName}{key}{appKey} app");
                            emailSender.SendEmail("evollutiion@gmail.com", "Installed Software Event Notification", emailBody);

                            // Mark the app as notified aka ensure it doesnt alert on the same app
                            MarkAppAsNotified(appName);
                            // Close the registry key when done accessing

                        }
                    }
                }
            }
        }
    }

    // Create the set from the already installed apps
    private void CleanAppList()
    {
        ogInstalledAppsSet.Clear();
        loadInitialApps(RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry64));
        loadInitialApps(RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry32));
    }

    private void loadInitialApps(RegistryKey localMachine)
    {
        using (var ogUninstallKey = localMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"))
        {
            string[] ogInstalledAppsArray = new string[0];

            try
            {
                // Have to generate another set, need access to both the key and the app name for comparison and recording in this method
                ogInstalledAppsArray = ogUninstallKey.GetSubKeyNames();
                string numApps = ogInstalledAppsArray.Length.ToString();
                Program.LogMessage(numApps);
            }
            catch (Exception ex)
            {
                Program.LogMessage($"Error retrieving og master uninstall key for installed apps: {ex.Message}");
            }

            
            // appKey is the individual subkey name of the folder in the Uninstall directory
            foreach (string appKey in ogInstalledAppsArray)
            {
                RegistryKey key = ogUninstallKey.OpenSubKey(appKey);
                if (key != null && key.ToString() != "AddressBook")
                {
                    string appName = key.GetValue("DisplayName") as string;
                    if (appName != null)
                    {
                        ogInstalledAppsSet.Add(appName);
                    }
                }
            }
        }
    }

    // Compare the app in the newly aquired set to see if it is in the old set (indicating a program has been installed)
    private bool IsAppAlreadyNotified(string appName)
    {
        bool isPresent = ogInstalledAppsSet.Contains(appName);
        return isPresent;
    }

    //Add app to default set after sending notification email so its known it is already installed
    private void MarkAppAsNotified(string appName)
    {
        ogInstalledAppsSet.Add(appName);
    }
}