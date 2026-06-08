; installer.nsh
; Custom NSIS hooks for Mutualzz
;
; electron-builder calls these macros at specific points during install/uninstall.
; We override the shortcuts so they point to updater.exe instead of mutualzz.exe.

; Called after the default install logic runs
!macro customInstall
  ; Remove the shortcuts electron-builder created (they point to mutualzz.exe)
  Delete "$DESKTOP\Mutualzz.lnk"
  Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"

  ; Re-create them pointing to updater.exe
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

  ; Also fix the registry run-on-startup entry if it was set
  ; (electron sets this to mutualzz.exe, we want updater.exe)
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" \
    "Mutualzz" "$INSTDIR\updater.exe"
!macroend

; Called after the default uninstall logic runs
!macro customUninstall
  ; Clean up shortcuts (electron-builder handles most, this is a safety net)
  Delete "$DESKTOP\Mutualzz.lnk"
  Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"

  ; Remove run-on-startup entry
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz"
!macroend
