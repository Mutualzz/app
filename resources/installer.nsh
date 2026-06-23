; installer.nsh
; Custom NSIS hooks for Mutualzz

!macro customInstall
  ; ── Kill running instances so files aren't locked during install ──────
  ; taskkill /F = force, /T = kill child processes too.
  ; nsExec::Exec is fire-and-forget — we don't care if the process
  ; wasn't running (taskkill exits non-zero in that case, which is fine).
  nsExec::Exec 'taskkill /F /IM updater.exe /T'
  nsExec::Exec 'taskkill /F /IM mutualzz.exe /T'
  Sleep 800

  ; ── Visual C++ Redistributable ──────────────────────────────────────────
  ReadRegDword $0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\X64" "Installed"
  ${If} $0 != 1
    DetailPrint "Installing Visual C++ Redistributable..."
    File "/oname=$TEMP\vc_redist.x64.exe" "${BUILD_RESOURCES_DIR}\vc_redist.x64.exe"
    ExecWait '"$TEMP\vc_redist.x64.exe" /install /quiet /norestart'
    Delete "$TEMP\vc_redist.x64.exe"
  ${EndIf}

  ; ── Shortcuts ────────────────────────────────────────────────────────────
  Delete "$DESKTOP\Mutualzz.lnk"
  Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"

  CreateShortcut "$DESKTOP\Mutualzz.lnk" \
    "$INSTDIR\updater.exe" \
    "" \
    "$INSTDIR\resources\app.asar.unpacked\resources\icons\icon.ico" \
    0

  CreateShortcut "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" \
    "$INSTDIR\updater.exe" \
    "" \
    "$INSTDIR\resources\app.asar.unpacked\resources\icons\icon.ico" \
    0

  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" \
    "Mutualzz" "$INSTDIR\updater.exe"

  ; ExecShell "open" uses Windows shell to launch — respects PE subsystem flag
  ; so the console window doesn't appear unlike plain Exec
  ExecShell "open" "$INSTDIR\updater.exe"
!macroend

!macro customUninstall
  Delete "$DESKTOP\Mutualzz.lnk"
  Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz"
!macroend
