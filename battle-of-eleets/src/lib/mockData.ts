import type { Problem } from "./types"

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    prompt:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  \n}",
      python: "def two_sum(nums, target):\n    ",
    },
    testCases: [
      { input: "[2,7,11,15]\\n9", expectedOutput: "[0,1]" },
      { input: "[3,2,4]\\n6", expectedOutput: "[1,2]" },
    ],
  },
  {
    id: "binary-tree-right-side-view",
    title: "Binary Tree Right Side View",
    difficulty: "medium",
    prompt:
      "Given the root of a binary tree, return the values of the nodes you can see ordered from top to bottom from the right side.",
    starterCode: {
      javascript: "function rightSideView(root) {\n  \n}",
      python: "def right_side_view(root):\n    ",
    },
    testCases: [
      { input: "[1,2,3,null,5,null,4]", expectedOutput: "[1,3,4]" },
      { input: "[]", expectedOutput: "[]" },
    ],
  },
]
