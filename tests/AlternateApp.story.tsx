import React from 'react';
import App from './App';
import type { AppProps } from './App';

export default (props: AppProps) => <App {...{ ...props, text: "alternate" }} />;
