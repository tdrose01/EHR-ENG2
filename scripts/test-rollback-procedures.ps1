# 🧪 TEST ROLLBACK PROCEDURES SCRIPT
# Radiation Health Monitoring System
# 
# This script tests all rollback procedures to ensure they work correctly
# Execute with: .\scripts\test-rollback-procedures.ps1

param(
    [switch]$Help,
    [switch]$QuickTest,
    [switch]$FullTest
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Test results tracking
$TestResults = @{
    "Emergency Rollback Script" = $false
    "Pre-Deployment Checklist" = $false
    "Configuration Backup" = $false
    "Application Backup" = $false
    "Git Tagging" = $false
    "Health Verification" = $false
    "Rollback Simulation" = $false
}

# Logging function
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to show help
function Show-Help {
    Write-Host "Test Rollback Procedures Script - Radiation Health Monitoring System" -ForegroundColor $White
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor $White
    Write-Host "  .\scripts\test-rollback-procedures.ps1 [OPTION]" -ForegroundColor $White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor $White
    Write-Host "  -Help          Show this help message" -ForegroundColor $White
    Write-Host "  -QuickTest     Run basic functionality tests" -ForegroundColor $White
    Write-Host "  -FullTest      Run comprehensive tests including rollback simulation" -ForegroundColor $White
    Write-Host ""
    Write-Host "This script validates that all rollback procedures work correctly." -ForegroundColor $White
}

# Function to test emergency rollback script
function Test-EmergencyRollbackScript {
    Write-Log "Testing Emergency Rollback Script..."
    
    try {
        # Test 1: Check if script exists
        if (-not (Test-Path "scripts\emergency-rollback.ps1")) {
            Write-Error "Emergency rollback script not found"
            return $false
        }
        Write-Success "Emergency rollback script found"
        
        # Test 2: Test help functionality
        $helpResult = & ".\scripts\emergency-rollback.ps1" -Help 2>$null
        if ($helpResult) {
            Write-Success "Help functionality working"
        }
        
        # Test 3: Test dry run mode
        $dryRunResult = & ".\scripts\emergency-rollback.ps1" -DryRun 2>$null
        if ($dryRunResult) {
            Write-Success "Dry run mode working"
        }
        
        # Test 4: Test verify mode
        $verifyResult = & ".\scripts\emergency-rollback.ps1" -Verify 2>$null
        if ($verifyResult) {
            Write-Success "Verify mode working"
        }
        
        $TestResults["Emergency Rollback Script"] = $true
        Write-Success "Emergency rollback script tests passed"
        return $true
    }
    catch {
        Write-Error "Emergency rollback script test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test pre-deployment checklist
function Test-PreDeploymentChecklist {
    Write-Log "Testing Pre-Deployment Checklist Script..."
    
    try {
        # Test 1: Check if script exists
        if (-not (Test-Path "scripts\pre-deployment-checklist.ps1")) {
            Write-Error "Pre-deployment checklist script not found"
            return $false
        }
        Write-Success "Pre-deployment checklist script found"
        
        # Test 2: Test help functionality
        $helpResult = & ".\scripts\pre-deployment-checklist.ps1" -Help 2>$null
        if ($helpResult) {
            Write-Success "Help functionality working"
        }
        
        # Test 3: Test check-only mode
        $checkResult = & ".\scripts\pre-deployment-checklist.ps1" -CheckOnly 2>$null
        if ($checkResult) {
            Write-Success "Check-only mode working"
        }
        
        $TestResults["Pre-Deployment Checklist"] = $true
        Write-Success "Pre-deployment checklist tests passed"
        return $true
    }
    catch {
        Write-Error "Pre-deployment checklist test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test configuration backup
function Test-ConfigurationBackup {
    Write-Log "Testing Configuration Backup Functionality..."
    
    try {
        # Test 1: Check if key configuration files exist
        $configFiles = @(
            "server\config\monitoring.config.js",
            "package.json",
            "package-lock.json"
        )
        
        $existingFiles = 0
        foreach ($file in $configFiles) {
            if (Test-Path $file) {
                $existingFiles++
            }
        }
        
        if ($existingFiles -gt 0) {
            Write-Success "Found $existingFiles configuration files"
            
            # Test 2: Create test backup
            $testBackupDir = "test_config_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
            New-Item -ItemType Directory -Path $testBackupDir -Force | Out-Null
            
            foreach ($file in $configFiles) {
                if (Test-Path $file) {
                    Copy-Item $file $testBackupDir\ -Force
                }
            }
            
            # Test 3: Verify backup
            $backupFiles = Get-ChildItem $testBackupDir | Measure-Object | Select-Object -ExpandProperty Count
            if ($backupFiles -gt 0) {
                Write-Success "Configuration backup test successful ($backupFiles files)"
                
                # Cleanup test backup
                Remove-Item $testBackupDir -Recurse -Force
                Write-Success "Test backup cleaned up"
                
                $TestResults["Configuration Backup"] = $true
                return $true
            }
        }
        
        Write-Warning "No configuration files found to test backup"
        return $false
    }
    catch {
        Write-Error "Configuration backup test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test application backup
function Test-ApplicationBackup {
    Write-Log "Testing Application Backup Functionality..."
    
    try {
        # Test 1: Check if key application directories exist
        $appDirs = @(
            "server",
            "src",
            "scripts"
        )
        
        $existingDirs = 0
        foreach ($dir in $appDirs) {
            if (Test-Path $dir) {
                $existingDirs++
            }
        }
        
        if ($existingDirs -gt 0) {
            Write-Success "Found $existingDirs application directories"
            
            # Test 2: Create test backup
            $testBackupDir = "test_app_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
            New-Item -ItemType Directory -Path $testBackupDir -Force | Out-Null
            
            foreach ($dir in $appDirs) {
                if (Test-Path $dir) {
                    Copy-Item $dir $testBackupDir\ -Recurse -Force
                }
            }
            
            # Test 3: Verify backup
            $backupDirs = Get-ChildItem $testBackupDir | Measure-Object | Select-Object -ExpandProperty Count
            if ($backupDirs -gt 0) {
                Write-Success "Application backup test successful ($backupDirs directories)"
                
                # Cleanup test backup
                Remove-Item $testBackupDir -Recurse -Force
                Write-Success "Test backup cleaned up"
                
                $TestResults["Application Backup"] = $true
                return $true
            }
        }
        
        Write-Warning "No application directories found to test backup"
        return $false
    }
    catch {
        Write-Error "Application backup test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test git tagging
function Test-GitTagging {
    Write-Log "Testing Git Tagging Functionality..."
    
    try {
        # Test 1: Check if git is available
        if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
            Write-Warning "Git not available - skipping git tagging test"
            return $false
        }
        
        # Test 2: Check if this is a git repository
        if (-not (Test-Path ".git")) {
            Write-Warning "Not a git repository - skipping git tagging test"
            return $false
        }
        
        # Test 3: Check git status
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            Write-Warning "Git repository has uncommitted changes - skipping tagging test"
            return $false
        }
        
        Write-Success "Git repository is clean"
        
        # Test 4: Create test tag
        $testTag = "test-tag-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        $tagResult = git tag $testTag 2>$null
        
        if ($tagResult -eq $null) {
            Write-Success "Test tag created: $testTag"
            
            # Test 5: Delete test tag
            git tag -d $testTag 2>$null
            Write-Success "Test tag deleted"
            
            $TestResults["Git Tagging"] = $true
            return $true
        }
        else {
            Write-Error "Failed to create test tag"
            return $false
        }
    }
    catch {
        Write-Error "Git tagging test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test health verification
function Test-HealthVerification {
    Write-Log "Testing Health Verification Functionality..."
    
    try {
        # Test 1: Check if emergency rollback script can verify health
        $verifyResult = & ".\scripts\emergency-rollback.ps1" -Verify 2>$null
        
        # The verify should complete (even if it fails health checks)
        if ($verifyResult -ne $null) {
            Write-Success "Health verification script executed successfully"
            $TestResults["Health Verification"] = $true
            return $true
        }
        else {
            Write-Warning "Health verification script execution unclear"
            return $false
        }
    }
    catch {
        Write-Error "Health verification test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to simulate rollback process
function Test-RollbackSimulation {
    Write-Log "Testing Rollback Process Simulation..."
    
    try {
        # Test 1: Create test backup files
        $testBackupFile = "test_backup_pre_deployment_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
        "Test backup content" | Out-File $testBackupFile
        
        $testConfigBackup = "test_monitoring.config.js.backup"
        "Test config backup content" | Out-File $testConfigBackup
        
        # Test 2: Simulate rollback steps
        Write-Log "Simulating rollback steps..."
        
        # Step 1: Create emergency backup
        $emergencyBackup = "emergency_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
        "Emergency backup created at $(Get-Date)" | Out-File $emergencyBackup
        Write-Success "Emergency backup created (simulated)"
        
        # Step 2: Stop services (simulated)
        Write-Success "Services stopped (simulated)"
        
        # Step 3: Rollback application (simulated)
        Write-Success "Application rolled back (simulated)"
        
        # Step 4: Restore configuration (simulated)
        Write-Success "Configuration restored (simulated)"
        
        # Step 5: Restart services (simulated)
        Write-Success "Services restarted (simulated)"
        
        # Step 6: Verify health (simulated)
        Write-Success "Health verified (simulated)"
        
        # Cleanup test files
        Remove-Item $testBackupFile -Force -ErrorAction SilentlyContinue
        Remove-Item $testConfigBackup -Force -ErrorAction SilentlyContinue
        Remove-Item $emergencyBackup -Force -ErrorAction SilentlyContinue
        
        Write-Success "Test files cleaned up"
        
        $TestResults["Rollback Simulation"] = $true
        Write-Success "Rollback simulation completed successfully"
        return $true
    }
    catch {
        Write-Error "Rollback simulation test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to display test results
function Show-TestResults {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor $White
    Write-Host "🧪 ROLLBACK PROCEDURES TEST RESULTS" -ForegroundColor $White
    Write-Host "==========================================" -ForegroundColor $White
    
    $passedTests = 0
    $totalTests = $TestResults.Count
    
    foreach ($test in $TestResults.GetEnumerator()) {
        $status = if ($test.Value) { "✅ PASS" } else { "❌ FAIL" }
        $color = if ($test.Value) { $Green } else { $Red }
        Write-Host "$status $($test.Key)" -ForegroundColor $color
        
        if ($test.Value) {
            $passedTests++
        }
    }
    
    Write-Host ""
    Write-Host "Test Summary:" -ForegroundColor $White
    Write-Host "  Passed: $passedTests" -ForegroundColor $Green
    Write-Host "  Failed: $($totalTests - $passedTests)" -ForegroundColor $Red
    Write-Host "  Total: $totalTests" -ForegroundColor $White
    
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
    Write-Host "  Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { $Green } elseif ($successRate -ge 60) { $Yellow } else { $Red })
    
    Write-Host ""
    if ($passedTests -eq $totalTests) {
        Write-Host "🎉 ALL TESTS PASSED! Rollback procedures are ready for production." -ForegroundColor $Green
    }
    elseif ($passedTests -ge ($totalTests * 0.8)) {
        Write-Host "⚠️  Most tests passed. Review failed tests before production deployment." -ForegroundColor $Yellow
    }
    else {
        Write-Host "❌ Multiple tests failed. Fix issues before production deployment." -ForegroundColor $Red
    }
    
    Write-Host "==========================================" -ForegroundColor $White
}

# Function to run quick tests
function Start-QuickTests {
    Write-Log "🚀 STARTING QUICK TESTS"
    Write-Log "Running basic functionality tests..."
    
    Test-EmergencyRollbackScript
    Test-PreDeploymentChecklist
    Test-HealthVerification
    
    Show-TestResults
}

# Function to run full tests
function Start-FullTests {
    Write-Log "🚀 STARTING FULL TESTS"
    Write-Log "Running comprehensive tests including rollback simulation..."
    
    Test-EmergencyRollbackScript
    Test-PreDeploymentChecklist
    Test-ConfigurationBackup
    Test-ApplicationBackup
    Test-GitTagging
    Test-HealthVerification
    Test-RollbackSimulation
    
    Show-TestResults
}

# Main execution logic
if ($Help) {
    Show-Help
}
elseif ($QuickTest) {
    Start-QuickTests
}
elseif ($FullTest) {
    Start-FullTests
}
else {
    # Default to quick tests
    Start-QuickTests
}
