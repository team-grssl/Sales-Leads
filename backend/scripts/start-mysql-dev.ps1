$mysqlBin = 'C:\Program Files\MySQL\MySQL Server 8.0\bin'
$mysqld = Join-Path $mysqlBin 'mysqld.exe'
$dataDir = 'C:\Users\Ryan George\Desktop\Projects\Company\Sales Lead Website\backend\mysql-data'

if (-not (Test-Path $dataDir)) {
  New-Item -ItemType Directory -Path $dataDir | Out-Null
  & $mysqld --initialize-insecure --datadir=$dataDir --console
}

$running = Get-Process mysqld -ErrorAction SilentlyContinue | Where-Object {
  $_.Path -eq $mysqld
}

if (-not $running) {
  Start-Process -FilePath $mysqld -ArgumentList "--datadir=$dataDir","--port=3307","--bind-address=127.0.0.1","--console"
  Start-Sleep -Seconds 5
}

Write-Host 'MySQL dev server ready on 127.0.0.1:3307'
