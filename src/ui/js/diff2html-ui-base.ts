import { closeTags, nodeStream, mergeStreams, getLanguage } from './highlight.js-helpers';

import { html, Diff2HtmlConfig, defaultDiff2HtmlConfig, parse } from '../../diff2html';
import { DiffFile } from '../../types';
import { HighlightResult, HLJSApi } from 'highlight.js';
import { fireEvent } from '../../events';
import { loadScript } from '../../utils';

export interface Diff2HtmlUIConfig extends Diff2HtmlConfig {
  synchronisedScroll?: boolean;
  highlight?: boolean;
  fileListToggle?: boolean;
  fileListStartVisible?: boolean;
  /**
   * @deprecated since version 3.1.0
   * Smart selection is now enabled by default with vanilla CSS
   */
  smartSelection?: boolean;
  fileContentToggle?: boolean;
}

export const defaultDiff2HtmlUIConfig = {
  ...defaultDiff2HtmlConfig,
  synchronisedScroll: true,
  highlight: true,
  fileListToggle: true,
  fileListStartVisible: false,
  /**
   * @deprecated since version 3.1.0
   * Smart selection is now enabled by default with vanilla CSS
   */
  smartSelection: true,
  fileContentToggle: true,
};

export class Diff2HtmlUI {
  readonly config: typeof defaultDiff2HtmlUIConfig;
  readonly diffHtml: string;
  readonly diffFiles: DiffFile[]
  readonly targetElement: HTMLElement;
  readonly hljs: HLJSApi | null = null;

  currentSelectionColumnId = -1;

  constructor(target: HTMLElement, diffInput?: string | DiffFile[], config: Diff2HtmlUIConfig = {}, hljs?: HLJSApi) {
    this.config = { ...defaultDiff2HtmlUIConfig, ...config };
    this.diffFiles = this.parse(diffInput as string);
    this.diffHtml = diffInput !== undefined ? html(diffInput, this.config) : target.innerHTML;
    this.targetElement = target;
    if (hljs !== undefined) this.hljs = hljs;
  }

  parse(diffInput: string): DiffFile[] {
    return parse(diffInput, this.config);
  }

  draw(): void {
    this.targetElement.innerHTML = this.diffHtml;
    if (this.config.synchronisedScroll) this.synchronisedScroll();
    if (this.config.highlight) this.highlightCode();
    if (this.config.fileListToggle) this.fileListToggle(this.config.fileListStartVisible);
    if (this.config.fileContentToggle) this.fileContentToggle();

    this.initEvents();
  }

  initEvents(): void {
    document.querySelectorAll('.cw-d2h-file-name-wrapper').forEach(cl => {
      cl.addEventListener('click', e => {
        // (e?.target as HTMLElement)?.parentElement?.classList.toggle('uncollapse')
        this.toggleFile((e?.target as HTMLElement)?.parentElement?.dataset.filePath as string);
      });
    });

    // slected line
    document.querySelectorAll('[data-target-id="lineNumber"]').forEach(ln => {
      ln.addEventListener('click', e => {
        document.querySelector('.code-line-selected')?.classList.remove('code-line-selected');
        (e?.target as HTMLElement)?.parentElement?.classList.toggle('code-line-selected');
      });
    });

    fireEvent('.load-more', 'loadMore');
    fireEvent('.cw-d2h-file-header', 'clickHeader');
    fireEvent('.cw-d2h-diff-table tbody', 'clickDiffBody');
    fireEvent('.cw-d2h-expand-all', 'expandAll');
  }

  synchronisedScroll(): void {
    this.targetElement.querySelectorAll('.cw-d2h-file-wrapper').forEach(wrapper => {
      const [left, right] = Array<Element>().slice.call(wrapper.querySelectorAll('.cw-d2h-file-side-diff'));

      if (left === undefined || right === undefined) return;

      const onScroll = (event: Event): void => {
        if (event === null || event.target === null) return;

        if (event.target === left) {
          right.scrollTop = left.scrollTop;
          right.scrollLeft = left.scrollLeft;
        } else {
          left.scrollTop = right.scrollTop;
          left.scrollLeft = right.scrollLeft;
        }
      };
      left.addEventListener('scroll', onScroll);
      right.addEventListener('scroll', onScroll);
    });
  }

