$ErrorActionPreference = "Stop"
$envPath = Join-Path $PSScriptRoot ".env.local"

$secureKey = Read-Host "Вставьте ключ Perplexity API (ввод скрыт)" -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        throw "Ключ не введён."
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    if (Test-Path -LiteralPath $envPath) {
        Get-Content -LiteralPath $envPath | Where-Object {
            $_ -notmatch '^\s*PERPLEXITY_(API_KEY|MODEL)\s*='
        } | ForEach-Object {
            $lines.Add($_)
        }
    }
    $lines.Add("PERPLEXITY_API_KEY=$apiKey")
    $lines.Add("PERPLEXITY_MODEL=sonar")
    Set-Content -LiteralPath $envPath -Value $lines -Encoding utf8
    Write-Host "Ключ Perplexity сохранён в .env.local."
} finally {
    if ($keyPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
    }
    $apiKey = $null
}

