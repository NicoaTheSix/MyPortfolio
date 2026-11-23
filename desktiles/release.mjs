// Values from the Windows v1.07 handoff and the unchanged macOS v1.02 release.
export const date='2026-11-23';
const windowsCommit='236cb523597eea599f032090c46ec9e6625ad29c';
export const release={
  version:'1.07',macVersion:'1.02',commit:windowsCommit,sourceCommit:windowsCommit,
  zipSha256:'BD515EB5E036A2F9EA9F9C5E1AEDE00C391297488BBE9CABB02795F8E860733E',zipBytes:1004683,
  exeSha256:'89FA0598F6681438CC3E259F5A1E72FDD26787CD00DD7FCE13594EC7E4EC49A4',exeBytes:1587712,
  cliSha256:'811CBC2CB306B21B58E99DE487D81A77FE5ACBA5F70083C72447AB63C5C9245A',cliBytes:322048,
  layoutCliChecks:38,coreChecks:235,windowsChecks:192,
  convenienceCoreChecks:24,convenienceNativeChecks:31,actualScreenChecks:64,
  macSha256:'A864E6AFA4B2B765A0294D54EA907F68989A677811AF0F80EC62537A355C0FC8',macBytes:451920,
  macCoreChecks:170,macWorkflow:42757989847,
};
export const macZip='downloads/DeskTiles-macOS-universal.zip';
export const windowsZip='downloads/DeskTiles-Windows-x64.zip';
const versionedFiles=new Set([
  windowsZip,'downloads/SHA256SUMS.txt','downloads/guide-zh.md','downloads/guide-en.md',
  'downloads/README.md','downloads/readme-en.md','search-index.json',
  'downloads/DeskTiles.exe','downloads/desktiles-cli.exe','assets/desktop-tools-presets.png',
]);
export const cacheVersion=file=>versionedFiles.has(file)?'windows-v'+release.version:'2026-11-12';
