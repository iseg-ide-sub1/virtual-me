// // commands.ts
// import * as vscode from 'vscode'
// import * as logItem from '../types/log-item'

// class CommandDescription {
//     constructor(
//         public oldCommand: string,
//         public newCommand: string,
//         public description: string
//     ) {
//     }
// }

// export const commandDescriptions: CommandDescription[] = [
//     //1. General
//     new CommandDescription('workbench.action.showCommands', 'virtualme.workbench.action.showCommands', 'Show Command Palette'),
//     new CommandDescription('workbench.action.quickOpen', 'virtualme.workbench.action.quickOpen', 'Quick Open, Go to File…'),
//     new CommandDescription('workbench.action.newWindow', 'virtualme.workbench.action.newWindow', 'New window/instance'),
//     new CommandDescription('workbench.action.closeWindow', 'virtualme.workbench.action.closeWindow', 'Close window/instance'),

//     // 2. EditCommands
//     new CommandDescription('editor.action.clipboardCutAction', 'virtualme.editor.action.clipboardCutAction', 'Cut Line'),
//     new CommandDescription('editor.action.clipboardCopyAction', 'virtualme.editor.action.clipboardCopyAction', 'Copy Line'),
//     new CommandDescription('editor.action.deleteLines', 'virtualme.editor.action.deleteLines', 'Delete Line'),
//     new CommandDescription('editor.action.insertLineAfter', 'virtualme.editor.action.insertLineAfter', 'Insert Line Below'),
//     new CommandDescription('editor.action.insertLineBefore', 'virtualme.editor.action.insertLineBefore', 'Insert Line Above'),
//     new CommandDescription('editor.action.moveLinesDownAction', 'virtualme.editor.action.moveLinesDownAction', 'Move Lines Down'),
//     new CommandDescription('editor.action.moveLinesUpAction', 'virtualme.editor.action.moveLinesUpAction', 'Move Lines Up'),
//     new CommandDescription('editor.action.copyLinesDownAction', 'virtualme.editor.action.copyLinesDownAction', 'Copy Line Down'),
//     new CommandDescription('editor.action.copyLinesUpAction', 'virtualme.editor.action.copyLinesUpAction', 'Copy Line Up'),
//     new CommandDescription('editor.action.addSelectionToNextFindMatch', 'virtualme.editor.action.addSelectionToNextFindMatch', 'Add Selection To Next Match'),
//     new CommandDescription('cursorUndo', 'virtualme.cursorUndo', 'Undo'),
//     new CommandDescription('editor.action.insertCursorAtEndOfEachLineSelected', 'virtualme.editor.action.insertCursorAtEndOfEachLineSelected', 'Insert Cursor At End Of Each Line'),
//     new CommandDescription('editor.action.selectHighlights', 'virtualme.editor.action.selectHighlights', 'Select All Occurrences'),
//     new CommandDescription('editor.action.changeAll', 'virtualme.editor.action.changeAll', 'Select All Occurrences'),
//     new CommandDescription('expandLineSelection', 'virtualme.expandLineSelection', 'Expand Line Selection'),
//     new CommandDescription('editor.action.insertCursorBelow', 'virtualme.editor.action.insertCursorBelow', 'Insert Cursor Below'),
//     new CommandDescription('editor.action.insertCursorAbove', 'virtualme.editor.action.insertCursorAbove', 'Insert Cursor Above'),
//     new CommandDescription('editor.action.jumpToBracket', 'virtualme.editor.action.jumpToBracket', 'Jump To Bracket'),
//     new CommandDescription('editor.action.indentLines', 'virtualme.editor.action.indentLines', 'Indent Line'),
//     new CommandDescription('editor.action.outdentLines', 'virtualme.editor.action.outdentLines', 'Outdent Line'),
//     new CommandDescription('cursorHome', 'virtualme.cursorHome', 'Move to Line Start'),
//     new CommandDescription('cursorEnd', 'virtualme.cursorEnd', 'Move to Line End'),
//     new CommandDescription('cursorBottom', 'virtualme.cursorBottom', 'Move to File End'),
//     new CommandDescription('cursorTop', 'virtualme.cursorTop', 'Move to File Start'),
//     new CommandDescription('scrollLineDown', 'virtualme.scrollLineDown', 'Scroll Line Down'),
//     new CommandDescription('scrollLineUp', 'virtualme.scrollLineUp', 'Scroll Line Up'),
//     new CommandDescription('scrollPageDown', 'virtualme.scrollPageDown', 'Scroll Page Down'),
//     new CommandDescription('scrollPageUp', 'virtualme.scrollPageUp', 'Scroll Page Up'),
//     new CommandDescription('editor.fold', 'virtualme.editor.fold', 'Fold Region'),
//     new CommandDescription('editor.unfoldRecursively', 'virtualme.editor.unfoldRecursively', 'Unfold Region'),
//     new CommandDescription('editor.foldAll', 'virtualme.editor.foldAll', 'Fold All Regions'),
//     new CommandDescription('editor.unfoldAll', 'virtualme.editor.unfoldAll', 'Unfold All Regions'),
//     new CommandDescription('editor.action.addCommentLine', 'virtualme.editor.action.addCommentLine', 'Add Line Comment'),
//     new CommandDescription('editor.action.removeCommentLine', 'virtualme.editor.action.removeCommentLine', 'Remove Line Comment'),
//     new CommandDescription('editor.action.commentLine', 'virtualme.editor.action.commentLine', 'Toggle Line Comment'),
//     new CommandDescription('editor.action.blockComment', 'virtualme.editor.action.blockComment', 'Toggle Block Comment'),
//     new CommandDescription('actions.find', 'virtualme.actions.find', 'Find'),
//     new CommandDescription('editor.action.startFindReplaceAction', 'virtualme.editor.action.startFindReplaceAction', 'Replace'),
//     new CommandDescription('editor.action.nextMatchFindAction', 'virtualme.editor.action.nextMatchFindAction', 'Find Next'),
//     new CommandDescription('editor.action.previousMatchFindAction', 'virtualme.editor.action.previousMatchFindAction', 'Find Previous'),
//     new CommandDescription('editor.action.selectAllMatches', 'virtualme.editor.action.selectAllMatches', 'Select All Matches'),
//     new CommandDescription('toggleFindCaseSensitive', 'virtualme.toggleFindCaseSensitive', 'Toggle Find Case Sensitive'),
//     new CommandDescription('toggleFindRegex', 'virtualme.toggleFindRegex', 'Toggle Find Regex'),
//     new CommandDescription('toggleFindWholeWord', 'virtualme.toggleFindWholeWord', 'Toggle Find Whole Word'),
//     new CommandDescription('editor.action.toggleTabFocusMode', 'virtualme.editor.action.toggleTabFocusMode', 'Toggle Tab Focus Mode'),
//     new CommandDescription('toggleRenderWhitespace', 'virtualme.toggleRenderWhitespace', 'Toggle Render Whitespace'),
//     new CommandDescription('editor.action.toggleWordWrap', 'virtualme.editor.action.toggleWordWrap', 'Toggle Word Wrap'),

