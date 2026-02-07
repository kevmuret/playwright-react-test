import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { FullConfig } from "playwright/test";

const setup = (config: FullConfig) => {
	process.env.PWRIGHT_REACT_TEST_TMPDIR = mkdtempSync(path.join(tmpdir(), 'pwright-react-'));
}

export default setup;
