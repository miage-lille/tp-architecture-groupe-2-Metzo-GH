import { IDateGenerator } from 'src/core/ports/date-generator.interface';

export class FixedDateGenerator implements IDateGenerator {
  constructor(
    private readonly fixedDate: Date = new Date('2024-01-01T00:00:00.000Z'),
  ) {}
  now() {
    return this.fixedDate;
  }
}
