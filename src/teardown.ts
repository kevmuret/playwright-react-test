import { rmSync } from "fs";
import { serverClose } from "./startup";
import { stderr } from "process";

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
