; Custom NSIS hooks for Mutualzz
!macro preInit
	SetRegView 64
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\Mutualzz"
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\Mutualzz"
	SetRegView 32
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\Mutualzz"
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\Mutualzz"
!macroend

!macro customInstall
	; ── Kill running instances ────────────────────────────────────────────
	nsExec::Exec "taskkill /F /IM updater.exe /T"
	nsExec::Exec "taskkill /F /IM mutualzz.exe /T"
	Sleep 800
	; ── Shortcuts ─────────────────────────────────────────────────────────
	Delete "$DESKTOP\Mutualzz.lnk"
	Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
	CreateShortcut "$DESKTOP\Mutualzz.lnk" "$INSTDIR\updater.exe" "" "$INSTDIR\mutualzz.exe" 0
	CreateDirectory "$SMPROGRAMS\Mutualzz"
	CreateShortcut "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" "$INSTDIR\updater.exe" "" "$INSTDIR\mutualzz.exe" 0
	; ── Auto-start ────────────────────────────────────────────────────────
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz" "$INSTDIR\updater.exe"
	; ── Launch ────────────────────────────────────────────────────────────
	ExecShell "open" "$INSTDIR\updater.exe"
!macroend

!macro customUninstall
	Delete "$DESKTOP\Mutualzz.lnk"
	Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
	RMDir "$SMPROGRAMS\Mutualzz"
	DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz"
!macroend
