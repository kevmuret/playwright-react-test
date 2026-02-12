// App component renders a greeting message
import React, { ReactNode } from "react";

export type AppProps = {
	/** Hello target textual representation. */
	text: string;
};

const App: React.FC<AppProps> = ({ text }): ReactNode => {
  return <h1>Hello: {text}</h1>;
};

export default App;
