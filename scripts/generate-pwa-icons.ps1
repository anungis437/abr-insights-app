# Generate PWA Icons using System.Drawing
# Run this script from PowerShell to create placeholder PWA icons

Add-Type -AssemblyName System.Drawing

$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$outputDir = Join-Path $PSScriptRoot "..\public\icons"

# Ensure output directory exists
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

foreach ($size in $sizes) {
    Write-Host "Generating icon-${size}x${size}.png..."
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable high quality rendering
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Background
    $bgColor = [System.Drawing.Color]::FromArgb(0, 112, 243) # #0070f3
    $bgBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $graphics.FillRectangle($bgBrush, 0, 0, $size, $size)
    
    # Text
    $text = "ABR"
    $fontSize = [int]($size * 0.35)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textColor = [System.Drawing.Color]::White
    $textBrush = New-Object System.Drawing.SolidBrush($textColor)
    
    # Center text
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $textRect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $graphics.DrawString($text, $font, $textBrush, $textRect, $stringFormat)
    
    # Save
    $outputPath = Join-Path $outputDir "icon-${size}x${size}.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $font.Dispose()
    $bgBrush.Dispose()
    $textBrush.Dispose()
    
    Write-Host "  Created: $outputPath"
}

Write-Host "`nAll PWA icons generated successfully!" -ForegroundColor Green