  fileListToggle(startVisible: boolean): void {
    const showBtn: HTMLElement | null = this.targetElement.querySelector('.cw-d2h-show');
    const hideBtn: HTMLElement | null = this.targetElement.querySelector('.cw-d2h-hide');
    const fileList: HTMLElement | null = this.targetElement.querySelector('.cw-d2h-file-list');

    if (showBtn === null || hideBtn === null || fileList === null) return;

    const show: () => void = () => {
      showBtn.style.display = 'none';
      hideBtn.style.display = 'inline';
      fileList.style.display = 'block';
    };

    const hide: () => void = () => {
      showBtn.style.display = 'inline';
      hideBtn.style.display = 'none';
      fileList.style.display = 'none';
    };

    showBtn.addEventListener('click', () => show());
    hideBtn.addEventListener('click', () => hide());

    const hashTag = this.getHashTag();
    if (hashTag === 'files-summary-show') show();
    else if (hashTag === 'files-summary-hide') hide();
    else if (startVisible) show();
    else hide();
  }

  fileContentToggle(): void {
    this.targetElement.querySelectorAll<HTMLElement>('.cw-d2h-file-collapse').forEach(fileContentToggleBtn => {
      fileContentToggleBtn.style.display = 'flex';

      const toggleFileContents: (selector: string) => void = selector => {
        const fileContents: HTMLElement | null | undefined = fileContentToggleBtn
          .closest('.cw-d2h-file-wrapper')
          ?.querySelector(selector);

        if (fileContents !== null && fileContents !== undefined) {
          fileContentToggleBtn.classList.toggle('cw-d2h-selected');
          fileContents.classList.toggle('cw-d2h-d-none');
        }
      };

      const toggleHandler: (e: Event) => void = e => {
        if (fileContentToggleBtn === e.target) return;

        toggleFileContents('.cw-d2h-file-diff');
        toggleFileContents('.cw-d2h-files-diff');
      };

      fileContentToggleBtn.addEventListener('click', e => toggleHandler(e));
    });
  }

  highlightCode(langBase?: string): void {
    if (this.hljs === null) {
      throw new Error('Missing a `highlight.js` implementation. Please provide one when instantiating Diff2HtmlUI.');
    }

    // Collect all the diff files and execute the highlight on their lines
    const files = this.targetElement.querySelectorAll('.cw-d2h-file-wrapper');
    files.forEach(async file => {
      // HACK: help Typescript know that `this.hljs` is defined since we already checked it
      if (this.hljs === null) return;
      const language = file.getAttribute('data-lang');
      //   const hljsLanguage = language ? this.hljs.getLanguage(language) : undefined;
      const hljsLanguage = language ? getLanguage(language) : 'plaintext';
      if (this.hljs.listLanguages().indexOf(hljsLanguage) < 0) {
        await loadScript(`${langBase}/${hljsLanguage}.min.js`);
      }

      // Collect all the code lines and execute the highlight on them
      const codeLines = file.querySelectorAll('.cw-d2h-code-line-ctn');
      codeLines.forEach(line => {
        // HACK: help Typescript know that `this.hljs` is defined since we already checked it
        if (this.hljs === null) return;

        const text = line.textContent;
        const lineParent = line.parentNode;

        if (text === null || lineParent === null || !this.isElement(lineParent)) return;

        const result: HighlightResult = closeTags(
          this.hljs.highlight(text, {
            // language: hljsLanguage?.name === 'HTML, XML' ? 'XML' : hljsLanguage?.name || 'plaintext',
            language: hljsLanguage,
            ignoreIllegals: true,
          }),
        );

        const originalStream = nodeStream(line);
        if (originalStream.length) {
          const resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
          resultNode.innerHTML = result.value;
          result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
        }

        line.classList.add('hljs');
        if (result.language) {
          const langStr = result.language.replaceAll(' ', '&nbsp;');
          line.classList.add(langStr);
        }
        line.innerHTML = result.value;
      });
    });
  }

  /**
   * @deprecated since version 3.1.0
   */
  smartSelection(): void {
    console.warn('Smart selection is now enabled by default with CSS. No need to call this method anymore.');
  }

  private getHashTag(): string | null {
    const docUrl = document.URL;
    const hashTagIndex = docUrl.indexOf('#');

    let hashTag = null;
    if (hashTagIndex !== -1) {
      hashTag = docUrl.substr(hashTagIndex + 1);
    }

    return hashTag;
  }

  private isElement(arg?: unknown): arg is Element {
    return arg !== null && (arg as Element)?.classList !== undefined;
  }

  toggleFile(fileName: string): void {
    const target = document.querySelector(`[data-file-path='${fileName}']`);
    target?.classList.toggle('uncollapse');
    const customEvent = new CustomEvent('toggleFile', {
      detail: {
        target,
        ...(target as HTMLElement)?.dataset,
      },
    });
    window.dispatchEvent(customEvent);
  }

  fireEvent(ele: string, name: string): void {
    return fireEvent(ele, name);
  }

  getHtml(input: string, config: Diff2HtmlUIConfig): string {
    return html(input, config);
  }
}
