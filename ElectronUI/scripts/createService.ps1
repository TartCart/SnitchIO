$serviceName = 'SnitchIO'
$binaryPathName = 'C:\ProgramData\snitchIO\resources\snitchio.exe'
$displayName = 'SnitchIO'
$startupType = 'Automatic'
$description = 'snitchIO Monitoring Service'

# Check if the service exists
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if (-not $service) {
    # Service does not exist, create it
    New-Service -Name $serviceName -BinaryPathName $binaryPathName -DisplayName $displayName -StartupType $startupType -Description $description
    Write-Host "Service '$serviceName' created successfully."
} else {
    Write-Host "Service '$serviceName' already exists."
}
