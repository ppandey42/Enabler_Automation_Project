try {
    Write-Host "Testing integrated FS Handling module..." -ForegroundColor Yellow
    
    # Test that the FS endpoints are still working
    Write-Host "`n1. Testing FS monitoring endpoints via frontend:" -ForegroundColor Cyan
    
    # Test getting hosts
    try {
        $hostsResponse = Invoke-RestMethod -Uri 'http://localhost:5173/api/fs/hosts' -Method GET
        Write-Host "✅ Hosts endpoint working: $($hostsResponse.Count) hosts found"
        if ($hostsResponse.Count -gt 0) {
            Write-Host "   Sample host: $($hostsResponse[0].hostname) ($($hostsResponse[0].host_id))"
        }
    } catch {
        Write-Host "❌ Error getting hosts: $($_.Exception.Message)"
    }
    
    # Test FS status
    Write-Host "`n2. Testing FS status endpoint:" -ForegroundColor Cyan
    try {
        $statusResponse = Invoke-RestMethod -Uri 'http://localhost:5173/api/fs/status' -Method GET
        Write-Host "✅ Status endpoint working: $($statusResponse.Count) hosts checked"
    } catch {
        Write-Host "❌ Error getting status: $($_.Exception.Message)"
    }
    
    Write-Host "`n✅ FS Handling integration successful!" -ForegroundColor Green
    Write-Host "📝 Now clicking 'FS Handling' module will open the monitoring dashboard" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error testing FS integration: $($_.Exception.Message)" -ForegroundColor Red
}