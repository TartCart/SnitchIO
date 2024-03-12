WatchTower
In progress:

Tool for monitoring various, usually hiddden, activity on windows systems.

For the Console test, cd to root and 'dotnet run' as admin in terminal will start the monitoring.

For the main service component, build with 'dotnet build', 
Create the service with  'New-Service -Name "WatchTower" -BinaryPathName "C:\path\to\project\WatchTower\bin\Debug\WatchTower.exe"'
Start the service from admin CMD with 'sc start WatchTower'
Stop with 'sc stop WatchTower'
Delete when done testing with 'sc delete WatchTower'