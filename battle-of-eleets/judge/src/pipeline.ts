import { SubmissionResult, TestCase } from '../../shared/types';
import { runOnJudge0 } from './judge0';

function normalizeOutput(output: string | null | undefined): string {
  return (output ?? '').trim();
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

    if (actual !== expected) {
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
