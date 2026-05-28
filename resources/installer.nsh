; ============================================================
;  resources/installer.nsh  —  Mutualzz splash installer
;  electron-builder v15 / NSIS 3.0.4.1
;
;  Creates a splash window using only nsDialogs + SetCtlColors.
;  No custom WndProc, no System::Get, no RegisterClassEx.
;
;  SetCtlColors is NSIS's built-in way to set background and
;  text colour on any window/control handle — it works by
;  subclassing the control internally, so it survives repaints.
;
;  Colours:
;    Background  #241927
;    Bar fill    #88449A
;    Bar track   #3A2840
;    Text        #FFF7FB
; ============================================================

!include "LogicLib.nsh"
!include "WinMessages.nsh"
!include "nsDialogs.nsh"

; ── Layout ───────────────────────────────────────────────────
!define SP_W       420
!define SP_H       260

!define TITLE_X     20
!define TITLE_Y    150
!define TITLE_W    380
!define TITLE_H     36

!define STATUS_X    20
!define STATUS_Y   198
!define STATUS_W   380
!define STATUS_H    18

!define BAR_X       20
!define BAR_Y      226
!define BAR_W      380
!define BAR_H       12

; ── Win32 constants (guarded) ────────────────────────────────
!ifndef WM_SETFONT
  !define WM_SETFONT 0x0030
!endif

; ── Globals ──────────────────────────────────────────────────
Var hSplash
Var hTitleCtrl
Var hStatusCtrl
Var hBarCtrl
Var hTrackCtrl
Var hTitleFont
Var hStatusFont


; ── Font helper ──────────────────────────────────────────────
!macro _MakeFont _H _W _OUT
  System::Call "gdi32::CreateFont(i ${_H},i 0,i 0,i 0,i ${_W}, \
    i 0,i 0,i 0,i 1,i 0,i 0,i 0,i 0,t 'Rubik')i.s"
  Pop ${_OUT}
  IntCmp ${_OUT} 0 0 _mf_ok_${_OUT} _mf_ok_${_OUT}
  System::Call "gdi32::CreateFont(i ${_H},i 0,i 0,i 0,i ${_W}, \
    i 0,i 0,i 0,i 1,i 0,i 0,i 0,i 0,t 'Inter')i.s"
  Pop ${_OUT}
  IntCmp ${_OUT} 0 0 _mf_ok_${_OUT} _mf_ok_${_OUT}
  System::Call "gdi32::CreateFont(i ${_H},i 0,i 0,i 0,i ${_W}, \
    i 0,i 0,i 0,i 1,i 0,i 0,i 0,i 0,t 'Segoe UI')i.s"
  Pop ${_OUT}
  _mf_ok_${_OUT}:
!macroend


; ── Progress + status update ─────────────────────────────────
!macro _SetProgress _PCT _MSG
  ; Resize fill bar
  IntOp $R0 ${BAR_W} * ${_PCT}
  IntOp $R0 $R0 / 100
  System::Call "user32::MoveWindow(i $hBarCtrl, \
    i ${BAR_X},i ${BAR_Y},i $R0,i ${BAR_H},i 1)"
  ; Update status text
  SendMessage $hStatusCtrl ${WM_SETTEXT} 0 "STR:${_MSG}"
  ; Pump messages so window repaints
  _sp_pump_${_PCT}:
    System::Call "user32::PeekMessage(@r8,i 0,i 0,i 0,i 1)i.r7"
    IntCmp $7 0 _sp_done_${_PCT}
    System::Call "user32::TranslateMessage(@r8)"
    System::Call "user32::DispatchMessage(@r8)"
    Goto _sp_pump_${_PCT}
  _sp_done_${_PCT}:
!macroend


; ── Cleanup ──────────────────────────────────────────────────
!macro _CloseSplash
  IntCmp $hSplash 0 _cl_tf +1 +1
    System::Call "user32::DestroyWindow(i $hSplash)"
    StrCpy $hSplash 0
  _cl_tf:
  IntCmp $hTitleFont 0 _cl_sf +1 +1
    System::Call "gdi32::DeleteObject(i $hTitleFont)"
    StrCpy $hTitleFont 0
  _cl_sf:
  IntCmp $hStatusFont 0 _cl_done +1 +1
    System::Call "gdi32::DeleteObject(i $hStatusFont)"
    StrCpy $hStatusFont 0
  _cl_done:
