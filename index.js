import { createGitgraph, templateExtend, TemplateName, Orientation } from "@gitgraph/js";

const color = ["#929292", "#255db7", "#f3a138", "#bd461d", "#419bb2", "#ef754a", "#f6bb3f", "#53c1dd"];
const graphContainer = document.getElementById("graph-container");

const branchesOrder = ['develop', 'release/1', 'feature/a', 'feature/b', 'feature/c', 'feature/d', 'feature/d+'];
const compareBranchesOrder = function (a, b) {
  return branchesOrder.indexOf(a) - branchesOrder.indexOf(b);
};

const template = templateExtend(TemplateName.Metro, {
  colors,
  commit: {
    shouldDisplayTooltipsInCompactMode: false,
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
    spacingX: 50,
    labelRotation: 0,
    showLabel: true
  },
});
let commitIndex = 0;
const generateCommitHash = (a, b) => {
  return `C${commitIndex++}`;
}
// Instantiate the graph.
const gitgraph = createGitgraph(graphContainer, {
  // mode: GitgraphJS.Mode.Compact,
  generateCommitHash,
  compareBranchesOrder,
  orientation: Orientation.Horizontal,
  template,
});

// Simulate git commands with Gitgraph API.
const develop = gitgraph.branch("develop");
develop.commit("commit to develop 1");

const release1 = gitgraph.branch({ name: "release/1" });
const aFeature = gitgraph.branch({
  name: "feature/a", style: {
    spacing: 1000,
  }
});
const cFeature = gitgraph.branch("feature/c");
const dFeature = gitgraph.branch("feature/d");

cFeature.commit({ dotText: "C1" });
dFeature.commit({ dotText: "C2" });
const dPlusFeature = gitgraph.branch("feature/d+");
dPlusFeature
  .commit({ dotText: "C3" })
  .commit({ dotText: "C4" });
dFeature.merge(dPlusFeature);
dFeature.commit({ dotText: "C5" });

develop.commit({ dotText: "C6" });
const bFeature = gitgraph.branch("feature/b");

release1.commit({ dotText: "C7" });

aFeature
  .commit({ dotText: "C8" })
  .commit({ dotText: "C9" })
bFeature
  .commit({ dotText: "C10" })
  .commit({ dotText: "C11" });

cFeature.merge(bFeature);
cFeature.commit({ dotText: "C12" });

develop.commit({ dotText: "C13" });
