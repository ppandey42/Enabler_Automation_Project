try {
    Write-Host "Testing document count..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri 'http://localhost:8000/api/chatbot/chat' -Method POST -ContentType 'application/json' -Body (@{message="how many documents"} | ConvertTo-Json)
    Write-Host "✅ Full Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    
    Write-Host "`nDocument count: $($response.documents_available)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}