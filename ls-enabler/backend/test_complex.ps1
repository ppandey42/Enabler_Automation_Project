$body = @{
    message = "How do I troubleshoot end-of-cycle processing issues?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8000/api/chatbot/chat' -Method POST -ContentType 'application/json' -Body $body
    Write-Host "✅ AI Response:" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}