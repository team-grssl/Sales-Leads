$mysqlPath = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe'

Get-Process mysqld -ErrorAction SilentlyContinue | Where-Object {
  $_.Path -eq $mysqlPath
} | Stop-Process -Force

Write-Host 'MySQL dev server stopped.'
