import React, { Attributes, useSyncExternalStore } from "react";
import { ReactNode } from "react";
import { createRoot } from "react-dom/client";

/**
 * Holds the current props passed from tests.
 */
let props: any = undefined;

/**
 * Callback invoked when props are updated.
 */
let listener: (() => void) | undefined;

/**
 * Reference to the story component passed in by tests.
 */
let test_story: (props: Attributes) => ReactNode;

/**
 * Component that renders the story and subscribes to prop changes.
 */
const Root = <T = any>(init_props: T): ReactNode => {
  if (!props) {
    props = init_props;
  }
  const story_props = useSyncExternalStore(
    (subscribe) => {
      listener = subscribe;
      return () => {
	      listener = undefined;
      };
    },
    () => props,
  );
  return test_story(story_props);
};

/**
 * Mounts a Storybook story onto a DOM element.
 *
 * @param container - The HTMLElement to render the story into.
 * @param props - Initial props passed to the story component.
 * @param story - A function that returns a ReactNode representing the story.
 */
const render = <T = any>(
  container: HTMLElement,
  props: T,
  story: (props: Attributes) => ReactNode,
): void => {
  test_story = story;
  // Mount the React component into the container
  createRoot(container).render(React.createElement(Root, props as Attributes));
};

/**
 * Updates the props passed to the mounted story and triggers a re-render.
 *
 * @param p - New props object to replace the current story props.
 */
const update = <T = any>(p: T): void => {
  props = p;
  // Must throw an error in case of undefined
  listener!();
};

export default {
  render,
  update,
};
