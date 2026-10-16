# deploy-cham-soc-xe.ps1 - deploy website ChamSocXe (rua xe Cam Ranh) len IIS + Node (pm2).
#
# Tham khao scripts\deploy-quoc-bao-cao-so-dang-bo.ps1, khac o may cho:
#   * KHONG co khoa ky request FE/BE -> bo buoc kiem VITE_API_SIGNATURE_SECRET va -BoQuaKiemKhoa.
#   * web.config chi can 2 rule: "API sang Node" + "SPA fallback" (khong co cong XML doi tac).
#   * Kiem them backend\.env may chu: JWT_SECRET / ADMIN_MAT_KHAU con gia tri mau, CORS_ORIGIN con localhost.
#   * /api/health phai tra app = "cham-soc-xe" (tranh proxy nham sang app khac cung may).
#   * Lan dau chay, backend tu tao du lieu mau + tai khoan admin neu DB trong (khoiTaoNeuTrong).
#
# Dich deploy GHIM CUNG vao $DeployRoot ben duoi. Cay thu muc phai co san truoc khi chay:
#   D:\deploy\ChamSocXe\frontend\     dich robocopy /MIR tu frontend\dist (+ web.config) -> tro site IIS vao day
#   D:\deploy\ChamSocXe\backend\.env  file DUY NHAT phai dien truoc, script giu nguyen tung byte
#   D:\deploy\ChamSocXe\_backup\      noi -Backup do ban luu theo moc yyyyMMdd_HHmmss
# Muon deploy cho khac: sua $DeployRoot.
#
# Script nay CHI dung ky tu ASCII: PowerShell 5.1 doc .ps1 khong BOM bang ANSI, chu Viet co dau se hong.
#
# Vi du (chay o thu muc ChamSocXe):
#   .\scripts\deploy-cham-soc-xe.ps1                         # build + deploy, chua khoi dong lai Node
#   .\scripts\deploy-cham-soc-xe.ps1 -Backup -RestartPm2     # sao luu + deploy + khoi dong lai Node + kiem health
#   .\scripts\deploy-cham-soc-xe.ps1 -SkipBuild -RestartPm2  # dung lai frontend\dist da build
# Bi chan "running scripts is disabled":
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy-cham-soc-xe.ps1 -Backup -RestartPm2
param(
    # Goc du an = thu muc cha cua scripts\ (cho chua backend\ + frontend\).
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    # Bo trong = doc PORT tu backend\.env tren may chu, thieu nua thi 3041.
    [int]$BackendProxyPort = 0,
    [string]$FrontendSource = "",
    [string]$BackendSource = "",
    [string]$FrontendTarget = "",
    [string]$BackendTarget = "",
    [string]$BackupRoot = "",
    [string]$Pm2AppName = "chamsocxe-backend",
    [switch]$SkipBuild,
    [switch]$Backup,
    # Khoi dong lai backend bang pm2 (chi dung khi pm2 chay tren CHINH may nay) + kiem /api/health.
    [switch]$RestartPm2,
    # Khong tu chay `npm ci --omit=dev` o backend dich.
    [switch]$SkipBackendDeps,
    # Chay tu CI / script khac thi them -NoPause de khong dung cho bam phim.
    [switch]$NoPause,
    # Giu nguyen web.config dang co o may chu (chi ep lai cong proxy + sua font).
    [switch]$GiuWebConfigDich
)

$ErrorActionPreference = "Stop"
# Dich deploy GHIM CUNG - sua dong nay neu may chu dung thu muc khac.
$DeployRoot = "D:\deploy\ChamSocXe"
$TenApp = "cham-soc-xe"
$CongMacDinh = 3041

$script:CurrentStep = "khoi tao"

function Wait-BeforeExit {
    param([string]$Message = "Nhan phim bat ky de dong cua so nay...")

    if ($NoPause) { return }
    if ($env:CI) { return }
    if (-not [Environment]::UserInteractive) { return }

    Write-Host ""
    Write-Host $Message -ForegroundColor Yellow
    try {
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    catch {
        try { $null = Read-Host "Nhan Enter de thoat" } catch { }
    }
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")

    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) { "WARN" { "Yellow" } "ERROR" { "Red" } default { "Gray" } }
    Write-Host "[$ts][$Level] $Message" -ForegroundColor $color
}

