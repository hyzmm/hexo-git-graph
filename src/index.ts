import {
    createGitgraph,
    templateExtend,
    TemplateName,
    Orientation,
    Branch,
    Mode,
} from '@gitgraph/js';
import queryString from 'query-string';
import { Config } from './types';

const colors: string[] = [
    '#929292',
    '#255db7',
    '#f3a138',
    '#bd461d',
    '#419bb2',
    '#ef754a',
    '#f6bb3f',
    '#53c1dd',
];
const graphContainer = document.getElementById(
    'graph-container'
) as HTMLElement;

let commitNumber = 0;
function compareBranchesOrder(a: Branch['name'], b: Branch['name']): number {
    return config.branchesOrder!.indexOf(a) - config.branchesOrder!.indexOf(b);
}

const template = templateExtend(TemplateName.Metro, {
    colors,
    commit: {
        hasTooltipInCompactMode: false,
        message: {
            displayAuthor: false,
        },
        dot: {
            font: '12px Arial',
        },
    },
});

function parseConfig(): Config {
    const query = queryString.parse(location.search);
    return {
        showCommitNumber: 'commit_number' in query,
        branchesOrder:
            'branches_order' in query
                ? (query['branches_order'] as string)?.split(',')
                : undefined,
        mode: query['mode'] as Mode | undefined,
        orientation: query['orientation'] as Orientation | undefined,
    };
}
const config = parseConfig();
const gitgraph = createGitgraph(graphContainer, {
    mode: config.mode,
    compareBranchesOrder: config.branchesOrder
        ? compareBranchesOrder
        : undefined,
    orientation: config.orientation,
    template,
});
// @ts-ignore
window['aa'] = gitgraph;

const branches: Map<string, Branch> = new Map();
let currentBranch: Branch | undefined;

atob(location.hash.substring(1))
    .split('\n')
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && c[0] !== '#')
    .forEach((command) => {
        const [commandName, ...args] = command.split(' ');
        switch (commandName) {
            case 'checkout':
                checkout(args);
                break;
            case 'commit':
                commit(args);
                break;
            case 'merge':
                merge(args[0]);
                break;
            default:
                console.warn(`Unknown command: ${commandName}`);
        }
    });

function checkout(branchNames: string[]) {
    branchNames.forEach((branchName, index) => {
        if (!branches.has(branchName)) {
            branches.set(
                branchName,
                gitgraph.branch({
                    name: branchName,
                    from: currentBranch,
                })
            );
        }

        // checkout last branch
        if (index == branchNames.length - 1) {
            currentBranch = branches.get(branchName);
        }
    });
}

function commit(args: string[]) {
    if (currentBranch) {
        currentBranch.commit({
            subject: args.join(' '),
            dotText: config.showCommitNumber ? `C${commitNumber++}` : undefined,
        });
    }
}

function merge(sourceBranch: string) {
    if (branches.has(sourceBranch)) {
        currentBranch?.merge(branches.get(sourceBranch)!);
    }
}
