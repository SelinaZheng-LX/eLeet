import { Router } from 'express';
import { problems } from '../../../judge/src/problems';

const router = Router();

/**
 * GET /problems
 * Response 200: Problem[]
 */
router.get('/', (_req, res) => {
  res.status(200).json(problems);
});

/**
 * GET /problems/:id
 * Request params: { id: string }
 * Response 200: Problem
 * Response 404: { error: 'Problem not found' }
 */
router.get('/:id', (req, res) => {
  const problem = problems.find((item) => item.id === req.params.id);

  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  return res.status(200).json(problem);
});

export default router;
