using System;
using System.IO;
using System.ServiceProcess;

namespace WatchTowerService
{
    static class Program
    {
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
        private PSMonitor eventLogMonitor;

        public MonitorService()
        {
            eventLogMonitor = new PSMonitor();
        }

        protected override void OnStart(string[] args)
        {
            Program.LogMessage("Service started.");
            eventLogMonitor.StartMonitoring();
        }

        protected override void OnStop()
        {
            Program.LogMessage("Service stopped.");
            eventLogMonitor.StopMonitoring();
        }
    }
}
