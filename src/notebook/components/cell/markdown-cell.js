// @flow
import React from 'react';
import CommonMark from 'commonmark';
import MarkdownRenderer from 'commonmark-react-renderer';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

import Editor from './editor';
import LatexRenderer from '../latex';

type Props = {
  cell: any,
  id: string,
  theme: string,
  focusAbove: Function,
  focusBelow: Function,
  focused: boolean,
};

type State = {
  view: boolean,
  source: string,
};

type MDRender = (input: string) => string

const parser = new CommonMark.Parser();
const renderer = new MarkdownRenderer();

const mdRender: MDRender = input => renderer.render(parser.parse(input));

export default class MarkdownCell extends React.Component {
  state: State;
  openEditor: () => void;
  editorKeyDown: (e: Object) => void;
  renderedKeyDown: (e: Object) => boolean;
  shouldComponentUpdate: (p: Props, s: State) => boolean;

  static contextTypes = {
    store: React.PropTypes.object,
  };

  static defaultProps = {
    focused: false,
  };

  constructor(props: Props): void {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      view: true,
      // HACK: We'll need to handle props and state change better here
      source: this.props.cell.get('source'),
    };
    this.openEditor = this.openEditor.bind(this);
    this.editorKeyDown = this.editorKeyDown.bind(this);
    this.renderedKeyDown = this.renderedKeyDown.bind(this);
  }

  componentDidMount(): void {
    this.updateRenderedElement();
  }

  componentWillReceiveProps(nextProps: Props): void {
    this.setState({
      source: nextProps.cell.get('source'),
    });
  }

  componentDidUpdate(): void {
    this.updateRenderedElement();
  }

  updateRenderedElement(): void {
    // On first load, if focused, focus rendered view
    if (this.state && this.state.view && this.props.focused) {
      this.refs.rendered.focus();
    }
  }

  /**
   * Handles when a keydown event occurs on the unrendered MD cell
   */
  editorKeyDown(e: Object): void {
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    if ((shift || ctrl) && e.key === 'Enter') {
      this.setState({ view: true });
    }
  }

  openEditor(): void {
    this.setState({ view: false });
  }

  /**
   * Handles when a keydown event occurs on the rendered MD cell
   */
  renderedKeyDown(e: Object): boolean {
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    if ((shift || ctrl) && e.key === 'Enter') {
      this.setState({ view: true });
      return false;
    }

    switch (e.key) {
      case 'ArrowUp':
        this.props.focusAbove();
        break;
      case 'ArrowDown':
        this.props.focusBelow();
        break;
      case 'Enter':
        this.openEditor();
        e.preventDefault();
        return false;
      default:
    }
    return true;
  }

  render(): ?React.Element<any> {
    return (
       (this.state && this.state.view) ?
         <div
           className="rendered"
           onDoubleClick={this.openEditor}
           onKeyDown={this.renderedKeyDown}
           ref="rendered"
           tabIndex="0"
         >
           <LatexRenderer>
             {
              mdRender(
                this.state.source ?
                this.state.source :
                '*Empty markdown cell, double click me to add content.*')
             }
           </LatexRenderer>
         </div> :
         <div onKeyDown={this.editorKeyDown}>
           <div className="input-container">
             <div className="prompt" />
             <Editor
               language="markdown"
               id={this.props.id}
               lineWrapping
               input={this.state.source}
               theme={this.props.theme}
               focusAbove={this.props.focusAbove}
               focusBelow={this.props.focusBelow}
               focused={this.props.focused}
             />
           </div>
           <div className="outputs">
             <LatexRenderer>
               { mdRender(this.state.source) }
             </LatexRenderer>
           </div>
         </div>
    );
  }
}