function Invoke-Step {
    param([string]$Title, [scriptblock]$Action)

    $script:CurrentStep = $Title
    Write-Log "START: $Title"
    & $Action
    Write-Log "DONE : $Title"
    $script:CurrentStep = "sau buoc: $Title"
}

function Invoke-Npm {
    param([string]$WorkingDirectory, [string[]]$NpmArgs)

    if ($WorkingDirectory.StartsWith("\\")) {
        # npm + native scripts co the hong khi cwd la UNC. Dung cmd pushd de gan tam mot o dia.
        $quotedArgs = ($NpmArgs | ForEach-Object {
            if ($_ -match '[\s"]') { '"' + ($_ -replace '"', '\"') + '"' } else { $_ }
        }) -join ' '
        $cmdLine = 'pushd "{0}" && npm {1} && set __ec=%errorlevel% && popd && exit /b %__ec%' -f $WorkingDirectory, $quotedArgs
        & cmd.exe /d /s /c $cmdLine
    }
    else {
        Push-Location $WorkingDirectory
        try { & npm @NpmArgs } finally { Pop-Location }
    }

    if ($LASTEXITCODE -ne 0) {
        throw "npm $($NpmArgs -join ' ') failed in $WorkingDirectory"
    }
}

function Invoke-Robocopy {
    param([string]$Source, [string]$Destination, [string[]]$RobocopyArgs)

    if (-not (Test-Path $Source)) { throw "Source path not found: $Source" }
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null

    & robocopy $Source $Destination @RobocopyArgs
    $code = $LASTEXITCODE
    # Robocopy: 0-7 la thanh cong.
    if ($code -gt 7) {
        throw "Robocopy failed with exit code $code. Source: $Source Destination: $Destination"
    }
}

