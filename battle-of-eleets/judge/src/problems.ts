import { Problem } from '../../shared/types';

export const problems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    prompt:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.',
    starterCode: {
      python: `def twoSum(nums, target):
    `,
    },
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { input: '[3,3]\n6', expectedOutput: '[0,1]' },
    ],
  },
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
    },
    testCases: [
      { input: '[1,2,3,null,5,null,4]', expectedOutput: '[1,3,4]' },
      { input: '[1,2,3,4,null,null,null,5]', expectedOutput: '[1,3,4,5]' },
      { input: '[1,null,3]', expectedOutput: '[1,3]' },
      { input: '[]', expectedOutput: '[]' },
    ],
  },
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'easy',
    prompt:
      'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    starterCode: {
      python: `def containsDuplicate(nums):
    `,
    },
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true' },
      { input: '[1,2,3,4]', expectedOutput: 'false' },
      { input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true' },
      { input: '[1]', expectedOutput: 'false' },
    ],
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'easy',
    prompt:
      'Given a string s, return true if after converting uppercase letters to lowercase and removing non-alphanumeric characters it reads the same forward and backward.',
    starterCode: {
      python: `def isPalindrome(s):
    `,
    },
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
      { input: '"race a car"', expectedOutput: 'false' },
      { input: '" "', expectedOutput: 'true' },
      { input: '"0P"', expectedOutput: 'false' },
    ],
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    difficulty: 'easy',
    prompt: 'Given the root of a binary tree, invert the tree, and return its root.',
    starterCode: {
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

def invertTree(root):
    `,
    },
    testCases: [
      { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]' },
      { input: '[2,1,3]', expectedOutput: '[2,3,1]' },
      { input: '[]', expectedOutput: '[]' },
      { input: '[1]', expectedOutput: '[1]' },
    ],
  },
  {
    id: 'lowest-common-ancestor-bst',
    title: 'Lowest Common Ancestor of a Binary Search Tree',
    difficulty: 'medium',
    prompt:
      'Given a BST, find the lowest common ancestor (LCA) node of two given nodes p and q.',
    starterCode: {
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

def lowestCommonAncestor(root, p, q):
    `,
    },
    testCases: [
      { input: '[6,2,8,0,4,7,9,null,null,3,5]\n2\n8', expectedOutput: '6' },
      { input: '[6,2,8,0,4,7,9,null,null,3,5]\n2\n4', expectedOutput: '2' },
      { input: '[2,1]\n2\n1', expectedOutput: '2' },
      { input: '[6,2,8,0,4,7,9,null,null,3,5]\n0\n5', expectedOutput: '2' },
    ],
  },
];
