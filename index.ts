import {
  createGitgraph,
  templateExtend,
  TemplateName,
  Orientation,
  Branch,
} from "@gitgraph/js";

const colors: string[] = [
  "#929292",
  "#255db7",
  "#f3a138",
  "#bd461d",
  "#419bb2",
  "#ef754a",
  "#f6bb3f",
  "#53c1dd",
];
const graphContainer = document.getElementById(
  "graph-container"
) as HTMLElement;

let branchesOrder: string[] | undefined = [];
let commitNumber = 0;
const compareBranchesOrder = (a: Branch["name"], b: Branch["name"]) => {
  return branchesOrder!.indexOf(a) - branchesOrder!.indexOf(b);
};

const template = templateExtend(TemplateName.Metro, {
  colors,
  commit: {
    hasTooltipInCompactMode: false,
    message: {
      // displayHash: false,
      displayAuthor: false,
    },
    dot: {
      font: "12px Arial",
    },
  },
  branch: {
    lineWidth: 10,
  },
});

const commandString = `
branchesOrder=feature/d feature/d+ feature/c feature/b feature/a release/1 develop
orientation=horizontal
commitNumber=true

checkout develop
commit commit to develop 1
checkout release/1 develop feature/a feature/c feature/d

checkout develop
commit commit to develop 2

checkout release/1
commit commit to release/1

checkout feature/a
commit start feature/a
commit finish feature/a

checkout develop
checkout feature/b
commit start feature/b
commit finish feature/b

checkout feature/c
commit start feature/c
merge feature/b
commit finish feature/c

checkout feature/d
commit start feature/d

  checkout feature/d+
  commit start feature/d+
  commit finish feature/d+

  checkout feature/d
  merge feature/d+

commit finish feature/d

checkout develop
commit commit to develop
`;
const args: string[] = [];
const commands: string[] = [];
commandString
  .split("\n")
  .map((command) => command.trim())
  .forEach((command) => {
    if (command.length === 0) return;
    if (command[0] === "#") return;
    if (/^[0-9a-zA-Z]+=.*$/.test(command)) {
      args.push(command);
    } else {
      commands.push(command);
    }
  });

function parseGitgraphArgs(argLines: string[]): { [key: string]: any } {
  const args: { [key: string]: any } = {};
  argLines.forEach((command) => {
    console.log(command);

    const [key, value] = command.split("=");
    args[key] = value;
  });

  return args;
}

const gitgraphArgs = parseGitgraphArgs(args);
branchesOrder = (gitgraphArgs["branchesOrder"] as string)
  ?.split(" ")
  .map((n) => n.trim())
  .filter((n) => n.length > 0);

const gitgraph = createGitgraph(graphContainer, {
  mode: gitgraphArgs["mode"],
  compareBranchesOrder: branchesOrder ? compareBranchesOrder : undefined,
  orientation: gitgraphArgs["orientation"],
  template,
});

let currentBranch: Branch | undefined;
const branches: Map<string, Branch> = new Map();
commands.forEach((command) => {
  const [commandName, ...args] = command.split(" ");
  switch (commandName) {
    case "checkout":
      checkout(args);
      break;
    case "commit":
      commit(args);
      break;
    case "merge":
      merge(args[0]);
      break;
    default:
      console.log(`Unknown command: ${commandName}`);
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
    currentBranch.commit({ subject: args.join(" "), dotText: `C${commitNumber++}` });
  }
}

function merge(sourceBranch: string) {
  if (branches.has(sourceBranch)) {
    currentBranch?.merge(branches.get(sourceBranch)!);
  }
}
