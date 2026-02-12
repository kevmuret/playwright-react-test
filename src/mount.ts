import React, { useSyncExternalStore } from "react";
import { ReactNode } from "react";
import { createRoot } from "react-dom/client";

// Holds the current props passed from tests
let props: any = undefined;

// Callback invoked when props are updated
let listener: Function;

// Reference to the story component passed in by tests
let test_story: (props: any) => ReactNode;

// Component that renders the story and subscribes to prop changes
const Root = (init_props: any): ReactNode => {
  if (!props) {
    props = init_props;
  }
  const story_props = useSyncExternalStore(
    (subscribe) => {
      listener = subscribe;
      return () => {};
    },
    () => props,
  );
  return test_story(story_props);
};

// Function to mount a story through a Root component
const render = (
  container: HTMLElement,
  props: any,
  story: (props: any) => ReactNode,
) => {
  test_story = story;
  // Mount the React component into the container
  createRoot(container).render(React.createElement(Root, props));
};

// Function to update story properties
function update<T = any>(p: T): void {
  props = p;
  listener();
}

export default {
  render: render,
  update: update,
};
