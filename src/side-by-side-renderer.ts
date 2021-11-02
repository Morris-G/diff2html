import HoganJsUtils from './hoganjs-utils';
import * as Rematch from './rematch';
import * as renderUtils from './render-utils';
import {
  DiffLine,
  LineType,
  DiffFile,
  DiffBlock,
  DiffLineContext,
  DiffLineDeleted,
  DiffLineInserted,
  DiffLineContent,
} from './types';

export interface SideBySideRendererConfig extends renderUtils.RenderConfig {
  renderNothingWhenEmpty?: boolean;
  matchingMaxComparisons?: number;
  maxLineSizeInBlockForComparison?: number;
}

export const defaultSideBySideRendererConfig = {
  ...renderUtils.defaultRenderConfig,
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200,
};

const genericTemplatesPath = 'generic';
const baseTemplatesPath = 'side-by-side';
const iconsBaseTemplatesPath = 'icon';
const tagsBaseTemplatesPath = 'tag';

export default class SideBySideRenderer {
  private readonly hoganUtils: HoganJsUtils;
  private readonly config: typeof defaultSideBySideRendererConfig;

  constructor(hoganUtils: HoganJsUtils, config: SideBySideRendererConfig = {}) {
    this.hoganUtils = hoganUtils;
    this.config = { ...defaultSideBySideRendererConfig, ...config };
  }

  render(diffFiles: DiffFile[]): string {
    const diffsHtml = diffFiles
      .map(file => {
        let diffs;
        if (file.blocks.length) {
          diffs = this.generateFileHtml(file);
        } else {
          diffs = this.generateEmptyDiff();
        }
        return this.makeFileDiffHtml(file, diffs);
      })
      .join('\n');

    return this.hoganUtils.render(genericTemplatesPath, 'wrapper', { content: diffsHtml });
  }

  makeFileDiffHtml(file: DiffFile, diffs: FileHtml): string {
    if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0) return '';

