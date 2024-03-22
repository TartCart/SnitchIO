# SnitchIO - Windows Monitoring Service
*Project is in progress*

### Recieve email alerts for actions/commands/access under the hood of Windows Server and Workstations 

## Monitoring Capabilities
- Powershell
- Command Prompt (Starting services)
- Remote Desktop Protocol (RDP)
- Application Installation

##  Back end / Service
- Windows Service built using VS and C#
- The service logic monitors event logs and the registry for specfic entrances or changes and reports them via email
- The reports are filtered logically as best as possible against default windows commands typically ran as scheduled tasks, there will be residual false positives
- There is timed release logic to prevent overloading the users inbox
- Alert notifications are also found in the log files

## Front end / Installer
- The gui is built with Electron, thus the included langauges are JavaScript, HTML, CSS and some Powershell scripts / batch files
- It takes in the user email(s), creates a directory in *ProgramData* for configuration and log files, installs or uninstalls the service and can update some of the config files accessed by the service 
- It also runs the included Powershell / batch files to enable the logging capabilities
- Later on will be looking to implement a monitor feature

## Requirements 
- Windows Server 2012 R2 and greater
- windows 8.1/RT 8.1 and greater