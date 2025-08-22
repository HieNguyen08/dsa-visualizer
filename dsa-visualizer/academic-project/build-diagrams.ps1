# Build all diagrams script for Windows PowerShell
# Author: Academic Project Team

Write-Host "Building academic project diagrams..." -ForegroundColor Green

# Navigate to diagrams directory
Set-Location diagrams

# Add Vietnamese babel to remaining diagram files
$diagrams = @("activity_diagram.tex", "sequence_diagram.tex", "system_architecture.tex")

foreach ($diagram in $diagrams) {
    Write-Host "Adding Vietnamese babel to $diagram..." -ForegroundColor Yellow
    
    # Read content
    $content = Get-Content $diagram -Raw
    
    # Replace the header to include Vietnamese babel
    $content = $content -replace '\\usepackage\{tikz\}', "\usepackage[vietnamese]{babel}`n\usepackage{tikz}"
    
    # Write back
    Set-Content -Path $diagram -Value $content
}

# Compile all diagrams
$allDiagrams = @("usecase_main.tex", "class_diagram.tex", "activity_diagram.tex", "sequence_diagram.tex", "system_architecture.tex")

foreach ($diagram in $allDiagrams) {
    Write-Host "Compiling $diagram..." -ForegroundColor Cyan
    
    $name = [System.IO.Path]::GetFileNameWithoutExtension($diagram)
    
    # Run pdflatex
    & pdflatex -interaction=nonstopmode $diagram
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully compiled $name.pdf" -ForegroundColor Green
    } else {
        Write-Host "Failed to compile $diagram" -ForegroundColor Red
    }
}

# List generated PDFs
Write-Host ""
Write-Host "Generated PDF files:" -ForegroundColor Magenta
Get-ChildItem *.pdf | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor White
}

# Return to parent directory
Set-Location ..

Write-Host ""
Write-Host "Diagram compilation complete!" -ForegroundColor Green
