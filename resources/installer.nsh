; installer.nsh
; Custom NSIS hooks for Mutualzz

!macro customInstall
  ; ── Kill running instances ────────────────────────────────────────────
  nsExec::Exec 'taskkill /F /IM updater.exe /T'
  nsExec::Exec 'taskkill /F /IM mutualzz.exe /T'
  Sleep 800

  ; ── Shortcuts — delete whatever electron-builder created and replace ──
  ; electron-builder creates shortcuts pointing to mutualzz.exe.
  ; We delete and recreate them pointing to updater.exe instead.
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

  ; ── Launch updater after install ──────────────────────────────────────
  Exec "$INSTDIR\updater.exe"
!macroend

!macro customUninstall
  Delete "$DESKTOP\Mutualzz.lnk"
  Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
  RMDir "$SMPROGRAMS\Mutualzz"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz"
!macroend
