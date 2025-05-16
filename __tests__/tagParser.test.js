// __tests__/csvHelpers.test.js
import { parseTagsCell, splitCsvLine } from '../app/static/js/import.js';

describe('parseTagsCell', () => {
  test('parses JSON-formatted tag string', () => {
    const input = '{"frequency":"Recurring","importance":["Need","Want"]}';
    expect(parseTagsCell(input)).toEqual({
      frequency: 'Recurring',
      importance: ['Need', 'Want'],
    });
  });

  test('parses plain text tags with comma', () => {
    expect(parseTagsCell('need,recurring')).toEqual({
      frequency: 'Recurring',
      importance: ['Need'],
    });
  });

  // add more ...
});

describe('splitCsvLine', () => {
  test('splits simple comma-separated values', () => {
    expect(splitCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  test('splits quoted fields with commas inside', () => {
    expect(splitCsvLine('"a,b",c')).toEqual(['"a,b"', 'c']);
  });

  test('handles empty values', () => {
    expect(splitCsvLine('a,,c')).toEqual(['a', '', 'c']);
  });

  test('handles escaped quotes', () => {
    expect(splitCsvLine('"he said \\"hi\\"",b')).toEqual(['"he said \\"hi\\""', 'b']);
  });

  // add more if needed
});