//     // 3. languageEditCommands
//     new CommandDescription('editor.action.triggerSuggest', 'virtualme.editor.action.triggerSuggest', 'Trigger Suggestion'),
//     new CommandDescription('editor.action.triggerParameterHints', 'virtualme.editor.action.triggerParameterHints', 'Trigger Parameter Hints'),
//     new CommandDescription('editor.action.formatDocument', 'virtualme.editor.action.formatDocument', 'Format Document'),
//     new CommandDescription('editor.action.formatSelection', 'virtualme.editor.action.formatSelection', 'Format Selection'),
//     new CommandDescription('editor.action.revealDefinition', 'virtualme.editor.action.revealDefinition', 'Go to Definition'),
//     new CommandDescription('editor.action.showHover', 'virtualme.editor.action.showHover', 'Show Hover'),
//     new CommandDescription('editor.action.peekDefinition', 'virtualme.editor.action.peekDefinition', 'Peek Definition'),
//     new CommandDescription('editor.action.revealDefinitionAside', 'virtualme.editor.action.revealDefinitionAside', 'Reveal Definition Aside'),
//     new CommandDescription('editor.action.quickFix', 'virtualme.editor.action.quickFix', 'Quick Fix'),
//     new CommandDescription('editor.action.referenceSearch.trigger', 'virtualme.editor.action.referenceSearch.trigger', 'Reference Search'),
//     new CommandDescription('editor.action.rename', 'virtualme.editor.action.rename', 'Rename Symbol'),
//     new CommandDescription('editor.action.inPlaceReplace.down', 'virtualme.editor.action.inPlaceReplace.down', 'Replace with Next Value'),
//     new CommandDescription('editor.action.inPlaceReplace.up', 'virtualme.editor.action.inPlaceReplace.up', 'Replace with Previous Value'),
//     new CommandDescription('editor.action.smartSelect.grow', 'virtualme.editor.action.smartSelect.grow', 'Expand AST Selection'),
//     new CommandDescription('editor.action.smartSelect.shrink', 'virtualme.editor.action.smartSelect.shrink', 'Shrink AST Selection'),
//     new CommandDescription('editor.action.trimTrailingWhitespace', 'virtualme.editor.action.trimTrailingWhitespace', 'Trim Trailing Whitespace'),
//     new CommandDescription('workbench.action.editor.changeLanguageMode', 'virtualme.workbench.action.editor.changeLanguageMode', 'Change Language Mode'),

