param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$OutputRoot = "",
  [string]$ImageName = "arlene-lms-web",
  [string]$ImageTag = "latest",
  # Env file supplying the NEXT_PUBLIC_* values that get inlined into the
  # browser bundle at build time. Defaults to .env.local for local exports.
  [string]$EnvFile = ".env.local"
)

$ErrorActionPreference = "Stop"

if (-not $OutputRoot) {
  $OutputRoot = Join-Path $ProjectRoot "dist\docker"
}

$resolvedProjectRoot = (Resolve-Path $ProjectRoot).Path
$outputRootAbsolute = [System.IO.Path]::GetFullPath($OutputRoot)
$dockerfilePath = Join-Path $resolvedProjectRoot "Dockerfile"
$imageReference = "${ImageName}:${ImageTag}"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$tarName = "$ImageName-$ImageTag-$timestamp.tar"
$tarPath = Join-Path $outputRootAbsolute $tarName

Write-Host "Project root: $resolvedProjectRoot"
Write-Host "Output root:  $outputRootAbsolute"
Write-Host "Image:        $imageReference"

if (-not (Test-Path -LiteralPath $dockerfilePath)) {
  throw "Dockerfile not found at $dockerfilePath"
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker CLI was not found. Install Docker Desktop or ensure docker is available in PATH."
}

if (-not (Test-Path -LiteralPath $outputRootAbsolute)) {
  New-Item -ItemType Directory -Path $outputRootAbsolute | Out-Null
}

# Collect NEXT_PUBLIC_* build args from the env file (inlined at build time).
$buildArgs = @()
$envFilePath = if ([System.IO.Path]::IsPathRooted($EnvFile)) { $EnvFile } else { Join-Path $resolvedProjectRoot $EnvFile }
if (Test-Path -LiteralPath $envFilePath) {
  Write-Host "Reading build args from: $envFilePath"
  foreach ($line in Get-Content -LiteralPath $envFilePath) {
    $trimmed = $line.Trim()
    if ($trimmed -eq "" -or $trimmed.StartsWith("#")) { continue }
    if ($trimmed -match '^(NEXT_PUBLIC_[A-Z0-9_]+)\s*=\s*(.*)$') {
      $name = $Matches[1]
      $value = $Matches[2].Trim().Trim('"').Trim("'")
      $buildArgs += "--build-arg"
      $buildArgs += "$name=$value"
    }
  }
} else {
  Write-Warning "Env file '$envFilePath' not found. Building without NEXT_PUBLIC_* args — the browser Supabase client will be misconfigured."
}

Push-Location $resolvedProjectRoot
try {
  Write-Host "Building Docker image..."
  docker build @buildArgs --file $dockerfilePath --tag $imageReference .
  if ($LASTEXITCODE -ne 0) {
    throw "docker build failed."
  }

  Write-Host "Exporting Docker image..."
  docker save --output $tarPath $imageReference
  if ($LASTEXITCODE -ne 0) {
    throw "docker save failed."
  }

  Write-Host ""
  Write-Host "Docker image exported successfully:"
  Write-Host "Image: $imageReference"
  Write-Host "TAR:   $tarPath"
}
finally {
  Pop-Location
}
