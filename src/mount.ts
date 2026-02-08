import React, { useSyncExternalStore } from "react";
import { ReactNode } from "react";
import { createRoot } from "react-dom/client";

// Holds the current props passed from tests
let props: any = undefined;
// Callback invoked when props are updated
let listener: Function;
// Reference to the story component passed in by tests
let test_story: (props: any) => ReactNode;
// Global handler exposed for tests to update props
(globalThis as any).ReactTestPropsHandler = {
  update(new_props: any) {
    props = new_props;
    console.log(props);
    listener();
  },
};
// Component that renders the story and subscribes to prop changes
const ReactTestRootComponent = (init_props: any): ReactNode => {
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
  console.log(props, story_props);
  return test_story(story_props);
};
(globalThis as any).ReactTestMount = function ReactTestMount(
  container: HTMLElement,
  props: any,
  story: (props: any) => ReactNode,
) {
  test_story = story;
  // Mount the React component into the container
  createRoot(container).render(
    React.createElement(ReactTestRootComponent, props),
  );
};