//     // 4. navigationCommand
//     new CommandDescription('workbench.action.showAllSymbols', 'virtualme.workbench.action.showAllSymbols', 'Show All Symbols'),
//     new CommandDescription('workbench.action.gotoLine', 'virtualme.workbench.action.gotoLine', 'Go to Line'),
//     new CommandDescription('workbench.action.gotoSymbol', 'virtualme.workbench.action.gotoSymbol', 'Go to Symbol'),
//     new CommandDescription('workbench.actions.view.problems', 'virtualme.workbench.actions.view.problems', 'View Problems'),
//     new CommandDescription('editor.action.marker.nextInFiles', 'virtualme.editor.action.marker.nextInFiles', 'Next Error or Warning'),
//     new CommandDescription('editor.action.marker.prevInFiles', 'virtualme.editor.action.marker.prevInFiles', 'Previous Error or Warning'),
//     new CommandDescription('workbench.action.openPreviousRecentlyUsedEditorInGroup', 'virtualme.workbench.action.openPreviousRecentlyUsedEditorInGroup', 'Open Previous Editor in Group'),
//     new CommandDescription('workbench.action.navigateBack', 'virtualme.workbench.action.navigateBack', 'Navigate Back'),
//     new CommandDescription('workbench.action.quickInputBack', 'virtualme.workbench.action.quickInputBack', 'Quick Input Back'),
//     new CommandDescription('workbench.action.navigateForward', 'virtualme.workbench.action.navigateForward', 'Navigate Forward'),

