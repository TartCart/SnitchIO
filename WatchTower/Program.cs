﻿using System;
using System.IO;
using System.Runtime.InteropServices;
using System.ServiceProcess;
using System.Threading;


// Must be ran as admin



namespace WatchTower
{
    static class Program
    {
        // Create this directory for testing, will have the installer create it separately
        private static string logFilePath = @"C:\ProgramData\WatchTower\logfile.txt";

        static void Main()
        {
            // Initialize log file
            InitializeLogFile();

            ServiceBase[] ServicesToRun;
            ServicesToRun = new ServiceBase[]
            {
                new MonitorService()
            };
            ServiceBase.Run(ServicesToRun);
        }

        private static void InitializeLogFile()
        {
            // Ensure the directory exists
            Directory.CreateDirectory(Path.GetDirectoryName(logFilePath));

            // Clear existing log file content
            File.WriteAllText(logFilePath, string.Empty);
        }

        public static void LogMessage(string message)
        {
            try
            {
                File.AppendAllText(logFilePath, $"{DateTime.Now} - {message}{Environment.NewLine}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error writing to log file: {ex.Message}");
            }
        }
    }

    public partial class MonitorService : ServiceBase
    {
        private PSMonitor psEventLogMonitor;
        private RDPMonitor rdpEventLogMonitor;
        private InstalledApps InstalledAppsMonitor;
        private CMDMonitor cmdMonitor;


        public MonitorService()
        {
            psEventLogMonitor = new PSMonitor();
            rdpEventLogMonitor = new RDPMonitor();
            InstalledAppsMonitor = new InstalledApps();
            cmdMonitor = new CMDMonitor();

        }

        protected override void OnStart(string[] args)
        {
            Program.LogMessage("Service started.");
            psEventLogMonitor.StartMonitoring();
            rdpEventLogMonitor.StartMonitoring();
            InstalledAppsMonitor.StartMonitoring();
            cmdMonitor.StartMonitoring();

        }

        protected override void OnStop()
        {
            Program.LogMessage("Service stopped not from shutdown.");
            psEventLogMonitor.StopMonitoring();
            rdpEventLogMonitor.StopMonitoring();
            InstalledAppsMonitor.StopMonitoring();
            cmdMonitor.StopMonitoring();
        }

        protected override void OnShutdown() 
        {
            Program.LogMessage("Service stopped due to shutdown.");
            psEventLogMonitor.StopMonitoring();
            rdpEventLogMonitor.StopMonitoring();
            InstalledAppsMonitor.StopMonitoring();
            cmdMonitor.StopMonitoring();
        }

    }
}
