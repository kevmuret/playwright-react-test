import { rmSync } from "fs";
import { serverClose } from "./setup";
import { stderr } from "process";

/**
 * Tears down the test environment.
 *
 * This function performs two main cleanup tasks:
 *   1. Removes the temporary directory specified by `PWRIGHT_REACT_TEST_TMPDIR`.
 *      If the environment variable is not set, an error message is written to
 *      stderr and no deletion is attempted.
 *   2. Closes the server that was started during the test run via
 *      `serverClose()`.
 *
 * The function is asynchronous because `serverClose` returns a promise.
 * It should be called after all tests have finished executing.
 */
export default async () => {
  if (!process.env.PWRIGHT_REACT_TEST_TMPDIR) {
    stderr.write("PWRIGHT_REACT_TEST_TMPDIR is not defined !");
  } else {
    rmSync(process.env.PWRIGHT_REACT_TEST_TMPDIR, {
      recursive: true,
      force: true,
    });
  }
  await serverClose();
};