//     // 5. editorWindowCommand
//     new CommandDescription('workbench.action.closeActiveEditor', 'virtualme.workbench.action.closeActiveEditor', 'Close Editor'),
//     new CommandDescription('workbench.action.closeFolder', 'virtualme.workbench.action.closeFolder', 'Close Folder'),
//     new CommandDescription('workbench.action.navigateEditorGroups', 'virtualme.workbench.action.navigateEditorGroups', 'Navigate Editor Groups'),
//     new CommandDescription('workbench.action.splitEditor', 'virtualme.workbench.action.splitEditor', 'Split Editor'),
//     new CommandDescription('workbench.action.focusFirstEditorGroup', 'virtualme.workbench.action.focusFirstEditorGroup', 'Focus First Editor Group'),
//     new CommandDescription('workbench.action.focusSecondEditorGroup', 'virtualme.workbench.action.focusSecondEditorGroup', 'Focus Second Editor Group'),
//     new CommandDescription('workbench.action.focusThirdEditorGroup', 'virtualme.workbench.action.focusThirdEditorGroup', 'Focus Third Editor Group'),
//     new CommandDescription('workbench.action.focusPreviousGroup', 'virtualme.workbench.action.focusPreviousGroup', 'Focus Previous Group'),
//     new CommandDescription('workbench.action.focusNextGroup', 'virtualme.workbench.action.focusNextGroup', 'Focus Next Group'),
//     new CommandDescription('workbench.action.moveEditorLeftInGroup', 'virtualme.workbench.action.moveEditorLeftInGroup', 'Move Editor Left'),
//     new CommandDescription('workbench.action.moveEditorRightInGroup', 'virtualme.workbench.action.moveEditorRightInGroup', 'Move Editor Right'),
//     new CommandDescription('workbench.action.moveActiveEditorGroupLeft', 'virtualme.workbench.action.moveActiveEditorGroupLeft', 'Move Active Editor Group Left'),
//     new CommandDescription('workbench.action.moveActiveEditorGroupRight', 'virtualme.workbench.action.moveActiveEditorGroupRight', 'Move Active Editor Group Right'),
//     new CommandDescription('workbench.action.moveEditorToNextGroup', 'virtualme.workbench.action.moveEditorToNextGroup', 'Move Editor to Next Group'),
//     new CommandDescription('workbench.action.moveEditorToPreviousGroup', 'virtualme.workbench.action.moveEditorToPreviousGroup', 'Move Editor to Previous Group'),
    
//     // 6. fileManagementCommand
//     new CommandDescription('workbench.action.files.newUntitledFile', 'virtualme.workbench.action.files.newUntitledFile', 'New File'),
//     new CommandDescription('workbench.action.files.openFile', 'virtualme.workbench.action.files.openFile', 'Open File...'),
//     new CommandDescription('workbench.action.files.save', 'virtualme.workbench.action.files.save', 'Save'),
//     new CommandDescription('workbench.action.files.saveAll', 'virtualme.workbench.action.files.saveAll', 'Save All'),
//     new CommandDescription('workbench.action.files.saveAs', 'virtualme.workbench.action.files.saveAs', 'Save As...'),
//     new CommandDescription('workbench.action.closeOtherEditors', 'virtualme.workbench.action.closeOtherEditors', 'Close Other Editors'),
//     new CommandDescription('workbench.action.closeEditorsInGroup', 'virtualme.workbench.action.closeEditorsInGroup', 'Close Editors In Group'),
//     new CommandDescription('workbench.action.closeEditorsInOtherGroups', 'virtualme.workbench.action.closeEditorsInOtherGroups', 'Close Editors In Other Groups'),
//     new CommandDescription('workbench.action.closeEditorsToTheLeft', 'virtualme.workbench.action.closeEditorsToTheLeft', 'Close Editors To The Left'),
//     new CommandDescription('workbench.action.closeEditorsToTheRight', 'virtualme.workbench.action.closeEditorsToTheRight', 'Close Editors To The Right'),
//     new CommandDescription('workbench.action.closeAllEditors', 'virtualme.workbench.action.closeAllEditors', 'Close All Editors'),
//     new CommandDescription('workbench.action.reopenClosedEditor', 'virtualme.workbench.action.reopenClosedEditor', 'Reopen Closed Editor'),
//     new CommandDescription('workbench.action.keepEditor', 'virtualme.workbench.action.keepEditor', 'Keep Editor'),
//     new CommandDescription('workbench.action.openNextRecentlyUsedEditorInGroup', 'virtualme.workbench.action.openNextRecentlyUsedEditorInGroup', 'Open Next Editor'),
//     new CommandDescription('workbench.action.files.copyPathOfActiveFile', 'virtualme.workbench.action.files.copyPathOfActiveFile', 'Copy Path Of Active File'),
//     new CommandDescription('workbench.action.files.revealActiveFileInWindows', 'virtualme.workbench.action.files.revealActiveFileInWindows', 'Reveal Active File In Windows'),
//     new CommandDescription('workbench.action.files.showOpenedFileInNewWindow', 'virtualme.workbench.action.files.showOpenedFileInNewWindow', 'Show Opened File In New Window'),
//     new CommandDescription('workbench.files.action.compareFileWith', 'virtualme.workbench.files.action.compareFileWith', 'Compare File With...'),

