import React, { useSyncExternalStore } from "react";
import { ReactNode } from "react";
import { createRoot } from "react-dom/client";

let props: any = undefined;
let listener: Function;
let test_story: (props: any) => ReactNode;
(globalThis as any).ReactTestPropsHandler = {
  update(new_props: any) {
    props = new_props;
    console.log(props);
    listener();
  },
};
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
  createRoot(container).render(
    React.createElement(ReactTestRootComponent, props),
  );
};
