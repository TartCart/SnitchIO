# Check if the base registry key exists
$regPath = "HKLM:\SOFTWARE\Wow6432Node\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"
if (Test-Path $regPath) {
    # Set the registry value to disable Script Block Logging
    Set-ItemProperty -Path $regPath -Name "EnableScriptBlockLogging" -Value 0 -Type DWORD
    Write-Host "Script Block Logging is now disabled."
} else {
    Write-Host "Script Block Logging registry path does not exist. No changes made."
}