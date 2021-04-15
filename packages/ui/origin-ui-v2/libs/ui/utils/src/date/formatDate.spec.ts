import { formatDate } from './formatDate';

describe('time', function () {
  it('should format date properly', function () {
    console.log(formatDate(Date.now(), true));
  });
});
