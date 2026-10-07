Add-Type -AssemblyName System.Drawing

$sourcePath = "e:\سۈنئى ئەقىل پىلان\public\logo_icon.png"
$resDir = "e:\سۈنئى ئەقىل پىلان\android\app\src\main\res"

$sizes = @(
    @{ Dir = "mipmap-mdpi"; Launcher = 48; Foreground = 108 },
    @{ Dir = "mipmap-hdpi"; Launcher = 72; Foreground = 162 },
    @{ Dir = "mipmap-xhdpi"; Launcher = 96; Foreground = 216 },
    @{ Dir = "mipmap-xxhdpi"; Launcher = 144; Foreground = 324 },
    @{ Dir = "mipmap-xxxhdpi"; Launcher = 192; Foreground = 432 }
)

$srcImage = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image($image, $targetWidth, $targetHeight, $destPath) {
    $destBitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($image, 0, 0, $targetWidth, $targetHeight)
    $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
}

# For foreground, adaptive icons have 108x108 with 72x72 inner area (padding around)
function Create-Foreground($image, $totalSize, $destPath) {
    $destBitmap = New-Object System.Drawing.Bitmap($totalSize, $totalSize)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # Inner icon is ~66% of total canvas
    $innerSize = [int]($totalSize * 0.66)
    $offset = [int](($totalSize - $innerSize) / 2)
    $graphics.DrawImage($image, $offset, $offset, $innerSize, $innerSize)
    $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
}

foreach ($item in $sizes) {
    $targetFolder = Join-Path $resDir $item.Dir
    if (-not (Test-Path $targetFolder)) {
        New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
    }
    
    # 1. ic_launcher.png
    $pLauncher = Join-Path $targetFolder "ic_launcher.png"
    Resize-Image $srcImage $item.Launcher $item.Launcher $pLauncher
    
    # 2. ic_launcher_round.png
    $pRound = Join-Path $targetFolder "ic_launcher_round.png"
    Resize-Image $srcImage $item.Launcher $item.Launcher $pRound
    
    # 3. ic_launcher_foreground.png
    $pFg = Join-Path $targetFolder "ic_launcher_foreground.png"
    Create-Foreground $srcImage $item.Foreground $pFg
    
    Write-Output "Generated icons for $($item.Dir)"
}

$srcImage.Dispose()
Write-Output "All icons successfully created from logo_icon.png!"
