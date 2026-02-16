try {
    Write-Host "Testing AI Status endpoint..." -ForegroundColor Yellow
    $statusResponse = Invoke-RestMethod -Uri 'http://localhost:8000/api/chatbot/ai-status' -Method GET
    Write-Host "✅ AI Status Response:" -ForegroundColor Green
    $statusResponse | ConvertTo-Json -Depth 3
    
    Write-Host "`nKnowledge Base Documents: $($statusResponse.knowledge_base_documents)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}