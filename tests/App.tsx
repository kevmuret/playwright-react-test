/*
 * App.tsx – simple React component used in tests
 * Exports a functional component that displays "Hello: {text}".
 * Props are typed via AppProps for clarity.
 */
// App component renders a greeting message
import React, { ReactNode } from "react";

export type AppProps = {
	/** Hello target textual representation. */
	text: string;
	onClick?: (text: string) => void;
};

const App: React.FC<AppProps> = ({ text, onClick }): ReactNode => {
  return <h1 onClick={(_e) => onClick && onClick(text)}>Hello: {text}</h1>;
};

export default App;
