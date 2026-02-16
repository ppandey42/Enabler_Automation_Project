try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8000/api/chatbot/chat' -Method POST -ContentType 'application/json' -Body (@{message="How many documents are uploaded?"} | ConvertTo-Json)
    Write-Host "✅ Backend Response:" -ForegroundColor Green
    $response
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}