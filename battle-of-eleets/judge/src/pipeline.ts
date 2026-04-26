import { SubmissionResult, TestCase } from '../../shared/types';
import { runOnJudge0 } from './judge0';

function normalizeOutput(output: string | null | undefined): string {
  return (output ?? '').trim();
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function areOutputsEquivalent(actual: string, expected: string): boolean {
  if (actual === expected) {
    return true;
  }

  const parsedActual = tryParseJson(actual);
  const parsedExpected = tryParseJson(expected);
  if (parsedActual === null || parsedExpected === null) {
    return false;
  }

  // Two Sum style outputs should accept both [i,j] and [j,i].
  if (
    Array.isArray(parsedActual) &&
    Array.isArray(parsedExpected) &&
    parsedActual.length === 2 &&
    parsedExpected.length === 2 &&
    parsedActual.every((entry) => typeof entry === 'number') &&
    parsedExpected.every((entry) => typeof entry === 'number')
  ) {
    const sortedActual = [...parsedActual].sort((a, b) => Number(a) - Number(b));
    const sortedExpected = [...parsedExpected].sort((a, b) => Number(a) - Number(b));
    return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
  }

  return JSON.stringify(parsedActual) === JSON.stringify(parsedExpected);
}

export async function runSubmission(
  code: string,
  language: string,
  testCases: TestCase[],
): Promise<Omit<SubmissionResult, 'socketId' | 'username'>> {
  let passedCount = 0;
  let runtime = 0;

  for (const testCase of testCases) {
    const runResult = await runOnJudge0(code, testCase.input, language);
    const actual = normalizeOutput(runResult.stdout);
    const expected = normalizeOutput(testCase.expectedOutput);
    const runTimeMs = Number(runResult.time ?? 0) * 1000;

    if (!Number.isNaN(runTimeMs)) {
      runtime += runTimeMs;
    }

    const runError = runResult.stderr ?? runResult.compile_output ?? runResult.message;
    if (runError) {
      return {
        passed: false,
        passedCount,
        totalCount: testCases.length,
        runtime,
        error: normalizeOutput(runError),
      };
    }

    if (!areOutputsEquivalent(actual, expected)) {
      return {
        passed: false,
        passedCount,
        totalCount: testCases.length,
        runtime,
        error: `Expected "${expected}" but got "${actual}"`,
      };
    }

    passedCount += 1;
  }

  return {
    passed: passedCount === testCases.length,
    passedCount,
    totalCount: testCases.length,
    runtime,
  };
}
