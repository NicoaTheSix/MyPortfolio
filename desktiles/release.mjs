// Values from the Windows v1.06 handoff and the existing macOS v1.02 release.
export const date='2026-11-12';
const windowsCommit='9f607d4d46d6173b85002a07ac22b1a0c2b76dc7';
export const release={
  version:'1.06',macVersion:'1.02',commit:windowsCommit,sourceCommit:windowsCommit,
  zipSha256:'33A4B3FDA786CB6CBA79154202968A5B2A46D281C48780B47C099407B7EBCECA',zipBytes:919285,
  exeSha256:'7FFFFE50B9E9D92369ECE3A5083871BC294253A85B48FFC12BF7ED10854AB129',exeBytes:1405440,
  cliSha256:'AE230F17D873A3F28603E51D6CA270665AA35666EC62F052E6B369FC34E25F78',cliBytes:322048,
  layoutCliChecks:38,coreChecks:235,windowsChecks:192,
  macSha256:'A864E6AFA4B2B765A0294D54EA907F68989A677811AF0F80EC62537A355C0FC8',macBytes:451920,
  macCoreChecks:170,macWorkflow:42757989847,
};
export const macZip='downloads/DeskTiles-macOS-universal.zip';
export const windowsZip='downloads/DeskTiles-Windows-x64.zip';
const versionedFiles=new Set([
  windowsZip,'downloads/SHA256SUMS.txt','downloads/guide-zh.md','downloads/guide-en.md',
  'downloads/README.md','downloads/readme-en.md','search-index.json',
]);
export const cacheVersion=file=>versionedFiles.has(file)?'windows-v'+release.version:date;
