!macro customUnInstall
  SetShellVarContext current

  RMDir /r "$APPDATA\${PRODUCT_NAME}"
  RMDir /r "$LOCALAPPDATA\${PRODUCT_NAME}"
  RMDir /r "$APPDATA\tts_electron"
  RMDir /r "$LOCALAPPDATA\tts-electron-updater"
!macroend