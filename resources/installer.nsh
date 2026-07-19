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
	CreateDirectory "$LOCALAPPDATA\Mutualzz"
	IfFileExists "$LOCALAPPDATA\Mutualzz\version.txt" existing_install fresh_install
	fresh_install:
	CreateShortcut "$DESKTOP\Mutualzz.lnk" "$INSTDIR\updater.exe" "" "$INSTDIR\mutualzz.exe" 0
	CreateDirectory "$SMPROGRAMS\Mutualzz"
	CreateShortcut "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" "$INSTDIR\updater.exe" "" "$INSTDIR\mutualzz.exe" 0
	WinShell::SetLnkAUMI "$DESKTOP\Mutualzz.lnk" "com.mutualzz.app"
	WinShell::SetLnkAUMI "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" "com.mutualzz.app"
	Goto shortcuts_done
	existing_install:
	IfFileExists "$LOCALAPPDATA\Mutualzz\shortcuts-v2" shortcuts_done migrate_shortcuts
	migrate_shortcuts:
	IfFileExists "$DESKTOP\Mutualzz.lnk" 0 migrate_start_menu
	Delete "$DESKTOP\Mutualzz.lnk"
	CreateShortcut "$DESKTOP\Mutualzz.lnk" "$INSTDIR\updater.exe" "" "$INSTDIR\mutualzz.exe" 0
	WinShell::SetLnkAUMI "$DESKTOP\Mutualzz.lnk" "com.mutualzz.app"
	migrate_start_menu:
	IfFileExists "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" 0 shortcuts_done
	Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
	CreateDirectory "$SMPROGRAMS\Mutualzz"
	CreateShortcut "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" "$INSTDIR\updater.exe" "" "$INSTDIR\mutualzz.exe" 0
	WinShell::SetLnkAUMI "$SMPROGRAMS\Mutualzz\Mutualzz.lnk" "com.mutualzz.app"
	shortcuts_done:
	FileOpen $0 "$LOCALAPPDATA\Mutualzz\shortcuts-v2" w
	FileWrite $0 "2"
	FileClose $0
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz" "$INSTDIR\updater.exe"
	FileOpen $0 "$LOCALAPPDATA\Mutualzz\version.txt" w
	FileWrite $0 "${VERSION}"
	FileClose $0
	FileOpen $0 "$LOCALAPPDATA\Mutualzz\just-updated" w
	FileWrite $0 "${VERSION}"
	FileClose $0
	IfFileExists "$INSTDIR\resources\electron-runtime-version.txt" 0 skip_electron_version
	nsExec::ExecToLog 'cmd /c copy /Y "$INSTDIR\resources\electron-runtime-version.txt" "$LOCALAPPDATA\Mutualzz\electron-version.txt"'
	skip_electron_version:
	IfFileExists "$INSTDIR\resources\updater-runtime-version.txt" 0 skip_updater_version
	nsExec::ExecToLog 'cmd /c copy /Y "$INSTDIR\resources\updater-runtime-version.txt" "$LOCALAPPDATA\Mutualzz\updater-version.txt"'
	skip_updater_version:
	ExecShell "open" "$INSTDIR\updater.exe"
!macroend

!macro customUninstall
	Delete "$DESKTOP\Mutualzz.lnk"
	Delete "$SMPROGRAMS\Mutualzz\Mutualzz.lnk"
	RMDir "$SMPROGRAMS\Mutualzz"
	DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Mutualzz"
	Delete "$LOCALAPPDATA\Mutualzz\shortcuts-v2"
	Delete "$LOCALAPPDATA\Mutualzz\version.txt"
!macroend
