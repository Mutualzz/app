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
	nsExec::Exec "taskkill /F /IM updater.exe /T"
	nsExec::Exec "taskkill /F /IM mutualzz.exe /T"
	Sleep 800
	Delete "$DESKTOP\Mutualzz.lnk"
	Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
	CreateShortcut "$DESKTOP\Mutualzz.lnk" "$INSTDIR\updater.exe" "" "$INSTDIR\mutualzz.exe" 0
	CreateDirectory "$SMPROGRAMS\Mutualzz"
	CreateShortcut "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" "$INSTDIR\updater.exe" "" "$INSTDIR\mutualzz.exe" 0
	WinShell::SetLnkAUMI "$DESKTOP\Mutualzz.lnk" "com.mutualzz.app"
	WinShell::SetLnkAUMI "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" "com.mutualzz.app"
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz" "$INSTDIR\updater.exe"
	CreateDirectory "$LOCALAPPDATA\Mutualzz"
	FileOpen $0 "$LOCALAPPDATA\Mutualzz\version.txt" w
	FileWrite $0 "${VERSION}"
	FileClose $0
	FileOpen $0 "$LOCALAPPDATA\Mutualzz\just-updated" w
	FileWrite $0 "${VERSION}"
	FileClose $0
	IfFileExists "$INSTDIR\resources\electron-runtime-version.txt" 0 skip_electron_version
	nsExec::ExecToLog 'cmd /c copy /Y "$INSTDIR\resources\electron-runtime-version.txt" "$LOCALAPPDATA\Mutualzz\electron-version.txt"'
	skip_electron_version:
	ExecShell "open" "$INSTDIR\updater.exe"
!macroend

!macro customUninstall
	Delete "$DESKTOP\Mutualzz.lnk"
	Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
	RMDir "$SMPROGRAMS\Mutualzz"
	DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz"
!macroend
