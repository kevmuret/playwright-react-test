/*
 * App.story.tsx – defines a simple story wrapper
 * The exported default function renders the App component with props passed from Playwright tests.
 * This file is imported by the test runner to mount the component.
 */
// Story definition for the App component used in Playwright tests
import { ReactNode } from "react";
import App from "./App";
import "./App.css";

export default (props: any): ReactNode => {
  return <App {...props} />;
};
