$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Create it from .env.example first."
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
        return
    }

    $separator = $line.IndexOf("=")
    if ($separator -le 0) {
        throw "Invalid environment entry: $line"
    }

    $name = $line.Substring(0, $separator).Trim()
    $value = $line.Substring($separator + 1)
    Set-Item -Path "Env:$name" -Value $value
}

& (Join-Path $PSScriptRoot "mvnw.cmd") spring-boot:run
exit $LASTEXITCODE
