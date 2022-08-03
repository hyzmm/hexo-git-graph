import { Mode, Orientation } from '@gitgraph/js';

interface Config {
    scrollable: boolean;
    showCommitNumber: boolean;
    branchesOrder: string[] | undefined;
    mode: Mode | undefined;
    orientation: Orientation | undefined;
}

export { Config };
