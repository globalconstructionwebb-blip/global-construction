$publicDir = "f:\Antigravity\Global Construction\public"
$footerContent = Get-Content -Path "$publicDir\projekt.html" -Raw

# Extract the footer block
$footerRegex = '(?s)<footer class="complex-footer" role="contentinfo">.*?</footer>'
if ($footerContent -match $footerRegex) {
    $rootFooter = $matches[0]
} else {
    Write-Host "Could not find footer in projekt.html"
    exit
}

# Create a subdir version of the footer
$subdirFooter = $rootFooter -replace 'href="([a-zA-Z0-9_-]+\.html)"', 'href="../$1"'
$subdirFooter = $subdirFooter -replace 'src="logo\.png"', 'src="../logo.png"'

# Find all HTML files
$files = Get-ChildItem -Path $publicDir -Recurse -Filter *.html

foreach ($file in $files) {
    # skip projekt.html since it's the source
    if ($file.FullName -eq "$publicDir\projekt.html") {
        continue
    }

    $content = Get-Content -Path $file.FullName -Raw
    
    $replacement = if ($file.DirectoryName -eq $publicDir) { $rootFooter } else { $subdirFooter }

    if ($content -match $footerRegex) {
        $newContent = $content -replace $footerRegex, $replacement
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Updated $($file.FullName)"
    } else {
        Write-Host "No complex-footer found in $($file.FullName)"
    }
}
Write-Host "Done!"