//     // displayCommands
//     new CommandDescription('workbench.action.toggleFullScreen', 'virtualme.workbench.action.toggleFullScreen', 'Toggle Full Screen'),
//     new CommandDescription('workbench.action.toggleZenMode', 'virtualme.workbench.action.toggleZenMode', 'Toggle Zen Mode'),
//     new CommandDescription('workbench.action.exitZenMode', 'virtualme.workbench.action.exitZenMode', 'Exit Zen Mode'),
//     new CommandDescription('workbench.action.zoomIn', 'virtualme.workbench.action.zoomIn', 'Zoom In'),
//     new CommandDescription('workbench.action.zoomOut', 'virtualme.workbench.action.zoomOut', 'Zoom Out'),
//     new CommandDescription('workbench.action.zoomReset', 'virtualme.workbench.action.zoomReset', 'Reset Zoom'),
//     new CommandDescription('workbench.action.toggleSidebarVisibility', 'virtualme.workbench.action.toggleSidebarVisibility', 'Toggle Sidebar Visibility'),
//     new CommandDescription('workbench.view.explorer', 'virtualme.workbench.view.explorer', 'Show Explorer'),
//     new CommandDescription('workbench.view.scm', 'virtualme.workbench.view.scm', 'Show SCM'),
//     new CommandDescription('workbench.view.debug', 'virtualme.workbench.view.debug', 'Show Debug'),
//     new CommandDescription('workbench.view.extensions', 'virtualme.workbench.view.extensions', 'Show Extensions'),
//     new CommandDescription('workbench.action.output.toggleOutput', 'virtualme.workbench.action.output.toggleOutput', 'Toggle Output'),
//     new CommandDescription('workbench.action.quickOpenView', 'virtualme.workbench.action.quickOpenView', 'Quick Open View'),
//     new CommandDescription('workbench.action.terminal.openNativeConsole', 'virtualme.workbench.action.terminal.openNativeConsole', 'Open Native Console'),
//     new CommandDescription('markdown.showPreview', 'virtualme.markdown.showPreview', 'Toggle Markdown Preview'),
//     new CommandDescription('markdown.showPreviewToSide', 'virtualme.markdown.showPreviewToSide', 'Markdown Preview To Side'),
//     new CommandDescription('workbench.action.terminal.toggleTerminal', 'virtualme.workbench.action.terminal.toggleTerminal', 'Toggle Terminal'),

//     // 7. searchCommands
//     new CommandDescription('workbench.view.search', 'virtualme.workbench.view.search', 'Show Search'),
//     new CommandDescription('workbench.action.replaceInFiles', 'virtualme.workbench.action.replaceInFiles', 'Replace in Files'),
//     new CommandDescription('toggleSearchCaseSensitive', 'virtualme.toggleSearchCaseSensitive', 'Toggle Match Case'),
//     new CommandDescription('toggleSearchWholeWord', 'virtualme.toggleSearchWholeWord', 'Toggle Match Whole Word'),
//     new CommandDescription('toggleSearchRegex', 'virtualme.toggleSearchRegex', 'Toggle Search Regex'),
//     new CommandDescription('workbench.action.search.toggleQueryDetails', 'virtualme.workbench.action.search.toggleQueryDetails', 'Toggle Search Details'),
//     new CommandDescription('search.action.focusNextSearchResult', 'virtualme.search.action.focusNextSearchResult', 'Focus Next Search Result'),
//     new CommandDescription('search.action.focusPreviousSearchResult', 'virtualme.search.action.focusPreviousSearchResult', 'Focus Previous Search Result'),
//     new CommandDescription('history.showNext', 'virtualme.history.showNext', 'Show Next Search Term'),
//     new CommandDescription('history.showPrevious', 'virtualme.history.showPrevious', 'Show Previous Search Term'),

