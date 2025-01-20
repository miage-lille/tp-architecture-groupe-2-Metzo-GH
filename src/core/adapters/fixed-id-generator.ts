import { IIdGenerator } from 'src/core/ports/id-generator.interface';

export class FixedIdGenerator implements IIdGenerator {
  generate() {
    return 'id-1';
  }
}
