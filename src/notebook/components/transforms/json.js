// @flow
import React from 'react';
import JSONTree from 'react-json-tree';

const defaultTheme = {
  base00: 'transparent',
  base01: '#073642',
  base02: '#586e75',
  base03: '#657b83',
  base04: '#839496',
  base05: '#93a1a1',
  base06: '#eee8d5',
  base07: '#fdf6e3',
  base08: '#dc322f',
  base09: '#cb4b16',
  base0A: '#b58900',
  base0B: '#66BB6A',
  base0C: '#2aa198',
  base0D: '#268bd2',
  base0E: '#6c71c4',
  base0F: '#d33682'
};

function getTheme(themeName) {
  switch (themeName) {
    case 'light':
    case 'classic': {
      return defaultTheme;
    }
    case 'dark':
    case 'nteract': {
      return Object.assign({}, defaultTheme, { base0B: '#EDF3F7' });
    }
    case 'halloween': {
      return Object.assign({}, defaultTheme, {
        base03: '#E28410',
        base0B: '#A22222',
        base0D: '#000000',
      });
    }
    default:
      return defaultTheme;
  }
}

type Props = {
  data: Object;
  theme: string;
}

export default class JsonDisplay extends React.Component {
  props: Props;

  shouldComponentUpdate(nextProps) {
    if (nextProps && nextProps.theme && this.props && nextProps.theme !== this.props.theme) {
      return true;
    }
    return false;
  }

  render() {
    const theme = getTheme(this.props.theme);
    return <JSONTree data={this.props.data} theme={theme} invertTheme={false} />;
  }
}
