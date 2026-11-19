# Zaptiye APK dosyasini Gradle olmadan, dogrudan Android SDK araclariyla derler.
# Cikti: android\Zaptiye.apk
param([string]$Site = (Split-Path $PSScriptRoot -Parent), [string]$Apk = (Join-Path $PSScriptRoot 'Zaptiye.apk'))
$ErrorActionPreference = 'Continue'   # yerel araclarin uyarilari hata sayilmasin; cikis kodlari kontrol ediliyor
$here = $PSScriptRoot
$sdk  = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$bt   = Get-ChildItem "$sdk\build-tools" -Directory | Where-Object { $_.Name -notmatch 'rc' } | Sort-Object { [version]$_.Name } | Select-Object -Last 1
$bt   = $bt.FullName
$jar  = "$sdk\platforms\android-35\android.jar"
$out  = "$here\build"
$ks   = "$here\zaptiye.keystore"
$pass = 'zaptiye'
$ver  = 7; $verName = '3.4'
$site = $Site

Remove-Item -Recurse -Force $out -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force "$out\gen", "$out\classes", "$out\dex", "$out\assets\web" | Out-Null

# Sayfa APK'nin icine gomulur (sunucu gerekmez). config.json varsa o da eklenir:
# API anahtari ve kanal listesi TV'de elle yazilmadan gelir.
# CasaOS klasorundeki sayfa kopyasini da guncel tut
if (Test-Path "$site\casaos") { Copy-Item "$site\canli-yayinlar.html" "$site\casaos\canli-yayinlar.html" }
# YouTube oynatici koprusu (altyazi/ses secimi, video bicimi filtresi)
Copy-Item "$PSScriptRoot\yt-bridge.js" "$out\assets\web\yt-bridge.js"
foreach ($f in 'canli-yayinlar.html', 'icon.svg', 'icon-192.png', 'icon-512.png', 'config.json') {
  if (Test-Path "$site\$f") { Copy-Item "$site\$f" "$out\assets\web\$f" }
}
if (Test-Path "$site\config.json") { Write-Host '   config.json eklendi (APK icinde API anahtarin var; APK dosyasini paylasma)' }
else { Write-Host '   config.json yok: API anahtari TV ilk acilista Ayarlar penceresinden girilecek' }

Write-Host "1/6 Kaynaklar derleniyor ($([IO.Path]::GetFileName($bt)))"
& "$bt\aapt2.exe" compile --dir "$here\res" -o "$out\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 compile' }
& "$bt\aapt2.exe" link -o "$out\base.apk" -I $jar --manifest "$here\AndroidManifest.xml" --java "$out\gen" `
  --min-sdk-version 21 --target-sdk-version 35 --version-code $ver --version-name $verName "$out\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 link' }

Write-Host '2/6 Java derleniyor'
$srcs = Get-ChildItem "$here\src", "$out\gen" -Recurse -Filter *.java | ForEach-Object FullName
& javac --release 11 -nowarn -encoding UTF-8 -classpath $jar -d "$out\classes" @srcs
if ($LASTEXITCODE) { throw 'javac' }

Write-Host '3/6 DEX olusturuluyor'
$classes = Get-ChildItem "$out\classes" -Recurse -Filter *.class | ForEach-Object FullName
& "$bt\d8.bat" --release --min-api 21 --lib $jar --output "$out\dex" @classes
if ($LASTEXITCODE) { throw 'd8' }

Write-Host '4/6 APK paketleniyor'
Copy-Item "$out\base.apk" "$out\unsigned.apk"
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$z = [IO.Compression.ZipFile]::Open("$out\unsigned.apk", 'Update')
[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($z, "$out\dex\classes.dex", 'classes.dex') | Out-Null
# assets: yollar APK icinde '/' ile yazilmali (Windows '\' kullanir)
Get-ChildItem "$out\assets\web" -File | ForEach-Object {
  [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($z, $_.FullName, "assets/web/$($_.Name)") | Out-Null
}
$z.Dispose()
& "$bt\zipalign.exe" -p -f 4 "$out\unsigned.apk" "$out\aligned.apk"
if ($LASTEXITCODE) { throw 'zipalign' }

Write-Host '5/6 Imza anahtari'
if (-not (Test-Path $ks)) {
  & keytool -genkeypair -keystore $ks -storepass $pass -keypass $pass -alias zaptiye -keyalg RSA -keysize 2048 `
    -validity 10000 -dname 'CN=Zaptiye' 2>&1 | Out-Null
  Write-Host '   Yeni anahtar olusturuldu: zaptiye.keystore (guncellemeler icin bu dosyayi sakla)'
}

Write-Host '6/6 Imzalaniyor'
& "$bt\apksigner.bat" sign --ks $ks --ks-pass "pass:$pass" --key-pass "pass:$pass" --out $Apk "$out\aligned.apk"
if ($LASTEXITCODE) { throw 'apksigner' }
& "$bt\apksigner.bat" verify $Apk
if ($LASTEXITCODE) { throw 'verify' }
Remove-Item "$Apk.idsig" -ErrorAction SilentlyContinue
Write-Host "Hazir: $Apk ($([math]::Round((Get-Item $Apk).Length/1KB)) KB)"