function Read-TextUtf8 {
    param([string]$Path)
    # PHAI doc UTF8 tuong minh: Get-Content -Raw cua PS 5.1 doc file khong BOM bang ANSI.
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-TextUtf8 {
    param([string]$Path, [string]$Text)
    # UTF-8 KHONG BOM, khop <?xml encoding="utf-8"?> va ban goc trong repo.
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

# Doc mot bien trong file .env theo luat cua dotenv: lan xuat hien DAU TIEN thang, bo dau nhay bao ngoai.
function Read-EnvValue {
    param([string]$Path, [string]$Key)

    if (-not (Test-Path $Path)) { return $null }
    foreach ($line in [System.IO.File]::ReadAllLines($Path, [System.Text.Encoding]::UTF8)) {
        if ($line -match ('^\s*(export\s+)?' + [regex]::Escape($Key) + '\s*=\s*(.*)$')) {
            $v = $Matches[2].Trim()
            if ($v.Length -ge 2 -and (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'")))) {
                return $v.Substring(1, $v.Length - 2)
            }
            # Khong co nhay: cat chu thich cuoi dong ( # ...).
            return ($v -replace '\s+#.*$', '').Trim()
        }
    }
    return $null
}

function Get-FileSha256 {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return "" }
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

# Chu Viet co dau nam trong U+1E00-U+1EFF, cong a/d/o/u moc. Mojibake cp1252 KHONG sinh ra ky tu
# trong nhung khoi nay - cho dua de phan biet "hong font" voi "dung".
function Test-CoChuViet {
    param([string]$Text)
    foreach ($ch in $Text.ToCharArray()) {
        $code = [int][char]$ch
        if ($code -ge 0x1E00 -and $code -le 0x1EFF) { return $true }
        if ($code -eq 0x0103 -or $code -eq 0x0111 -or $code -eq 0x01A1 -or $code -eq 0x01B0) { return $true }
    }
    return $false
}

function Test-CoLatin1Cao {
    param([string]$Text)
    foreach ($ch in $Text.ToCharArray()) {
        $code = [int][char]$ch
        if ($code -ge 0x80 -and $code -le 0xFF) { return $true }
    }
    return $false
}

function Repair-MojibakeUtf8 {
    param([string]$Text)

    if ([string]::IsNullOrEmpty($Text)) { return $null }
    if (Test-CoChuViet -Text $Text) { return $null }
    if (-not (Test-CoLatin1Cao -Text $Text)) { return $null }
    try {
        $cp1252 = [System.Text.Encoding]::GetEncoding(1252)
        $strictUtf8 = New-Object System.Text.UTF8Encoding($false, $true)
        $fixed = $strictUtf8.GetString($cp1252.GetBytes($Text))
    }
    catch { return $null }
    if (Test-CoChuViet -Text $fixed) { return $fixed }
    return $null
}

# IIS khong chi doi XML dung cu phap: the dat sai CHO van qua trinh phan tich XML nhung IIS tu choi
# ca file => 500.19 / 0x8007000d. Bat loi ngay tai may build.
function Assert-WebConfigHopLe {
    param([string]$Path)

    $xml = New-Object System.Xml.XmlDocument
    try { $xml.Load($Path) }
    catch { throw "web.config hong XML tai ${Path}: $($_.Exception.Message)" }

    foreach ($node in $xml.SelectNodes("//location")) {
        $cha = $node.ParentNode.Name
        if ($cha -ne "configuration") {
            throw "web.config sai cau truc tai ${Path}: the <location path=""$($node.path)""> nam trong <$cha>, phai la con truc tiep cua <configuration>"
        }
    }

    # Hai rule bat buoc - thieu "API sang Node" la moi trang trong; thieu "SPA fallback" la F5 ra 404.
    $tenRule = @($xml.SelectNodes("//rewrite/rules/rule") | ForEach-Object { $_.GetAttribute("name") })
    foreach ($can in @("API sang Node", "SPA fallback")) {
        if ($tenRule -notcontains $can) {
            throw "web.config tai ${Path} thieu rule '$can'"
        }
    }

    Write-Log "web.config hop le (XML OK, <location> dung vi tri, du 2 rule)"
}

function Sync-WebConfig {
    param([string]$FrontendTarget, [string]$WebConfigGoc, [string]$ProxyBase)

    $rootIndex = Join-Path $FrontendTarget "index.html"
    if (-not (Test-Path $rootIndex)) { throw "Frontend deploy invalid: missing index.html at $FrontendTarget" }

    $webConfigPath = Join-Path $FrontendTarget "web.config"
    $noiDungGoc = Read-TextUtf8 -Path $WebConfigGoc

    if (-not (Test-Path $webConfigPath)) {
        Write-Log "Dich chua co web.config. Lay ban goc tu $WebConfigGoc"
        Write-TextUtf8 -Path $webConfigPath -Text $noiDungGoc
    }
    elseif ($GiuWebConfigDich) {
        Write-Log "Co -GiuWebConfigDich: giu nguyen web.config o dich, chi ep cong proxy va sua font" "WARN"
    }
    else {
        # So sanh sau khi ep cong: neu chi khac moi con so cong thi khong can luu ban cu.
        $gocDaEpCong = $noiDungGoc -replace 'http://(127\.0\.0\.1|localhost):\d+/', "$ProxyBase/"
        $noiDungDich = Read-TextUtf8 -Path $webConfigPath
        if ($gocDaEpCong -eq $noiDungDich) {
            Write-Log "web.config o dich da khop ban goc"
        }
        else {
            $banLuu = "$webConfigPath.truoc-deploy"
            Copy-Item -Path $webConfigPath -Destination $banLuu -Force
            Write-Log "web.config o dich khac ban goc. Da luu ban cu -> $banLuu roi dong bo tu $WebConfigGoc" "WARN"
            Write-TextUtf8 -Path $webConfigPath -Text $noiDungGoc
        }
    }

    $raw = Read-TextUtf8 -Path $webConfigPath
    $daSuaFont = Repair-MojibakeUtf8 -Text $raw
    if ($daSuaFont) {
        Write-Log "web.config o dich bi hong font (doc ANSI ghi UTF-8). Da doi lai dung chu tieng Viet" "WARN"
        $raw = $daSuaFont
    }

    # Ep dia chi proxy ve dung cong backend.
    $raw = $raw -replace 'http://(127\.0\.0\.1|localhost):\d+/', "$ProxyBase/"
    Write-TextUtf8 -Path $webConfigPath -Text $raw

    Assert-WebConfigHopLe -Path $webConfigPath
}

function Assert-BackupMirror {
    param([string]$Source, [string]$Backup, [string]$Label, [string[]]$ExcludeTopLevelDirs = @())

    if (-not (Test-Path $Source)) { throw "$Label source not found: $Source" }
    if (-not (Test-Path $Backup)) { throw "$Label backup target not found: $Backup" }

    $sourceRoot = (Resolve-Path -LiteralPath $Source).ProviderPath.TrimEnd('\')
    $backupRoot = (Resolve-Path -LiteralPath $Backup).ProviderPath.TrimEnd('\')

    $excluded = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($d in $ExcludeTopLevelDirs) { if ($d) { [void]$excluded.Add($d.Trim('\', '/')) } }

    $lay = {
        param($root)
        $map = @{}
        Get-ChildItem -Path $root -Recurse -File -Force -ErrorAction SilentlyContinue | ForEach-Object {
            $rel = $_.FullName.Substring($root.Length).TrimStart('\')
            $top = if ($rel.Contains('\')) { $rel.Substring(0, $rel.IndexOf('\')) } else { $rel }
            if (-not $excluded.Contains($top)) { $map[$rel] = $_.Length }
        }
        return $map
    }
    $sourceMap = & $lay $sourceRoot
    $backupMap = & $lay $backupRoot

    $thieu = @($sourceMap.Keys | Where-Object { -not $backupMap.ContainsKey($_) })
    $lech = @($sourceMap.Keys | Where-Object { $backupMap.ContainsKey($_) -and $backupMap[$_] -ne $sourceMap[$_] })
    if ($thieu.Count -gt 0 -or $lech.Count -gt 0) {
        Write-Log "$Label backup verification failed. Missing=$($thieu.Count), SizeMismatch=$($lech.Count)" "ERROR"
        if ($thieu.Count -gt 0) { Write-Log "$Label missing sample: $($thieu[0])" "ERROR" }
        if ($lech.Count -gt 0) { Write-Log "$Label size mismatch sample: $($lech[0])" "ERROR" }
        throw "$Label backup is incomplete"
    }
    Write-Log "$Label backup verification passed. Files=$($sourceMap.Count)"
}

function Test-BackendHealth {
    param([int]$Port, [int]$SoLan = 15)

    $url = "http://127.0.0.1:$Port/api/health"
    for ($i = 1; $i -le $SoLan; $i++) {
        try {
            $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
            $j = $r.Content | ConvertFrom-Json
            if ($j.app -ne $TenApp) {
                throw "Cong $Port dang la app '$($j.app)', KHONG phai $TenApp - web.config se proxy nham app"
            }
            Write-Log "Backend song: $url (moi_truong=$($j.moi_truong), db=$($j.db))"
            if ($j.moi_truong -ne "production") {
                Write-Log "Backend KHONG chay NODE_ENV=production. Sua backend\.env tren may chu" "WARN"
            }
            return
        }
        catch {
            if ($_.Exception.Message -like "*KHONG phai $TenApp*") { throw }
            Start-Sleep -Seconds 2
        }
    }
    throw "Backend khong tra loi $url sau $SoLan lan thu. Xem: pm2 logs $Pm2AppName"
}

try {
    if (-not $FrontendSource) { $FrontendSource = Join-Path $ProjectRoot "frontend" }
    if (-not $BackendSource) { $BackendSource = Join-Path $ProjectRoot "backend" }
    if (-not $FrontendTarget) { $FrontendTarget = Join-Path $DeployRoot "frontend" }
    if (-not $BackendTarget) { $BackendTarget = Join-Path $DeployRoot "backend" }
    if (-not $BackupRoot) { $BackupRoot = Join-Path $DeployRoot "_backup" }

    $FrontendDist = Join-Path $FrontendSource "dist"
    $WebConfigGoc = Join-Path $FrontendSource "web.config.iis"
    $CurrentBackupRoot = Join-Path $BackupRoot (Get-Date -Format "yyyyMMdd_HHmmss")

    if (-not (Test-Path $FrontendSource)) { throw "Frontend source not found: $FrontendSource" }
    if (-not (Test-Path $BackendSource)) { throw "Backend source not found: $BackendSource" }
    if (-not (Test-Path $WebConfigGoc)) { throw "Thieu ban goc web.config: $WebConfigGoc" }
    if (-not (Test-Path $DeployRoot)) { throw "Deploy root not found: $DeployRoot (tao thu muc truoc, hoac sua `$DeployRoot trong script)" }

    $serverEnvPath = Join-Path $BackendTarget ".env"
    $coEnvMayChu = Test-Path $serverEnvPath

    # Cong proxy: tham so > PORT trong backend\.env cua may chu > 3041.
    if ($BackendProxyPort -le 0) {
        $portEnv = Read-EnvValue -Path $serverEnvPath -Key "PORT"
        $BackendProxyPort = if ($portEnv -match '^\d+$') { [int]$portEnv } else { $CongMacDinh }
    }
    $proxyBase = "http://127.0.0.1:$BackendProxyPort"

    Write-Log "ProjectRoot   : $ProjectRoot"
    Write-Log "DeployRoot    : $DeployRoot"
    Write-Log "ProxyPort     : $BackendProxyPort"
    Write-Log "Frontend src  : $FrontendSource"
    Write-Log "Backend src   : $BackendSource"
    Write-Log "Frontend dst  : $FrontendTarget"
    Write-Log "Backend dst   : $BackendTarget"
    Write-Log "Backup enabled: $Backup"

    Invoke-Step "Kiem cau hinh truoc khi deploy" {
        Assert-WebConfigHopLe -Path $WebConfigGoc

        if (-not $coEnvMayChu) {
            Write-Log "May chu CHUA co $serverEnvPath. Deploy lan dau: chep backend\.env.example thanh .env roi dien (NODE_ENV=production, JWT_SECRET, ADMIN_MAT_KHAU, CORS_ORIGIN...). Backend se KHONG chay duoc neu thieu" "WARN"
            return
        }

        # Chi so sanh, KHONG bao gio in gia tri bi mat ra log.
        $nodeEnv = Read-EnvValue -Path $serverEnvPath -Key "NODE_ENV"
        $jwt = Read-EnvValue -Path $serverEnvPath -Key "JWT_SECRET"
        if ($nodeEnv -ne "production") {
            Write-Log "backend\.env tren may chu co NODE_ENV='$nodeEnv' (nen dat production)" "WARN"
        }
        elseif (-not $jwt) {
            throw "backend\.env tren may chu co NODE_ENV=production nhung THIEU JWT_SECRET -> backend se dung ngay khi khoi dong"
        }
        if ($jwt -eq "doi-thanh-chuoi-ngau-nhien") {
            Write-Log "JWT_SECRET tren may chu van la gia tri MAU cua .env.example -> ai cung gia duoc ve dang nhap quan tri. Doi ngay" "WARN"
        }
        elseif ($jwt -and $jwt.Length -lt 32) {
            Write-Log "JWT_SECRET tren may chu ngan ($($jwt.Length) ky tu). Nen dung chuoi ngau nhien >= 32 ky tu" "WARN"
        }
        if ((Read-EnvValue -Path $serverEnvPath -Key "ADMIN_MAT_KHAU") -eq "admin@123") {
            Write-Log "ADMIN_MAT_KHAU van la admin@123. Neu DB moi tinh, tai khoan admin se dung mat khau nay - doi ngay sau khi dang nhap" "WARN"
        }
        $cors = Read-EnvValue -Path $serverEnvPath -Key "CORS_ORIGIN"
        if (-not $cors -or $cors -match 'localhost|127\.0\.0\.1') {
            Write-Log "CORS_ORIGIN tren may chu = '$cors'. Nen dat ten mien that, vd. https://chamsocxe.vn" "WARN"
        }
    }

    if (-not $SkipBuild) {
        Invoke-Step "Install frontend deps (npm ci)" {
            Invoke-Npm -WorkingDirectory $FrontendSource -NpmArgs @("ci")
        }
        Invoke-Step "Build frontend (npm run build)" {
            Invoke-Npm -WorkingDirectory $FrontendSource -NpmArgs @("run", "build")
        }
    }

    if (-not (Test-Path (Join-Path $FrontendDist "index.html"))) {
        throw "Frontend dist not found / thieu index.html: $FrontendDist"
    }

    if ($Backup) {
        Invoke-Step "Backup current frontend" {
            if (Test-Path $FrontendTarget) {
                $dst = Join-Path $CurrentBackupRoot "frontend"
                Invoke-Robocopy -Source $FrontendTarget -Destination $dst -RobocopyArgs @("/E", "/R:2", "/W:2", "/NFL", "/NDL", "/NP")
                Assert-BackupMirror -Source $FrontendTarget -Backup $dst -Label "Frontend"
            }
            else { Write-Log "Frontend target chua co, bo qua sao luu" "WARN" }
        }
        Invoke-Step "Backup current backend" {
            if (Test-Path $BackendTarget) {
                $dst = Join-Path $CurrentBackupRoot "backend"
                Invoke-Robocopy -Source $BackendTarget -Destination $dst -RobocopyArgs @("/E", "/XD", "node_modules", "/R:2", "/W:2", "/NFL", "/NDL", "/NP")
                Assert-BackupMirror -Source $BackendTarget -Backup $dst -Label "Backend" -ExcludeTopLevelDirs @("node_modules")
            }
            else { Write-Log "Backend target chua co, bo qua sao luu" "WARN" }
        }
    }
    else {
        Write-Log "Backup disabled. Them -Backup de sao luu truoc khi ghi de"
    }

    Invoke-Step "Deploy frontend dist (mirror)" {
        # web.config + ban luu cua no KHONG nam trong dist -> phai loai khoi /MIR, khong thi bi xoa.
        Invoke-Robocopy -Source $FrontendDist -Destination $FrontendTarget -RobocopyArgs @(
            "/MIR",
            "/XF", "web.config", "web.config.truoc-deploy",
            "/R:2", "/W:2", "/NFL", "/NDL", "/NP"
        )
        $asset = Get-ChildItem -Path (Join-Path $FrontendTarget "assets") -File -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $asset) { throw "Frontend deploy invalid: assets\ rong sau khi chep" }
    }

    Invoke-Step "Dong bo web.config (cong proxy $BackendProxyPort)" {
        Sync-WebConfig -FrontendTarget $FrontendTarget -WebConfigGoc $WebConfigGoc -ProxyBase $proxyBase
    }

    # .env cua may chu: giu nguyen tung byte (robocopy da /XF, day la lop chan thu hai).
    $envBytes = $null
    $envTime = $null
    if ($coEnvMayChu) {
        $envBytes = [System.IO.File]::ReadAllBytes($serverEnvPath)
        $envTime = (Get-Item -LiteralPath $serverEnvPath).LastWriteTimeUtc
    }
    $lockTruoc = Get-FileSha256 -Path (Join-Path $BackendTarget "package-lock.json")

    Invoke-Step "Deploy backend source (mirror, giu .env/logs/node_modules)" {
        Invoke-Robocopy -Source $BackendSource -Destination $BackendTarget -RobocopyArgs @(
            "/MIR",
            "/XD", "node_modules", "logs", ".git",
            # Script nhap (_*.mjs, *-tmp.mjs) la rac may dev, khong len may chu.
            "/XF", ".env", ".env.local", ".env.production", ".env.development", "nohup.out", "_*.mjs", "*-tmp.mjs",
            "/R:2", "/W:2", "/NFL", "/NDL", "/NP"
        )
    }

    if ($null -ne $envBytes) {
        $hienTai = if (Test-Path $serverEnvPath) { [System.IO.File]::ReadAllBytes($serverEnvPath) } else { $null }
        $khac = ($null -eq $hienTai) -or ($hienTai.Length -ne $envBytes.Length) -or
            ([System.Linq.Enumerable]::SequenceEqual([byte[]]$hienTai, [byte[]]$envBytes) -eq $false)
        if ($khac) {
            Write-Log "CRITICAL: backend\.env tren may chu bi doi/xoa trong luc deploy. Tra lai dung ban cu..." "WARN"
            [System.IO.File]::WriteAllBytes($serverEnvPath, $envBytes)
            (Get-Item -LiteralPath $serverEnvPath).LastWriteTimeUtc = $envTime
            Write-Log "Da tra lai $serverEnvPath"
        }
        else {
            Write-Log "backend\.env tren may chu con nguyen (so tung byte)"
        }
    }

    if (-not $SkipBackendDeps) {
        $lockSau = Get-FileSha256 -Path (Join-Path $BackendTarget "package-lock.json")
        $coNodeModules = Test-Path (Join-Path $BackendTarget "node_modules")
        if (-not $coNodeModules -or $lockSau -ne $lockTruoc) {
            Invoke-Step "Cai dependency backend (npm ci --omit=dev)" {
                if ($coNodeModules) { Write-Log "package-lock.json doi -> cai lai node_modules" "WARN" }
                Invoke-Npm -WorkingDirectory $BackendTarget -NpmArgs @("ci", "--omit=dev")
            }
        }
        else {
            Write-Log "package-lock.json khong doi, giu node_modules hien co"
        }
    }

    if ($RestartPm2) {
        Invoke-Step "Khoi dong lai backend bang pm2 ($Pm2AppName)" {
            if (-not (Test-Path $serverEnvPath)) {
                throw "Chua co $serverEnvPath - tao file nay truoc roi chay lai -RestartPm2"
            }
            if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
                throw "Khong tim thay pm2 tren may nay (npm i -g pm2), hoac bo -RestartPm2 va khoi dong lai tay"
            }
            & pm2 describe $Pm2AppName *> $null
            if ($LASTEXITCODE -eq 0) {
                & pm2 restart $Pm2AppName --update-env
            }
            else {
                # --cwd BAT BUOC: dotenv doc .env theo thu muc lam viec cua tien trinh.
                & pm2 start "src/server.js" --name $Pm2AppName --cwd $BackendTarget
            }
            if ($LASTEXITCODE -ne 0) { throw "pm2 restart/start that bai" }
            & pm2 save | Out-Null
            Test-BackendHealth -Port $BackendProxyPort
        }
    }
    else {
        Write-Log "Backend CHUA khoi dong lai. Tren may chu: pm2 restart $Pm2AppName (hoac chay lai voi -RestartPm2)" "WARN"
    }

    Write-Log "Deploy completed successfully"
    if ($Backup) { Write-Log "Backup created at: $CurrentBackupRoot" }

    Wait-BeforeExit -Message "Deploy XONG. Nhan phim bat ky de dong cua so nay..."
    exit 0
}
catch {
    $err = $_

    Write-Host ""
    Write-Host "==================== DEPLOY THAT BAI ====================" -ForegroundColor Red
    Write-Log "Deploy failed: $($err.Exception.Message)" "ERROR"
    Write-Log "Buoc bi loi   : $script:CurrentStep" "ERROR"
    if ($err.InvocationInfo -and $err.InvocationInfo.ScriptName) {
        Write-Log "Vi tri        : $($err.InvocationInfo.ScriptName) dong $($err.InvocationInfo.ScriptLineNumber)" "ERROR"
    }
    if ($err.InvocationInfo -and $err.InvocationInfo.PositionMessage) {
        Write-Host $err.InvocationInfo.PositionMessage -ForegroundColor DarkYellow
    }
    if ($err.ScriptStackTrace) {
        Write-Host ""
        Write-Host "--- Stack trace ---" -ForegroundColor DarkGray
        Write-Host $err.ScriptStackTrace -ForegroundColor DarkGray
    }
    Write-Host "=========================================================" -ForegroundColor Red

    Wait-BeforeExit -Message "Deploy LOI. Doc thong bao o tren roi nhan phim bat ky de dong..."
    exit 1
}
