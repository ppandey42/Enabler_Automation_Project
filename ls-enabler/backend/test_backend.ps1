try {
    Write-Host "Testing backend connectivity..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri 'http://localhost:8000/health' -Method GET
    Write-Host "✅ Health Check:" -ForegroundColor Green
    $healthResponse
    
    Write-Host "`nTesting document search..." -ForegroundColor Yellow
    $searchResponse = Invoke-RestMethod -Uri 'http://localhost:8000/api/chatbot/chat' -Method POST -ContentType 'application/json' -Body (@{message="test"} | ConvertTo-Json)
    Write-Host "✅ Search Response:" -ForegroundColor Green
    $searchResponse
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Error Details: $($_.Exception)" -ForegroundColor Red
}