//     // 8. preferenceCommands
//     new CommandDescription('workbench.action.openSettings', 'virtualme.workbench.action.openSettings', 'Open Settings'),
//     new CommandDescription('workbench.action.openWorkspaceSettings', 'virtualme.workbench.action.openWorkspaceSettings', 'Open Workspace Settings'),
//     new CommandDescription('workbench.action.openGlobalKeybindings', 'virtualme.workbench.action.openGlobalKeybindings', 'Open Keyboard Shortcuts'),
//     new CommandDescription('workbench.action.openSnippets', 'virtualme.workbench.action.openSnippets', 'Open User Snippets'),
//     new CommandDescription('workbench.action.selectTheme', 'virtualme.workbench.action.selectTheme', 'Select Color Theme'),
//     new CommandDescription('workbench.action.configureLocale', 'virtualme.workbench.action.configureLocale', 'Configure Display Language'),

//     // 9. debugCommands
//     new CommandDescription('editor.debug.action.toggleBreakpoint', 'virtualme.editor.debug.action.toggleBreakpoint', 'Toggle Breakpoint'),
//     new CommandDescription('workbench.action.debug.start', 'virtualme.workbench.action.debug.start', 'Start Debugging'),
//     new CommandDescription('workbench.action.debug.continue', 'virtualme.workbench.action.debug.continue', 'Continue'),
//     new CommandDescription('workbench.action.debug.run', 'virtualme.workbench.action.debug.run', 'Start Without Debugging'),
//     new CommandDescription('workbench.action.debug.pause', 'virtualme.workbench.action.debug.pause', 'Pause'),
//     new CommandDescription('workbench.action.debug.stepInto', 'virtualme.workbench.action.debug.stepInto', 'Step Into'),
//     new CommandDescription('workbench.action.debug.stepOut', 'virtualme.workbench.action.debug.stepOut', 'Step Out'),
//     new CommandDescription('workbench.action.debug.stepOver', 'virtualme.workbench.action.debug.stepOver', 'Step Over'),
//     new CommandDescription('workbench.action.debug.stop', 'virtualme.workbench.action.debug.stop', 'Stop'),
//     new CommandDescription('editor.debug.action.showDebugHover', 'virtualme.editor.debug.action.showDebugHover', 'Show Debug Hover'),

//     // 10. taskCommands
//     new CommandDescription('workbench.action.tasks.build', 'virtualme.workbench.action.tasks.build', 'Run Build Task'),
//     new CommandDescription('workbench.action.tasks.test', 'virtualme.workbench.action.tasks.test', 'Run Test Task'),

//     // 11. extensionCommands
//     new CommandDescription('workbench.extensions.action.installExtension', 'virtualme.workbench.extensions.action.installExtension', 'Install Extension'),
//     new CommandDescription('workbench.extensions.action.showInstalledExtensions', 'virtualme.workbench.extensions.action.showInstalledExtensions', 'Show Installed Extensions'),
//     new CommandDescription('workbench.extensions.action.listOutdatedExtensions', 'virtualme.workbench.extensions.action.listOutdatedExtensions', 'List Outdated Extensions'),
//     new CommandDescription('workbench.extensions.action.showRecommendedExtensions', 'virtualme.workbench.extensions.action.showRecommendedExtensions', 'Show Recommended Extensions'),
//     new CommandDescription('workbench.extensions.action.showPopularExtensions', 'virtualme.workbench.extensions.action.showPopularExtensions', 'Show Popular Extensions'),
//     new CommandDescription('workbench.extensions.action.updateAllExtensions', 'virtualme.workbench.extensions.action.updateAllExtensions', 'Update All Extensions'),
// ];
import * as vscode from 'vscode'
import * as logItem from "../types/log-item"

export function handleCommand(commandName: string) {
    const artifact = new logItem.Artifact(commandName, logItem.ArtifactType.MenuItem)
    const eventType = logItem.EventType.ExecuteMenuItem
    const log = new logItem.LogItem(eventType, artifact)
    return log
}




