$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:PATH = $env:JAVA_HOME + '\\bin;' + $env:PATH
Write-Output "SESSION JAVA_HOME=$env:JAVA_HOME"
Write-Output "Using java: $(Get-Command java.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source)"
npx expo run:android
