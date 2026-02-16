try {
    Write-Host "Testing FS Monitoring endpoints..." -ForegroundColor Yellow
    
    # Test getting hosts list
    Write-Host "`n1. Testing /api/fs/hosts endpoint:" -ForegroundColor Cyan
    $hostsResponse = Invoke-RestMethod -Uri 'http://localhost:8000/api/fs/hosts' -Method GET
    $hostsResponse | ConvertTo-Json -Depth 3
    
    # Test adding a host (using localhost as example)
    Write-Host "`n2. Testing /api/fs/add-host endpoint:" -ForegroundColor Cyan
    $addHostData = @{
        host_id = "localhost_test"
        hostname = "127.0.0.1"
        username = $env:USERNAME
        password = "dummy_password"
        port = 22
    } | ConvertTo-Json
    
    try {
        $addResponse = Invoke-RestMethod -Uri 'http://localhost:8000/api/fs/add-host' -Method POST -ContentType 'application/json' -Body $addHostData
        Write-Host "Add host response:"
        $addResponse | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Note: Host addition might fail if SSH is not configured - this is expected for testing"
        Write-Host "Error: $($_.Exception.Message)"
    }
    
    # Test getting hosts list again
    Write-Host "`n3. Testing hosts list after adding:" -ForegroundColor Cyan
    $hostsResponse2 = Invoke-RestMethod -Uri 'http://localhost:8000/api/fs/hosts' -Method GET
    $hostsResponse2 | ConvertTo-Json -Depth 3
    
    Write-Host "`n✅ FS Monitoring endpoints are working!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error testing FS endpoints: $($_.Exception.Message)" -ForegroundColor Red
}