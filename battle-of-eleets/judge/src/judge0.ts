import { spawn } from 'node:child_process';

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

def serialize_tree(root):
    if root is None:
        return []
    out = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def find_node(root, target):
    if root is None:
        return None
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node is None:
            continue
        if node.val == target:
            return node
        queue.append(node.left)
        queue.append(node.right)
    return None
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
    (sourceCode.includes('rightSideView') ||
      sourceCode.includes('invertTree') ||
      sourceCode.includes('lowestCommonAncestor')) &&
    (normalizedLanguage === 'python' || normalizedLanguage === 'javascript');

  if (normalizedLanguage === 'python') {
    const pythonPreamble = shouldInjectTreeHelper ? buildTreePreamble(normalizedLanguage) : '';
    const needsTwoSumRunner = lowerSource.includes('def twosum(') || lowerSource.includes('def two_sum(');
    const needsContainsDuplicateRunner =
      lowerSource.includes('def containsduplicate(') || lowerSource.includes('def contains_duplicate(');
    const needsValidPalindromeRunner =
      lowerSource.includes('def ispalindrome(') || lowerSource.includes('def is_palindrome(');
    const needsRightSideViewRunner =
      lowerSource.includes('def rightsideview(') || lowerSource.includes('def right_side_view(');
    const needsInvertTreeRunner =
      lowerSource.includes('def inverttree(') || lowerSource.includes('def invert_tree(');
    const needsLcaBstRunner =
      lowerSource.includes('def lowestcommonancestor(') ||
      lowerSource.includes('def lowest_common_ancestor(');

    let pythonRunner = '';
    if (needsTwoSumRunner) {
      pythonRunner = `
import json
import sys

def __run_two_sum():
    raw = [line for line in sys.stdin.read().splitlines() if line.strip()]
    nums = json.loads(raw[0]) if len(raw) > 0 else []
    target = json.loads(raw[1]) if len(raw) > 1 else 0
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
    } else if (needsContainsDuplicateRunner) {
      pythonRunner = `
import json
import sys

def __run_contains_duplicate():
    raw = sys.stdin.read().strip()
    nums = json.loads(raw) if raw else []
    if 'containsDuplicate' in globals():
      out = containsDuplicate(nums)
    elif 'contains_duplicate' in globals():
      out = contains_duplicate(nums)
    else:
      raise NameError("Expected containsDuplicate or contains_duplicate function")
    print(json.dumps(out))

if __name__ == "__main__":
    __run_contains_duplicate()
`;
    } else if (needsValidPalindromeRunner) {
      pythonRunner = `
import json
import sys

def __run_valid_palindrome():
    raw = sys.stdin.read().strip()
    s = json.loads(raw) if raw else ""
    if 'isPalindrome' in globals():
      out = isPalindrome(s)
    elif 'is_palindrome' in globals():
      out = is_palindrome(s)
    else:
      raise NameError("Expected isPalindrome or is_palindrome function")
    print(json.dumps(out))

if __name__ == "__main__":
    __run_valid_palindrome()
`;
    } else if (needsRightSideViewRunner) {
      pythonRunner = `
import json
import sys

def __run_right_side_view():
    raw = sys.stdin.read().strip()
    arr = json.loads(raw) if raw else []
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
    } else if (needsInvertTreeRunner) {
      pythonRunner = `
import json
import sys

def __run_invert_tree():
    raw = sys.stdin.read().strip()
    arr = json.loads(raw) if raw else []
    root = build_tree(arr)
    if 'invertTree' in globals():
      out_root = invertTree(root)
    elif 'invert_tree' in globals():
      out_root = invert_tree(root)
    else:
      raise NameError("Expected invertTree or invert_tree function")
    print(json.dumps(serialize_tree(out_root), separators=(",", ":")))

if __name__ == "__main__":
    __run_invert_tree()
`;
    } else if (needsLcaBstRunner) {
      pythonRunner = `
import json
import sys

def __run_lca_bst():
    raw = [line for line in sys.stdin.read().splitlines() if line.strip()]
    arr = json.loads(raw[0]) if len(raw) > 0 else []
    p_val = json.loads(raw[1]) if len(raw) > 1 else None
    q_val = json.loads(raw[2]) if len(raw) > 2 else None
    root = build_tree(arr)
    p_node = find_node(root, p_val)
    q_node = find_node(root, q_val)
    if 'lowestCommonAncestor' in globals():
      out = lowestCommonAncestor(root, p_node, q_node)
    elif 'lowest_common_ancestor' in globals():
      out = lowest_common_ancestor(root, p_node, q_node)
    else:
      raise NameError("Expected lowestCommonAncestor or lowest_common_ancestor function")
    print(json.dumps(out.val if out else None))

if __name__ == "__main__":
    __run_lca_bst()
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
  const normalizedLanguage = language.toLowerCase();
  const useLocalEvaluator =
    String(process.env.USE_LOCAL_EVALUATOR ?? 'false') === 'true' ||
    (!process.env.JUDGE0_API_KEY && !process.env.JUDGE0_URL);

  if (useLocalEvaluator) {
    if (normalizedLanguage !== 'python') {
      throw new Error('Local evaluator currently supports python submissions only');
    }
    return runOnLocalPython(sourceCode, stdin, normalizedLanguage);
  }

  const judge0Url = process.env.JUDGE0_URL ?? 'https://judge0-ce.p.rapidapi.com';
  const apiKey = process.env.JUDGE0_API_KEY;
  const url = new URL('/submissions?base64_encoded=false&wait=true', judge0Url);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-RapidAPI-Key'] = apiKey;
    headers['X-RapidAPI-Host'] = url.host;
  }

  try {
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
  } catch (error) {
    // Network/API instability should not block local development gameplay.
    if (normalizedLanguage === 'python') {
      return runOnLocalPython(sourceCode, stdin, normalizedLanguage);
    }
    throw error;
  }
}

function runOnLocalPython(sourceCode: string, stdin: string, language: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const preparedSource = prepareSourceCode(sourceCode, language);
    const startedAt = Date.now();
    const child = spawn('python3', ['-c', preparedSource], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      resolve({
        stdout: null,
        stderr: 'Execution timed out',
        compile_output: null,
        message: null,
        time: null,
      });
    }, 5000);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve({
        stdout: null,
        stderr: `Local evaluator error: ${error.message}`,
        compile_output: null,
        message: null,
        time: null,
      });
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      const elapsedMs = Date.now() - startedAt;
      resolve({
        stdout: stdout || null,
        stderr: code === 0 ? null : stderr || `Exited with code ${code}`,
        compile_output: null,
        message: null,
        time: (elapsedMs / 1000).toFixed(3),
      });
    });

    child.stdin.write(stdin);
    child.stdin.end();
  });
}