!macroend


; ============================================================
;  customInit
; ============================================================
!macro customInit
  InitPluginsDir

  ; Create fonts
  !insertmacro _MakeFont -26 700 $hTitleFont
  !insertmacro _MakeFont -13 400 $hStatusFont

  ; Centre on screen
  System::Call "user32::GetSystemMetrics(i 0)i.r1"
  System::Call "user32::GetSystemMetrics(i 1)i.r2"
  IntOp $3 $1 - ${SP_W}
  IntOp $3 $3 / 2
  IntOp $4 $2 - ${SP_H}
  IntOp $4 $4 / 2

  ; Create borderless topmost popup
  ; WS_EX_TOPMOST|WS_EX_TOOLWINDOW = 0x89
  ; WS_POPUP|WS_CLIPCHILDREN|WS_VISIBLE = 0x94000000
  System::Call "user32::CreateWindowEx(i 0x89, \
    t '#32770',t 'Mutualzz', \
    i 0x94000000, \
    i $3,i $4,i ${SP_W},i ${SP_H}, \
    i 0,i 0,i 0,i 0)i.s"
  Pop $hSplash

  ; Colour the splash background
  SetCtlColors $hSplash "" "241927"

  ; Title label
  System::Call "user32::CreateWindowEx(i 0,t 'Static',t 'Mutualzz', \
    i 0x50000001, \
    i ${TITLE_X},i ${TITLE_Y},i ${TITLE_W},i ${TITLE_H}, \
    i $hSplash,i 1,i 0,i 0)i.s"
  Pop $hTitleCtrl
  SendMessage $hTitleCtrl ${WM_SETFONT} $hTitleFont 1
  SetCtlColors $hTitleCtrl "FFF7FB" "241927"

  ; Status label
  System::Call "user32::CreateWindowEx(i 0,t 'Static',t 'Starting...', \
    i 0x50000001, \
    i ${STATUS_X},i ${STATUS_Y},i ${STATUS_W},i ${STATUS_H}, \
    i $hSplash,i 2,i 0,i 0)i.s"
  Pop $hStatusCtrl
  SendMessage $hStatusCtrl ${WM_SETFONT} $hStatusFont 1
  SetCtlColors $hStatusCtrl "FFF7FB" "241927"

  ; Progress track (full-width background bar)
  System::Call "user32::CreateWindowEx(i 0,t 'Static',t '', \
    i 0x50000000, \
    i ${BAR_X},i ${BAR_Y},i ${BAR_W},i ${BAR_H}, \
    i $hSplash,i 3,i 0,i 0)i.s"
  Pop $hTrackCtrl
  SetCtlColors $hTrackCtrl "" "3A2840"

  ; Progress fill bar (starts 0-wide)
  System::Call "user32::CreateWindowEx(i 0,t 'Static',t '', \
    i 0x50000000, \
    i ${BAR_X},i ${BAR_Y},i 0,i ${BAR_H}, \
    i $hSplash,i 4,i 0,i 0)i.s"
  Pop $hBarCtrl
  SetCtlColors $hBarCtrl "" "88449A"

  System::Call "user32::UpdateWindow(i $hSplash)"
  !insertmacro _SetProgress 0 "Starting..."
!macroend


; ============================================================
;  customInstall
; ============================================================
!macro customInstall
  ShowWindow $HWNDPARENT 0

  !insertmacro _SetProgress  5  "Starting..."
  Sleep 60
  !insertmacro _SetProgress 15  "Checking requirements..."
  Sleep 80
  !insertmacro _SetProgress 30  "Extracting files..."
  Sleep 80
  !insertmacro _SetProgress 55  "Installing application..."
  Sleep 80
  !insertmacro _SetProgress 74  "Writing registry entries..."
  Sleep 60
  !insertmacro _SetProgress 88  "Creating shortcuts..."
  Sleep 60
  !insertmacro _SetProgress 97  "Finalising..."
  Sleep 80
  !insertmacro _SetProgress 100 "Done!"
  Sleep 400

  !insertmacro _CloseSplash
  ShowWindow $HWNDPARENT 5
!macroend
