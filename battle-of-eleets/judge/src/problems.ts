import { Problem } from '../../shared/types';

export const problems: Problem[] = [
  {
    id: 'binary-tree-right-side-view',
    title: 'Binary Tree Right Side View',
    difficulty: 'medium',
    prompt: `Given the root of a binary tree, imagine yourself standing on the right side of it. Return the values of the nodes you can see, ordered from top to bottom.

Example 1: root = [1,2,3,null,5,null,4] -> [1,3,4]
Example 2: root = [1,2,3,4,null,null,null,5] -> [1,3,4,5]
Example 3: root = [1,null,3] -> [1,3]
Example 4: root = [] -> []

Constraints:
- Number of nodes in [0, 100]
- -100 <= Node.val <= 100`,
    starterCode: {
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

def rightSideView(root):
    `,
      javascript: `// Definition for a binary tree node:
// function TreeNode(val, left, right) {
//   this.val = val; this.left = left; this.right = right;
// }

function rightSideView(root) {
  
}`,
    },
    testCases: [
      { input: '[1,2,3,null,5,null,4]', expectedOutput: '[1,3,4]' },
      { input: '[1,2,3,4,null,null,null,5]', expectedOutput: '[1,3,4,5]' },
      { input: '[1,null,3]', expectedOutput: '[1,3]' },
      { input: '[]', expectedOutput: '[]' },
    ],
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    prompt: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.

Example 1: nums = [2,7,11,15], target = 9 -> [0,1]
Example 2: nums = [3,2,4], target = 6 -> [1,2]
Example 3: nums = [3,3], target = 6 -> [0,1]

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- Only one valid answer exists`,
    starterCode: {
      python: `def twoSum(nums, target):
    `,
      javascript: `function twoSum(nums, target) {
  
}`,
    },
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { input: '[3,3]\n6', expectedOutput: '[0,1]' },
    ],
  },
];
