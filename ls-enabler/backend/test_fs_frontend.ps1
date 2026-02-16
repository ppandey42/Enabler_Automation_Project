try {
    Write-Host "Testing FS Monitor integration with frontend..." -ForegroundColor Yellow
    
    # Test adding a host through frontend proxy
    $hostData = @{
        host_id = "test_server_1"
        hostname = "127.0.0.1"
        username = "test_user"
        password = "test_password"
        port = 22
    } | ConvertTo-Json
    
    Write-Host "`n1. Adding host via frontend proxy:" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri 'http://localhost:5173/api/fs/add-host' -Method POST -ContentType 'application/json' -Body $hostData
        Write-Host "Response: $($response | ConvertTo-Json)"
    } catch {
        Write-Host "Error adding host: $($_.Exception.Message)"
    }
    
    # Test getting hosts
    Write-Host "`n2. Getting hosts list via frontend:" -ForegroundColor Cyan
    try {
        $hostsResponse = Invoke-RestMethod -Uri 'http://localhost:5173/api/fs/hosts' -Method GET
        Write-Host "Hosts: $($hostsResponse | ConvertTo-Json -Depth 3)"
    } catch {
        Write-Host "Error getting hosts: $($_.Exception.Message)"
    }
    
    # Test setting threshold
    Write-Host "`n3. Setting threshold via frontend:" -ForegroundColor Cyan
    try {
        $thresholdData = @{ threshold = 85 } | ConvertTo-Json
        $thresholdResponse = Invoke-RestMethod -Uri 'http://localhost:5173/api/fs/set-threshold' -Method POST -ContentType 'application/json' -Body $thresholdData
        Write-Host "Threshold response: $($thresholdResponse | ConvertTo-Json)"
    } catch {
        Write-Host "Error setting threshold: $($_.Exception.Message)"
    }
    
    Write-Host "`n✅ FS Monitor frontend integration test completed!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error during FS Monitor testing: $($_.Exception.Message)" -ForegroundColor Red
}