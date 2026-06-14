
$contractAddress = "0x4B09e895699593c5e427CF8eA7Be550273989aa4"
$apiKey = "DCIMH4YNP4T6IVXPBTC8RPHCHKHI9Y9TCA"
$contractCode = Get-Content "FakeBTC_Flattened.sol" -Raw

# Build form data - URL encoded form data format
$bodyParts = @(
    "module=contract",
    "action=verifysourcecode",
    "apikey=$apiKey",
    "contractaddress=$contractAddress",
    "sourceCode=" + [System.Web.HttpUtility]::UrlEncode($contractCode),
    "codeformat=solidity-single-file",
    "contractname=FakeBTC",
    "compilerversion=v0.8.20+commit.a1b79de6",
    "optimizationUsed=1",
    "runs=200",
    "licenseType=3"
)

# First try to load the URL encoding assembly
Add-Type -AssemblyName System.Web

$body = $bodyParts -join "&"

Write-Host "Submitting contract verification to Etherscan..."
Write-Host "Contract: $contractAddress"
Write-Host "API Endpoint: https://api.etherscan.io/api"

try {
    $response = Invoke-WebRequest -Uri "https://api.etherscan.io/api" `
        -Method POST `
        -Body $body `
        -ContentType "application/x-www-form-urlencoded" `
        -UseBasicParsing -TimeoutSec 30

    Write-Host "Response:"
    Write-Host $response.Content
    
    $jsonResp = $response.Content | ConvertFrom-Json
    if ($jsonResp.status -eq "1") {
        Write-Host "`nSuccess! Verification submitted with GUID: $($jsonResp.result)"
    } else {
        Write-Host "`nVerification status: $($jsonResp.message)"
        Write-Host "Details: $($jsonResp.result)"
    }
} catch {
    Write-Host "Error: $_"
}
