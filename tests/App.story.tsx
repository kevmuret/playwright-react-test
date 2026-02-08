// Story definition for the App component used in Playwright tests
import { ReactNode } from "react";
import App from "./App";

globalThis.story = (props: any): ReactNode => {
  return <App {...props} />;
};
