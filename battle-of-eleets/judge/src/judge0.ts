const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
};

interface RunResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  status?: {
    id: number;
    description: string;
  };
}

function getLanguageId(language: string): number {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  return languageId;
}

function buildTreePreamble(language: string): string {
  if (language === 'python') {
    return `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(arr):
    if not arr:
        return None
    nodes = [None if v is None else TreeNode(v) for v in arr]
    i = 1
    for node in nodes:
        if node is not None:
            if i < len(nodes):
                node.left = nodes[i]
                i += 1
            if i < len(nodes):
                node.right = nodes[i]
                i += 1
    return nodes[0]
`;
  }

  if (language === 'javascript') {
    return `function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

function buildTree(arr) {
  if (!arr.length) return null;
  const nodes = arr.map((v) => (v === null ? null : new TreeNode(v)));
  let i = 1;
  for (const node of nodes) {
    if (!node) continue;
    if (i < nodes.length) node.left = nodes[i++];
    if (i < nodes.length) node.right = nodes[i++];
  }
  return nodes[0];
}
`;
  }

  return '';
}

function prepareSourceCode(sourceCode: string, language: string): string {
  const normalizedLanguage = language.toLowerCase();
  const lowerSource = sourceCode.toLowerCase();
  const shouldInjectTreeHelper =
    sourceCode.includes('rightSideView') && (normalizedLanguage === 'python' || normalizedLanguage === 'javascript');

  if (normalizedLanguage === 'python') {
    const pythonPreamble = shouldInjectTreeHelper ? buildTreePreamble(normalizedLanguage) : '';
    const needsTwoSumRunner = lowerSource.includes('def twosum(') || lowerSource.includes('def two_sum(');
    const needsRightSideViewRunner =
      lowerSource.includes('def rightsideview(') || lowerSource.includes('def right_side_view(');

    let pythonRunner = '';
    if (needsTwoSumRunner) {
      pythonRunner = `
import ast
import json
import sys

def __run_two_sum():
    raw = [line for line in sys.stdin.read().splitlines() if line.strip()]
    nums = ast.literal_eval(raw[0]) if len(raw) > 0 else []
    target = ast.literal_eval(raw[1]) if len(raw) > 1 else 0
    if 'twoSum' in globals():
      out = twoSum(nums, target)
    elif 'two_sum' in globals():
      out = two_sum(nums, target)
    else:
      raise NameError("Expected twoSum or two_sum function")
    print(json.dumps(out, separators=(",", ":")))

if __name__ == "__main__":
    __run_two_sum()
`;
    } else if (needsRightSideViewRunner) {
      pythonRunner = `
import ast
import json
import sys

def __run_right_side_view():
    raw = sys.stdin.read().strip()
    arr = ast.literal_eval(raw) if raw else []
    root = build_tree(arr)
    if 'rightSideView' in globals():
      out = rightSideView(root)
    elif 'right_side_view' in globals():
      out = right_side_view(root)
    else:
      raise NameError("Expected rightSideView or right_side_view function")
    print(json.dumps(out, separators=(",", ":")))

if __name__ == "__main__":
    __run_right_side_view()
`;
    }

    return `${pythonPreamble}\n${sourceCode}\n${pythonRunner}`.trim();
  }

  if (!shouldInjectTreeHelper) {
    return sourceCode;
  }

  return `${buildTreePreamble(normalizedLanguage)}\n${sourceCode}`;
}

export async function runOnJudge0(sourceCode: string, stdin: string, language: string): Promise<RunResult> {
  const judge0Url = process.env.JUDGE0_URL ?? 'https://judge0-ce.p.rapidapi.com';
  const apiKey = process.env.JUDGE0_API_KEY;
  const url = new URL('/submissions?base64_encoded=false&wait=true', judge0Url);
  const normalizedLanguage = language.toLowerCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-RapidAPI-Key'] = apiKey;
    headers['X-RapidAPI-Host'] = url.host;
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source_code: prepareSourceCode(sourceCode, normalizedLanguage),
      language_id: getLanguageId(normalizedLanguage),
      stdin,
    }),
  });

  if (!response.ok) {
    throw new Error(`Judge0 request failed with status ${response.status}`);
  }

  return (await response.json()) as RunResult;
}
