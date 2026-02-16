$boundary = "----WebKitFormBoundary" + (Get-Random)
$filename = "sample_document.txt"
$filepath = "C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler\backend\sample_document.txt"

# Read file content
if (Test-Path $filepath) {
    $fileContent = Get-Content $filepath -Raw -Encoding UTF8
    
    # Create multipart form data
    $body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="$filename"
Content-Type: text/plain

$fileContent
--$boundary--
"@

    try {
        $response = Invoke-RestMethod -Uri 'http://localhost:8000/api/upload' -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $body
        Write-Host "✅ Upload Response:" -ForegroundColor Green
        $response
    } catch {
        Write-Host "❌ Upload Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $responseBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseBody)
            $responseText = $reader.ReadToEnd()
            Write-Host "Response Body: $responseText" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ Sample document not found at: $filepath" -ForegroundColor Red
}