    const fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, 'file-diff');
    const filePathTemplate = this.hoganUtils.template(genericTemplatesPath, 'file-path');
    const collapseIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, 'collapse');
    const fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, 'file');
    const fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));
    const expandTemplate = this.hoganUtils.template('file', 'expand-all');
    const lastBlock = file.blocks[file.blocks?.length - 1];
    return fileDiffTemplate.render({
      file: file,
      fileName: file.newName || file.oldName,
      fileHtmlId: renderUtils.getHtmlId(file),
      diffs: diffs,
      filePath: filePathTemplate.render(
        {
          fileName: file.newName || file.oldName,
          fileDiffName: renderUtils.filenameDiff(file),
          addedLines: file.addedLines,
          deletedLines: file.deletedLines,
        },
        {
          collapseIcon: collapseIconTemplate,
          fileIcon: fileIconTemplate,
          fileTag: fileTagTemplate,
        },
      ),
      isExpand: !file?.isNew && !file?.isDeleted && !file?.isRename && !file?.isBinary && !file?.isEnd,
      expand: expandTemplate.render({
        fileName: file.newName || file.oldName,
        blockTitle: file?.isEnd ? '' : renderUtils.escapeForHtml(lastBlock?.header ?? ''),
        newBlockEnd: lastBlock?.newBlockStart + lastBlock?.newBlockEnd - 1,
        oldBlockEnd: lastBlock?.oldBlockStart + lastBlock?.oldBlockEnd - 1,
      }),
    });
  }

  generateEmptyDiff(): FileHtml {
    return {
      right: '',
      left: this.hoganUtils.render(genericTemplatesPath, 'empty-diff', {
        contentClass: 'cw-d2h-code-side-line',
        CSSLineClass: renderUtils.CSSLineClass,
      }),
    };
  }

  generateFileHtml(file: DiffFile): FileHtml {
    const matcher = Rematch.newMatcherFn(
      Rematch.newDistanceFn((e: DiffLine) => renderUtils.deconstructLine(e.content, file.isCombined).content),
    );

    return file.blocks
      .map(block => {
        const fileHtml = {
          left: this.makeHeaderHtml(block, file, true),
          right: this.makeHeaderHtml(block, file, false),
        };

        this.applyLineGroupping(block).forEach(([contextLines, oldLines, newLines]) => {
          if (oldLines.length && newLines.length && !contextLines.length) {
            this.applyRematchMatching(oldLines, newLines, matcher).map(([oldLines, newLines]) => {
              const { left, right } = this.processChangedLines(file.isCombined, oldLines, newLines, file);
              fileHtml.left += left;
              fileHtml.right += right;
            });
          } else if (contextLines.length) {
            contextLines.forEach(line => {
              const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
              const { left, right } = this.generateLineHtml(
                {
                  type: renderUtils.CSSLineClass.CONTEXT,
                  prefix: prefix,
                  content: content,
                  number: line.oldNumber,
                },
                {
                  type: renderUtils.CSSLineClass.CONTEXT,
                  prefix: prefix,
                  content: content,
                  number: line.newNumber,
                },
                file,
              );
              fileHtml.left += left;
              fileHtml.right += right;
            });
          } else if (oldLines.length || newLines.length) {
            const { left, right } = this.processChangedLines(file.isCombined, oldLines, newLines, file);
            fileHtml.left += left;
            fileHtml.right += right;
          } else {
            console.error('Unknown state reached while processing groups of lines', contextLines, oldLines, newLines);
          }
        });

        return fileHtml;
      })
      .reduce(
        (accomulated, html) => {
          return { left: accomulated.left + html.left, right: accomulated.right + html.right };
        },
        { left: '', right: '' },
      );
  }

  applyLineGroupping(block: DiffBlock): DiffLineGroups {
    const blockLinesGroups: DiffLineGroups = [];

    let oldLines: (DiffLineDeleted & DiffLineContent)[] = [];
    let newLines: (DiffLineInserted & DiffLineContent)[] = [];

    for (let i = 0; i < block.lines.length; i++) {
      const diffLine = block.lines[i];

      if (
        (diffLine.type !== LineType.INSERT && newLines.length) ||
        (diffLine.type === LineType.CONTEXT && oldLines.length > 0)
      ) {
        blockLinesGroups.push([[], oldLines, newLines]);
        oldLines = [];
        newLines = [];
      }

      if (diffLine.type === LineType.CONTEXT) {
        blockLinesGroups.push([[diffLine], [], []]);
      } else if (diffLine.type === LineType.INSERT && oldLines.length === 0) {
        blockLinesGroups.push([[], [], [diffLine]]);
      } else if (diffLine.type === LineType.INSERT && oldLines.length > 0) {
        newLines.push(diffLine);
      } else if (diffLine.type === LineType.DELETE) {
        oldLines.push(diffLine);
      }
    }

    if (oldLines.length || newLines.length) {
      blockLinesGroups.push([[], oldLines, newLines]);
      oldLines = [];
      newLines = [];
    }

    return blockLinesGroups;
  }

  applyRematchMatching(
    oldLines: DiffLine[],
    newLines: DiffLine[],
    matcher: Rematch.MatcherFn<DiffLine>,
  ): DiffLine[][][] {
    const comparisons = oldLines.length * newLines.length;
    const maxLineSizeInBlock = Math.max.apply(
      null,
      [0].concat(oldLines.concat(newLines).map(elem => elem.content.length)),
    );
    const doMatching =
      comparisons < this.config.matchingMaxComparisons &&
      maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison &&
      (this.config.matching === 'lines' || this.config.matching === 'words');

    return doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];
  }

  makeHeaderHtml(block?: DiffBlock, file?: DiffFile, isLeft?: boolean, isEnd = false): string {
    return this.hoganUtils.render(genericTemplatesPath, 'block-header', {
      isRender: !file?.isBinary ?? file.isCombined ?? !file.isNew ?? !file.isDeleted,
      CSSLineClass: renderUtils.CSSLineClass,
      blockHeader: isEnd
        ? ''
        : isLeft
        ? file?.isTooBig
          ? block?.header
          : renderUtils.escapeForHtml(block?.header ?? '')
        : '',
      blockTitle: isEnd ? '' : renderUtils.escapeForHtml(block?.header ?? ''),
      lineClass: 'cw-d2h-code-side-linenumber',
      contentClass: 'cw-d2h-code-side-line',
      newBlockStart: block?.newBlockStart,
      newBlockEnd: block?.newBlockEnd,
      oldBlockStart: block?.oldBlockStart,
      oldBlockEnd: block?.oldBlockEnd,
      isNewRender: !isLeft && block?.newBlockStart !== 1 && block?.newBlockStart !== 0,
      isOldRender: isLeft && block?.oldBlockStart !== 1 && block?.oldBlockStart !== 0,
      oldName: file?.oldName,
      newName: file?.newName,
    });
  }

  processChangedLines(isCombined: boolean, oldLines: DiffLine[], newLines: DiffLine[], file: DiffFile): FileHtml {
    const fileHtml = {
      right: '',
      left: '',
    };

    const maxLinesNumber = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLinesNumber; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      const diff =
        oldLine !== undefined && newLine !== undefined
          ? renderUtils.diffHighlight(oldLine.content, newLine.content, isCombined, this.config)
          : undefined;

      const preparedOldLine =
        oldLine !== undefined && oldLine.oldNumber !== undefined
          ? {
              ...(diff !== undefined
                ? {
                    prefix: diff.oldLine.prefix,
                    content: diff.oldLine.content,
                    type: renderUtils.CSSLineClass.DELETE_CHANGES,
                  }
                : {
                    ...renderUtils.deconstructLine(oldLine.content, isCombined),
                    type: renderUtils.toCSSClass(oldLine.type),
                  }),
              number: oldLine.oldNumber,
            }
          : undefined;

      const preparedNewLine =
        newLine !== undefined && newLine.newNumber !== undefined
          ? {
              ...(diff !== undefined
                ? {
                    prefix: diff.newLine.prefix,
                    content: diff.newLine.content,
                    type: renderUtils.CSSLineClass.INSERT_CHANGES,
                  }
                : {
                    ...renderUtils.deconstructLine(newLine.content, isCombined),
                    type: renderUtils.toCSSClass(newLine.type),
                  }),
              number: newLine.newNumber,
            }
          : undefined;

      const { left, right } = this.generateLineHtml(preparedOldLine, preparedNewLine, file);
      fileHtml.left += left;
      fileHtml.right += right;
    }

    return fileHtml;
  }

  generateLineHtml(oldLine?: DiffPreparedLine, newLine?: DiffPreparedLine, file?: DiffFile): FileHtml {
    return {
      left: this.generateSingleHtml(oldLine, file, 'old'),
      right: this.generateSingleHtml(newLine, file, 'new'),
    };
  }

  generateSingleHtml(line?: DiffPreparedLine, file?: DiffFile, lineMode?: string): string {
    const lineClass = 'cw-d2h-code-side-linenumber';
    const contentClass = 'cw-d2h-code-side-line';

    return this.hoganUtils.render(genericTemplatesPath, 'line', {
      type: line?.type || `${renderUtils.CSSLineClass.CONTEXT} cw-d2h-emptyplaceholder`,
      lineClass: line !== undefined ? lineClass : `${lineClass} cw-d2h-code-side-emptyplaceholder`,
      contentClass: line !== undefined ? contentClass : `${contentClass} cw-d2h-code-side-emptyplaceholder`,
      prefix: line?.prefix === ' ' ? '&nbsp;' : line?.prefix,
      content: line?.content,
      lineNumber: line?.number,
      fileName: lineMode === 'old' ? file?.oldName : file?.newName ?? file?.oldName,
      lineMode: lineMode,
    });
  }
}

type DiffLineGroups = [
  (DiffLineContext & DiffLineContent)[],
  (DiffLineDeleted & DiffLineContent)[],
  (DiffLineInserted & DiffLineContent)[],
][];

type DiffPreparedLine = {
  type: renderUtils.CSSLineClass;
  prefix: string;
  content: string;
  number: number;
};

type FileHtml = {
  left: string;
  right: string;
};
