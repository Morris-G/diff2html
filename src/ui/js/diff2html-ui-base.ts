import { closeTags, nodeStream, mergeStreams } from './highlight.js-helpers';

import { html, Diff2HtmlConfig, defaultDiff2HtmlConfig } from '../../diff2html';
import { DiffFile } from '../../types';
import { HighlightResult, HLJSApi } from 'highlight.js';

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
  readonly targetElement: HTMLElement;
  readonly hljs: HLJSApi | null = null;

  currentSelectionColumnId = -1;

  constructor(target: HTMLElement, diffInput?: string | DiffFile[], config: Diff2HtmlUIConfig = {}, hljs?: HLJSApi) {
    this.config = { ...defaultDiff2HtmlUIConfig, ...config };
    this.diffHtml = diffInput !== undefined ? html(diffInput, this.config) : target.innerHTML;
    this.targetElement = target;
    if (hljs !== undefined) this.hljs = hljs;
  }

  draw(): void {
    this.targetElement.innerHTML = this.diffHtml;
    if (this.config.synchronisedScroll) this.synchronisedScroll();
    if (this.config.highlight) this.highlightCode();
    if (this.config.fileListToggle) this.fileListToggle(this.config.fileListStartVisible);
    if (this.config.fileContentToggle) this.fileContentToggle();
    document.querySelectorAll('.load-more').forEach(el => {
        el.addEventListener('click', e => {
            const { fileMode, fileName, lineNumber } = (e?.target as HTMLElement)?.dataset
            const loadMore = new CustomEvent('loadMore', {
                detail: { fileMode, fileName, lineNumber }
            })
            window.dispatchEvent(loadMore)
        })
    })

    document.querySelectorAll('.d2h-file-name-wrapper').forEach(cl => {
      cl.addEventListener('click', e => {
        (e?.target as HTMLElement)?.parentElement?.classList.toggle('uncollapse')
      })
    })

    document.querySelectorAll('.d2h-file-header').forEach(el => {
      el.addEventListener('click', e => {
        const t = (e.target as HTMLElement).id
        switch(t) {
          case 'copy':
            console.log('====click copy====')
            break
          case 'tool':
            console.log('====click tool====')
            break
          case '':
            console.log(e)
        }
      })
    })

    document.querySelectorAll('tbody.d2h-diff-tbody').forEach(tb => {
        tb.addEventListener('click', e => {
            // const target = e.target
            const { className, dataset } = e.target as HTMLElement
            // console.log({className, dataset})
            const { fileName, lineMode, lineNumber, targetId } = dataset
            switch(targetId) {
                case 'lineNumber':
                    // TODO
                    document.querySelector('.code-line-selected')?.classList.remove('code-line-selected');
                    (e?.target as HTMLElement)?.parentElement?.classList.toggle('code-line-selected')
                    console.log(`点击了${lineMode === 'old' ? '左' : '右'}侧第${lineNumber}行，文件名是${fileName}`)
                    break
                case 'commentBtn':
                    // TODO
                    console.log(`点击了${lineMode === 'old' ? '左' : '右'}侧第${lineNumber}行的评论按钮，文件名是${fileName}`)
                    break
                default:
                    console.log({ className, dataset })
            }
        })
    })
  }

  synchronisedScroll(): void {
    this.targetElement.querySelectorAll('.d2h-file-wrapper').forEach(wrapper => {
      const [left, right] = Array<Element>().slice.call(wrapper.querySelectorAll('.d2h-file-side-diff'));

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
    const showBtn: HTMLElement | null = this.targetElement.querySelector('.d2h-show');
    const hideBtn: HTMLElement | null = this.targetElement.querySelector('.d2h-hide');
    const fileList: HTMLElement | null = this.targetElement.querySelector('.d2h-file-list');

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
    this.targetElement.querySelectorAll<HTMLElement>('.d2h-file-collapse').forEach(fileContentToggleBtn => {
      fileContentToggleBtn.style.display = 'flex';

      const toggleFileContents: (selector: string) => void = selector => {
        const fileContents: HTMLElement | null | undefined = fileContentToggleBtn
          .closest('.d2h-file-wrapper')
          ?.querySelector(selector);

        if (fileContents !== null && fileContents !== undefined) {
          fileContentToggleBtn.classList.toggle('d2h-selected');
          fileContents.classList.toggle('d2h-d-none');
        }
      };

      const toggleHandler: (e: Event) => void = e => {
        if (fileContentToggleBtn === e.target) return;

        toggleFileContents('.d2h-file-diff');
        toggleFileContents('.d2h-files-diff');
      };

      fileContentToggleBtn.addEventListener('click', e => toggleHandler(e));
    });
  }

  highlightCode(): void {
    if (this.hljs === null) {
      throw new Error('Missing a `highlight.js` implementation. Please provide one when instantiating Diff2HtmlUI.');
    }

    // Collect all the diff files and execute the highlight on their lines
    const files = this.targetElement.querySelectorAll('.d2h-file-wrapper');
    files.forEach(file => {
      // HACK: help Typescript know that `this.hljs` is defined since we already checked it
      if (this.hljs === null) return;
      const language = file.getAttribute('data-lang');
      const hljsLanguage = language ? this.hljs.getLanguage(language) : undefined;

      // Collect all the code lines and execute the highlight on them
      const codeLines = file.querySelectorAll('.d2h-code-line-ctn');
      codeLines.forEach(line => {
        // HACK: help Typescript know that `this.hljs` is defined since we already checked it
        if (this.hljs === null) return;

        const text = line.textContent;
        const lineParent = line.parentNode;

        if (text === null || lineParent === null || !this.isElement(lineParent)) return;

        const result: HighlightResult = closeTags(
          this.hljs.highlight(text, {
            language: hljsLanguage?.name === 'HTML, XML' ? 'XML' : hljsLanguage?.name || 'plaintext',
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
          const langStr = result.language.replaceAll(' ', '&nbsp;')
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
}
