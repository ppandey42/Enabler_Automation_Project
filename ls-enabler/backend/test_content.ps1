try {
    Write-Host "Testing document search for known content..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri 'http://localhost:8000/api/chatbot/chat' -Method POST -ContentType 'application/json' -Body (@{message="ADJ1DISPEOC"} | ConvertTo-Json)
    Write-Host "✅ Search Response:" -ForegroundColor Green
    $response
    
    Write-Host "`nTesting for error content..." -ForegroundColor Yellow
    $response2 = Invoke-RestMethod -Uri 'http://localhost:8000/api/chatbot/chat' -Method POST -ContentType 'application/json' -Body (@{message="error"} | ConvertTo-Json)
    Write-Host "✅ Error Search Response:" -ForegroundColor Green
    $response2
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}