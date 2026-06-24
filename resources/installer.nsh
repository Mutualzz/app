; installer.nsh
; Custom NSIS hooks for Mutualzz

!macro customHeader
  ; Disable electron-builder's auto-generated shortcut creation.
  ; We handle shortcuts ourselves in customInstall so they point to
  ; updater.exe instead of mutualzz.exe.
  !define BUILD_NO_SHORTCUTS
!macroend

!macro customInstall
  ; ── Kill running instances ────────────────────────────────────────────
  nsExec::Exec 'taskkill /F /IM updater.exe /T'
  nsExec::Exec 'taskkill /F /IM mutualzz.exe /T'
  Sleep 800

  ; ── Visual C++ Redistributable ───────────────────────────────────────
  ReadRegDword $0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\X64" "Installed"
  ${If} $0 != 1
    DetailPrint "Installing Visual C++ Redistributable..."
    File "/oname=$TEMP\vc_redist.x64.exe" "${BUILD_RESOURCES_DIR}\vc_redist.x64.exe"
    ExecWait '"$TEMP\vc_redist.x64.exe" /install /quiet /norestart'
    Delete "$TEMP\vc_redist.x64.exe"
  ${EndIf}

  ; ── Shortcuts — always point to updater.exe, never mutualzz.exe ──────
  Delete "$DESKTOP\Mutualzz.lnk"
  Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"

  CreateShortcut "$DESKTOP\Mutualzz.lnk" \
    "$INSTDIR\updater.exe" \
    "" \
    "$INSTDIR\resources\app.asar.unpacked\resources\icons\icon.ico" \
    0

  CreateDirectory "$SMPROGRAMS\Mutualzz"
  CreateShortcut "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" \
    "$INSTDIR\updater.exe" \
    "" \
    "$INSTDIR\resources\app.asar.unpacked\resources\icons\icon.ico" \
    0

  ; ── Auto-start registry ───────────────────────────────────────────────
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" \
    "Mutualzz" "$INSTDIR\updater.exe"

  ; ── Launch updater after install ─────────────────────────────────────
  ; Don't launch here — relaunch_bootstrapper in Rust handles this.
  ; Launching from NSIS causes a double-launch race condition.
!macroend

!macro customUninstall
  Delete "$DESKTOP\Mutualzz.lnk"
  Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
  RMDir "$SMPROGRAMS\Mutualzz"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz"
!macroend
