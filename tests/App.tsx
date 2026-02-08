// App component renders a greeting message
import React, { ReactNode } from "react";

const App: React.FC<{ text: string }> = ({ text }): ReactNode => {
  return <h1>Hello: {text}</h1>;
};

export default App;
