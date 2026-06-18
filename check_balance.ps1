@{
    jsonrpc = "2.0"
    method = "eth_call"
    params = @(
        @{
            to = "0x4B09e895699593c5e427CF8eA7Be550273989aa4"
            data = "0x70a0823100000000000000000000000073d712e0405900d36a17368f6146460cc9774439"
        },
        "latest"
    )
    id = 1
} | ConvertTo-Json | Set-Content /tmp/call.json -PassThru

$response = Invoke-WebRequest -Uri "https://mainnet.infura.io/v3/6f364710da4e409a8a22bc4b9c4fc894" `
    -Method Post `
    -ContentType "application/json" `
    -Body (Get-Content /tmp/call.json -Raw) -ErrorAction SilentlyContinue

if ($response) {
    $result = $response.Content | ConvertFrom-Json
    $balanceHex = $result.result
    Write-Host "Balance (hex): $balanceHex"
    if ($balanceHex -and $balanceHex -ne "0x") {
        $balance = [Int64]::Parse($balanceHex.Substring(2), [System.Globalization.NumberStyles]::HexNumber)
        $balanceBTC = $balance / 1e8
        Write-Host "✅ Balance of admin: $balanceBTC BTC"
    }
}
