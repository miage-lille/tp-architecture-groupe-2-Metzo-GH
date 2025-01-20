import { IDateGenerator } from 'src/core/ports/date-generator.interface';

export class RealDateGenerator implements IDateGenerator {
  now(): Date {
    return new Date();
  }
}
