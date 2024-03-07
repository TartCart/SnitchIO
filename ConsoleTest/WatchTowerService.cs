using System.ServiceProcess;

namespace WatchTowerService
{
    public partial class MonitorService : ServiceBase
    {
        private PSMonitor psMonitor;
        private RDPMonitor rdpMonitor;
        private CMDMonitor cmdMonitor;
        private InstalledApps installed;

        public MonitorService()
        {
            psMonitor = new PSMonitor();
            rdpMonitor = new RDPMonitor();
            cmdMonitor = new CMDMonitor();
            installed = new InstalledApps();
        }

        protected override void OnStart(string[] args)
        {
            psMonitor.StartMonitoring();
            rdpMonitor.StartMonitoring();
            cmdMonitor.StartMonitoring();
            installed.StartMonitoring();
        }

        protected override void OnStop()
        {
            psMonitor.StopMonitoring();
            rdpMonitor.StopMonitoring();
            cmdMonitor.StopMonitoring();
            installed.StopMonitoring();
        }

        public static void Main(string[] args)
        {
            // For testing purposes, run the service as a console application
            Console.WriteLine("Starting WatchTower Service...");
            var service = new MonitorService();
            service.OnStart(args);
            Console.WriteLine("WatchTower Service started. Press any key to stop...");
            Console.ReadKey();
            service.OnStop();
            Console.WriteLine("WatchTower Service stopped.");
        }
    }
}
