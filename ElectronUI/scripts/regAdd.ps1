# Check if the base registry key exists, if not, create it
$regPath = "HKLM:\SOFTWARE\Wow6432Node\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"
if (-not (Test-Path $regPath)) {
    New-Item -Path $regPath -Force -ItemType Directory | Out-Null
}

# Set the registry values to enable Script Block Logging
Set-ItemProperty -Path $regPath -Name "EnableScriptBlockLogging" -Value 1 -Type DWORD

Write-Host "Script Block Logging is now enabled."