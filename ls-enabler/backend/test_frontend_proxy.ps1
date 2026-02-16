try {
    Write-Host "Testing Frontend Proxy to AI Status..." -ForegroundColor Yellow
    $frontendResponse = Invoke-RestMethod -Uri 'http://localhost:5173/api/chatbot/ai-status' -Method GET
    Write-Host "✅ Frontend Proxy Response:" -ForegroundColor Green
    $frontendResponse | ConvertTo-Json -Depth 3
    
    Write-Host "`nKnowledge Base Documents (via frontend): $($frontendResponse.knowledge_base_documents)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}