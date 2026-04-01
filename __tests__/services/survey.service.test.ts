import { describe, it } from 'vitest';

describe('survey.service', () => {
  it.todo('createSurvey appends a new row to surveys.csv with the given name');
  it.todo('listSurveys returns surveys sorted by createdAt descending');
  it.todo('saveQuestions writes questions to questions-{surveyId}.csv');
  it.todo('getQuestions reads and deserialises questions from questions-{surveyId}.csv');
  it.todo('getResponseCount returns 0 when responses-{surveyId}.csv does not exist');
});
